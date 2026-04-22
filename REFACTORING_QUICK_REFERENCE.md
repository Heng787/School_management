# StudentsPage Refactoring - Quick Reference

## What Changed?

### State Management

**Before:** 14 separate `useState` calls scattered throughout component
**After:** 5 organized custom hooks

### Code Organization

Clear sections with numbered comments (1-12) making navigation easy

### File Structure

```
hooks/
  useStudentsPageState.js          ← Custom state hooks
utils/
  studentFilterUtils.js             ← Pure filter functions
  importProcessingUtils.js          ← Import logic utilities
pages/
  StudentsPage.jsx                  ← Refactored component
REFACTORING_SUMMARY.md             ← Detailed documentation
```

---

## Custom Hooks

### `useFilters()`

**What it does:** Manages search, class, and status filters

```javascript
const filters = useFilters();
filters.searchTerm; // Current search term
filters.setSearchTerm(val); // Update search
filters.classFilter; // Current class filter
filters.setClassFilter(val); // Update class
filters.statusFilter; // Current status
filters.setStatusFilter(val); // Update status
filters.resetFilters(); // Clear all filters
```

### `useStudentSelection()`

**What it does:** Manages checkbox selections for bulk operations

```javascript
const selection = useStudentSelection();
selection.selectedStudentIds; // Set of selected IDs
selection.toggleSelect(id); // Toggle one student
selection.toggleSelectAllOnPage(ids); // Toggle page
selection.clearSelection(); // Clear all
```

### `useModalState()`

**What it does:** Manages 4 different modals (student, report, delete, bulk delete)

```javascript
const modals = useModalState();

// Student modal
modals.isModalOpen
modals.editingStudent
modals.openStudentModal(student?)
modals.closeStudentModal()

// Report modal
modals.isReportModalOpen
modals.selectedReportStudent
modals.openReportModal(student)
modals.closeReportModal()

// Delete confirm modal
modals.isConfirmDeleteOpen
modals.studentToDelete
modals.openDeleteConfirm(student)
modals.closeDeleteConfirm()

// Bulk delete modal
modals.isBulkDeleteModalOpen
modals.openBulkDeleteModal()
modals.closeBulkDeleteModal()
```

### `useImportState()`

**What it does:** Manages import workflow (preview → confirm → results)

```javascript
const importState = useImportState();
importState.importPreviewData; // Data being previewed
importState.setImportPreviewData(); // Set preview data
importState.isImportModalOpen; // Show results modal?
importState.setIsImportModalOpen(); // Show/hide
importState.importResults; // Import results
importState.setImportResults(); // Set results
importState.resetImport(); // Clear everything
```

### `usePaginationState()`

**What it does:** Manages pagination and deletion loading state

```javascript
const pagination = usePaginationState();
pagination.currentPage; // Current page number
pagination.setCurrentPage(); // Jump to page
pagination.pageSize; // Items per page
pagination.setPageSize(); // Change page size
pagination.isDeletingId; // Which student is being deleted?
pagination.setIsDeletingId(); // Set loading state
pagination.resetPagination(); // Go to page 1
```

---

## Utility Functions

### Filter Utilities (`studentFilterUtils.js`)

```javascript
// Individual filter functions
filterStudentsByRole(students, currentUser, classes, enrollments);
filterStudentsBySearch(students, searchTerm);
filterStudentsByStatus(students, status);
filterStudentsByClass(students, classId, enrollments);

// Main pipeline
applyAllFilters(students, currentUser, classes, enrollments, {
  searchTerm,
  classFilter,
  statusFilter,
});

// Display helper
buildDisplayClassesMap(students, currentUser, classes, enrollments);
```

### Import Processing (`importProcessingUtils.js`)

```javascript
// ID generation
getNextStudentId(students);

// Matching
matchStudentsByName(importedStudent, students);
getDefaultStudentMatch(importedStudent, possibleMatches);
prepareStudentsForPreview(validStudents, students);

// Processing
processFinalStudentList(modifiedStudents, students, importType);
remapRelatedData(enrollments, grades, tempIdToFinalIdMap);
```

---

## Component Structure

### 1. CONTEXT & DATA

Get data from DataContext

### 2. CUSTOM HOOKS

Initialize all 5 custom hooks

### 3. REFS

Set up refs for file input and scrolling

### 4. DERIVED VALUES

Compute `isAdmin` and `isOffice`

### 5. MEMOIZED DATA

Calculate filtered students and class map

### 6. SIDE EFFECTS

Handle pagination reset and highlighting

### 7-10. HANDLERS

Deletion, export, import logic

### 11. PAGINATION HELPERS

Calculate page IDs for bulk selection

### 12. RENDER

JSX markup

---

## Usage in Component

### Before

```javascript
// Scattered throughout
const [isModalOpen, setIsModalOpen] = useState(false);
const handleOpenModal = (student = null) => {
  setEditingStudent(student);
  setIsModalOpen(true);
};
// Used with: setIsModalOpen(false)
```

### After

```javascript
// Clean imports
const modals = useModalState();
// Used with: modals.openStudentModal(student)
//            modals.closeStudentModal()
```

---

## Common Patterns

### Opening/Closing Modals

```javascript
<StudentHeaderActions
  onAddStudent={() => modals.openStudentModal()}    // New
  onBulkDelete={() => modals.openBulkDeleteModal()} // Bulk delete
/>

<StudentTable
  onEdit={modals.openStudentModal}                  // Edit student
  onDelete={modals.openDeleteConfirm}               // Delete student
  onReportCard={modals.openReportModal}             // Report card
/>
```

### Managing Filters

```javascript
<StudentSearchBar
  searchTerm={filters.searchTerm}
  setSearchTerm={filters.setSearchTerm}
/>

<select value={filters.classFilter} onChange={(e) => filters.setClassFilter(e.target.value)}>
```

### Managing Selection

```javascript
<StudentTable
  selectedStudentIds={selection.selectedStudentIds}
  onSelectStudent={selection.toggleSelect}
  onSelectAllOnPage={() => selection.toggleSelectAllOnPage(pageIds)}
/>
```

---

## Key Benefits

✅ **Reduced Complexity** - From 14 useState to 5 hooks
✅ **Better Organization** - Clear sections with comments
✅ **Reusable** - Hooks and utilities can be used elsewhere
✅ **Testable** - Pure functions are easy to test
✅ **Maintainable** - Logic is isolated and focused
✅ **Scalable** - Easy to add new features

---

## Troubleshooting

**Q: Component not re-rendering?**
A: Check that hook functions are being called (e.g., `filters.setSearchTerm()` not just `filters.searchTerm`)

**Q: Filters not working?**
A: Verify `applyAllFilters` is being called with correct parameters in useMemo

**Q: Import failing?**
A: Check `processFinalStudentList` and `remapRelatedData` are using correct ID mappings

---

## Next Steps

1. Test all features work as before
2. Apply same pattern to other pages
3. Create utility library for shared logic
4. Add TypeScript for better type safety
