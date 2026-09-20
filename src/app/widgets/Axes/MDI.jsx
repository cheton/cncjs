import { Button } from '@tonic-ui/react';
import React from 'react';
import controller from '@app/lib/controller';

const gapSize = 5;

/**
 * @param {{ canClick?: boolean, mdi?: { disabled?: boolean, commands?: Array<{ id: string, name: string, command: string, grid?: object }> } }} props
 * @returns {JSX.Element|null}
 */
function MDI({ canClick = false, mdi = { disabled: true, commands: [] } }) {
  const commands = mdi.commands || [];

  if (mdi.disabled || commands.length === 0) {
    return null;
  }

  return (
    <div
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        marginTop: gapSize,
        gap: gapSize,
      }}
    >
      {commands.map(c => {
      // Calculate flex-basis from grid configuration (default to 4 = 3 columns per row)
        const grid = c.grid || {};
        const gridSize = grid.xs || grid.sm || grid.md || grid.lg || grid.xl || 4;
        const itemsPerRow = 12 / gridSize;
        const gapsPerRow = itemsPerRow - 1;

        // Calculate flex-basis accounting for gaps: (100% - total gap space) / items per row
        const flexBasis = `calc((100% - ${gapsPerRow * gapSize}px) / ${itemsPerRow})`;

        return (
          <div
            key={c.id}
            style={{
              flexBasis: flexBasis,
              maxWidth: flexBasis,
              boxSizing: 'border-box'
            }}
          >
            <Button
              size="sm"
              variant="ghost"
              style={{
                minWidth: 'auto',
                width: '100%',
              }}
              disabled={!canClick}
              onClick={() => {
                controller.command('gcode', c.command);
              }}
            >
              {c.name}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

export default MDI;
