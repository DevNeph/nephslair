import React, { useEffect, useState } from 'react';

const Footer = () => {
  const [settings, setSettings] = useState({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem('website_settings');
      if (raw) setSettings(JSON.parse(raw));
    } catch (_) {}
  }, []);

  const year = new Date().getFullYear();
  const siteName = settings.site_name || 'Nephslair';
  const email = settings.footer_contact_email;
  const copyright = `© ${year} ${siteName}. All rights reserved.`;

  return (
    <footer className="bg-black border-t border-gray-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center text-gray-500 text-sm space-y-2">
          <p>{copyright}</p>
          {email && (
            <p>
              <a href={`mailto:${email}`} className="text-gray-400 hover:text-gray-300">Contact: {email}</a>
            </p>
          )}
        </div>
      </div>
    </footer>
  );
};

export default Footer;