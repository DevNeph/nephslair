import { format, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Format date to readable string
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd MMM yyyy', { locale: tr });
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param {string|Date} date 
 * @returns {string}
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: tr });
};

/**
 * Truncate text to specified length
 * @param {string} text 
 * @param {number} maxLength 
 * @returns {string}
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get vote count with sign
 * @param {number} upvotes 
 * @param {number} downvotes 
 * @returns {number}
 */
export const getVoteCount = (upvotes = 0, downvotes = 0) => {
  return upvotes - downvotes;
};