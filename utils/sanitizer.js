/**
 * Shared sanitization utility for frontend.
 */
export const sanitize = (val) => {
  if (typeof val !== 'string') return val;
  return val
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
