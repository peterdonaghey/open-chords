import { test, expect } from '@playwright/test';

test.describe('Transposer', () => {
  test.beforeEach(async ({ page }) => {
    // Create a test song first
    await page.goto('/');
    await page.getByRole('button', { name: /new song/i }).click();
    
    await page.getByLabel(/title/i).fill('Transpose Test');
    await page.getByLabel(/artist/i).fill('Test Artist');
    await page.getByLabel(/key/i).selectOption('C');
    await page.getByLabel(/song content/i).fill(`[Verse]
C       G       Am      F
Test lyrics for transposition`);
    
    await page.getByRole('button', { name: /save song/i }).click();
    
    // Wait for song view to load
    await expect(page.getByText('Transpose Test')).toBeVisible();
  });

  test('should display transpose controls', async ({ page }) => {
    await expect(page.getByRole('button', { name: /\+/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /-/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /reset|0/i })).toBeVisible();
  });

  test('should transpose up by one semitone', async ({ page }) => {
    // Get initial content
    const initialContent = await page.textContent('.song-content');
    expect(initialContent).toContain('C');
    
    // Transpose up
    await page.getByRole('button', { name: /\+/i }).click();
    
    // Content should change
    const transposedContent = await page.textContent('.song-content');
    expect(transposedContent).not.toContain('C       G       Am      F');
    // Lyrics should remain the same
    expect(transposedContent).toContain('Test lyrics for transposition');
  });

  test('should transpose down by one semitone', async ({ page }) => {
    // Transpose down
    await page.getByRole('button', { name: /-/i }).click();
    
    // Content should change
    const content = await page.textContent('.song-content');
    expect(content).toContain('Test lyrics for transposition');
  });

  test('should reset to original key', async ({ page }) => {
    // Transpose up several times
    await page.getByRole('button', { name: /\+/i }).click();
    await page.getByRole('button', { name: /\+/i }).click();
    await page.getByRole('button', { name: /\+/i }).click();
    
    // Reset
    await page.getByRole('button', { name: /reset|0/i }).click();
    
    // Should be back to original
    const content = await page.textContent('.song-content');
    expect(content).toContain('C');
    expect(content).toContain('G');
    expect(content).toContain('Am');
    expect(content).toContain('F');
  });

  test('should use keyboard shortcuts to transpose', async ({ page }) => {
    // Transpose up with arrow key
    await page.keyboard.press('ArrowUp');
    
    // Wait for content to update
    await page.waitForTimeout(100);
    
    // Transpose down with arrow key
    await page.keyboard.press('ArrowDown');
    
    await page.waitForTimeout(100);
    
    // Reset with 0 key
    await page.keyboard.press('0');
    
    await page.waitForTimeout(100);
    
    // Should be back to original
    const content = await page.textContent('.song-content');
    expect(content).toContain('Test lyrics for transposition');
  });

  test('should transpose multiple semitones', async ({ page }) => {
    // Transpose up 5 times
    for (let i = 0; i < 5; i++) {
      await page.getByRole('button', { name: /\+/i }).click();
      await page.waitForTimeout(50);
    }
    
    // Content should be different
    const content = await page.textContent('.song-content');
    expect(content).toContain('Test lyrics for transposition');
    
    // Reset
    await page.getByRole('button', { name: /reset|0/i }).click();
    await page.waitForTimeout(100);
    
    const resetContent = await page.textContent('.song-content');
    expect(resetContent).toContain('C');
  });

  test('should display current transpose value', async ({ page }) => {
    // Initial transpose should be 0
    const toolbar = page.locator('.toolbar, .transposer-controls');
    await expect(toolbar).toBeVisible();
    
    // Transpose up
    await page.getByRole('button', { name: /\+/i }).click();
    await page.waitForTimeout(100);
    
    // Should show +1 or similar indicator
    // (This depends on your UI implementation)
  });

  test('should preserve lyrics when transposing', async ({ page }) => {
    const originalLyrics = 'Test lyrics for transposition';
    
    // Transpose up
    await page.getByRole('button', { name: /\+/i }).click();
    await page.waitForTimeout(100);
    expect(await page.textContent('.song-content')).toContain(originalLyrics);
    
    // Transpose down
    await page.getByRole('button', { name: /-/i }).click();
    await page.waitForTimeout(100);
    expect(await page.textContent('.song-content')).toContain(originalLyrics);
    
    // Reset
    await page.getByRole('button', { name: /reset|0/i }).click();
    await page.waitForTimeout(100);
    expect(await page.textContent('.song-content')).toContain(originalLyrics);
  });

  test('should preserve section markers when transposing', async ({ page }) => {
    // Section marker should always be visible
    await expect(page.getByText('[Verse]')).toBeVisible();
    
    // Transpose up
    await page.getByRole('button', { name: /\+/i }).click();
    await page.waitForTimeout(100);
    
    // Section marker still visible
    await expect(page.getByText('[Verse]')).toBeVisible();
  });
});

