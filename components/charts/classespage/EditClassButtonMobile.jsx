import React from "react";

const EditClassButtonMobile = ({ onEdit }) => {
  return (
    <button
      onClick={onEdit}
      className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition-all"
    >
      Edit
    </button>
  );
};

export default EditClassButtonMobile;
