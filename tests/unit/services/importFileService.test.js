import { importFileService } from '@/services/importFileService';

// Note: To run these tests, you must install vitest
// npm install -D vitest

describe('importFileService', () => {
  describe('processCSVFile', () => {
    it('should parse CSV and call addClasses for valid classes', async () => {
      // Arrange
      const mockFile = { text: async () => "name,level,schedule\nClass A,L1,Monday" };
      const staff = [];
      const classes = [];
      const addClasses = vi.fn().mockResolvedValue(true);
      const parseClassCSV = vi.fn().mockReturnValue({
        validClasses: [{ id: '1', name: 'Class A' }],
        errors: []
      });

      // Act
      const result = await importFileService.processCSVFile(
        mockFile, staff, classes, addClasses, parseClassCSV
      );

      // Assert
      expect(parseClassCSV).toHaveBeenCalledWith("name,level,schedule\nClass A,L1,Monday", staff);
      expect(addClasses).toHaveBeenCalledWith([{ id: '1', name: 'Class A' }]);
      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
    });

    it('should not call addClasses if no valid classes are found', async () => {
      // Arrange
      const mockFile = { text: async () => "invalid data" };
      const addClasses = vi.fn();
      const parseClassCSV = vi.fn().mockReturnValue({
        validClasses: [],
        errors: ['Missing required fields']
      });

      // Act
      const result = await importFileService.processCSVFile(
        mockFile, [], [], addClasses, parseClassCSV
      );

      // Assert
      expect(addClasses).not.toHaveBeenCalled();
      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toContain('Missing required fields');
    });
  });
});
