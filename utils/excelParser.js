import * as XLSX from 'xlsx';

export const parseExcelFile = async (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                
                let results = {
                    classes: [],
                    students: [],
                    enrollments: [],
                    grades: [],
                    errors: [],
                };

                // Scan all sheets for relevant data
                workbook.SheetNames.forEach(sheetName => {
                    const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                    console.log(`Processing sheet: ${sheetName}, Rows: ${sheet.length}`);
                    
                    // --- A. CLASS METADATA SCAN (Look for Level, Time, Room, Teacher) ---
                    if (sheetName.toLowerCase().includes('classes') || sheetName.toLowerCase().includes('score') || results.classes.length === 0) {
                        let branch = '', level = '', time = '', room = '', teacherName = '';
                        for (let i = 0; i < Math.min(sheet.length, 15); i++) {
                            const row = sheet[i];
                            if (!row) continue;
                            for (let j = 0; j < row.length; j++) {
                                const cell = String(row[j] || '').trim().toLowerCase();
                                const val = String(row[j + 1] || '').trim();
                                if (cell === 'br:' || cell === 'branch') branch = val;
                                if (cell === 'level:' || cell === 'level') level = val;
                                if (cell === 'time:' || cell === 'schedule:') time = val;
                                if (cell === 'room:' || cell === 'room') room = val;
                                if (cell === 'tr:' || cell === 'teacher:') teacherName = val;
                            }
                        }
                        if (level && room) {
                            results.classes.push({ name: room, level, schedule: time, teacherName, branch, id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) });
                        }
                    }

                    // --- B. STUDENT LIST SCAN ---
                    let colMapping = { name: -1, sex: -1, phone: -1 };
                    let headerRowIdx = -1;
                    for (let i = 0; i < Math.min(sheet.length, 30); i++) {
                        const row = sheet[i];
                        if (!row) continue;
                        let foundName = false;
                        for (let j = 0; j < row.length; j++) {
                            const val = String(row[j] || '').trim().toLowerCase();
                            if (val === 'name' || val === 'student name' || val === 'student') {
                                colMapping.name = j;
                                foundName = true;
                            }
                            if (val === 'sex' || val === 'gender') colMapping.sex = j;
                            if (val.includes('phone') || val.includes('contact')) colMapping.phone = j;
                        }
                        if (foundName) { headerRowIdx = i; break; }
                    }

                    if (headerRowIdx !== -1) {
                        for (let i = headerRowIdx + 1; i < sheet.length; i++) {
                            const row = sheet[i];
                            if (!row || !row[colMapping.name] || String(row[colMapping.name]).trim() === '') continue;
                            const cell0 = String(row[0]||'').toLowerCase();
                            if (cell0 === 'no' || cell0 === 'name') continue;

                            const name = String(row[colMapping.name]).trim();
                            // Avoid duplicates in the same import session
                            if (results.students.find(s => s.name === name)) continue;

                            const studentObj = {
                                id: 'stu_imp_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 3),
                                name,
                                sex: (String(row[colMapping.sex] || '').toUpperCase().startsWith('M')) ? 'Male' : 'Female',
                                phone: String(row[colMapping.phone] || '').trim(),
                                dob: '2015-01-01',
                                status: 'Active',
                                enrollmentDate: new Date().toISOString().split('T')[0]
                            };
                            results.students.push(studentObj);
                            if (results.classes.length > 0) {
                                results.enrollments.push({ studentId: studentObj.id, classId: results.classes[results.classes.length - 1].id });
                            }
                        }
                    }

                    // --- C. GRADES / MARKS SCAN ---
                    // Detect Subject and Exam type from sheet name or headers
                    let type = 'Daily'; // Default
                    if (sheetName.toLowerCase().includes('exam')) type = 'Exam';
                    if (sheetName.toLowerCase().includes('result')) type = 'Result';
                    
                    let term = 'Midterm';
                    if (sheetName.toLowerCase().includes('promotion')) term = 'Promotion';

                    // Look for Subject names in headers (columns 4+)
                    if (headerRowIdx !== -1) {
                        const headerRow = sheet[headerRowIdx];
                        let subjectCols = [];
                        for (let j = 0; j < headerRow.length; j++) {
                            const val = String(headerRow[j] || '').trim();
                            if (val && !['no','name','sex','phone','total','avg','result','mention'].includes(val.toLowerCase())) {
                                subjectCols.push({ col: j, name: val });
                            }
                        }

                        if (subjectCols.length > 0) {
                            for (let i = headerRowIdx + 1; i < sheet.length; i++) {
                                const row = sheet[i];
                                if (!row || !row[colMapping.name]) continue;
                                const studentName = String(row[colMapping.name]).trim();
                                const student = results.students.find(s => s.name === studentName);
                                if (!student) continue;

                                subjectCols.forEach(sub => {
                                    const score = parseFloat(row[sub.col]);
                                    if (!isNaN(score)) {
                                        results.grades.push({
                                            id: `grd_${Date.now()}_${Math.random().toString(36).substr(2,5)}`,
                                            studentId: student.id,
                                            classId: results.classes[0]?.id || '',
                                            subject: sub.name,
                                            score: score,
                                            type: type === 'Result' ? 'Exam' : type, // Map Result to Exam for consistency
                                            term: term,
                                            date: new Date().toISOString().split('T')[0]
                                        });
                                    }
                                });
                            }
                        }
                    }
                });

                // Dedup classes (if multiple sheets had metadata)
                results.classes = results.classes.filter((v, i, a) => a.findIndex(t => (t.name === v.name && t.level === v.level)) === i);

                console.log("Parse complete:", {
                    classes: results.classes.length,
                    students: results.students.length,
                    grades: results.grades.length
                });

                resolve(results);
            } catch (err) {
                console.error("Excel parse error:", err);
                reject(err);
            }
        };
        reader.onerror = (err) => reject(err);
        reader.readAsArrayBuffer(file);
    });
};
