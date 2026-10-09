const fs = require('fs');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { Spinner, TonicProvider } = require('@tonic-ui/react');

// Render the actual Tonic spinner before the application bundle loads. Keep
// language placeholders for the existing server-side template renderer.
module.exports = (filename) => {
  const indicator = React.createElement(Spinner, { size: 'sm', mx: 'auto', 'aria-hidden': true });
  const spinner = renderToStaticMarkup(React.createElement(TonicProvider, null, indicator));
  return fs.readFileSync(filename, 'utf8').replace('{{spinner}}', spinner);
};
