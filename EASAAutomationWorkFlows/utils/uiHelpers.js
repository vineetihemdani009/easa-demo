import { expect } from '@playwright/test';

export class UiHelpers {
  constructor(page) {
    this.page = page;
  }

  async highlight(target, ms = 900) {
    await target.scrollIntoViewIfNeeded();
    await target.evaluate(
      (el, duration) => {
        const node = el;

        const prevOutline = node.style.outline;
        const prevOffset = node.style.outlineOffset;

        node.style.outline = '3px solid red';
        node.style.outlineOffset = '2px';

        setTimeout(() => {
          node.style.outline = prevOutline;
          node.style.outlineOffset = prevOffset;
        }, duration);
      },
      ms
    );
  }

  async logFieldError(field, fieldName, expectedText) {
    await expect(field).toHaveAttribute('aria-invalid', 'true');

    const describedBy = await field.getAttribute('aria-describedby');
    if (!describedBy) {
      throw new Error(`${fieldName}: aria-describedby not found`);
    }

    const errorContainer = this.page.locator(`id=${describedBy}`);
    await expect(errorContainer).toBeVisible();

    if (expectedText) {
      await expect(errorContainer).toContainText(expectedText);
    }

    const msg = (await errorContainer.textContent())?.trim() ?? '';

    await this.highlight(errorContainer);
    await this.highlight(field);

    console.log(`✅ ${fieldName} error is correct, message is: "${msg}"`);
  }

}