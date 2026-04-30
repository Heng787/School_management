import React from "react";
import {
  DeleteSelectedButton,
  ExportSelectedButton,
  TemplateButton,
  ImportButton,
  ClassSettingsButton,
  AddClassButton,
} from ".";

const ClassesPageHeader = ({
  selectedClassIds,
  isAdmin,
  isConfigOpen,
  onDeleteSelected,
  onExportSelected,
  onDownloadTemplate,
  onImportClick,
  onToggleConfig,
  onAddClass,
  fileInputRef,
  onFileChange,
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
      <div className="space-y-1">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Classes
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">
          Manage schedules, room assignments, and enrollment.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-2 pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 w-[calc(100%+2rem)] md:w-auto">
        {selectedClassIds.size > 0 && isAdmin && (
          <div className="flex items-center gap-2">
            <DeleteSelectedButton
              selectedCount={selectedClassIds.size}
              onDelete={onDeleteSelected}
            />
            <ExportSelectedButton
              selectedCount={selectedClassIds.size}
              onExport={onExportSelected}
            />
          </div>
        )}
        {isAdmin && (
          <>
            <TemplateButton onDownload={onDownloadTemplate} />
            <ImportButton onImport={onImportClick} />
            <input
              type="file"
              ref={fileInputRef}
              onChange={onFileChange}
              accept=".csv, .xlsx, .xls"
              className="hidden"
            />
            <ClassSettingsButton
              isOpen={isConfigOpen}
              onToggle={onToggleConfig}
            />
            <AddClassButton onAdd={onAddClass} />
          </>
        )}
      </div>
    </div>
  );
};

export default ClassesPageHeader;
