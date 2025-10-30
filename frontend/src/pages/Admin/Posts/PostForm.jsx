import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiSave, FiX, FiEye, FiPlus, FiTrash2, FiPackage, FiBarChart2 } from 'react-icons/fi';
import api from '../../../services/api';
import { 
  addPollToPost, 
  removePollFromPost,
  addReleaseToPost,
  removeReleaseFromPost
} from '../../../services/postService';
import Loading from '../../../components/common/Loading';
import toast from 'react-hot-toast';
import { formatDate } from '../../../utils/helpers';
import { request } from '../../../services/request';
import { useFormHandler } from '../../../utils/useFormHandler';

const PostForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  const [availablePolls, setAvailablePolls] = useState([]);
  const [availableReleases, setAvailableReleases] = useState([]);
  const [selectedPolls, setSelectedPolls] = useState([]);
  const [selectedReleases, setSelectedReleases] = useState([]);
  const [attachedPolls, setAttachedPolls] = useState([]);
  const [attachedReleases, setAttachedReleases] = useState([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showPollModal, setShowPollModal] = useState(false);
  const [showReleaseModal, setShowReleaseModal] = useState(false);

  const form = useFormHandler({
    title: '',
    content: '',
    project_id: '',
    status: 'draft',
    excerpt: ''
  }, (values) => {
    const errors = {};
    if (!values.title?.trim()) {
      errors.title = 'Title is required';
    }
    if (!values.content?.trim()) {
      errors.content = 'Content is required';
    }
    return errors;
  });

  useEffect(() => {
    fetchProjects();
    fetchAvailablePolls(null);
    if (isEditMode) {
      fetchPost();
    }
  }, [id]);

  useEffect(() => {
    fetchAvailablePolls(form.form.project_id || null);
    
    if (form.form.project_id) {
      fetchAvailableReleases(form.form.project_id);
    } else {
      setAvailableReleases([]);
      if (!isEditMode) {
        setSelectedReleases([]);
      }
    }
  }, [form.form.project_id]);

  const fetchProjects = async () => {
    try {
      const res = await request(() => api.get('/projects/admin/all'), (msg) => toast.error('Failed to load projects'));
      setProjects(res.data.data);
    } catch {}
  };

  const fetchPost = async () => {
    try {
      const res = await request(() => api.get(`/posts/admin/${id}`), (msg) => { toast.error('Failed to load post'); navigate('/admin/posts'); }, setLoading);
      const post = res.data.data;
      
      form.resetForm({
        title: post.title,
        content: post.content,
        project_id: post.project_id || '',
        status: post.status,
        excerpt: post.excerpt || ''
      });

      if (post.slug) {
        const detailRes = await request(() => api.get(`/posts/${post.slug}`));
        setAttachedPolls(detailRes.data.data.attachedPolls || []);
        setAttachedReleases(detailRes.data.data.attachedReleases || []);
      }
    } catch {}
  };

  const fetchAvailablePolls = async (projectId) => {
    try {
      const params = projectId ? { project_id: projectId } : {};
      const res = await request(() => api.get('/polls/available', { params }));
      setAvailablePolls(res.data.data || []);
    } catch {}
  };

  const fetchAvailableReleases = async (projectId) => {
    try {
      const res = await request(() => api.get(`/releases`, {
        params: { project_id: projectId }
      }));
      setAvailableReleases(res.data.data || []);
    } catch {}
  };


  // Poll handlers
  const handleSelectPoll = (poll) => {
    if (selectedPolls.find(p => p.id === poll.id)) {
      toast.error('Poll already added');
      return;
    }
    setSelectedPolls([...selectedPolls, poll]);
    setShowPollModal(false);
    toast.success('Poll added to post');
  };

  const handleDeselectPoll = (pollId) => {
    setSelectedPolls(selectedPolls.filter(p => p.id !== pollId));
    toast.success('Poll removed');
  };

  const handleAddPoll = async (pollId) => {
    try {
      await addPollToPost(id, pollId);
      toast.success('Poll added successfully');
      fetchPost();
      setShowPollModal(false);
    } catch (error) {
      console.error('Error adding poll:', error);
      toast.error(error.response?.data?.message || 'Failed to add poll');
    }
  };

  const handleRemovePoll = async (pollId) => {
    if (!window.confirm('Remove this poll from the post?')) return;

    try {
      await removePollFromPost(id, pollId);
      toast.success('Poll removed successfully');
      fetchPost();
    } catch (error) {
      console.error('Error removing poll:', error);
      toast.error('Failed to remove poll');
    }
  };

  // Release handlers
  const handleSelectRelease = (release) => {
    if (selectedReleases.find(r => r.id === release.id)) {
      toast.error('Release already added');
      return;
    }
    setSelectedReleases([...selectedReleases, release]);
    setShowReleaseModal(false);
    toast.success('Release added to post');
  };

  const handleDeselectRelease = (releaseId) => {
    setSelectedReleases(selectedReleases.filter(r => r.id !== releaseId));
    toast.success('Release removed');
  };

  const handleAddRelease = async (releaseId) => {
    try {
      await addReleaseToPost(id, releaseId);
      toast.success('Release added successfully');
      fetchPost();
      setShowReleaseModal(false);
    } catch (error) {
      console.error('Error adding release:', error);
      toast.error(error.response?.data?.message || 'Failed to add release');
    }
  };

  const handleRemoveRelease = async (releaseId) => {
    if (!window.confirm('Remove this release from the post?')) return;

    try {
      await removeReleaseFromPost(id, releaseId);
      toast.success('Release removed successfully');
      fetchPost();
    } catch (error) {
      console.error('Error removing release:', error);
      toast.error('Failed to remove release');
    }
  };

  const handleSubmit = form.handleSubmit(async (values) => {
    try {
      setSaving(true);

      if (isEditMode) {
        await api.put(`/posts/${id}`, values);
        toast.success('Post updated successfully');
        navigate('/admin/posts');
      } else {
        const response = await api.post('/posts', values);
        const newPostId = response.data.data.id;

        if (selectedPolls.length > 0) {
          await Promise.all(
            selectedPolls.map((poll, index) => 
              addPollToPost(newPostId, poll.id, index)
            )
          );
        }

        if (selectedReleases.length > 0) {
          await Promise.all(
            selectedReleases.map((release, index) => 
              addReleaseToPost(newPostId, release.id, index)
            )
          );
        }

        toast.success('Post created successfully!');
        navigate('/admin/posts');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error(error.response?.data?.message || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  });

  const handleCancel = () => {
    if (window.confirm('Are you sure you want to cancel? Unsaved changes will be lost.')) {
      navigate('/admin/posts');
    }
  };

  if (loading) {
    return <Loading />;
  }

  const displayPolls = isEditMode ? attachedPolls : selectedPolls;
  const displayReleases = isEditMode ? attachedReleases : selectedReleases;

  const usedPollIds = displayPolls.map(p => p.id);
  const usedReleaseIds = displayReleases.map(r => r.id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">
          {isEditMode ? 'Edit Post' : 'Create New Post'}
        </h1>
        <p className="text-gray-400">
          {isEditMode ? 'Update post details' : 'Fill in the details below to create a new post'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Basic Information</h2>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={form.form.title}
              onChange={form.handleChange}
              className={`w-full bg-neutral-800 border ${
                form.errors.title ? 'border-red-500' : 'border-neutral-700'
              } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500`}
              placeholder="Enter post title"
            />
            {form.errors.title && <p className="text-red-500 text-sm mt-1">{form.errors.title}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Project <span className="text-gray-500">(Optional)</span>
            </label>
            <select
              name="project_id"
              value={form.form.project_id || ''}
              onChange={form.handleChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="">No Project (General Feed)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Select a project to enable releases (changelogs + downloads)
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Excerpt (Optional)
            </label>
            <textarea
              name="excerpt"
              value={form.form.excerpt}
              onChange={form.handleChange}
              rows="3"
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none"
              placeholder="Brief summary of the post (optional)"
            />
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-300">
                Content <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="text-sm text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <FiEye /> {showPreview ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {showPreview ? (
              <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 min-h-[400px] whitespace-pre-wrap">
                {form.form.content}
              </div>
            ) : (
              <textarea
                name="content"
                value={form.form.content}
                onChange={form.handleChange}
                rows="15"
                className={`w-full bg-neutral-800 border ${
                  form.errors.content ? 'border-red-500' : 'border-neutral-700'
                } rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 resize-none font-mono text-sm`}
                placeholder="Write your post content here..."
              />
            )}
            {form.errors.content && <p className="text-red-500 text-sm mt-1">{form.errors.content}</p>}
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={form.form.status}
              onChange={form.handleChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 appearance-none cursor-pointer"
            >
              <option value="draft">Draft (Hidden from public)</option>
              <option value="published">Published (Visible to everyone)</option>
            </select>
          </div>
        </div>

        {/* Polls Section */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <FiBarChart2 className="text-purple-400" size={20} />
              <h2 className="text-xl font-bold text-white">Polls</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPollModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
            >
              <FiPlus /> Add Poll
            </button>
          </div>

          {displayPolls.length > 0 ? (
            <div className="space-y-3">
              {displayPolls.map((poll) => (
                <div
                  key={poll.id}
                  className="flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-lg"
                >
                  <div>
                    <p className="text-white font-medium">{poll.question}</p>
                    <p className="text-sm text-gray-400 mt-1">
                      {poll.options?.length || 0} options • {poll.is_closed ? 'Closed' : 'Active'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => isEditMode ? handleRemovePoll(poll.id) : handleDeselectPoll(poll.id)}
                    className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No polls attached</p>
          )}
        </div>

        {/* Releases Section */}
        {form.form.project_id && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <FiPackage className="text-purple-400" size={20} />
                <h2 className="text-xl font-bold text-white">Releases</h2>
                <span className="text-xs text-gray-500">(Changelogs + Downloads)</span>
              </div>
              <button
                type="button"
                onClick={() => setShowReleaseModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition"
              >
                <FiPlus /> Add Release
              </button>
            </div>

            {displayReleases.length > 0 ? (
              <div className="space-y-3">
                {displayReleases.map((release) => (
                  <div
                    key={release.id}
                    className="flex items-center justify-between p-4 bg-neutral-800 border border-neutral-700 rounded-lg"
                  >
                    <div>
                      <p className="text-white font-medium">Version {release.version}</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {formatDate(release.release_date)} • {release.files?.length || 0} files
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => isEditMode ? handleRemoveRelease(release.id) : handleDeselectRelease(release.id)}
                      className="p-2 text-red-400 hover:bg-red-900/20 rounded-lg transition"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No releases attached</p>
            )}
          </div>
        )}

        {/* Save/Cancel Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>{isEditMode ? 'Saving...' : 'Creating...'}</span>
              </>
            ) : (
              <>
                {isEditMode ? 'Update Post' : 'Create Post'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Poll Selection Modal */}
      {showPollModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Select Poll</h3>
              <button
                onClick={() => setShowPollModal(false)}
                className="p-1 hover:bg-neutral-800 rounded transition"
              >
                <FiX className="text-gray-400" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {availablePolls.filter(poll => !usedPollIds.includes(poll.id)).length > 0 ? (
                <div className="space-y-3">
                  {availablePolls.filter(poll => !usedPollIds.includes(poll.id)).map((poll) => (
                    <button
                      key={poll.id}
                      onClick={() => isEditMode ? handleAddPoll(poll.id) : handleSelectPoll(poll)}
                      className="w-full text-left p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition"
                    >
                      <p className="text-white font-medium mb-1">{poll.question}</p>
                      <p className="text-sm text-gray-400">
                        {poll.options?.length || 0} options • {poll.is_closed ? 'Closed' : 'Active'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No available polls</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Release Selection Modal */}
      {showReleaseModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-neutral-800">
              <h3 className="text-lg font-bold text-white">Select Release</h3>
              <button
                onClick={() => setShowReleaseModal(false)}
                className="p-1 hover:bg-neutral-800 rounded transition"
              >
                <FiX className="text-gray-400" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {availableReleases.filter(release => !usedReleaseIds.includes(release.id)).length > 0 ? (
                <div className="space-y-3">
                  {availableReleases.filter(release => !usedReleaseIds.includes(release.id)).map((release) => (
                    <button
                      key={release.id}
                      onClick={() => isEditMode ? handleAddRelease(release.id) : handleSelectRelease(release)}
                      className="w-full text-left p-4 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg transition"
                    >
                      <p className="text-white font-medium mb-1">Version {release.version}</p>
                      <p className="text-sm text-gray-400">
                        {formatDate(release.release_date)} • {release.files?.length || 0} files • {release.is_published ? 'Published' : 'Draft'}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500">No available releases for this project</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostForm;