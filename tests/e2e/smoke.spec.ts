import { expect, test } from '@playwright/test'

test('overview and encoders flows are reachable', async ({ page }) => {
  await page.goto('/overview')

  await expect(page.getByRole('heading', { name: 'Fast Base64 Workspace' })).toBeVisible()

  await page.getByRole('link', { name: 'Encoders' }).first().click()
  await expect(page.getByRole('heading', { name: 'Encoders' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Encode to Base64' })).toBeVisible()
})
