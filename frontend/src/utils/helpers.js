import { format, formatDistanceToNow } from 'date-fns';
import { enUS } from 'date-fns/locale';

/**
 * Format date to readable string
 */
export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'dd MMM yyyy', { locale: enUS });
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: enUS });
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

/**
 * Get vote count with sign
 */
export const getVoteCount = (upvotes = 0, downvotes = 0) => {
  return upvotes - downvotes;
};