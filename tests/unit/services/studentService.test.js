import { describe, it, expect, vi, beforeEach } from 'vitest';
import { studentService } from '@/services/studentService';
import { fetchCollection, pushCollection } from '@/services/core';

vi.mock('@/services/core', () => ({
  fetchCollection: vi.fn(),
  pushCollection: vi.fn(),
}));

describe('studentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudents', () => {
    it('should call fetchCollection with "students"', async () => {
      await studentService.getStudents();
      expect(fetchCollection).toHaveBeenCalledWith('students', expect.any(Function));
    });
  });

  describe('getEnrollments', () => {
    it('should filter out duplicate enrollments', async () => {
      // Arrange
      const mockEnrollments = [
        { studentId: '1', classId: 'A' },
        { studentId: '1', classId: 'A' }, // Duplicate
        { studentId: '2', classId: 'A' },
      ];
      fetchCollection.mockResolvedValue(mockEnrollments);

      // Act
      const result = await studentService.getEnrollments();

      // Assert
      expect(result).toHaveLength(2);
      expect(result).toEqual([
        { studentId: '1', classId: 'A' },
        { studentId: '2', classId: 'A' },
      ]);
    });
  });

  describe('saveStudents', () => {
    it('should call pushCollection with "students" and mapped data', async () => {
      const mockStudents = [{ id: '1', name: 'Test' }];
      await studentService.saveStudents(mockStudents);
      expect(pushCollection).toHaveBeenCalledWith('students', mockStudents, expect.any(Function));
    });
  });
});
