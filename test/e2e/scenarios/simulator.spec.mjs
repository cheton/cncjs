/* Simulator commands must be issued and observed sequentially. */
/* eslint-disable no-await-in-loop */
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { test, expect, widget } from '../support/simulator.mjs';

const toolpath = 'G21\nG90\nG1 X10 Y5 F600\nG1 X0 Y0 F600\n';
async function upload(page, content = toolpath) {
  await widget(page, 'visualizer').locator('input[type="file"]').setInputFiles({
    name: 'e2e-toolpath.nc', mimeType: 'text/plain', buffer: Buffer.from(content),
  });
  await expect(widget(page, 'gcode')).toContainText('e2e-toolpath.nc');
  await expect(widget(page, 'visualizer').getByRole('button', { name: 'Run', exact: true })).toBeEnabled();
}

test('simulator: quick access toolbar sends controller commands to the isolated simulator', async ({ page, simulator }) => {
  const toolbar = page.getByRole('toolbar', { name: 'Quick access toolbar' });
  for (const [name, output] of [
    ['Feedhold', 'RT: !'],
    ['Cycle Start', 'RT: ~'],
    ['Homing', 'CMD: $H'],
    ['Unlock', 'CMD: $X'],
    ['Sleep', 'CMD: $SLP'],
    ['Reset', 'RT: Ctrl-X'],
  ]) {
    await toolbar.getByRole('button', { name, exact: true }).click();
    await expect.poll(() => simulator.commands.some(line => line.includes(output))).toBe(true);
  }
});

test('simulator: previews dimensions, executes G-code and clears the loaded file', async ({ page, simulator }, testInfo) => {
  const visualizer = widget(page, 'visualizer');
  const gcode = widget(page, 'gcode');
  await upload(page);
  await expect(gcode).toContainText('10.000 mm');
  await expect(gcode).toContainText('5.000 mm');
  await expect(visualizer).toContainText('e2e-toolpath.nc');
  if (process.env.E2E_SCREENSHOTS === '1') {
    const directory = fileURLToPath(new URL(`../../../output/e2e/screenshots/${testInfo.project.name}/`, import.meta.url));
    await mkdir(directory, { recursive: true });
    await page.screenshot({ path: `${directory}/visualizer-toolpath.png`, fullPage: true });
  }
  await visualizer.getByRole('button', { name: 'Run', exact: true }).click();
  await expect.poll(() => simulator.commands.some(line => line.includes('CMD: G1 X10 Y5 F600'))).toBe(true);
  await expect(visualizer.getByRole('button', { name: 'Close G-code file', exact: true })).toBeEnabled();
  await expect.poll(() => simulator.commands.some(line => line.includes('CMD: G1 X0 Y0 F600'))).toBe(true);
  await visualizer.getByRole('button', { name: 'Close G-code file', exact: true }).click();
  await expect(gcode).toContainText('G-code not loaded');
  await expect(visualizer.getByRole('button', { name: 'Run', exact: true })).toBeDisabled();
});

test('simulator: 3D-off dashboard keeps progress labels inside a full-height track', async ({ page, simulator }, testInfo) => {
  const visualizer = widget(page, 'visualizer');
  const toggle = visualizer.getByRole('button', { name: '3D View', exact: true }).first();
  await toggle.click();
  const dashboard = visualizer.getByLabel('G-code dashboard', { exact: true });
  const progress = dashboard.getByRole('progressbar', { name: 'G-code progress' });
  await expect(dashboard).toBeVisible();
  await expect(dashboard.getByText('G-code not loaded', { exact: true })).toBeVisible();
  await expect(progress).toHaveAttribute('aria-valuenow', '0');
  expect((await progress.boundingBox()).height).toBe(20);
  await expect(dashboard.locator('img')).toBeVisible();
  await upload(page);
  await expect(dashboard.getByText('e2e-toolpath.nc', { exact: true })).toBeVisible();
  await expect(dashboard.locator('[class*="line"]').filter({ hasText: 'G1 X10 Y5 F600' }).first()).toBeVisible();
  const total = String(toolpath.split('\n').length);
  await expect(progress).toHaveAttribute('aria-valuemax', total);
  const label = dashboard.getByText(`0 / ${total}`, { exact: true });
  await expect(label).toBeVisible();
  const trackBox = await progress.boundingBox();
  const labelBox = await label.boundingBox();
  expect(labelBox.y).toBeGreaterThanOrEqual(trackBox.y);
  expect(labelBox.y + labelBox.height).toBeLessThanOrEqual(trackBox.y + trackBox.height);
  expect(Math.abs(labelBox.x + labelBox.width / 2 - trackBox.x - trackBox.width / 2)).toBeLessThanOrEqual(1);
  const bounds = await dashboard.boundingBox();
  const toolbar = await visualizer.getByRole('toolbar', { name: 'G-code workflow toolbar' }).boundingBox();
  expect(bounds.y - toolbar.y - toolbar.height).toBeLessThanOrEqual(16);
  if (process.env.E2E_SCREENSHOTS === '1') {
    const directory = fileURLToPath(new URL(`../../../output/e2e/screenshots/${testInfo.project.name}/`, import.meta.url));
    await mkdir(directory, { recursive: true });
    await visualizer.screenshot({ path: `${directory}/visualizer-dashboard.png` });
  }
  await visualizer.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(progress).toHaveAttribute('aria-valuenow', total);
  await expect(dashboard.getByText(`${total} / ${total}`, { exact: true })).toBeVisible();
  await expect.poll(() => simulator.commands.some(line => line.includes('CMD: G1 X0 Y0 F600'))).toBe(true);
  await toggle.click();
  await expect(dashboard).toBeHidden();
  await expect(visualizer.locator('[aria-label="3D Visualizer"] canvas')).toBeVisible();
});

test('simulator: pause, resume and stop preserve workflow safety controls', async ({ page, simulator }) => {
  const visualizer = widget(page, 'visualizer');
  await upload(page, 'G21\nG90\nG1 X100 F60\nG1 X0 F60\n');
  await visualizer.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(visualizer.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
  await visualizer.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(visualizer.getByRole('button', { name: 'Stop', exact: true })).toBeEnabled();
  await expect(visualizer.getByRole('button', { name: 'Upload G-code', exact: true })).toBeDisabled();
  await visualizer.getByRole('button', { name: 'Run', exact: true }).click();
  await expect(visualizer.getByRole('button', { name: 'Pause', exact: true })).toBeEnabled();
  await visualizer.getByRole('button', { name: 'Pause', exact: true }).click();
  await visualizer.getByRole('button', { name: 'Stop', exact: true }).click();
  await expect(visualizer.getByRole('button', { name: 'Close G-code file', exact: true })).toBeEnabled();
  await expect(visualizer.getByRole('button', { name: 'Pause', exact: true })).toBeDisabled();
});

test('simulator: work coordinate entry updates the reported controller mode', async ({ page, simulator }) => {
  const visualizer = widget(page, 'visualizer');
  await visualizer.getByRole('button', { name: 'G54 (P1)', exact: true }).click();
  await page.getByRole('menuitem', { name: 'G55 (P2)', exact: true }).click();
  await expect(visualizer.getByRole('button', { name: 'G55 (P2)', exact: true })).toBeVisible();
  await expect.poll(() => simulator.commands.some(line => line.includes('CMD: G55'))).toBe(true);
});

test('simulator: watch directory opens safely without selecting or uploading a file', async ({ page, simulator }) => {
  const visualizer = widget(page, 'visualizer');
  await visualizer.getByRole('button', { name: 'Upload G-code options', exact: true }).click();
  await page.getByRole('menuitem', { name: 'Browse...', exact: true }).click();
  const dialog = page.getByRole('dialog');
  await expect(dialog.getByText('Watch Directory', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Load G-code', exact: true })).toBeDisabled();
  await dialog.getByRole('button', { name: 'Cancel', exact: true }).click();
  await expect(dialog).toBeHidden();
  await expect(visualizer.getByRole('button', { name: 'Run', exact: true })).toBeDisabled();
});

test('simulator: Grbl info tabs and override controls reflect actual controller state', async ({ page, simulator }) => {
  const grbl = widget(page, 'grbl');
  const bounds = await grbl.evaluate(element => ({ width: element.clientWidth, scrollWidth: element.scrollWidth }));
  expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1);
  const panels = grbl.locator('[data-tonic="Accordion"]');
  await expect(panels).not.toHaveCount(0);
  const borders = await panels.evaluateAll(elements => elements.map(element => {
    const style = getComputedStyle(element);
    return {
      top: parseFloat(style.borderTopWidth),
      right: parseFloat(style.borderRightWidth),
      bottom: parseFloat(style.borderBottomWidth),
      left: parseFloat(style.borderLeftWidth),
    };
  }));
  for (const [index, border] of borders.entries()) {
    expect(border.top).toBe(index === 0 ? 1 : 0);
    expect(border.right).toBe(1);
    expect(border.bottom).toBe(1);
    expect(border.left).toBe(1);
  }
  await grbl.getByRole('button', { name: 'Grbl controller info', exact: true }).click();
  const dialog = page.getByRole('dialog');
  const tabBounds = await dialog.getByRole('tablist').boundingBox();
  const panelBounds = await dialog.getByRole('tabpanel').boundingBox();
  expect(panelBounds.y - tabBounds.y - tabBounds.height).toBe(8);
  expect(panelBounds.x - tabBounds.x).toBe(12);
  expect(tabBounds.x + tabBounds.width - panelBounds.x - panelBounds.width).toBe(12);
  await expect(dialog.getByRole('tabpanel')).toContainText('machineState');
  await dialog.getByRole('tab', { name: 'Controller Settings', exact: true }).click();
  await expect(dialog.getByRole('tabpanel')).toContainText('$100');
  await dialog.getByRole('button', { name: 'Close', exact: true }).first().click();
  await grbl.getByRole('button', { name: '10%', exact: true }).first().click();
  const feedRow = grbl.getByRole('button', { name: 'Reset feed rate override', exact: true }).locator('..');
  await expect(feedRow).toContainText('110%');
  await grbl.getByRole('button', { name: 'Reset feed rate override', exact: true }).click();
  await expect(feedRow).toContainText('100%');
  const intensity = widget(page, 'laser').getByRole('status', { name: 'Laser Intensity Control' });
  await expect(intensity).toHaveText('100%');
  const spindleReset = grbl.getByRole('button', { name: 'Reset spindle override', exact: true });
  await spindleReset.locator('..').getByRole('button', { name: '10%', exact: true }).click();
  await expect(intensity).toHaveText('110%');
  await spindleReset.click();
  await expect(intensity).toHaveText('100%');
});
