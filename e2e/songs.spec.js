import { test, expect } from '@playwright/test';

test.describe('Song Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display song library', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Open Chords');
    await expect(page.getByRole('button', { name: /new song/i })).toBeVisible();
  });

  test('should navigate to new song page', async ({ page }) => {
    await page.getByRole('button', { name: /new song/i }).click();
    await expect(page).toHaveURL(/\/song\/new/);
    await expect(page.getByText('New Song')).toBeVisible();
  });

  test('should create a new song', async ({ page }) => {
    await page.getByRole('button', { name: /new song/i }).click();
    
    // Fill in song details
    await page.getByLabel(/title/i).fill('Test E2E Song');
    await page.getByLabel(/artist/i).fill('Test E2E Artist');
    await page.getByLabel(/song content/i).fill(`[Verse]
C       G       Am      F
This is a test song for E2E testing`);
    
    // Save song
    await page.getByRole('button', { name: /save song/i }).click();
    
    // Should navigate to view page
    await expect(page).toHaveURL(/\/song\/view\//);
    await expect(page.getByText('Test E2E Song')).toBeVisible();
    await expect(page.getByText('Test E2E Artist')).toBeVisible();
  });

  test('should display song content correctly', async ({ page }) => {
    // Create and view a song
    await page.getByRole('button', { name: /new song/i }).click();
    await page.getByLabel(/title/i).fill('Display Test');
    await page.getByLabel(/artist/i).fill('Display Artist');
    await page.getByLabel(/song content/i).fill(`[Verse 1]
C       G       Am      F
Test lyrics for display

[Chorus]
F       G       C
Chorus lyrics here`);
    
    await page.getByRole('button', { name: /save song/i }).click();
    
    // Verify content display
    await expect(page.getByText('[Verse 1]')).toBeVisible();
    await expect(page.getByText('[Chorus]')).toBeVisible();
    await expect(page.getByText('Test lyrics for display')).toBeVisible();
    await expect(page.getByText('Chorus lyrics here')).toBeVisible();
  });

  test('should preview song while editing', async ({ page }) => {
    await page.getByRole('button', { name: /new song/i }).click();
    
    await page.getByLabel(/title/i).fill('Preview Test');
    await page.getByLabel(/artist/i).fill('Preview Artist');
    await page.getByLabel(/song content/i).fill(`C       G
Test preview lyrics`);
    
    // Click preview
    await page.getByRole('button', { name: /preview/i }).click();
    
    // Should show preview
    await expect(page.getByText('Test preview lyrics')).toBeVisible();
    await expect(page.getByRole('button', { name: /edit/i })).toBeVisible();
    
    // Click edit to go back
    await page.getByRole('button', { name: /edit/i }).click();
    await expect(page.getByLabel(/title/i)).toBeVisible();
  });

  test('should navigate back to library', async ({ page }) => {
    await page.getByRole('button', { name: /new song/i }).click();
    await page.getByLabel(/title/i).fill('Test');
    await page.getByLabel(/artist/i).fill('Test');
    await page.getByLabel(/song content/i).fill('C G Am F\nTest');
    await page.getByRole('button', { name: /save song/i }).click();
    
    // Click back to library
    await page.getByRole('button', { name: /back to library/i }).click();
    
    await expect(page).toHaveURL('/songs');
    await expect(page.getByText('Open Chords')).toBeVisible();
  });

  test('should cancel song creation', async ({ page }) => {
    await page.getByRole('button', { name: /new song/i }).click();
    
    await page.getByLabel(/title/i).fill('Cancel Test');
    
    // Click cancel
    await page.getByRole('button', { name: /cancel/i }).click();
    
    // Should go back to library
    await expect(page).toHaveURL('/songs');
  });

  test('should handle empty song list', async ({ page }) => {
    // This test assumes a fresh database or mock
    // In real scenario, you'd set up test data
    await expect(page.getByRole('button', { name: /new song/i })).toBeVisible();
  });
});

