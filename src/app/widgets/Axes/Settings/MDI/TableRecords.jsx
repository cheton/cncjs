import {
  Box,
  Button,
  ButtonGroup,
  Space,
} from '@tonic-ui/react';
import get from 'lodash/get';
import take from 'lodash/take';
import React from 'react';
import Table from '@app/components/Table';
import i18n from '@app/lib/i18n';

/**
 * @param {{ numerator: number, denominator: number }} props
 * @returns {JSX.Element}
 */
const Fraction = ({ numerator, denominator }) => (
  <Box sx={{ display: 'inline-flex', alignItems: 'baseline' }}>
    <Box
      as="sup"
      sx={{ display: 'inline', fontSize: '0.75em', lineHeight: 0, position: 'relative', top: '-0.5em' }}
    >
      {numerator}
    </Box>
    <Box sx={{ display: 'inline', lineHeight: 1 }}>/</Box>
    <Box
      as="sub"
      sx={{ display: 'inline', fontSize: '0.75em', lineHeight: 0, position: 'relative', bottom: '-0.25em' }}
    >
      {denominator}
    </Box>
  </Box>
);

const GRID_LABELS = {
  1: <Fraction numerator={1} denominator={12} />,
  2: <Fraction numerator={1} denominator={6} />,
  3: <Fraction numerator={1} denominator={4} />,
  4: <Fraction numerator={1} denominator={3} />,
  5: <Fraction numerator={5} denominator={12} />,
  6: <Fraction numerator={1} denominator={2} />,
  7: <Fraction numerator={7} denominator={12} />,
  8: <Fraction numerator={2} denominator={3} />,
  9: <Fraction numerator={3} denominator={4} />,
  10: <Fraction numerator={5} denominator={6} />,
  11: <Fraction numerator={11} denominator={12} />,
  12: '100%',
};

/**
 * @param {{
 *   records: Array<Record<string, unknown>>,
 *   loading?: boolean,
 *   error?: boolean,
 *   onMove: (from: number, to: number) => void,
 *   onCreate: () => void,
 *   onUpdate: (record: Record<string, unknown>) => void,
 *   onRemove: (id: string) => void
 * }} props
 * @returns {JSX.Element}
 */
function TableRecords({
  records,
  loading = false,
  error = false,
  onMove,
  onCreate,
  onUpdate,
  onRemove,
}) {
  return (
    <Table
      bordered={false}
      justified={false}
      hoverable={false}
      maxHeight={300}
      useFixedHeader
      data={(error || loading) ? [] : records}
      rowKey={record => record.id}
      emptyText={() => {
        if (error) {
          return <Box color="danger">{i18n._('An unexpected error has occurred.')}</Box>;
        }

        if (loading) {
          return (
            <Box>
              <i className="fa fa-fw fa-spin fa-circle-o-notch" />
              <Space width="2x" />
              {i18n._('Loading...')}
            </Box>
          );
        }

        return i18n._('No data to display');
      }}
      title={() => (
        <Button onClick={onCreate}>
          <i className="fa fa-plus" />
          <Space width="2x" />
          {i18n._('New')}
        </Button>
      )}
      columns={[
        {
          title: i18n._('Order'),
          className: 'text-nowrap',
          key: 'order',
          width: 80,
          render: (value, row, rowIndex) => (
            <ButtonGroup>
              <Button
                size="sm"
                disabled={rowIndex === 0}
                aria-label={i18n._('Move Up')}
                title={i18n._('Move Up')}
                onClick={() => onMove(rowIndex, rowIndex - 1)}
              >
                <i className="fa fa-fw fa-chevron-up" />
              </Button>
              <Button
                size="sm"
                disabled={rowIndex === records.length - 1}
                aria-label={i18n._('Move Down')}
                title={i18n._('Move Down')}
                onClick={() => onMove(rowIndex, rowIndex + 1)}
              >
                <i className="fa fa-fw fa-chevron-down" />
              </Button>
            </ButtonGroup>
          ),
        },
        {
          title: i18n._('Name'),
          className: 'text-nowrap',
          key: 'name',
          dataKey: 'name',
        },
        {
          title: i18n._('Command'),
          key: 'command',
          render: (value, row) => {
            const style = { background: 'inherit', border: 'none', margin: 0, padding: 0 };
            const lines = String(row.command).split('\n');
            const limit = 4;

            if (lines.length > limit) {
              return (
                <pre style={style}>
                  {take(lines, limit).join('\n')}
                  {'\n'}
                  {i18n._('and more...')}
                </pre>
              );
            }

            return <pre style={style}>{row.command}</pre>;
          },
        },
        {
          title: i18n._('Button Width'),
          className: 'text-nowrap',
          key: 'grid.xs',
          render: (value, row) => GRID_LABELS[get(row, 'grid.xs')] || '–',
        },
        {
          title: i18n._('Action'),
          className: 'text-nowrap',
          key: 'action',
          width: 90,
          render: (value, row) => (
            <Box>
              <Button
                size="sm"
                aria-label={i18n._('Update')}
                title={i18n._('Update')}
                onClick={() => onUpdate(row)}
              >
                <i className="fa fa-fw fa-edit" />
              </Button>
              <Button
                size="sm"
                aria-label={i18n._('Remove')}
                title={i18n._('Remove')}
                onClick={() => onRemove(row.id)}
              >
                <i className="fa fa-fw fa-close" />
              </Button>
            </Box>
          ),
        },
      ]}
    />
  );
}

export default TableRecords;
