import Modal from './ui/Modal';

const ImportResultsModal = ({ results, onClose }) => {
    if (!results) return null;

    const hasErrors   = results.errorCount > 0;
    const hasWarnings = results.warnings?.length > 0;

    return (
        <Modal
            onClose={onClose}
            title="Import Results"
            maxWidth="max-w-2xl"
        >
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-xl text-center border border-green-200 dark:border-green-800/50">
                    <p className="text-sm font-medium text-green-800 dark:text-green-300">Successful Imports</p>
                    <p className="text-3xl font-bold text-green-900 dark:text-green-100">{results.successCount}</p>
                </div>
                <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-xl text-center border border-red-200 dark:border-red-800/50">
                    <p className="text-sm font-medium text-red-800 dark:text-red-300">Failed Imports</p>
                    <p className="text-3xl font-bold text-red-900 dark:text-red-100">{results.errorCount}</p>
                </div>
            </div>

            {hasErrors && (
                <div className="grow overflow-hidden flex flex-col mb-4">
                    <h3 className="text-lg font-semibold text-gray-700 dark:text-slate-200 mb-2">Error Details</h3>
                    <div
                        className="border dark:border-slate-700 rounded-xl overflow-y-auto focus:outline-none focus:ring-2 focus:ring-primary-500 max-h-[300px]"
                        tabIndex={0}
                        role="region"
                        aria-label="Error details list"
                    >
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-700">
                            <thead className="bg-gray-50 dark:bg-slate-800 sticky top-0 z-10">
                                <tr>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">CSV Row</th>
                                    <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-slate-400 uppercase">Error Message</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-gray-200 dark:divide-slate-700">
                                {results.errors.map((error, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-800 dark:text-slate-200">{error.row}</td>
                                        <td className="px-4 py-3 whitespace-normal text-sm text-gray-600 dark:text-slate-400">{error.message}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {hasWarnings && (
                <div className="mb-4">
                    <h3 className="text-base font-semibold text-amber-700 dark:text-amber-400 mb-2">⚠ Notices</h3>
                    <ul className="space-y-1">
                        {results.warnings.map((w, i) => (
                            <li key={i} className="text-sm text-amber-800 dark:text-amber-200 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 rounded-lg px-4 py-2">
                                {w.message}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-end pt-6">
                <button
                    onClick={onClose}
                    className="px-6 py-2.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md shadow-primary-200"
                >
                    Close
                </button>
            </div>
        </Modal>
    );
};

export default ImportResultsModal;

