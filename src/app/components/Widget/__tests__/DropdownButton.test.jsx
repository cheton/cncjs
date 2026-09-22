import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderAppUI } from '@app/test/render';
import Widget from '..';

describe('Widget.DropdownButton', () => {
  test('routes one enabled item selection to its owner and ignores disabled items', () => {
    const onSelect = jest.fn();
    const view = renderAppUI(
      <Widget.DropdownButton aria-label="Widget actions" onSelect={onSelect} toggle="Actions">
        <Widget.DropdownMenuItem eventKey="enabled">Enabled action</Widget.DropdownMenuItem>
        <Widget.DropdownMenuItem disabled eventKey="disabled">Disabled action</Widget.DropdownMenuItem>
      </Widget.DropdownButton>
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Widget actions' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Enabled action' }));
      fireEvent.click(screen.getByRole('menuitem', { name: 'Disabled action' }));

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith('enabled', expect.any(Object));
    } finally {
      view.dispose();
    }
  });

  test('closes on Escape and restores focus to the toggle', async () => {
    const view = renderAppUI(
      <Widget.DropdownButton aria-label="Widget actions" toggle="Actions">
        <Widget.DropdownMenuItem eventKey="enabled">Enabled action</Widget.DropdownMenuItem>
      </Widget.DropdownButton>
    );

    try {
      const toggle = screen.getByRole('button', { name: 'Widget actions' });
      fireEvent.click(toggle);
      fireEvent.keyDown(screen.getByRole('menu'), { key: 'Escape' });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
        expect(toggle).toHaveFocus();
      });
    } finally {
      view.dispose();
    }
  });

  test('closes when focus moves outside the menu', async () => {
    const view = renderAppUI(
      <>
        <Widget.DropdownButton aria-label="Widget actions" toggle="Actions">
          <Widget.DropdownMenuItem eventKey="enabled">Enabled action</Widget.DropdownMenuItem>
        </Widget.DropdownButton>
        <button type="button">Outside</button>
      </>
    );

    try {
      fireEvent.click(screen.getByRole('button', { name: 'Widget actions' }));
      fireEvent.blur(screen.getByRole('menu'), {
        relatedTarget: screen.getByRole('button', { name: 'Outside' }),
      });

      await waitFor(() => {
        expect(screen.queryByRole('menu')).not.toBeInTheDocument();
      });
    } finally {
      view.dispose();
    }
  });
});
