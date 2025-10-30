import React, { useState } from 'react';

const EditForm = ({ commentId, initialContent, onSubmit, onCancel }) => {
  const [editText, setEditText] = useState(initialContent);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editText.trim()) {
      onSubmit(commentId, editText);
    }
  };

  return (
    <div className="mb-2">
      <textarea
        value={editText}
        onChange={(e) => setEditText(e.target.value)}
        rows="3"
        autoFocus
        className="w-full bg-black border border-gray-700 rounded px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none"
      />
      <div className="flex gap-2 justify-end mt-2">
        <button
          type="button"
          onClick={() => {
            setEditText(initialContent);
            onCancel();
          }}
          className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!editText.trim()}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white rounded-lg font-medium transition"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default EditForm;
