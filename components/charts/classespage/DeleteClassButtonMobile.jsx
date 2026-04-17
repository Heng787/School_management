import React from "react";

const DeleteClassButtonMobile = ({ onDelete }) => {
  return (
    <button
      onClick={onDelete}
      className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-xs font-bold hover:bg-red-100 transition-all"
    >
      Delete
    </button>
  );
};

export default DeleteClassButtonMobile;
