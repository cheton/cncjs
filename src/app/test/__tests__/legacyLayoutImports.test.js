import fs from 'fs';
import path from 'path';

const appRoot = path.resolve(__dirname, '../..');
const legacyFamilies = [
  'Badge', 'Card', 'Center', 'CollapsibleCard', 'GridSystem', 'Hoverable',
  'Image', 'ImageIcon', 'Navs', 'Panel', 'Progress', 'ProgressBar', 'shared',
  'BaseTable', 'Table', 'TablePagination', 'Paginations',
];
const familyPaths = legacyFamilies.map(family => path.join(appRoot, 'components', family));
const isWithin = (filename, directory) => filename === directory || filename.startsWith(`${directory}${path.sep}`);
const sourceFiles = directory => fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const filename = path.join(directory, entry.name);
  if (entry.isDirectory()) {
    return entry.name === '__tests__' ? [] : sourceFiles(filename);
  }
  return /\.(js|jsx|styl)$/.test(entry.name) ? [filename] : [];
});

test('P3/P4 families are deleted and have no alias or relative source references', () => {
  expect(legacyFamilies.filter(family => fs.existsSync(path.join(appRoot, 'components', family)))).toEqual([]);
  const offenders = sourceFiles(appRoot).flatMap(filename => {
    const source = fs.readFileSync(filename, 'utf8');
    const literals = [...source.matchAll(/["']([^"'\n]+)["']/g)].map(match => match[1]);
    return literals.flatMap(literal => {
      let resolved = null;
      if (literal.startsWith('@app/')) {
        resolved = path.resolve(appRoot, literal.slice(5));
      } else if (literal.startsWith('.')) {
        resolved = path.resolve(path.dirname(filename), literal);
      }
      return resolved && familyPaths.some(familyPath => isWithin(resolved, familyPath))
        ? [`${path.relative(appRoot, filename)}: ${literal}`] : [];
    });
  });
  expect(offenders).toEqual([]);
});
