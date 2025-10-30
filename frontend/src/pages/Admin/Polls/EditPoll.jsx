import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FiPlus, FiTrash2, FiSave, FiArrowLeft, FiHome, FiFolder, FiFileText } from 'react-icons/fi';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import Loading from '../../../components/common/Loading';

const EditPoll = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [projects, setProjects] = useState([]);
  
  const [formData, setFormData] = useState({
    question: '',
    show_on_homepage: false,
    project_id: '',
    is_standalone: true,
    is_active: true,
    has_end_date: false,
    end_date: ''
  });
  
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    fetchPoll();
    fetchProjects();
  }, [id]);

  const fetchPoll = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/polls/${id}`);
      const poll = response.data.data;
      
      setFormData({
        question: poll.question,
        show_on_homepage: poll.show_on_homepage || false,
        project_id: poll.project_id || '',
        is_standalone: poll.is_standalone !== undefined ? poll.is_standalone : true,
        is_active: poll.is_active,
        has_end_date: !!poll.end_date,
        end_date: poll.end_date ? new Date(poll.end_date).toISOString().slice(0, 16) : ''
      });

      if (poll.options && poll.options.length > 0) {
        setOptions(poll.options.map(opt => opt.option_text));
      }
    } catch (error) {
      console.error('Error fetching poll:', error);
      toast.error('Failed to load poll');
      navigate('/admin/polls');
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data.data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to load projects');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, '']);
    } else {
      toast.error('Maximum 10 options allowed');
    }
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    } else {
      toast.error('Minimum 2 options required');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    if (formData.has_end_date && !formData.end_date) {
      toast.error('Please select an end date');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    try {
      setSaving(true);

      const pollData = {
        question: formData.question,
        is_active: formData.is_active,
        show_on_homepage: formData.show_on_homepage,
        is_standalone: formData.is_standalone,
        options: validOptions
      };

      // Add project_id if selected
      if (formData.project_id) {
        pollData.project_id = parseInt(formData.project_id);
      } else {
        pollData.project_id = null;
      }

      // Add end_date if specified
      if (formData.has_end_date && formData.end_date) {
        pollData.end_date = new Date(formData.end_date).toISOString();
      } else {
        pollData.end_date = null;
      }

      await api.put(`/polls/${id}`, pollData);
      toast.success('Poll updated successfully!');
      navigate('/admin/polls');
    } catch (error) {
      console.error('Error updating poll:', error);
      toast.error(error.response?.data?.message || 'Failed to update poll');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/admin/polls')}
        className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 mb-6 transition"
      >
        <FiArrowLeft />
        <span>Back to Polls</span>
      </button>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Edit Poll</h1>
        <p className="text-gray-400">Update poll settings and placement</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poll Placement */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <h3 className="text-white font-medium text-lg mb-4">Where should this poll appear?</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Homepage Card */}
            <label 
              className={`relative flex flex-col p-5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.show_on_homepage 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
              }`}
            >
              <input
                type="checkbox"
                name="show_on_homepage"
                checked={formData.show_on_homepage}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex items-start gap-3 mb-2">
                <FiHome className={`text-2xl flex-shrink-0 ${formData.show_on_homepage ? 'text-purple-400' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className="text-white font-semibold mb-1">Homepage Sidebar</div>
                  <div className="text-gray-400 text-sm">Visible to all visitors on the homepage</div>
                </div>
                {formData.show_on_homepage && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </label>

            {/* Standalone Card */}
            <label 
              className={`relative flex flex-col p-5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.is_standalone 
                  ? 'border-purple-500 bg-purple-500/10' 
                  : 'border-neutral-700 bg-neutral-800 hover:border-neutral-600'
              }`}
            >
              <input
                type="checkbox"
                name="is_standalone"
                checked={formData.is_standalone}
                onChange={handleInputChange}
                className="sr-only"
              />
              <div className="flex items-start gap-3 mb-2">
                <FiFileText className={`text-2xl flex-shrink-0 ${formData.is_standalone ? 'text-purple-400' : 'text-gray-400'}`} />
                <div className="flex-1">
                  <div className="text-white font-semibold mb-1">Standalone</div>
                  <div className="text-gray-400 text-sm">Can be added to posts manually</div>
                </div>
                {formData.is_standalone && (
                  <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
            </label>
          </div>

          {/* Project Selection */}
          <div className="mt-4">
            <label className="flex items-center gap-3 text-white font-medium mb-3">
              <FiFolder className="text-xl text-purple-400" />
              Project Page (Optional)
            </label>
            <select
              name="project_id"
              value={formData.project_id}
              onChange={handleInputChange}
              className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            >
              <option value="">None - Not shown on any project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
            {formData.project_id && (
              <p className="text-purple-400 text-sm mt-2">✓ Will appear on the selected project page</p>
            )}
          </div>
        </div>

        {/* Poll Question */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <label className="block text-white font-medium mb-2">
            Poll Question *
          </label>
          <input
            type="text"
            name="question"
            value={formData.question}
            onChange={handleInputChange}
            placeholder="What feature would you like to see next?"
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
            maxLength={500}
            required
          />
          <p className="text-gray-500 text-sm mt-2">
            {formData.question.length}/500 characters
          </p>
        </div>

        {/* Poll Options */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <label className="block text-white font-medium">
              Poll Options * (Min: 2, Max: 10)
            </label>
            <button
              type="button"
              onClick={addOption}
              disabled={options.length >= 10}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition"
            >
              <FiPlus />
              <span>Add Option</span>
            </button>
          </div>

          <div className="space-y-3">
            {options.map((option, index) => (
              <div key={index} className="flex gap-3">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition"
                  maxLength={255}
                  required
                />
                {options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="p-3 text-red-400 hover:text-red-300 hover:bg-neutral-800 rounded-lg transition"
                  >
                    <FiTrash2 className="text-xl" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Warning: Changing options will reset all votes for this poll
            </p>
          </div>
        </div>

        {/* Poll Duration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <label className="block text-white font-medium mb-2">
            Poll Duration *
          </label>
          <div className="flex items-center gap-3 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_end_date"
                checked={!formData.has_end_date}
                onChange={() => setFormData(prev => ({ ...prev, has_end_date: false, end_date: '' }))}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-white">No End Date</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="has_end_date"
                checked={formData.has_end_date}
                onChange={() => setFormData(prev => ({ ...prev, has_end_date: true }))}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-white">Set End Date</span>
            </label>
          </div>

          {formData.has_end_date && (
            <div>
              <label className="block text-gray-400 text-sm mb-2">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="end_date"
                value={formData.end_date}
                onChange={handleInputChange}
                min={new Date().toISOString().slice(0, 16)}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
                required
              />
              <p className="text-gray-500 text-sm mt-2">
                Poll will automatically close at this date and time
              </p>
            </div>
          )}
        </div>

        {/* Poll Status */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <label className="block text-white font-medium mb-2">
            Poll Status *
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_active"
                checked={formData.is_active}
                onChange={() => setFormData(prev => ({ ...prev, is_active: true }))}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-white">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="is_active"
                checked={!formData.is_active}
                onChange={() => setFormData(prev => ({ ...prev, is_active: false }))}
                className="w-4 h-4 text-purple-500"
              />
              <span className="text-white">Inactive</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <FiSave />
                <span>Save Changes</span>
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/polls')}
            className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg font-medium transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditPoll;