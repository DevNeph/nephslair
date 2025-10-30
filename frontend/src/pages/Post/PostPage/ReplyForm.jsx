import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const ReplyForm = ({ commentId, onSubmit, onCancel, submitting, user }) => {
  const [replyText, setReplyText] = useState('');
  if (!user) {
    return (
      <div className="mt-4 p-4 border border-gray-700 rounded-lg text-center">
        <p className="text-gray-400">
          Please <Link to="/login" className="text-white hover:text-gray-400 underline">login</Link> to reply
        </p>
      </div>
    );
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    if (replyText.trim()) {
      onSubmit(commentId, replyText);
      setReplyText('');
    }
  };
  return (
    <div className="mt-4">
      <textarea
        value={replyText}
        onChange={(e) => setReplyText(e.target.value)}
        placeholder="Write a reply..."
        rows="3"
        autoFocus
        className="w-full bg-black border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none"
      />
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={() => {
            setReplyText('');
            onCancel();
          }}
          className="px-4 py-2 border border-gray-700 hover:bg-gray-900 text-white rounded transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting || !replyText.trim()}
          className="px-4 py-2 bg-white text-black hover:bg-gray-200 rounded transition disabled:opacity-50"
        >
          {submitting ? 'Posting...' : 'Reply'}
        </button>
      </div>
    </div>
  );
};

export default ReplyForm;
