import { expect, test } from '@playwright/test';

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test(`loading bouquet stays clear of the text at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('status', { name: 'Memuat kejutan ulang tahun' })).toBeVisible();
    const bouquet = await page.locator('.loading-bouquet').boundingBox();
    const eyebrow = await page.locator('.loading-eyebrow').boundingBox();
    const heading = await page.locator('.loading-content h1').boundingBox();
    expect(bouquet && eyebrow && heading).toBeTruthy();
    expect(bouquet!.width).toBeLessThanOrEqual(viewport.width === 390 ? 150 : 175);
    expect(bouquet!.y + bouquet!.height).toBeLessThanOrEqual(eyebrow!.y);
    expect(bouquet!.y + bouquet!.height).toBeLessThanOrEqual(heading!.y);
  });
}

for (const viewport of [{ width: 320, height: 740 }, { width: 1280, height: 800 }]) {
  test(`fits the ${viewport.width}px viewport without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /nopal/i })).toBeVisible();
    expect(await page.locator('body').evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(viewport.width);
    if (viewport.width === 320) {
      const keypad = await page.locator('.keypad').boundingBox();
      expect(keypad?.width).toBeLessThanOrEqual(292);
    }
  });
}

test('four chat photos and the visible video fit the narrow mobile screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto('/');
  for (const digit of '0311') await page.getByRole('button', { name: `Angka ${digit}` }).click();
  await page.getByRole('button', { name: 'Buka kejutan' }).click();
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await page.getByRole('button', { name: /ambil bunganya/i }).click();
  await page.getByRole('button', { name: 'Mulai main' }).waitFor();
  await page.evaluate(() => { Math.random = () => 0.5; });
  await page.getByRole('button', { name: 'Mulai main' }).click();
  await expect(page.getByRole('heading', { name: /tekan amplopnya/i })).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Buka amplop' }).click();
  await expect(page.locator('.photo-card')).toHaveCount(4);
  await expect(page.locator('.photo-stack')).toHaveCSS('grid-template-columns', /\S+\s+\S+/);
  const video = page.locator('#nopalpante-youtube');
  const bounds = await video.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(200);
  expect(bounds?.height).toBeGreaterThanOrEqual(199);
  expect(await page.locator('body').evaluate((body) => body.scrollWidth)).toBeLessThanOrEqual(320);
});

for (const viewport of [{ width: 320, height: 640 }, { width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test(`gift scene stays within the ${viewport.width}x${viewport.height} viewport`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: 740 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    for (const [index, digit] of [...'0311'].entries()) {
      await page.getByRole('button', { name: `Angka ${digit}` }).click();
      await expect(page.locator('.pin-dots')).toHaveAttribute('aria-label', `${index + 1} dari 4 angka terisi`);
    }
    await page.getByRole('button', { name: 'Buka kejutan' }).click();
    await expect(page.locator('.gift-scene')).toBeVisible();
    await page.setViewportSize(viewport);
    const fitsViewport = () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight);
    expect(await fitsViewport()).toBe(true);
    await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
    await expect(page.locator('.gift-scene')).toHaveClass(/gift-opened/);
    expect(await fitsViewport()).toBe(true);
  });
}

for (const viewport of [{ width: 390, height: 844 }, { width: 1280, height: 800 }]) {
  test(`bouquet note is readable and stays clear of the heading at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    const note = page.locator('.bouquet-note');
    await expect(note).toHaveCSS('color', 'rgb(234, 245, 255)');
    await expect(note).toHaveCSS('background-color', 'rgb(18, 43, 70)');
    const noteBox = await note.boundingBox();
    const headingBox = await page.locator('.intro-copy h1').boundingBox();
    expect(noteBox && headingBox).toBeTruthy();
    const overlapsHeading = noteBox!.x < headingBox!.x + headingBox!.width
      && noteBox!.x + noteBox!.width > headingBox!.x
      && noteBox!.y < headingBox!.y + headingBox!.height
      && noteBox!.y + noteBox!.height > headingBox!.y;
    expect(overlapsHeading).toBe(false);
    if (viewport.width <= 720) await expect(page.locator('.intro-copy')).toHaveCSS('text-align', 'center');
  });
}

test('gift scene uses a navy animated background', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const digit of '0311') await page.getByRole('button', { name: `Angka ${digit}` }).click();
  await page.getByRole('button', { name: 'Buka kejutan' }).click();
  const giftScene = page.locator('.gift-scene');
  await expect(giftScene).toBeVisible();
  await expect(giftScene).toHaveCSS('background-color', 'rgb(8, 23, 47)');
  await expect(giftScene.locator('.gift-ambient .ambient-motif').first()).toHaveCSS('animation-name', 'gift-ambient-drift');
});

test('scene transition uses a longer spider swarm curtain', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const digit of '0311') await page.getByRole('button', { name: `Angka ${digit}` }).click();
  await page.getByRole('button', { name: 'Buka kejutan' }).click();
  const curtain = page.locator('.transition-spider');
  await expect(curtain.locator('.transition-spider-bloom')).toHaveCount(36);
  await expect(curtain.locator('.transition-spider-bloom').first()).toHaveCSS('animation-duration', '1.32s');
  await expect(page.locator('.gift-scene')).toBeVisible({ timeout: 3000 });
});

test('flower-catching game fits one mobile screen and starts with the spider catcher', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const digit of '0311') await page.getByRole('button', { name: `Angka ${digit}` }).click();
  await page.getByRole('button', { name: 'Buka kejutan' }).click();
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await page.getByRole('button', { name: /ambil bunganya/i }).click();
  await expect(page.locator('.game-start-card')).toBeVisible();
  const startBounds = await page.getByRole('button', { name: 'Mulai main' }).boundingBox();
  expect(startBounds).toBeTruthy();
  const viewportFits = () => page.evaluate(() => document.documentElement.scrollHeight <= window.innerHeight);
  expect(await viewportFits()).toBe(true);
  await page.getByRole('button', { name: 'Mulai main' }).click();
  await expect(page.locator('.falling-item').first()).toBeVisible();
  await expect(page.locator('.catch-field')).toHaveCSS('background-image', /nopalpante-game-sky/);
  expect(await viewportFits()).toBe(true);
});
