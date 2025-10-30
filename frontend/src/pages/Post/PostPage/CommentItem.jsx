import React from 'react';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiTrash2, FiEdit2 } from 'react-icons/fi';
import EditForm from './EditForm';
import ReplyForm from './ReplyForm';
import { getVoteCount } from '../../../utils/helpers';

const CommentItem = ({ comment, depth = 0, user, votingComment, isExpanded, expandedComments, replyCount, canModifyComment, editingCommentId, replyingTo, submitting, handleVote, handleUpdateComment, setReplyingTo, setEditingCommentId, handleDeleteComment, toggleExpand, CommentItemSelf }) => {
  // Recursive rendering için CommentItemSelf kullanmak gerekiyor.
  const voteScore = getVoteCount(comment.upvotes, comment.downvotes);
  const isVoting = votingComment === comment.id;
  const isDeleted = comment.is_deleted || comment.content === '[deleted]';
  const isEdited = comment.created_at && comment.updated_at && (new Date(comment.updated_at).getTime() - new Date(comment.created_at).getTime() > 1000);
  return (
    <div className={`relative ${depth > 0 ? 'ml-6' : ''}`}>
      {depth > 0 && (
        <div 
          className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-800 hover:bg-purple-600 transition cursor-pointer"
          onClick={() => toggleExpand(comment.id)}
          title="Click to toggle replies"
        />
      )}
      <div className={`${depth > 0 ? 'pl-6' : ''} ${depth === 0 ? 'border-t border-gray-700 pt-4' : 'pt-2'}`}>
        <div className="flex items-start gap-3">
          <div className="flex flex-col items-center gap-1 pt-1">
            <button
              onClick={() => handleVote(comment.id, 'upvote')}
              disabled={!user || isVoting || isDeleted}
              className="p-1 hover:bg-gray-900 rounded transition disabled:opacity-50"
            >
              <FiArrowUp className="text-gray-400 hover:text-green-500" size={16} />
            </button>
            <span className={`text-xs font-medium ${voteScore > 0 ? 'text-green-500' : voteScore < 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {voteScore}
            </span>
            <button
              onClick={() => handleVote(comment.id, 'downvote')}
              disabled={!user || isVoting || isDeleted}
              className="p-1 hover:bg-gray-900 rounded transition disabled:opacity-50"
            >
              <FiArrowDown className="text-gray-400 hover:text-red-500" size={16} />
            </button>
          </div>
          <div className="flex-1 min-w-0">
            {isDeleted ? (
              <div className="flex flex-col justify-center min-h-[80px]">
                {replyCount > 0 && (
                  <div className="mb-2">
                    <button
                      onClick={() => toggleExpand(comment.id)}
                      className="text-xs text-gray-500 hover:text-purple-400 transition font-medium"
                    >
                      {isExpanded 
                        ? '[hide replies]'
                        : `[show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}]`}
                    </button>
                  </div>
                )}
                <p className="text-sm text-gray-500 italic">Comment deleted by user</p>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                  {comment.user?.username?.charAt(0).toUpperCase() || 'A'}
                </div>
                <span className="text-sm font-medium text-white">
                  {comment.user?.username || 'Anonymous'}
                </span>
                <span className="text-xs text-gray-500">{comment.created_at}</span>
                {isEdited && (
                  <span className="text-xs text-gray-500 italic">[edited]</span>
                )}
                {replyCount > 0 && (
                  <button
                    onClick={() => toggleExpand(comment.id)}
                    className="text-xs text-gray-500 hover:text-purple-400 transition font-medium"
                  >
                    {isExpanded 
                      ? '[hide replies]'
                      : `[show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}]`}
                  </button>
                )}
              </div>
            )}
            {!isDeleted && (
              <>
                {editingCommentId === comment.id ? (
                  <EditForm
                    commentId={comment.id}
                    initialContent={comment.content}
                    onSubmit={handleUpdateComment}
                    onCancel={() => setEditingCommentId(null)}
                  />
                ) : (
                  <>
                    <p className="text-sm mb-2 text-gray-300">{comment.content}</p>
                    <div className="flex items-center gap-3">
                      {user && (
                        <button
                          onClick={() => setReplyingTo(comment.id)}
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                        >
                          <FiMessageSquare size={12} />
                          Reply
                        </button>
                      )}
                      {canModifyComment(comment) && (
                        <>
                          <button
                            onClick={() => setEditingCommentId(comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition"
                          >
                            <FiEdit2 size={12} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-400 transition"
                          >
                            <FiTrash2 size={12} />
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </>
                )}
                {replyingTo === comment.id && (
                  <ReplyForm
                    commentId={comment.id}
                    onSubmit={onSubmit => onSubmit}
                    onCancel={() => setReplyingTo(null)}
                    submitting={submitting}
                    user={user}
                  />
                )}
              </>
            )}
            {isExpanded && comment.replies && comment.replies.length > 0 && (
              <div className="mt-2">
                {comment.replies.map((reply) => (
                  <CommentItemSelf
                    key={reply.id}
                    comment={reply}
                    depth={depth + 1}
                    user={user}
                    votingComment={votingComment}
                    isExpanded={expandedComments.has(reply.id)}
                    expandedComments={expandedComments}
                    replyCount={reply.replies ? reply.replies.length : 0}
                    canModifyComment={canModifyComment}
                    editingCommentId={editingCommentId}
                    replyingTo={replyingTo}
                    submitting={submitting}
                    handleVote={handleVote}
                    handleUpdateComment={handleUpdateComment}
                    setReplyingTo={setReplyingTo}
                    setEditingCommentId={setEditingCommentId}
                    handleDeleteComment={handleDeleteComment}
                    toggleExpand={toggleExpand}
                    CommentItemSelf={CommentItemSelf}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentItem;
