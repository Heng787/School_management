import React from 'react';

const ImportResultsModal = ({ results, onClose }) => {
    if (!results) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" role="dialog" aria-modal="true" aria-labelledby="import-results-title">
            <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-2xl max-h-[90vh] flex flex-col">
                <h2 id="import-results-title" className="text-2xl font-bold text-gray-800 mb-4">Import Results</h2>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                        <p className="text-sm font-medium text-green-800">Successful Imports</p>
                        <p className="text-3xl font-bold text-green-900">{results.successCount}</p>
                    </div>
                     <div className="bg-red-100 p-4 rounded-lg text-center">
                        <p className="text-sm font-medium text-red-800">Failed Imports</p>
                        <p className="text-3xl font-bold text-red-900">{results.errorCount}</p>
                    </div>
                </div>

                {results.errorCount > 0 && (
                     <div className="flex-grow overflow-hidden flex flex-col">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Error Details</h3>
                        <div className="border rounded-lg overflow-y-auto" tabIndex={0}>
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50 sticky top-0 z-10">
                                    <tr>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CSV Row</th>
                                        <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Error Message</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {results.errors.map((error, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800">{error.row}</td>
                                            <td className="px-4 py-3 whitespace-normal text-sm text-gray-600">{error.message}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
                
                <div className="flex justify-end pt-6">
                    <button onClick={onClose} className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700">Close</button>
                </div>
            </div>
        </div>
    );
};

export default ImportResultsModal;
