import { getCoreRowModel, getExpandedRowModel, useReactTable } from '@tanstack/react-table';
import { useEffect, useRef, useState } from 'react';
import { getColumnSizing } from './columnSizing';

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {String} text The text to be rendered.
 * @param {String} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
const getTextWidth = (text, font) => {
  // re-use canvas object for better performance
  const canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
  const context = canvas.getContext('2d');
  context.font = font;
  const metrics = context.measureText(text);
  return metrics.width || 0;
};

/** Own the Administration table model and measured sizing; presentation stays in each resource. */
export default function useResourceTable({ columns, data, rowSelection, onRowSelectionChange, font }) {
  const headerRef = useRef(null);
  const [tableWidth, setTableWidth] = useState(0);
  const table = useReactTable({
    data,
    columns,
    defaultColumn: { minSize: 80 },
    state: { rowSelection },
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
    getRowId: row => row.id,
    onRowSelectionChange,
  });
  useEffect(() => {
    if (!tableWidth) {
      return;
    }
    const definitions = table.getAllColumns().map(column => ({ ...column.columnDef, id: column.id }));
    table.setColumnSizing(getColumnSizing(definitions, tableWidth, text => getTextWidth(text, font)));
  }, [columns, font, table, tableWidth]);
  return { table, headerRef, setTableWidth };
}
