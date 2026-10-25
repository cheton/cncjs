import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test as base, expect } from '@playwright/test';

export { expect };
export const widget = (page, id) => {
  const host = page.locator(`[data-widget-id="${id}"]`);
  return id === 'visualizer' ? host.locator('[aria-label="3D Visualizer widget"]') : host;
};
export async function openWorkspace(page) {
  await page.goto('/#/workspace');
  await expect(widget(page, 'connection')).toBeVisible();
  await expect(widget(page, 'visualizer')).toBeVisible();
}

export const test = base.extend({
  // Playwright requires a destructured first argument even without dependencies.
  // eslint-disable-next-line no-empty-pattern
  authenticatedSession: [async ({}, use, workerInfo) => {
    const name = process.env.E2E_USERNAME;
    const password = process.env.E2E_PASSWORD;
    if (!name && !password) {
      await use(null);
      return;
    }
    if (!name || !password) {
      throw new Error('Set both E2E_USERNAME and E2E_PASSWORD for authenticated scenarios.');
    }
    const baseURL = workerInfo.project.use.baseURL;
    if (!['localhost', '127.0.0.1', '[::1]'].includes(new URL(baseURL).hostname)) {
      throw new Error('Credential-based E2E sign-in is restricted to the local development server.');
    }
    // Native fetch keeps credentials out of Playwright request artifacts.
    const response = await fetch(new URL('/api/signin', baseURL), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, password }),
    });
    if (!response.ok) {
      throw new Error(`E2E sign-in failed (HTTP ${response.status}).`);
    }
    const result = await response.json();
    if (!result.token) {
      throw new Error('E2E sign-in returned no session token.');
    }
    await use({ enabled: result.enabled, name: result.name, token: result.token });
  }, { scope: 'worker' }],
  isolatedWorkspace: [async ({ context, page, baseURL, authenticatedSession }, use, testInfo) => {
    const mode = testInfo.project.use.colorScheme;
    // Seed each context once. Reloads must preserve the user's local changes.
    await context.addInitScript(({ mode, origin, session }) => {
      if (window.location.origin !== origin) {
        return;
      }
      if (localStorage.getItem('e2e-seeded')) {
        return;
      }
      localStorage.setItem('e2e-seeded', '1');
      localStorage.setItem('lang', 'en');
      localStorage.setItem('cnc', JSON.stringify({
        version: '2.0.0-dev',
        state: {
          session: session || {},
          settings: { appearance: mode, language: 'en' },
          workspace: {
            container: {
              default: { widgets: ['visualizer'] },
              primary: { show: true, widgets: ['connection', 'console', 'grbl', 'marlin', 'smoothie', 'tinyg', 'webcam', 'custom'] },
              secondary: { show: true, widgets: ['axes', 'gcode', 'macro', 'autolevel', 'probe', 'tool', 'spindle', 'laser'] },
            },
          },
          widgets: { connection: { autoReconnect: false } },
        },
      }));
    }, { mode, origin: new URL(baseURL).origin, session: authenticatedSession });
    const forbiddenWrites = [];
    await context.route('**/api/**', route => {
      const request = route.request();
      const path = new URL(request.url()).pathname;
      if (['GET', 'HEAD', 'OPTIONS'].includes(request.method()) ||
          (request.method() === 'POST' &&
          ['/api/signin', '/api/gcode', '/api/watch/files', '/api/watch/file'].includes(path))) {
        return route.continue();
      }
      forbiddenWrites.push(`${request.method()} ${path}`);
      return route.abort('blockedbyclient');
    });
    const pageErrors = [];
    page.on('pageerror', error => pageErrors.push(error.message));
    await use();
    if (process.env.E2E_SCREENSHOTS === '1' && !page.isClosed()) {
      const directory = fileURLToPath(new URL(`../../../output/e2e/screenshots/${mode}/`, import.meta.url));
      await mkdir(directory, { recursive: true });
      const name = testInfo.titlePath.slice(1).join('--').replace(/[^a-z0-9._-]+/gi, '-');
      await page.screenshot({ path: `${directory}/${name}.png`, fullPage: true });
    }
    expect(pageErrors, 'Uncaught browser errors').toEqual([]);
    expect(forbiddenWrites, 'Scenarios must not modify server settings or records').toEqual([]);
  }, { auto: true }],
});
