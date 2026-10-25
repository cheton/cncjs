import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import { test as base, expect, openWorkspace, widget } from './fixtures.mjs';

export { expect, widget };
export const test = base.extend({
  simulator: async ({ page, baseURL }, use) => {
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname)) {
      throw new Error('Simulator scenarios require a local CNCjs backend.');
    }
    const child = spawn(process.execPath, ['-e', `
      const GrblServer = require('./grbl-simulator/grbl-server');
      const server = new GrblServer(0);
      const processRealtimeCommand = server.simulator.processRealtimeCommand.bind(server.simulator);
      server.simulator.processRealtimeCommand = (char) => {
        console.log('E2E RT: ' + server.escapeChar(char));
        return processRealtimeCommand(char);
      };
      server.start();
      server.server.once('listening', () => console.log('E2E_PORT=' + server.server.address().port));
    `], { cwd: fileURLToPath(new URL('../../../', import.meta.url)), stdio: ['ignore', 'pipe', 'pipe'] });
    const lines = createInterface({ input: child.stdout });
    const commands = [];
    lines.on('line', line => {
      if (line.includes(' CMD: ') || line.includes(' RT: ')) {
        commands.push(line);
      }
    });
    try {
      const port = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('Simulator did not bind a port')), 10_000);
        child.once('error', reject);
        child.once('exit', code => reject(new Error(`Simulator exited before connection: ${code}`)));
        lines.on('line', line => {
          if (!line.startsWith('E2E_PORT=')) {
            return;
          }
          clearTimeout(timer);
          resolve(Number(line.slice('E2E_PORT='.length)));
        });
      });
      await openWorkspace(page);
      const connection = widget(page, 'connection');
      await connection.getByRole('button', { name: 'Wi-Fi', exact: true }).click();
      await connection.getByRole('textbox', { name: 'Host', exact: true }).fill('127.0.0.1');
      await connection.getByRole('spinbutton', { name: 'Port', exact: true }).fill(String(port));
      await connection.getByRole('button', { name: 'Open', exact: true }).click();
      await expect(widget(page, 'visualizer').getByRole('button', { name: 'Upload G-code', exact: true })).toBeEnabled();
      await use({ port, commands });
    } finally {
      try {
        const close = widget(page, 'connection').getByRole('button', { name: 'Close', exact: true });
        if (!page.isClosed() && await close.isEnabled().catch(() => false)) {
          await close.click();
          await page.getByRole('dialog').getByRole('button', { name: 'OK', exact: true }).click();
          await expect(widget(page, 'connection').getByRole('button', { name: 'Open', exact: true })).toBeVisible();
        }
      } finally {
        lines.close();
        if (child.exitCode === null) {
          const exited = once(child, 'exit');
          child.kill('SIGTERM');
          await exited;
        }
      }
    }
  },
});
