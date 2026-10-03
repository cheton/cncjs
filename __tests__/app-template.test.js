const path = require('path');
const Hogan = require('hogan.js');
const appTemplate = require('../scripts/app-template');

test('bootstrap uses the real Tonic Spinner and preserves server translations', () => {
  const template = appTemplate(path.resolve(__dirname, '../src/app/index.tmpl.html'));
  const html = Hogan.compile(template).render({
    dir: 'rtl', lang: 'ar', title: 'CNCjs test', webroot: '/test/', loading: 'Please wait',
  });
  expect(template).toContain('{{loading}}');
  expect(template).toContain('role="progressbar"');
  expect(template).toContain('@keyframes');
  expect(html).toContain('Please wait');
  expect(html).toContain('dir=rtl');
  expect(html).toContain('/test/favicon.ico');
  expect(html).not.toContain('loading.gif');
  expect(html).not.toContain('{{spinner}}');
});
