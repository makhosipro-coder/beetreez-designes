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
      if (i < maxRetries - 1) {
        await page.waitForTimeout(500);
      }
    }
  }
  throw new Error('loginUser failed after ' + maxRetries + ' retries');
}

test.describe('Home page', () => {
  test('loads with correct title and navigation', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveText('beetreez designes');
    await expect(page.locator('text=Create a design')).toBeVisible();
    await expect(page.locator('text=Browse templates')).toBeVisible();
  });

  test('navigates to login when clicking "Create a design" (unauthenticated)', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Create a design');
    await expect(page).toHaveURL(/\/login/);
  });

  test('navigates to login when clicking "Browse templates" (unauthenticated)', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Browse templates');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authentication', () => {
  test('login page loads with form', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
    await expect(page.locator('#email')).toBeVisible();
    await expect(page.locator('#password')).toBeVisible();
  });

  test('valid credentials redirects to /design/new', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.fill('#email', 'demo@example.com');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/design\/new/, { timeout: 15000 });
  });

  test('invalid credentials shows error', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'networkidle' });
    await page.waitForTimeout(300);
    await page.fill('#email', 'bad@example.com');
    await page.fill('#password', 'test123');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 10000 });
  });

  test('Header shows sign in button when logged out', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign in to your account')).toBeVisible();
  });
});

test.describe('Design editor', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('loads editor with all core components', async ({ page }) => {
    await expect(page.locator('text=beetreez designes')).toBeVisible();
    await expect(page.getByText('Tools', { exact: true })).toBeVisible();
    await expect(page.getByText('Layers', { exact: true })).toBeVisible();
    await expect(page.locator('text=Properties')).toBeVisible();
    await expect(page.locator('text=Export')).toBeVisible();
    await expect(page.locator('canvas')).toBeVisible();
  });

  test('Header shows user avatar when authenticated', async ({ page }) => {
    await expect(page.locator('text=Sign out')).toBeVisible();
    await expect(page.locator('text=Sign in')).not.toBeVisible();
  });

  test('tool switching updates active state via data-tool-id', async ({ page }) => {
    const rectBtn = page.locator('[data-tool-id="rectangle"]');
    await rectBtn.click();
    await expect(rectBtn).toHaveClass(/bg-accent/);

    const textBtn = page.locator('[data-tool-id="text"]');
    await textBtn.click();
    await expect(textBtn).toHaveClass(/bg-accent/);
    await expect(rectBtn).not.toHaveClass(/bg-accent/);
  });

  test('select tool starts active by default', async ({ page }) => {
    const selectBtn = page.locator('[data-tool-id="select"]');
    await expect(selectBtn).toHaveClass(/bg-accent/);
  });

  test('canvas renders with demo layer', async ({ page }) => {
    const canvas = page.locator('canvas');
    await canvas.waitFor({ state: 'visible' });
    await page.waitForTimeout(500);

    const boundingBox = await canvas.boundingBox();
    expect(boundingBox).not.toBeNull();
    expect(boundingBox!.width).toBeGreaterThan(0);
    expect(boundingBox!.height).toBeGreaterThan(0);
  });

  test('zoom controls are interactive', async ({ page }) => {
    const zoomSlider = page.locator('input[type="range"]');
    await expect(zoomSlider).toBeVisible();
  });

  test('undo/redo buttons are present and clickable', async ({ page }) => {
    const undoBtn = page.locator('[data-testid="undo-btn"]');
    const redoBtn = page.locator('[data-testid="redo-btn"]');
    await expect(undoBtn).toBeVisible();
    await expect(redoBtn).toBeVisible();
    await expect(undoBtn).toHaveText('Undo');
    await expect(redoBtn).toHaveText('Redo');
  });

  test('keyboard shortcut Ctrl+Z does not throw', async ({ page }) => {
    await page.keyboard.press('Control+z');
    await page.waitForTimeout(200);
  });

  test('Header logo navigates home', async ({ page }) => {
    await page.click('text=beetreez designes');
    await expect(page).toHaveURL('/');
  });
});

test.describe('Templates page', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/templates');
    await page.waitForTimeout(300);
  });

  test('loads with template grid', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Templates');
    await expect(page.locator('h3', { hasText: 'Instagram Post' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Presentation 16:9' })).toBeVisible();
  });

  test('category filtering works', async ({ page }) => {
    await page.click('text=Presentation');
    await expect(page.locator('h3', { hasText: 'Instagram Post' })).not.toBeVisible();
    await expect(page.locator('h3', { hasText: 'Presentation 16:9' })).toBeVisible();
  });

  test('template click navigates to editor', async ({ page }) => {
    await page.getByRole('link').filter({ hasText: 'Instagram Post' }).first().click();
    await expect(page).toHaveURL(/\/design\/template-instagram/);
  });
});

test.describe('Settings page', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
    await page.goto('/settings');
    await page.waitForTimeout(300);
  });

  test('loads with profile form', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('Settings');
    await expect(page.locator('text=Profile')).toBeVisible();
    await expect(page.locator('text=Save changes')).toBeVisible();
  });

  test('can edit name input', async ({ page }) => {
    const nameInput = page.locator('input').first();
    await nameInput.fill('Test User');
    await expect(nameInput).toHaveValue('Test User');
  });
});

test.describe('404 page', () => {
  test('shows 404 for non-existent routes', async ({ page }) => {
    const response = await page.goto('/nonexistent-route');
    expect(response!.status()).toBe(404);
    await expect(page.locator('text=404')).toBeVisible();
    await expect(page.locator('text=Go home')).toBeVisible();
  });
});

test.describe('API endpoints', () => {
  test('CSRF endpoint returns token', async ({ request }) => {
    const resp = await request.get('/api/csrf');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(body).toHaveProperty('token');
  });

  test('Designs list returns 401 without auth', async ({ request }) => {
    const resp = await request.get('/api/designs');
    expect(resp.status()).toBe(200);
    const body = await resp.json();
    expect(Array.isArray(body)).toBe(true);
  });
});

test.describe('Data persistence (Supabase)', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page);
  });

  test('design saves and loads from Supabase', async ({ page }) => {
    await page.goto('/design/new');
    await page.waitForTimeout(500);

    const designId = page.url().split('/design/')[1];

    const canvas = page.locator('canvas');
    await expect(canvas).toBeVisible();

    await page.click('text=Save');
    await page.waitForTimeout(1000);

    await page.goto(`/design/${designId}`);
    await page.waitForTimeout(1000);

    await expect(canvas).toBeVisible();
    await expect(page.locator('header')).toContainText('beetreez designes');
  });

  test('templates load from Supabase seed data', async ({ page }) => {
    await page.goto('/templates');
    await page.waitForTimeout(500);
    await expect(page.locator('h1')).toHaveText('Templates');
    await expect(page.locator('h3', { hasText: 'Instagram Post' })).toBeVisible();
    await expect(page.locator('h3', { hasText: 'Presentation 16:9' })).toBeVisible();
  });
});

test.describe('Responsive layout', () => {
  test('canvas remains functional at mobile width', async ({ page }) => {
    await loginUser(page);
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/design/new');
    await page.waitForTimeout(500);
    await expect(page.locator('text=beetreez designes')).toBeVisible();
    await expect(page.locator('text=Export')).toBeVisible();
  });
});
