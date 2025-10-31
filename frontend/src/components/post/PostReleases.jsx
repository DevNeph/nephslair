import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp, FiDownload } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { formatDate } from '../../utils/helpers';
import { downloadFile } from '../../services/releaseService';
import toast from 'react-hot-toast';

const PostReleases = ({ releases }) => {
  const [expandedVersions, setExpandedVersions] = useState(new Set()); // ✅ Boş başlar (hepsi kapalı)

  const toggleVersion = (index) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedVersions(newExpanded);
  };

  const handleDownload = async (file) => {
    try {
      downloadFile(file.id);
      toast.success('Download started!');
    } catch (error) {
      console.error('Error downloading:', error);
      toast.error('Failed to start download');
    }
  };

  if (!Array.isArray(releases) || releases.length === 0) return null;

  return (
    <div className="space-y-6">
      {releases.map((release, index) => (
        <div key={release.id} className="space-y-4">
          {/* Changelog - Collapsible */}
          {release.release_notes && (
            <div className="bg-black border border-gray-700 rounded-lg overflow-hidden">
              {/* Version Header - Tıklanabilir */}
              <button
                onClick={() => toggleVersion(index)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-900 transition"
              >
                <div className="flex items-center gap-3">
                  {expandedVersions.has(index) ? (
                    <FiChevronUp className="text-white" size={20} />
                  ) : (
                    <FiChevronDown className="text-white" size={20} />
                  )}
                  <h2 className="text-xl font-bold text-white">
                    Version {release.version}
                  </h2>
                </div>
                <span className="text-sm text-gray-400">
                  {formatDate(release.release_date)}
                </span>
              </button>

              {/* Changelog Content - Açılır/Kapanır */}
              {expandedVersions.has(index) && (
                <div className="px-6 pb-6 border-t border-gray-700">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    className="prose prose-invert max-w-none text-sm mt-4"
                    components={{
                      h1: ({node, ...props}) => <h1 className="text-xl font-bold text-white mb-2 mt-3" {...props} />,
                      h2: ({node, ...props}) => <h2 className="text-lg font-bold text-white mb-2 mt-3" {...props} />,
                      h3: ({node, ...props}) => <h3 className="text-base font-bold text-white mb-1 mt-2" {...props} />,
                      p: ({node, ...props}) => <p className="text-gray-300 my-2 leading-relaxed" {...props} />,
                      ul: ({node, ...props}) => <ul className="list-disc pl-5 my-2 text-gray-300" {...props} />,
                      ol: ({node, ...props}) => <ol className="list-decimal pl-5 my-2 text-gray-300" {...props} />,
                      li: ({node, ...props}) => <li className="my-1" {...props} />,
                      strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
                      code: ({node, inline, ...props}) => 
                        inline ? 
                          <code className="bg-gray-900 text-purple-400 px-1 py-0.5 rounded text-xs font-mono" {...props} /> :
                          <code className="block bg-gray-900 rounded p-3 my-2 overflow-x-auto text-xs" {...props} />,
                      blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-purple-500 pl-3 italic text-gray-400 my-2" {...props} />,
                    }}
                  >
                    {release.release_notes}
                  </ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Downloads - Her Zaman Açık */}
          {Array.isArray(release?.files) && release.files.length > 0 && (
            <div className="bg-black border border-gray-700 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <FiDownload className="text-purple-400" size={20} />
                <h3 className="text-lg font-bold text-white">
                  Downloads - v{release.version}
                </h3>
              </div>
              
              <div className="space-y-2">
                {release.files.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between bg-gray-900 rounded-lg p-4 hover:bg-gray-800 transition"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-1 bg-purple-600/20 text-purple-400 text-xs font-medium rounded">
                          {file.platform}
                        </span>
                      </div>
                      <p className="text-white text-sm font-medium">{file.file_name}</p>
                      <p className="text-gray-500 text-xs mt-1">
                        {file.file_type?.toUpperCase()} • {(file.file_size / 1024 / 1024).toFixed(1)} MB • {file.download_count} downloads
                      </p>
                    </div>
                    <button
                      onClick={() => handleDownload(file)}
                      className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition ml-4"
                    >
                      <FiDownload size={14} />
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PostReleases;