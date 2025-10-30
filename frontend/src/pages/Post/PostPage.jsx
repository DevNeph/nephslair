import React, { useState, useEffect, memo } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import { FiArrowUp, FiArrowDown, FiMessageSquare, FiTrash2, FiEdit2, FiX, FiClock, FiChevronLeft, FiChevronUp } from 'react-icons/fi';
import { getPostBySlug, votePost } from '../../services/postService';
import { createComment, deleteComment, updateComment, voteComment } from '../../services/commentService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/common/Loading';
import ErrorMessage from '../../components/common/ErrorMessage';
import { formatDate, getVoteCount } from '../../utils/helpers';
import toast from 'react-hot-toast';
import api from '../../services/api';
import PostPolls from '../../components/post/PostPolls';
import PostReleases from '../../components/post/PostReleases';

// Edit History Modal Component
const EditHistoryModal = memo(({ commentId, onClose }) => {
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await api.get(`/comments/${commentId}/history`);
        setHistory(response.data.data);
      } catch (error) {
        console.error('Error fetching history:', error);
        toast.error('Failed to load edit history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [commentId]);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-neutral-900 border border-gray-700 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-lg font-medium text-white">Edit History</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-800 rounded transition"
          >
            <FiX className="text-gray-400" size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
          ) : history ? (
            <div className="space-y-4">
              {/* Current Version */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-medium text-green-400">CURRENT</span>
                  <FiClock className="text-gray-500" size={12} />
                  <span className="text-xs text-gray-500">Now</span>
                </div>
                <p className="text-sm text-white">{history.current}</p>
              </div>

              {/* Previous Versions */}
              {history.history && history.history.length > 0 ? (
                history.history.map((item, index) => (
                  <div key={item.id} className="bg-gray-800/30 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-medium text-gray-400">
                        VERSION {history.history.length - index}
                      </span>
                      <FiClock className="text-gray-500" size={12} />
                      <span className="text-xs text-gray-500">
                        {formatDate(item.edited_at)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300">{item.content}</p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No edit history</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">Failed to load history</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// Edit Form Component
const EditForm = memo(({ commentId, initialContent, onSubmit, onCancel }) => {
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
      <div className="flex justify-end gap-2 mt-2">
        <button
          type="button"
          onClick={() => {
            setEditText(initialContent);
            onCancel();
          }}
          className="px-3 py-1 text-xs border border-gray-700 hover:bg-gray-900 text-white rounded transition"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!editText.trim()}
          className="px-3 py-1 text-xs bg-white text-black hover:bg-gray-200 rounded transition disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  );
});

// Reply Form Component
const ReplyForm = memo(({ commentId, onSubmit, onCancel, submitting, user }) => {
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
});

const PostPage = () => {
  const { slug, postSlug } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [votingComment, setVotingComment] = useState(null);
  const [votingPost, setVotingPost] = useState(false);
  const [expandedComments, setExpandedComments] = useState(new Set());
  const [historyModalCommentId, setHistoryModalCommentId] = useState(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [postSlug]);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getPostBySlug(postSlug);
      setPost(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error loading post');
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = (comments) => {
    if (!comments || comments.length === 0) return [];
    
    const commentMap = {};
    const rootComments = [];

    comments.forEach(comment => {
      commentMap[comment.id] = { 
        ...comment, 
        replies: comment.replies || []
      };
    });

    comments.forEach(comment => {
      if (comment.parent_id && comment.parent_id !== null) {
        if (commentMap[comment.parent_id]) {
          commentMap[comment.parent_id].replies.push(commentMap[comment.id]);
        }
      } else {
        rootComments.push(commentMap[comment.id]);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (e, parentId = null) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    if (!commentText.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await createComment({
        post_id: post.id,
        parent_id: parentId,
        content: commentText
      });
      
      toast.success('Comment posted successfully');
      setCommentText('');
      fetchPost();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId, content) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      setSubmitting(true);
      await createComment({
        post_id: post.id,
        parent_id: parentId,
        content
      });
      
      toast.success('Reply posted successfully');
      setReplyingTo(null);
      fetchPost();
    } catch (error) {
      console.error('Error posting reply:', error);
      toast.error(error.response?.data?.message || 'Failed to post reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (commentId, voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      setVotingComment(commentId);
      const result = await voteComment(commentId, voteType);
      
      setPost(prevPost => ({
        ...prevPost,
        comments: updateCommentVotes(prevPost.comments, commentId, result)
      }));
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    } finally {
      setVotingComment(null);
    }
  };

  const handlePostVote = async (voteType) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      setVotingPost(true);
      const result = await votePost(post.id, voteType);
      
      setPost(prevPost => ({
        ...prevPost,
        upvotes: result.upvotes,
        downvotes: result.downvotes
      }));
    } catch (error) {
      console.error('Error voting on post:', error);
      toast.error('Failed to vote');
    } finally {
      setVotingPost(false);
    }
  };

  const updateCommentVotes = (comments, commentId, voteData) => {
    return comments.map(comment => {
      if (comment.id === commentId) {
        return { ...comment, upvotes: voteData.upvotes, downvotes: voteData.downvotes };
      }
      if (comment.replies) {
        return { ...comment, replies: updateCommentVotes(comment.replies, commentId, voteData) };
      }
      return comment;
    });
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      await deleteComment(commentId);
      toast.success('Comment deleted successfully');
      fetchPost();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleUpdateComment = async (commentId, newContent) => {
    if (!newContent.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      await updateComment(commentId, newContent);
      toast.success('Comment updated successfully');
      setEditingCommentId(null);
      fetchPost();
    } catch (error) {
      console.error('Error updating comment:', error);
      toast.error(error.response?.data?.message || 'Failed to update comment');
    }
  };

  const canModifyComment = (comment) => {
    if (!user) return false;
    if (comment.is_deleted) return false;
    return user.id === comment.user_id || user.role === 'admin';
  };

  const toggleExpand = (commentId) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
        
        const findAndExpandDescendants = (comments, targetId) => {
          for (const comment of comments) {
            if (comment.id === targetId && comment.replies) {
              const expandAllChildren = (replies) => {
                replies.forEach(reply => {
                  newSet.add(reply.id);
                  if (reply.replies && reply.replies.length > 0) {
                    expandAllChildren(reply.replies);
                  }
                });
              };
              expandAllChildren(comment.replies);
              return true;
            }
            if (comment.replies && comment.replies.length > 0) {
              if (findAndExpandDescendants(comment.replies, targetId)) {
                return true;
              }
            }
          }
          return false;
        };
        
        if (post && post.comments) {
          const organized = organizeComments(post.comments);
          findAndExpandDescendants(organized, commentId);
        }
      }
      return newSet;
    });
  };

  const countReplies = (comment) => {
    if (!comment.replies || comment.replies.length === 0) return 0;
    let count = comment.replies.length;
    comment.replies.forEach(reply => {
      count += countReplies(reply);
    });
    return count;
  };

  const hasBeenEdited = (comment) => {
    if (!comment.created_at || !comment.updated_at) return false;
    const created = new Date(comment.created_at).getTime();
    const updated = new Date(comment.updated_at).getTime();
    return updated - created > 1000;
  };

  // Comment Item Component
  const CommentItem = ({ comment, depth = 0 }) => {
    const voteScore = getVoteCount(comment.upvotes, comment.downvotes);
    const isVoting = votingComment === comment.id;
    const isExpanded = expandedComments.has(comment.id);
    const replyCount = countReplies(comment);
    const isDeleted = comment.is_deleted || comment.content === '[deleted]';
    const isEdited = hasBeenEdited(comment);

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
              <span className={`text-xs font-medium ${
                voteScore > 0 ? 'text-green-500' : 
                voteScore < 0 ? 'text-red-500' : 
                'text-gray-400'
              }`}>
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
                            : `[show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}]`
                          }
                        </button>
                      </div>
                    )}
                    
                    <p className="text-sm text-gray-500 italic">
                      Comment deleted by user
                    </p>
                  </div>
                ) : (
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <div className="w-6 h-6 bg-gray-700 rounded-full flex items-center justify-center text-white text-xs font-medium flex-shrink-0">
                    {comment.user?.username?.charAt(0).toUpperCase() || 'A'}
                  </div>

                  <span className="text-sm font-medium text-white">
                    {comment.user?.username || 'Anonymous'}
                  </span>

                  <span className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </span>

                  {isEdited && (
                    <button
                      onClick={() => setHistoryModalCommentId(comment.id)}
                      className="text-xs text-gray-500 hover:text-purple-400 transition italic"
                      title="View edit history"
                    >
                      [edited]
                    </button>
                  )}

                  {replyCount > 0 && (
                    <button
                      onClick={() => toggleExpand(comment.id)}
                      className="text-xs text-gray-500 hover:text-purple-400 transition font-medium"
                    >
                      {isExpanded 
                        ? '[hide replies]'
                        : `[show ${replyCount} ${replyCount === 1 ? 'reply' : 'replies'}]`
                      }
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
                      <p className="text-sm mb-2 text-gray-300">
                        {comment.content}
                      </p>
                      
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
                      onSubmit={handleSubmitReply}
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
                    <CommentItem key={reply.id} comment={reply} depth={depth + 1} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!post) return <ErrorMessage message="Post not found" />;

  const voteCount = getVoteCount(post.upvotes, post.downvotes);
  const organizedComments = post.comments ? organizeComments(post.comments) : [];

  // Navigation items for project sidebar
  const navItems = post.project ? [
    { label: 'Project Home Page', path: `/project/${post.project.slug}`, active: false },
    { label: 'About', path: `/project/${post.project.slug}/about`, active: false },
    { label: 'Downloads', path: `/project/${post.project.slug}/downloads`, active: false },
    { label: 'Changelogs', path: `/project/${post.project.slug}/changelogs`, active: false }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {historyModalCommentId && (
        <EditHistoryModal
          commentId={historyModalCommentId}
          onClose={() => setHistoryModalCommentId(null)}
        />
      )}

      <div className="flex gap-8">
        {/* Left Sidebar - Only show if post has a project */}
        {post.project && (
          <aside className="w-64 flex-shrink-0">
            <div className="sticky top-24">
              {/* Back Button */}
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4 w-full"
              >
                <FiChevronLeft size={20} />
                <span>Back</span>
              </button>

              {/* Project Info Card */}
              <div className="bg-black border border-gray-700 rounded-lg p-6 mb-6">
                <h2 className="text-xl font-normal text-white mb-4">
                  {post.project.name}
                </h2>
                
                {post.project.latest_version && (
                  <div className="mb-3">
                    <p className="text-sm text-gray-500 mb-1">Latest Version</p>
                    <p className="text-white">{post.project.latest_version}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="text-white">{formatDate(post.project.updated_at)}</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="block px-4 py-2 rounded-lg transition text-gray-400 hover:bg-gray-800 hover:text-white"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* Breadcrumb - Only show if no sidebar */}
          {!post.project && (
            <div className="mb-6">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition mb-4"
              >
                <FiChevronLeft size={20} />
                <span>Back</span>
              </button>

              <nav className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-gray-500 truncate max-w-md">{post.title}</span>
              </nav>
            </div>
          )}

          {/* Breadcrumb - Show if sidebar exists */}
          {post.project && (
            <div className="mb-6">
              <nav className="flex items-center gap-2 text-sm">
                <Link to="/" className="text-gray-400 hover:text-white transition">
                  Home
                </Link>
                <span className="text-gray-600">/</span>
                <Link 
                  to={`/project/${post.project.slug}`} 
                  className="text-gray-400 hover:text-white transition"
                >
                  {post.project.name}
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-gray-500 truncate max-w-md">{post.title}</span>
              </nav>
            </div>
          )}

          {/* Post Container */}
          <div className="bg-black border border-gray-700 rounded-lg p-8 mb-8">
            <div className="flex justify-end mb-6">
              <span className="text-sm text-gray-500">
                {formatDate(post.published_at || post.created_at)}
              </span>
            </div>

            <h1 className="text-4xl font-normal text-white mb-3">{post.title}</h1>
            
            {post.project && (
              <Link
                to={`/project/${post.project.slug}`}
                className="inline-block text-base text-gray-400 hover:text-gray-300 mb-6"
              >
                {post.project.name}
              </Link>
            )}

            <hr className="border-gray-700 my-6" />

            <div className="text-gray-300 leading-relaxed mb-6 whitespace-pre-wrap">
              {post.content}
            </div>

            <hr className="border-gray-700 my-6" />

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handlePostVote('upvote')}
                disabled={!user || votingPost}
                className="p-2 hover:bg-gray-900 rounded-lg transition disabled:opacity-50"
              >
                <FiArrowUp className="text-gray-400 hover:text-green-500" size={20} />
              </button>
              <span className={`text-lg font-medium ${voteCount > 0 ? 'text-green-500' : voteCount < 0 ? 'text-red-500' : 'text-gray-400'}`}>
                {voteCount}
              </span>
              <button 
                onClick={() => handlePostVote('downvote')}
                disabled={!user || votingPost}
                className="p-2 hover:bg-gray-900 rounded-lg transition disabled:opacity-50"
              >
                <FiArrowDown className="text-gray-400 hover:text-red-500" size={20} />
              </button>
            </div>
          </div>

        {/* Polls & Releases */}
        <div className="space-y-6 mb-8">
          {/* Polls */}
          {post.attachedPolls && post.attachedPolls.length > 0 && (
            <PostPolls polls={post.attachedPolls} />
          )}

          {/* Releases (changelog + downloads birlikte) */}
          {post.attachedReleases && post.attachedReleases.length > 0 && (
            <PostReleases releases={post.attachedReleases} />
          )}
        </div>

          {/* Comments Section */}
          <div className="bg-black border border-gray-700 rounded-lg p-8">
            <h2 className="text-2xl font-normal text-white mb-6">
              Comments ({post.comments?.length || 0})
            </h2>
            
            {user ? (
              <form onSubmit={(e) => handleSubmitComment(e)} className="mb-8">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="What are your thoughts?"
                  rows="4"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Posting...' : 'Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="mb-8 p-4 border border-gray-700 rounded-lg text-center">
                <p className="text-gray-400">
                  Please <Link to="/login" className="text-white hover:text-gray-400 underline">login</Link> to comment
                </p>
              </div>
            )}

            {organizedComments.length > 0 ? (
              <div className="space-y-4">
                {organizedComments.map((comment) => (
                  <CommentItem key={comment.id} comment={comment} depth={0} />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No comments yet. Start the discussion!
              </p>
            )}
          </div>
        </main>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-white text-black hover:bg-gray-200 rounded-full shadow-lg transition transform hover:scale-110 z-50"
          aria-label="Scroll to top"
        >
          <FiChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default PostPage;