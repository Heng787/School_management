/**
 * Backend sanitization utility.
 */

const sanitize = (val) => {
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

/**
 * Recursively sanitizes an object or array.
 */
const sanitizeData = (data) => {
  if (Array.isArray(data)) {
    return data.map(sanitizeData);
  }
  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, sanitizeData(value)])
    );
  }
  return sanitize(data);
};

module.exports = {
  sanitize,
  sanitizeData,
};
