import * as XLSX from 'xlsx';
import { sanitize } from './sanitizer';

// Extracts level, room, time, teacher from the top of the sheet
const extractMetadata = (sheet) => {
  let level = '', room = '', time = '', teacherName = '';

  for (let i = 0; i < Math.min(sheet.length, 10); i++) {
    const row = sheet[i];
    if (!row) continue;

    for (let j = 0; j < row.length; j++) {
      const val = sanitize(String(row[j] || ''));
      const nextVal = sanitize(String(row[j + 1] || ''));
      const lv = val.toLowerCase();

      if (lv.includes('level:') && !level) level = nextVal || val.replace(/level:/i, '').trim();
      if (lv.includes('room:') && !room) room = nextVal || val.replace(/room:/i, '').trim();
      if (lv.includes('time:') && !time) time = nextVal || val.replace(/time:/i, '').trim();
      if (lv.includes('tr:') && !teacherName) teacherName = nextVal || val.replace(/tr:/i, '').trim();
    }
  }

  return { level, room, time, teacherName };
};

// Normalises subject names to match database names if needed
const normalizeSubject = (sub) => {
  const s = sanitize(String(sub || '')).trim();
  if (!s) return null;
  if (s.toLowerCase() === 'up-low c') return 'Up-Low C';
  if (s.toLowerCase() === 'alphabet n') return 'Alphabet N';
  if (s.toLowerCase() === 'alphabet s') return 'Alphabet S';
  return s;
};

export const parseScoresheet = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const buffer = e.target.result;
        const workbook = XLSX.read(new Uint8Array(buffer), { type: 'array' });
        
        const results = {
          metadata: {},
          students: [], // { name, sex, scores: { subject: score } }
          errors: []
        };

        // We prefer 'Midterm Results' or 'Promotion Results'
        const sheetName = workbook.SheetNames.find(n => n.toLowerCase().includes('results')) || 
                          workbook.SheetNames.find(n => n.toLowerCase().includes('midterm'));
        
        if (!sheetName) {
          throw new Error('Could not find a Results or Midterm sheet in the file.');
        }

        const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
        results.metadata = extractMetadata(sheet);

        let headerRowIdx = -1;
        let subjectsRowIdx = -1;
        const colMap = { name: -1, sex: -1 };
        const subjectCols = {}; // colIndex -> subjectName

        // Find header row and subjects row
        for (let i = 0; i < Math.min(sheet.length, 15); i++) {
          const row = sheet[i];
          if (!row) continue;
          
          let hasName = false;
          let hasSex = false;
          
          for (let j = 0; j < row.length; j++) {
            const val = sanitize(String(row[j] || '')).toLowerCase();
            if (val === 'name' || val === 'student name') {
              hasName = true;
              colMap.name = j;
            }
            if (val === 'sex' || val === 'gender') {
              hasSex = true;
              colMap.sex = j;
            }
          }

          if (hasName) {
            headerRowIdx = i;
            subjectsRowIdx = i - 1; // Subjects are usually in the row right above the NO/NAME/SEX row
            break;
          }
        }

        if (headerRowIdx === -1) throw new Error('Could not find Name/Sex header row.');

        // Map subjects from the subjects row
        const subjRow = sheet[subjectsRowIdx] || [];
        for (let j = colMap.sex + 1; j < subjRow.length; j++) {
          const sub = normalizeSubject(subjRow[j]);
          if (sub && sub.toLowerCase() !== 'daily' && sub.toLowerCase() !== 'total' && sub.toLowerCase() !== 'scores') {
            subjectCols[j] = sub;
          }
        }

        // Parse student scores
        for (let i = headerRowIdx + 1; i < sheet.length; i++) {
          const row = sheet[i];
          if (!row || !row[colMap.name]) continue;

          const name = sanitize(String(row[colMap.name]));
          // Stop parsing if we hit summary rows or empty
          if (!name || name.toLowerCase() === 'name' || name.toLowerCase().includes('total')) break;

          const sex = sanitize(String(row[colMap.sex] || ''));
          const scores = {};

          for (const [colIdx, subName] of Object.entries(subjectCols)) {
            const scoreVal = parseFloat(row[colIdx]);
            if (!isNaN(scoreVal)) {
              scores[subName] = scoreVal;
            }
          }

          results.students.push({ name, sex, scores });
        }

        resolve(results);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};
