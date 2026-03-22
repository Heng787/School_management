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
                                if (cell.includes('br:') || cell.includes('branch')) branch = val;
                                if (cell === 'level:' || cell === 'level') level = val;
                                if (cell.includes('time') || cell.includes('schedule')) time = val;
                                if (cell === 'room:' || cell === 'room') room = val;
                                if (cell === 'tr:' || cell.includes('teacher')) teacherName = val;
                            }
                        }
                        
                        if (level && room) {
                            // Enforce app's strict schedule formatting prefix
                            if (time && !time.toLowerCase().includes('weekday') && !time.toLowerCase().includes('weekend')) {
                                time = `Weekday ${time.replace(':', ':')}`;
                            }
                            results.classes.push({ name: room, level, schedule: time, teacherName, branch, id: 'cls_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4) });
                        }
                    }

                    // --- B. STUDENT LIST SCAN ---
                    let colMapping = { name: -1, sex: -1, phone: -1 };
                    let headerRowIdx = -1;
                    // Find header row by looking for 'name' column
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
                        if (foundName) { 
                            headerRowIdx = i; 
                            break; 
                        }
                    }

                    // Track students added in this specific sheet
                    let sheetStudentIds = [];
                    
                    if (headerRowIdx !== -1) {
                        for (let i = headerRowIdx + 1; i < sheet.length; i++) {
                            const row = sheet[i];
                            if (!row || !row[colMapping.name]) {
                                // Break consecutive empty rows
                                if (i > headerRowIdx + 20) break;
                                continue;
                            }
                            
                            const nameVal = String(row[colMapping.name]).trim();
                            // Stop parsing if we hit an empty name, "name", "no", or just a number which usually indicates the end of a list.
                            if (!nameVal || nameVal.toLowerCase() === 'name' || nameVal.toLowerCase() === 'no' || !isNaN(nameVal)) {
                                continue;
                            }

                            // Avoid duplicates globally but keep track of ID for this sheet
                            let existingStudent = results.students.find(s => s.name.toLowerCase() === nameVal.toLowerCase());
                            let studentId;
                            
                            if (existingStudent) {
                                studentId = existingStudent.id;
                            } else {
                                studentId = 'stu_imp_' + Date.now() + '_' + i + '_' + Math.random().toString(36).substr(2, 3);
                                
                                let rawPhone = String(row[colMapping.phone] || '').trim();
                                if (rawPhone && !rawPhone.startsWith('0') && rawPhone.replace(/\s/g, '').length >= 8) {
                                    rawPhone = '0' + rawPhone;
                                }

                                const studentObj = {
                                    id: studentId,
                                    name: nameVal,
                                    sex: (String(row[colMapping.sex] || '').toUpperCase().startsWith('M')) ? 'Male' : 'Female',
                                    phone: rawPhone,
                                    dob: '2015-01-01',
                                    status: 'Active',
                                    enrollmentDate: new Date().toISOString().split('T')[0]
                                };
                                results.students.push(studentObj);
                            }
                            
                            sheetStudentIds.push(studentId);
                        }
                    }

                    // --- C. GRADES / MARKS SCAN ---
                    // Detect Subject and Exam type from sheet name or headers
                    let type = 'Daily'; // Default
                    if (sheetName.toLowerCase().includes('exam')) type = 'Exam';
                    if (sheetName.toLowerCase().includes('result')) type = 'Result';
                    
                    let term = 'Midterm';
                    if (sheetName.toLowerCase().includes('promotion')) term = 'Promotion';
                    
                    // Scan top rows for a dynamic term title (like 'MIDTERM DAILY SCORE SHEET')
                    for (let i = 0; i < Math.min(sheet.length, 6); i++) {
                        const row = sheet[i];
                        if (!row) continue;
                        for (let j = 0; j < row.length; j++) {
                            const val = String(row[j] || '').trim().toLowerCase();
                            if (val.includes('score sheet')) {
                                const cleanTitle = val.replace('score sheet', '').trim();
                                if (cleanTitle.length > 3) {
                                    // Capitalize words for clean term formatting
                                    term = cleanTitle.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
                                }
                            }
                        }
                    }

                    // Look for Subject names in headers
                    if (headerRowIdx !== -1) {
                        let headerRow = sheet[headerRowIdx];
                        
                        // Fix to prevent parser from locking onto the red "10 points" sub-row as headers
                        let pointsCount = 0;
                        for (let j = 0; j < headerRow.length; j++) {
                            if (String(headerRow[j]).toLowerCase().includes('point')) pointsCount++;
                        }
                        if (pointsCount >= 3 && headerRowIdx > 0) {
                            headerRowIdx = headerRowIdx - 1; // Shift up one row to the true subjects!
                            headerRow = sheet[headerRowIdx];
                        }

                        let subjectCols = [];
                        let lastSubject = '';
                        // Identify subject columns. Support merged multi-columns by appending numeric identifiers
                        for (let j = 0; j < headerRow.length; j++) {
                            const val = String(headerRow[j] || '').trim();
                            const lowerVal = val.toLowerCase();
                            
                            const isExcluded = ['no','name','sex','phone','total','avg','result','mention'].includes(lowerVal) 
                                                || lowerVal.includes('change') 
                                                || lowerVal.includes('stop')
                                                || lowerVal.includes('point');

                            if (val && !isExcluded) {
                                subjectCols.push({ col: j, name: val });
                                lastSubject = val;
                            } else if (!val && lastSubject && j > 3) {
                                // Cell is blank but follows a parsed subject; highly likely this is a merged cell dual-column system.
                                subjectCols.push({ col: j, name: `${lastSubject} Part 2` });
                                lastSubject = ''; // Prevent cascade linking
                            } else {
                                lastSubject = '';
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

                // Dedup classes globally
                let uniqueClasses = [];
                let classMap = {}; // Maps old duplicate ID to strict unique ID
                
                results.classes.forEach(c => {
                    const key = `${c.name.toLowerCase()}_${c.level.toLowerCase()}`;
                    const existing = uniqueClasses.find(uc => `${uc.name.toLowerCase()}_${uc.level.toLowerCase()}` === key);
                    if (existing) {
                        classMap[c.id] = existing.id;
                    } else {
                        classMap[c.id] = c.id;
                        uniqueClasses.push(c);
                    }
                });
                results.classes = uniqueClasses;

                // --- B2. ENROLLMENT CREATION (1 Class per Student mapped correctly) ---
                // We create enrollments AFTER resolving unique classes to prevent 2 classes logic
                if (results.classes.length > 0) {
                    // Default to the first mapped unique class to prevent multiple class creations per student across sheets
                    const primaryClassId = results.classes[0].id; 
                    
                    results.students.forEach(student => {
                        results.enrollments.push({
                            studentId: student.id,
                            classId: primaryClassId
                        });
                    });
                }
                
                // --- C2. GRADE CLASS ID CLEANUP ---
                // Ensure grades point to the cleaned up class map
                results.grades.forEach(g => {
                   if(classMap[g.classId]) {
                       g.classId = classMap[g.classId];
                   } else {
                       g.classId = results.classes[0]?.id || '';
                   }
                });

                // Final deduplication for enrollments just in case
                results.enrollments = results.enrollments.filter((v, i, a) => 
                    a.findIndex(t => (t.studentId === v.studentId && t.classId === v.classId)) === i
                );

                console.log("Parse complete:", {
                    classes: results.classes.length,
                    students: results.students.length,
                    enrollments: results.enrollments.length,
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
