const syncRepository = require('../repositories/syncRepository');

class StudentService {
  /**
   * Checks if a student with the same Name and DOB already exists.
   * Returns potential collisions to the client for human verification.
   */
  async checkCollisions(studentData) {
    const students = await syncRepository.getTableData('students');
    
    // Normalize input for comparison
    const targetName = studentData.name.trim().toLowerCase();
    const targetDob = studentData.dob; // Format: YYYY-MM-DD

    const collisions = students.filter(s => {
      // Skip if checking against itself (if ID exists)
      if (studentData.id && s.id === studentData.id) return false;
      
      const matchName = s.name.trim().toLowerCase() === targetName;
      const matchDob = s.dob === targetDob;
      
      return matchName && matchDob;
    });

    return {
      isPotentialDuplicate: collisions.length > 0,
      collisions: collisions.map(c => ({
        id: c.id,
        name: c.name,
        dob: c.dob,
        sex: c.sex,
        phone: c.phone
      }))
    };
  }

  /**
   * Normalizes student data before storage.
   * Enforces 2-gender system and cleans whitespace.
   */
  normalizeStudent(student) {
    const normalized = { ...student };
    
    // Normalize Gender (Strict 2-gender system)
    if (normalized.sex || normalized.gender) {
      const sex = (normalized.sex || normalized.gender || '').trim().toLowerCase();
      if (['female', 'f', 'girl'].includes(sex)) {
        normalized.sex = 'Female';
      } else {
        // Default everything else to Male as per recent UI constraints
        normalized.sex = 'Male';
      }
      // Cleanup legacy gender field
      delete normalized.gender;
    }

    if (normalized.name) normalized.name = normalized.name.trim();
    
    return normalized;
  }
}

module.exports = new StudentService();
