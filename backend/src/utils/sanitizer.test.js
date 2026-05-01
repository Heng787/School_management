const { sanitize, sanitizeData } = require('./sanitizer');

describe('Sanitizer Utility', () => {
  test('sanitize should escape HTML special characters', () => {
    const input = '<script>alert("XSS")</script>';
    const expected = '&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;';
    expect(sanitize(input)).toBe(expected);
  });

  test('sanitize should trim whitespace', () => {
    expect(sanitize('  test  ')).toBe('test');
  });

  test('sanitizeData should recursively sanitize arrays and objects', () => {
    const input = {
      name: '<b>John</b>',
      meta: [
        { note: '<script>' },
        '<i>italic</i>'
      ]
    };
    const expected = {
      name: '&lt;b&gt;John&lt;&#x2F;b&gt;',
      meta: [
        { note: '&lt;script&gt;' },
        '&lt;i&gt;italic&lt;&#x2F;i&gt;'
      ]
    };
    expect(sanitizeData(input)).toEqual(expected);
  });
});
