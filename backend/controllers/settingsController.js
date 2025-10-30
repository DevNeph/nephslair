const { Settings } = require('../models');
const { success, error } = require('../utils/response');

const ALLOWED_KEYS = new Set([
  'site_name',
  'site_description',
  'seo_description',
  'footer_contact_email',
  'footer_company_name',
  'maintenance_mode',
  'announcement_enabled',
  'announcement_text'
]);

async function getAll(req, res) {
  try {
    const rows = await Settings.findAll({});
    const data = {};
    for (const r of rows) data[r.key] = r.value;
    return success(res, data);
  } catch (e) {
    return error(res, 'Failed to load settings', 500, e.message);
  }
}

async function updateBulk(req, res) {
  try {
    const payload = req.body || {};
    const entries = Object.entries(payload).filter(([k]) => ALLOWED_KEYS.has(k));
    for (const [key, value] of entries) {
      await Settings.upsert({ key, value: String(value), type: 'string' });
    }
    const rows = await Settings.findAll({});
    const data = {};
    for (const r of rows) data[r.key] = r.value;
    return success(res, data, 'Settings updated');
  } catch (e) {
    return error(res, 'Failed to update settings', 500, e.message);
  }
}

module.exports = { getAll, updateBulk };
