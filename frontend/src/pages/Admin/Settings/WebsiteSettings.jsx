import React, { useEffect, useState } from 'react';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import { request } from '../../../services/request';
import { refreshSettingsCache } from '../../../services/api';

const defaultValues = {
  site_name: '',
  site_description: '',
  seo_description: '',
  footer_contact_email: '',
  footer_company_name: '',
  maintenance_mode: 'false',
  announcement_enabled: 'false',
  announcement_text: ''
};

const WebsiteSettings = () => {
  const [form, setForm] = useState(defaultValues);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await request(() => api.get('/settings'));
        const data = res?.data?.data || {};
        setForm({ ...defaultValues, ...data });
      } catch (_) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await request(() => api.put('/settings', form));
      await refreshSettingsCache();
      toast.success('Settings updated (cache refreshed)');
    } catch (_) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-400">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">Website Settings</h1>
        <p className="text-gray-400">Manage site-wide information and SEO.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Site Name</label>
            <input name="site_name" value={form.site_name} onChange={handleChange} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
            <p className="text-gray-500 text-xs mt-1">SEO title is automatically set to Site Name.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Site Description</label>
            <textarea name="site_description" value={form.site_description} onChange={handleChange} rows="3" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">SEO</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">SEO Description</label>
            <textarea name="seo_description" value={form.seo_description} onChange={handleChange} rows="3" className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Footer</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Contact Email</label>
            <input name="footer_contact_email" value={form.footer_contact_email} onChange={handleChange} className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white" />
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Maintenance</h2>
          <label className="flex items-center gap-3 text-gray-300">
            <input
              type="checkbox"
              checked={String(form.maintenance_mode) === 'true'}
              onChange={(e) => setForm((f) => ({ ...f, maintenance_mode: e.target.checked ? 'true' : 'false' }))}
            />
            <span>Enable maintenance mode (only admins can access the site)</span>
          </label>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 space-y-4">
          <h2 className="text-white font-semibold">Announcement</h2>
          <label className="flex items-center gap-3 text-gray-300">
            <input
              type="checkbox"
              checked={String(form.announcement_enabled) === 'true'}
              onChange={(e) => setForm((f) => ({ ...f, announcement_enabled: e.target.checked ? 'true' : 'false' }))}
            />
            <span>Show announcement on homepage</span>
          </label>
          <textarea
            name="announcement_text"
            value={form.announcement_text}
            onChange={handleChange}
            rows="3"
            placeholder="Short announcement text..."
            className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-4 py-3 text-white"
          />
          <p className="text-xs text-gray-500">A short message shown above posts on the homepage.</p>
        </div>

        <div className="flex gap-4">
          <button type="submit" disabled={saving} className="flex-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-neutral-700 text-white px-6 py-3 rounded-lg font-medium transition">
            {saving ? (<><div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div><span>Saving...</span></>) : (<>Save Settings</>)}
          </button>
        </div>
      </form>
    </div>
  );
};

export default WebsiteSettings;
