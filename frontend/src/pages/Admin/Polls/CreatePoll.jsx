import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiBarChart2, FiArrowLeft } from 'react-icons/fi';
import api from '../../../services/api';
import toast from 'react-hot-toast';

const CreatePoll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  
  const [formData, setFormData] = useState({
    question: '',
    location: 'homepage',
    is_active: 'true',
    has_end_date: 'false',
    end_date: ''
  });
  
  const [options, setOptions] = useState(['', '']);

  useEffect(() => {
    fetchProjects();
  }, []);

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
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
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

    if (formData.has_end_date === 'true' && !formData.end_date) {
      toast.error('Please select an end date');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      toast.error('Please provide at least 2 options');
      return;
    }

    try {
      setLoading(true);

      const pollData = {
        question: formData.question,
        is_active: formData.is_active === 'true',
        options: validOptions
      };

      // Add end_date if specified
      if (formData.has_end_date === 'true' && formData.end_date) {
        pollData.end_date = new Date(formData.end_date).toISOString();
      }

      // If homepage, set placement_type to 'standalone'
      if (formData.location === 'homepage') {
        pollData.placement_type = 'standalone';
      } else {
        // If project selected, set project_id and placement_type
        pollData.project_id = parseInt(formData.location);
        pollData.placement_type = 'project';
      }

      await api.post('/polls', pollData);
      toast.success('Poll created successfully!');
      navigate('/admin/polls');
    } catch (error) {
      console.error('Error creating poll:', error);
      toast.error(error.response?.data?.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

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
        <h1 className="text-4xl font-bold text-white mb-2">Create Poll</h1>
        <p className="text-gray-400">Create a poll for homepage or project page</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Poll Location */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <label className="block text-white font-medium mb-2">
            Poll Location *
          </label>
          <select
            name="location"
            value={formData.location}
            onChange={handleInputChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            required
          >
            <option value="homepage">Homepage Sidebar</option>
            <optgroup label="Projects">
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </optgroup>
          </select>
          <p className="text-gray-400 text-sm mt-2">
            {formData.location === 'homepage' 
              ? 'Poll will appear in the homepage sidebar' 
              : 'Poll will appear on the selected project page'}
          </p>
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
        </div>

        {/* Poll Duration */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6">
          <label className="block text-white font-medium mb-2">
            Poll Duration *
          </label>
          <select
            name="has_end_date"
            value={formData.has_end_date}
            onChange={handleInputChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition mb-4"
            required
          >
            <option value="false">No End Date - Poll runs indefinitely</option>
            <option value="true">Set End Date - Poll closes automatically</option>
          </select>

          {formData.has_end_date === 'true' && (
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
          <select
            name="is_active"
            value={formData.is_active}
            onChange={handleInputChange}
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition"
            required
          >
            <option value="true">Active - Users can vote immediately</option>
            <option value="false">Inactive - Poll is hidden from users</option>
          </select>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <FiBarChart2 />
                <span>Create Poll</span>
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

export default CreatePoll;