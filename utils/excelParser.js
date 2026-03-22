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
                
                // Extract class details
                // B2/C2 etc.. We read rows
                const rowBr = classesSheet[0] || [];
                const rowLevel = classesSheet[1] || [];
                const rowTime = classesSheet[2] || [];
                const rowRoom = classesSheet[3] || [];
                const rowTr = classesSheet[4] || [];

                const getVal = (row, idx) => (row[idx] ? String(row[idx]).trim() : '');
                
                // Assuming it's in Column B (index 1)
                const branch = getVal(rowBr, 1) || 'Unknown Branch';
                const level = getVal(rowLevel, 1) || 'Unknown Level';
                const time = getVal(rowTime, 1) || 'Unknown Time';
                const room = getVal(rowRoom, 1) || 'Unknown Room';
                const teacherName = getVal(rowTr, 1) || 'Unknown Teacher';

                let classData = {
                    name: room,
                    level,
                    schedule: time,
                    teacherName,
                    branch,
                    id: 'new_class_' + Date.now()
                };

                results.classes.push(classData);

                // Start parsing students at row 7 (index 6 in 0-based array)
                // NO | NAME | SEX | PHONE
                const studentStartRow = 6;
                let studentList = [];

                for (let i = studentStartRow; i < classesSheet.length; i++) {
                    const row = classesSheet[i];
                    if (!row || !row[1] || row[1].trim() === '') continue; // Skip empty names
                    
                    const no = row[0];
                    if (no === 'NO') continue; // Skip header again if any

                    const name = String(row[1]).trim();
                    const sexRaw = String(row[2] || '').trim().toUpperCase();
                    const sex = (sexRaw === 'M' || sexRaw === 'MALE') ? 'Male' : 'Female';
                    const phone = String(row[3] || '').trim();

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
