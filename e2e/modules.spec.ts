import { test, expect, Page } from '@playwright/test';

async function loginUser(page: Page, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.fill('#email', 'demo@example.com');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    try {
      await page.waitForURL(/\/design\/new/, { timeout: 10000 });
      return;
    } catch {
      if (i < maxRetries - 1) await page.waitForTimeout(500);
    }
  }
  throw new Error('loginUser failed after ' + maxRetries + ' retries');
}

test.describe('Template categories', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/templates');
    await page.waitForTimeout(500);
  });

  test('shows all new category buttons', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Photobooks' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Invitations' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Tributes' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Social Media' })).toBeVisible();
    await expect(page.locator('button', { hasText: 'Presentations' })).toBeVisible();
  });

  test('photobooks category shows Photo Album template', async ({ page }) => {
    await page.click('button', { hasText: 'Photobooks' });
    await expect(page.locator('h3', { hasText: 'Photo Album' })).toBeVisible();
  });

  test('invitations category shows Wedding Invitation template', async ({ page }) => {
    await page.click('button', { hasText: 'Invitations' });
    await expect(page.locator('h3', { hasText: 'Wedding Invitation' })).toBeVisible();
  });

  test('tributes category shows In Loving Memory template', async ({ page }) => {
    await page.click('button', { hasText: 'Tributes' });
    await expect(page.locator('h3', { hasText: 'In Loving Memory' })).toBeVisible();
  });

  test('template click navigates to editor for new templates', async ({ page }) => {
    await page.click('button', { hasText: 'Photobooks' });
    await page.getByRole('link').filter({ hasText: 'Photo Album' }).first().click();
    await expect(page).toHaveURL(/\/design\/template-photobook/);
  });

  test('search filters templates by name', async ({ page }) => {
    await page.fill('input[placeholder="Search templates..."]', 'Wedding');
    await expect(page.locator('h3', { hasText: 'Wedding Invitation' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Instagram Post' })).not.toBeVisible();
    await expect(page.locator('h3', { hasText: 'Photo Album' })).not.toBeVisible();
  });

  test('search shows no results for non-matching query', async ({ page }) => {
    await page.fill('input[placeholder="Search templates..."]', 'zzzznonexistent');
    await expect(page.locator('text=No templates match your search')).toBeVisible();
  });

  test('search clears when query deleted', async ({ page }) => {
    await page.fill('input[placeholder="Search templates..."]', 'Wedding');
    await expect(page.locator('h3', { hasText: 'Wedding Invitation' })).toBeVisible();
    await page.fill('input[placeholder="Search templates..."]', '');
    await expect(page.locator('h3', { hasText: 'Instagram Post' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Wedding Invitation' })).toBeVisible();
  });
});

test.describe('Windows & Screens', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/windows-screens');
    await page.waitForTimeout(500);
  });

  test('page loads with heading and navigation', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Windows & Screens');
    await expect(page.locator('text=New Project')).toBeVisible();
  });

  test('shows empty state with no tickets', async ({ page }) => {
    await expect(page.locator('text=No fabrication tickets yet')).toBeVisible();
  });

  test('New Project links to design creation', async ({ page }) => {
    await page.click('text=New Project');
    await expect(page).toHaveURL(/\/design\/new/);
  });
});

test.describe('Transit', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/transit');
    await page.waitForTimeout(500);
  });

  test('page loads with heading and stats', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Transit');
    await expect(page.locator('text=Active')).toBeVisible();
    await expect(page.locator('text=Delayed')).toBeVisible();
    await expect(page.locator('text=Delivered')).toBeVisible();
    await expect(page.locator('text=Manifested')).toBeVisible();
  });

  test('shows empty state with no shipments', async ({ page }) => {
    await expect(page.locator('text=No shipments yet')).toBeVisible();
  });

  test('New Shipment links to design creation', async ({ page }) => {
    await page.click('text=New Shipment');
    await expect(page).toHaveURL(/\/design\/new/);
  });
});

test.describe('Homepage modules links', () => {
  test('shows module navigation links', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Windows & Screens')).toBeVisible();
    await expect(page.locator('text=Transit')).toBeVisible();
  });

  test('Windows & Screens link navigates correctly', async ({ page }) => {
    await loginUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'Windows & Screens' }).click();
    await expect(page).toHaveURL('/windows-screens');
  });

  test('Transit link navigates correctly', async ({ page }) => {
    await loginUser(page);
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.getByRole('link', { name: 'Transit' }).click();
    await expect(page).toHaveURL('/transit');
  });
});
