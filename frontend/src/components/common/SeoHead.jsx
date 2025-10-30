import { useEffect } from 'react';

const readSettings = () => {
  try { return JSON.parse(localStorage.getItem('website_settings') || '{}'); } catch { return {}; }
};

const SeoHead = ({ pageTitle, pageDescription }) => {
  useEffect(() => {
    const settings = readSettings();
    const siteName = settings.site_name || 'Nephslair';
    const computedTitle = pageTitle ? `${pageTitle} | ${siteName}` : siteName;
    const computedDesc = pageDescription || settings.seo_description || settings.site_description || '';

    if (computedTitle) document.title = computedTitle;
    if (computedDesc) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', computedDesc);
    }
  }, [pageTitle, pageDescription]);

  return null;
};

export default SeoHead;
