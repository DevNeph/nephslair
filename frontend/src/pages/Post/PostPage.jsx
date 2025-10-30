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
import { request } from '../../services/request';
import { useFormHandler } from '../../utils/useFormHandler';
import PostPolls from '../../components/post/PostPolls';
import PostReleases from '../../components/post/PostReleases';
import EditHistoryModal from './PostPage/EditHistoryModal';
import EditForm from './PostPage/EditForm';
import ReplyForm from './PostPage/ReplyForm';
import CommentItem from './PostPage/CommentItem';
import SeoHead from '../../components/common/SeoHead';

const PostPage = () => {
  const { slug, postSlug } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  
  const commentForm = useFormHandler({ content: '' }, (values) => {
    const errors = {};
    if (!values.content?.trim()) {
      errors.content = 'Comment cannot be empty';
    }
    return errors;
  });
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
      setError(null);
      const data = await request(() => getPostBySlug(postSlug), setError, setLoading);
      setPost(data);
    } catch (err) {
      // setError already handled in request()
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

  const handleSubmitComment = commentForm.handleSubmit(async (values) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
      await createComment({
        post_id: post.id,
        parent_id: null,
        content: values.content
      });
      
      toast.success('Comment posted successfully');
      commentForm.resetForm();
      fetchPost();
    } catch (error) {
      console.error('Error posting comment:', error);
      toast.error(error.response?.data?.message || 'Failed to post comment');
    }
  });

  const handleSubmitReply = async (parentId, content) => {
    if (!user) {
      toast.error('Please login to comment');
      return;
    }

    try {
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

  if (loading) return <Loading />;
  if (error) return <ErrorMessage message={error} />;
  if (!post) return <ErrorMessage message="Post not found" />;

  const voteCount = getVoteCount(post.upvotes, post.downvotes);
  const organizedComments = post.comments ? organizeComments(post.comments) : [];
  const pageDesc = post.excerpt || (post.content ? String(post.content).slice(0, 150) : '');

  // Navigation items for project sidebar
  const navItems = post.project ? [
    { label: 'Project Home Page', path: `/project/${post.project.slug}`, active: false },
    { label: 'About', path: `/project/${post.project.slug}/about`, active: false },
    { label: 'Downloads', path: `/project/${post.project.slug}/downloads`, active: false },
    { label: 'Changelogs', path: `/project/${post.project.slug}/changelogs`, active: false }
  ] : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <SeoHead pageTitle={post.title} pageDescription={pageDesc} />
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
              <form onSubmit={handleSubmitComment} className="mb-8">
                <textarea
                  name="content"
                  value={commentForm.form.content}
                  onChange={commentForm.handleChange}
                  placeholder="What are your thoughts?"
                  rows="4"
                  className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-gray-500 resize-none"
                />
                {commentForm.errors.content && (
                  <p className="text-red-400 text-sm mt-1">{commentForm.errors.content}</p>
                )}
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={commentForm.loading || !commentForm.form.content?.trim()}
                    className="px-6 py-2 bg-white text-black hover:bg-gray-200 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {commentForm.loading ? 'Posting...' : 'Comment'}
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
                  <CommentItem 
                    key={comment.id} 
                    comment={comment} 
                    depth={0} 
                    onVote={handleVote} 
                    onReply={handleSubmitReply} 
                    onEdit={handleUpdateComment} 
                    onDelete={handleDeleteComment} 
                    onExpand={toggleExpand} 
                    expandedComments={expandedComments} 
                    user={user} 
                    canModify={canModifyComment} 
                    hasBeenEdited={hasBeenEdited} 
                    countReplies={countReplies} 
                    votingComment={votingComment} 
                    setVotingComment={setVotingComment} 
                    editingCommentId={editingCommentId} 
                    setEditingCommentId={setEditingCommentId} 
                    replyingTo={replyingTo} 
                    setReplyingTo={setReplyingTo} 
                    submitting={commentForm.loading} 
                    EditForm={EditForm} 
                    ReplyForm={ReplyForm} 
                    formatDate={formatDate} 
                    historyModalCommentId={historyModalCommentId} 
                    setHistoryModalCommentId={setHistoryModalCommentId} 
                    showScrollTop={showScrollTop} 
                    setShowScrollTop={setShowScrollTop} 
                    scrollToTop={scrollToTop} 
                    updateCommentVotes={updateCommentVotes} 
                    organizeComments={organizeComments} 
                    CommentItem={CommentItem} 
                  />
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