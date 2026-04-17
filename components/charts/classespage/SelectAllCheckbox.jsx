import React from "react";

const SelectAllCheckbox = ({ checked, onChange }) => {
  return (
    <label className="flex items-center gap-3 cursor-pointer select-none px-3 py-2 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4.5 w-4.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 transition-all"
      />
      <span className="text-sm font-bold text-slate-700">Select All</span>
    </label>
  );
};

export default SelectAllCheckbox;
