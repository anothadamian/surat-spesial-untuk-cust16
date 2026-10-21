import { expect, test } from '@playwright/test';

async function enterPin(page: import('@playwright/test').Page, pin: string) {
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  await page.getByRole('heading', { name: /nopalpante/i }).waitFor();
  for (const [index, digit] of [...pin].entries()) {
    await page.getByRole('button', { name: `Angka ${digit}` }).click();
    await expect(page.locator('.pin-dots')).toHaveAttribute('aria-label', `${index + 1} dari 4 angka terisi`);
  }
  await page.getByRole('button', { name: 'Buka kejutan' }).click();
}

async function catchSixFlowers(page: import('@playwright/test').Page) {
  await page.getByRole('button', { name: /ambil bunganya/i }).click();
  await page.getByRole('button', { name: 'Mulai main' }).waitFor();
  await page.evaluate(() => { Math.random = () => 0.5; });
  await page.getByRole('button', { name: 'Mulai main' }).click();
  await expect(page.getByRole('heading', { name: /tekan amplopnya/i })).toBeVisible({ timeout: 15000 });
  await expect(page.getByRole('button', { name: 'Lanjut ke amplop' })).toHaveCount(0);
}

test('the first visit opens with a loading screen before the intro', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  const loader = page.getByRole('status', { name: 'Memuat kejutan ulang tahun' });
  await expect(loader).toBeVisible();
  await expect(page.getByRole('progressbar', { name: 'Memuat kejutan' })).toBeVisible();
  await expect(loader).toBeHidden({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Angka 1' })).toBeVisible();
});

test('an incorrect PIN keeps the visitor on the intro', async ({ page }) => {
  await enterPin(page, '1111');
  await expect(page.locator('.form-message')).toContainText(/belum tepat|coba lagi/i);
  await expect(page.getByRole('heading', { name: /nopalpante/i })).toBeVisible();
});

test('the intro shows the new bouquet instead of the spider', async ({ page }) => {
  await page.goto('/');
  const bouquet = page.locator('.intro-bouquet');
  await expect(bouquet).toBeVisible();
  await expect(bouquet).toHaveAttribute('src', '/img/newbuket.png');
  await expect(page.locator('.intro-made')).toHaveText('made for you ♥');
  await expect(page.locator('.topbar')).toHaveCount(0);
  await expect(page.locator('.intro-scene .intro-spider')).toHaveCount(0);
  await expect(page.locator('.intro-sparkles .ambient-motif')).toHaveCount(16);
  await expect(page.locator('.intro-sparkles .ambient-motif').first()).toHaveCSS('animation-name', 'ambient-drift');
});

test('demo PIN 1234 opens the gift screen and the gift starts the flower game', async ({ page }) => {
  await enterPin(page, '1234');
  await expect(page.getByRole('heading', { name: /a little gift for you/i })).toBeVisible();
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await page.getByRole('button', { name: /ambil bunganya/i }).click();
  await expect(page.getByRole('heading', { name: /tangkap 6 bunga/i })).toBeVisible();
});

test('opening the gift reveals the bouquet and confetti before continuing', async ({ page }) => {
  await enterPin(page, '1234');
  await expect(page.locator('.gift-bouquet')).not.toBeVisible();
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await expect(page.locator('.gift-scene')).toHaveClass(/gift-opened/);
  await expect(page.locator('.gift-bouquet')).toBeVisible();
  await expect(page.locator('.gift-confetti')).toBeVisible();
  await expect(page.locator('.confetti-piece').first()).toHaveCSS('animation-name', 'confetti-fall');
  await expect(page.getByRole('button', { name: /ambil bunganya/i })).toBeVisible();
});

test('only opening the gift plays Kienan-style sparkle, not regular buttons or minigames', async ({ page }) => {
  await page.addInitScript(() => {
    const audio = window.AudioContext;
    const createOscillator = audio.prototype.createOscillator;
    Object.defineProperty(window, '__nopalpanteOscillatorCount', { value: 0, writable: true });
    audio.prototype.createOscillator = function () {
      (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount += 1;
      return createOscillator.call(this);
    };
  });
  await enterPin(page, '1234');
  await page.evaluate(() => { (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount = 0; });
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount)).toBe(3);
  await page.getByRole('button', { name: /ambil bunganya/i }).click();
  await page.getByRole('button', { name: 'Mulai main' }).click();
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount)).toBe(3);
});

test('the opened gift and continue button keep comfortable bottom spacing on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await enterPin(page, '1234');
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  const continueButton = page.getByRole('button', { name: /ambil bunganya/i });
  await expect(continueButton).toBeVisible();
  const bounds = await continueButton.boundingBox();
  expect(bounds).toBeTruthy();
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(844 - 28);
});

test('catching all six flowers reveals the envelope, then the four-photo video page', async ({ page }) => {
  await enterPin(page, '1234');
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await catchSixFlowers(page);
  await expect(page.getByRole('heading', { name: /tekan amplopnya/i })).toBeVisible();
  await page.getByRole('button', { name: 'Buka amplop' }).click();
  await expect(page.getByRole('heading', { name: /empat potongan cerita/i })).toBeVisible();
  await expect(page.locator('.photo-card')).toHaveCount(4);
  await expect(page.locator('.music-dock')).toBeVisible();
  await expect(page.locator('audio')).toHaveAttribute('src', '/music/anugerah-terindah.mp3');
  const video = page.locator('#nopalpante-youtube');
  await expect(video).toBeVisible();
  const bounds = await video.boundingBox();
  expect(bounds?.width).toBeGreaterThanOrEqual(200);
  expect(bounds?.height).toBeGreaterThanOrEqual(200);
});

test('the envelope visibly opens before moving to the memories page', async ({ page }) => {
  await enterPin(page, '1234');
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await catchSixFlowers(page);
  const envelope = page.getByRole('button', { name: 'Buka amplop' });
  await envelope.click();
  await expect(envelope).toHaveClass(/opening/);
  await expect(page.locator('.envelope-scene')).toBeVisible();
  await expect(page.getByRole('heading', { name: /empat potongan cerita/i })).toBeVisible({ timeout: 5000 });
});

test('blowing out the candle shows a gentle confetti celebration', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const audio = window.AudioContext;
    const createOscillator = audio.prototype.createOscillator;
    Object.defineProperty(window, '__nopalpanteOscillatorCount', { value: 0, writable: true });
    audio.prototype.createOscillator = function () {
      (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount += 1;
      return createOscillator.call(this);
    };
  });
  await enterPin(page, '1234');
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await catchSixFlowers(page);
  await page.getByRole('button', { name: 'Buka amplop' }).click();
  await page.getByRole('button', { name: /lanjutkan ceritanya/i }).click();
  await expect(page.getByRole('button', { name: /tahan untuk meniup lilin/i })).toBeVisible();
  await page.evaluate(() => { (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount = 0; });
  await expect(page.locator('.cake-layer')).toHaveCount(3);
  const candle = page.getByRole('button', { name: /tahan untuk meniup lilin/i });
  await candle.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(1800);
  await page.keyboard.up('Space');
  await expect(page.locator('.candle-confetti .confetti-piece')).toHaveCount(30);
  await expect(page.locator('.candle-confetti .confetti-piece').first()).toHaveCSS('animation-name', 'candle-confetti-fall');
  await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __nopalpanteOscillatorCount: number }).__nopalpanteOscillatorCount)).toBe(3);
  await expect(page.locator('.wish-card')).toBeVisible();
  await expect(page.locator('.cake')).toHaveCount(0);
  await page.getByRole('button', { name: /lihat kejutan berikutnya/i }).click();
  const present = page.getByRole('button', { name: 'Buka kotak hadiah' });
  await expect(present).toBeVisible();
  await expect(page.locator('.wish-scene .gift-letter')).toHaveAttribute('src', '/img/wish-letter.png');
  const presentBounds = await present.boundingBox();
  const musicBounds = await page.locator('.music-dock').boundingBox();
  expect(presentBounds && musicBounds).toBeTruthy();
  expect(presentBounds!.y + presentBounds!.height).toBeLessThan(musicBounds!.y);
  await expect(page.locator('.wish-scene .gift-bouquet')).toHaveCSS('opacity', '0');
  await expect(page.locator('.message-paper')).toHaveCount(0);
  await present.click();
  await expect(page.locator('.wish-scene')).toHaveClass(/gift-opened/);
  await expect(page.locator('.wish-scene .gift-letter')).toHaveCSS('animation-name', 'bouquet-unbox');
  await expect(page.getByRole('heading', { name: /selamat ulang tahun/i })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.wish-scene .gift-box-scene')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /masih ada kejutan kecil untukmu/i })).toBeVisible();
});

test('Dlynn-style picnic and catcher lead into the Kienan-style maze', async ({ page }) => {
  test.setTimeout(90000);
  await enterPin(page, '1234');
  await page.getByRole('button', { name: 'Buka kotak hadiah' }).click();
  await catchSixFlowers(page);
  await page.getByRole('button', { name: 'Buka amplop' }).click();
  await page.getByRole('button', { name: /lanjutkan ceritanya/i }).click();
  const candle = page.getByRole('button', { name: /tahan untuk meniup lilin/i });
  await candle.focus();
  await page.keyboard.down('Space');
  await page.waitForTimeout(1800);
  await page.keyboard.up('Space');
  await page.getByRole('button', { name: /lihat kejutan berikutnya/i }).click();
  await page.getByRole('button', { name: /buka kotak hadiah/i }).click();
  await page.getByRole('button', { name: /masih ada kejutan kecil untukmu/i }).waitFor();
  await page.getByRole('button', { name: /masih ada kejutan kecil untukmu/i }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  const picnicBoard = await page.locator('.picnic-board').boundingBox();
  expect(picnicBoard?.width).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: /jus/i }).click();
  await page.getByRole('button', { name: 'Tempatkan ke buah' }).click();
  await expect(page.locator('.live-message')).toContainText('Belum cocok');
  for (const [item, category] of [['Jus', 'minuman'], ['Sandwich', 'makanan'], ['Berry', 'buah'], ['Bunga', 'dekorasi']]) {
    await page.getByRole('button', { name: new RegExp(item, 'i') }).click();
    await page.getByRole('button', { name: `Tempatkan ke ${category}` }).click();
  }
  await expect(page.getByRole('heading', { name: /tangkap 7 kejutan/i })).toBeVisible({ timeout: 5000 });
  await page.evaluate(() => { Math.random = () => 0; });
  const catchField = page.locator('.surprise-catch-field');
  const catchBounds = await catchField.boundingBox();
  expect(catchBounds).toBeTruthy();
  expect(catchBounds!.width).toBeLessThanOrEqual(390);
  await page.mouse.move(catchBounds!.x + catchBounds!.width * 0.08, catchBounds!.y + catchBounds!.height * 0.8);
  await expect(page.locator('.catch-hud')).toContainText('7/7 tertangkap', { timeout: 45000 });
  await expect(page.getByRole('heading', { name: /bantu laba-laba kecil/i })).toBeVisible({ timeout: 5000 });
  await expect(page.locator('.tiny-maze [role="gridcell"]')).toHaveCount(49);
  const mazeBounds = await page.locator('.maze-shell').boundingBox();
  expect(mazeBounds?.width).toBeLessThanOrEqual(390);
  await page.getByRole('button', { name: 'Atas' }).click();
  await expect(page.locator('.maze-player')).toHaveAttribute('data-position', '6-0');
  const moves = ['Kanan', 'Kanan', 'Atas', 'Atas', 'Kanan', 'Kanan', 'Kanan', 'Atas', 'Atas', 'Kiri', 'Kiri', 'Kiri', 'Kiri', 'Atas', 'Atas', 'Kanan', 'Kanan', 'Kanan', 'Kanan', 'Kanan'];
  for (const direction of moves) await page.getByRole('button', { name: direction }).click();
  await expect(page.locator('.maze-success')).toBeVisible();
  await page.getByRole('button', { name: /selesai/i }).click();
  await expect(page.getByRole('heading', { name: /semoga harimu/i })).toBeVisible();
});
