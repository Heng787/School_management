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

                // The primary sheet for Classes and Students is "(1).Classes"
                // The sheets for grades could be "(2).Midterm Daily", "(3).Midterm Exam", "(4).Midterm Results", "(5).Promotion Daily", "(6).Promotion Exam" 
                
                const classesSheetName = workbook.SheetNames.find(sn => sn.includes('Classes'));
                if (!classesSheetName) {
                    results.errors.push("Missing '(1).Classes' sheet. Please use the provided template.");
                    return resolve(results);
                }

                const classesSheet = XLSX.utils.sheet_to_json(workbook.Sheets[classesSheetName], { header: 1 });
                
                // Extract class details using keyword search across the top 10 rows
                let branch = 'Unknown Branch';
                let level = 'Unknown Level';
                let time = 'Unknown Time';
                let room = 'Unknown Room';
                let teacherName = 'Unknown Teacher';

                // Scan top rows for metadata (up to row 15)
                for (let i = 0; i < Math.min(classesSheet.length, 15); i++) {
                    const row = classesSheet[i];
                    if (!row) continue;
                    for (let j = 0; j < row.length; j++) {
                        const cellRaw = String(row[j] || '').trim().toLowerCase();
                        if (!cellRaw) continue;
                        const nextCellRaw = String(row[j + 1] || '').trim();

                        if (cellRaw === 'br:' || cellRaw === 'branch' || cellRaw === 'branch:') branch = nextCellRaw || branch;
                        if (cellRaw === 'level:' || cellRaw === 'level') level = nextCellRaw || level;
                        if (cellRaw === 'time:' || cellRaw === 'time' || cellRaw === 'schedule:') time = nextCellRaw || time;
                        if (cellRaw === 'room:' || cellRaw === 'room') room = nextCellRaw || room;
                        if (cellRaw === 'tr:' || cellRaw === 'teacher:' || cellRaw === 'teacher') teacherName = nextCellRaw || teacherName;
                    }
                }

                let classData = {
                    name: room,
                    level,
                    schedule: time,
                    teacherName,
                    branch,
                    id: 'new_class_' + Date.now()
                };

                results.classes.push(classData);

                // Find the header row for the student table
                let headerRowIdx = -1;
                let colMapping = { name: -1, sex: -1, phone: -1 };

                for (let i = 0; i < Math.min(classesSheet.length, 30); i++) {
                    const row = classesSheet[i];
                    if (!row) continue;
                    let foundName = false;
                    
                    for (let j = 0; j < row.length; j++) {
                        const val = String(row[j] || '').trim().toLowerCase();
                        if (val === 'name' || val === 'student name' || val === 'student' || val === 'students') {
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

                // Fallback to strict columns if header row not found or incomplete
                if (headerRowIdx === -1) {
                    headerRowIdx = 5; // Default to row 6
                    if (colMapping.name === -1) colMapping.name = 1;
                }
                if (colMapping.sex === -1) colMapping.sex = colMapping.name + 1;
                if (colMapping.phone === -1) colMapping.phone = colMapping.name + 2;

                const studentStartRow = headerRowIdx + 1;
                let studentList = [];

                for (let i = studentStartRow; i < classesSheet.length; i++) {
                    const row = classesSheet[i];
                    if (!row || !row[colMapping.name] || String(row[colMapping.name]).trim() === '') continue; // Skip empty names
                    
                    const cell0 = String(row[0] || '').trim().toLowerCase();
                    if (cell0 === 'no' || cell0 === 'name' || cell0 === 'student') continue; // Skip repeating headers

                    const name = String(row[colMapping.name]).trim();
                    const sexRaw = String(row[colMapping.sex] || '').trim().toUpperCase();
                    const sex = (sexRaw === 'M' || sexRaw === 'MALE' || sexRaw === 'BOY') ? 'Male' : 'Female';
                    const phone = String(row[colMapping.phone] || '').trim();

                    const studentObj = {
                        id: 'new_stu_' + Date.now() + '_' + i,
                        name,
                        sex,
                        phone,
                        dob: '2015-01-01', // Default DOB
                        status: 'Active',
                        enrollmentDate: new Date().toISOString().split('T')[0]
                    };

                    studentList.push(studentObj);
                    results.students.push(studentObj);
                    results.enrollments.push({ studentId: studentObj.id, classId: classData.id });
                }

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
