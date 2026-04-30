import { describe, it, expect, beforeEach, vi } from 'vitest';
import { studentService } from '../../services/studentService';
import { localStore } from '../../services/core';

// Create mock functions that we can assert against
const mockUpsert = vi.fn().mockResolvedValue({ error: null });
const mockSelect = vi.fn().mockReturnThis();
const mockOrder = vi.fn().mockResolvedValue({ data: [], error: null });

const mockClient = {
    from: vi.fn().mockReturnThis(),
    upsert: mockUpsert,
    select: mockSelect,
    order: mockOrder,
};

// Mocking Supabase client for controlled stress simulation
vi.mock('@supabase/supabase-js', () => ({
    createClient: () => mockClient
}));

describe('Extreme Stress Tests - Sync Engine', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
        
        // Ensure mock returns successful response for upsert
        mockUpsert.mockResolvedValue({ error: null });

        process.env.SUPABASE_URL = 'http://localhost:54321';
        process.env.SUPABASE_ANON_KEY = 'test-key';

        Object.defineProperty(navigator, 'onLine', {
            configurable: true,
            value: true,
            writable: true
        });
    });

    /**
     * STRESS TEST 1: Massive Bulk Load (500 Records)
     * Goal: Verify if the system can handle a single push of 500 records without crashing or timing out.
     */
    it('should handle a bulk save of 500 student records', async () => {
        const largeDataset = Array.from({ length: 500 }, (_, i) => ({
            id: `student-stress-${i}`,
            name: `Stress Test Student ${i}`,
            sex: i % 2 === 0 ? 'Male' : 'Female',
            dob: '2000-01-01',
        }));

        const startTime = Date.now();
        await studentService.saveStudents(largeDataset);
        const duration = Date.now() - startTime;

        console.log(`[STRESS] 500 records saved in ${duration}ms`);
        
        // Assertions
        expect(duration).toBeLessThan(2000); // Expect < 2 seconds for local processing and mocked push
        expect(mockClient.upsert).toHaveBeenCalledWith(expect.any(Array));
        expect(mockClient.upsert.mock.calls[0][0].length).toBe(500);
        
        // Verify local storage
        const saved = localStore.get('students', []);
        expect(saved.length).toBe(500);
    });

    /**
     * STRESS TEST 2: Conflict & Granular Sync
     * Goal: Simulate two admins editing different parts of the list. 
     * Verify that only changed IDs are pushed.
     */
    it('should only push "dirty" records during a sync burst', async () => {
        // Initial state: 10 students
        const initialData = Array.from({ length: 10 }, (_, i) => ({
            id: `s-${i}`,
            name: `Student ${i}`
        }));
        localStore.set('students', initialData);
        localStore.clearDirtyIds('students');

        // Admin modifies ONLY student 5
        const modifiedData = [...initialData];
        modifiedData[5] = { ...modifiedData[5], name: 'Modified Name' };

        await studentService.saveStudents(modifiedData);

        // Verify that the upsert ONLY contained the modified student
        const upsertedData = mockClient.upsert.mock.calls[0][0];
        expect(upsertedData.length).toBe(1);
        expect(upsertedData[0].id).toBe('s-5');
        expect(upsertedData[0].name).toBe('Modified Name');
    });

    /**
     * STRESS TEST 3: Network Interruption Recovery
     * Goal: Verify that if the cloud push fails, the data remains "dirty" for the next attempt.
     */
    it('should preserve dirty state if network fails during bulk push', async () => {
        mockUpsert.mockResolvedValue({ error: { message: 'Network Timeout' } });
        
        const data = [{ id: 'fail-1', name: 'Failure Test' }];
        
        // We expect this to log a warning but not crash the local state
        try {
            await studentService.saveStudents(data);
        } catch (e) {
            // Error caught
        }

        expect(localStore.get('students', [])).toEqual(data);
        expect(localStore.isDirty('students')).toBe(true);
        expect(localStore.getDirtyIds('students')).toContain('fail-1');
    });

    /**
     * STRESS TEST 4: Payload Size Limit
     * Goal: Test 1MB string in a single record to check LocalStorage/Network boundaries.
     */
    it('should handle an extremely large data payload per record', async () => {
        const largeString = 'A'.repeat(1024 * 512); // 0.5MB string
        const heavyData = [{ id: 'heavy-1', name: 'Heavy Student', metadata: { largeString } }];

        await studentService.saveStudents(heavyData);

        const saved = localStore.get('students', []);
        expect(saved[0].metadata.largeString.length).toBe(1024 * 512);
        expect(mockClient.upsert).toHaveBeenCalled();
    });
});
