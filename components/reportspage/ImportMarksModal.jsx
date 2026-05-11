import React, { useState, useRef } from 'react';
import { UploadCloud, X, Check, AlertCircle } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { importFileService } from '../../services/importFileService';
import { parseScoresheet } from '../../utils/scoresheetParser';

const ImportMarksModal = ({ isOpen, onClose, selectedClassId, selectedTerm, selectedDate, onImportComplete }) => {
  const { students, classes, saveGradeBatch } = useData();
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setPreviewData(null);

    try {
      const result = await importFileService.processScoresheetFile(
        file,
        students,
        classes,
        {
          saveGradeBatch,
          parseScoresheet,
          term: selectedTerm,
          date: selectedDate
        }
      );

      if (result.requiresPreview) {
        setPreviewData(result.previewData);
      } else {
        setError(result.message);
      }
    } catch (err) {
      console.error('Import error:', err);
      setError(err.message || 'Failed to parse the scoresheet. Please check the file format.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const confirmImport = () => {
    if (!previewData || !previewData.studentsToPreview) return;
    
    // Convert preview data into the format expected by MarksEntry
    // Basically we just want to update local grades in the parent component
    const gradesToImport = {};
    
    previewData.studentsToPreview.forEach(stu => {
      // Find the matched student ID
      const matchedStudentId = stu._selectedMatchId;
      if (matchedStudentId && matchedStudentId !== 'NEW') {
        gradesToImport[matchedStudentId] = { ...stu.scores };
      }
    });

    onImportComplete(gradesToImport);
    setPreviewData(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Import Scoresheet</h2>
            <p className="text-sm text-slate-500 mt-1">Upload a Kid Scoresheet Excel file (.xlsx)</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-xl transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {!previewData ? (
            <div 
              className="border-2 border-dashed border-slate-200 hover:border-primary-500 bg-slate-50 hover:bg-primary-50 transition-colors rounded-3xl p-12 text-center cursor-pointer relative"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept=".xlsx, .xls"
                onChange={handleFileUpload}
              />
              <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4 text-primary-500">
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <UploadCloud className="w-8 h-8" />
                )}
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {isProcessing ? 'Processing File...' : 'Click to Upload Excel'}
              </h3>
              <p className="text-slate-500 text-sm max-w-[280px] mx-auto">
                Only standard Kid Scoresheets with "Midterm Results" or "Midterm Daily" sheets are supported.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-emerald-800">Ready to Import</h4>
                  <p className="text-sm text-emerald-600 mt-1">
                    Found {previewData.studentsToPreview.length} student records in the file.
                  </p>
                </div>
                <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center text-emerald-500">
                  <Check className="w-6 h-6" />
                </div>
              </div>

              {previewData.targetClassId && previewData.targetClassId !== selectedClassId && (
                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600" />
                  <p className="text-sm font-medium text-amber-800">
                    Warning: The class room mentioned in the Excel file differs from the one you currently have selected. The marks will still be imported for the matched students.
                  </p>
                </div>
              )}

              <div className="border border-slate-200 rounded-2xl overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3">Student Name (File)</th>
                      <th className="p-3">Match Status</th>
                      <th className="p-3 text-right">Scores Found</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm">
                    {previewData.studentsToPreview.slice(0, 10).map((stu, idx) => (
                      <tr key={idx}>
                        <td className="p-3 font-medium text-slate-800">{stu.name}</td>
                        <td className="p-3">
                          {stu._selectedMatchId === 'NEW' ? (
                            <span className="text-rose-600 font-medium">Not Found in DB</span>
                          ) : (
                            <span className="text-emerald-600 font-medium flex items-center gap-1">
                              <Check className="w-4 h-4" /> Matched
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right font-medium text-slate-600">
                          {Object.keys(stu.scores || {}).length}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {previewData.studentsToPreview.length > 10 && (
                  <div className="p-3 text-center text-xs font-bold text-slate-500 bg-slate-50 border-t border-slate-100">
                    + {previewData.studentsToPreview.length - 10} more students
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {previewData && (
          <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
              onClick={() => setPreviewData(null)}
              className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
            <button 
              onClick={confirmImport}
              className="px-6 py-2.5 rounded-xl font-bold text-white bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all flex items-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              Import to Sheet
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImportMarksModal;
