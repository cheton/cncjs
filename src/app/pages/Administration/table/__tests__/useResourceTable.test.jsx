import { renderHook, waitFor } from '@testing-library/react';
import { useEffect, useState } from 'react';
import useResourceTable from '../useResourceTable';

const data = [{ id: 'r6-row', name: 'R6 row' }];

beforeEach(() => {
  jest.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    measureText: () => ({ width: 48 }),
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

test('measured column sizing settles when a caller recreates its column definitions', async () => {
  let renderCount = 0;
  const { result } = renderHook(() => {
    renderCount += 1;
    const [rowSelection, setRowSelection] = useState({});
    const columns = [
      { id: 'name', accessorKey: 'name', header: 'Name', size: 'auto', minSize: 80 },
    ];
    const { table, setTableWidth } = useResourceTable({
      columns,
      data,
      rowSelection,
      onRowSelectionChange: setRowSelection,
      font: '600 14px Arial',
    });

    useEffect(() => {
      setTableWidth(480);
    }, [setTableWidth]);

    return table;
  });

  await waitFor(() => {
    expect(result.current.getState().columnSizing.name).toBeGreaterThan(80);
  });
  expect(renderCount).toBeLessThan(8);
});
