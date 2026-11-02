import { expect, type Page, test as base } from "@playwright/test";

const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(`console: ${m.text()}`);
      });
      await use(errors);
      expect(errors, "browser console/runtime errors").toEqual([]);
    },
    { auto: true },
  ],
});

async function fill(page: Page, id: string, value: string) {
  const input = page.locator(`#${id}`);
  await input.focus();
  await input.fill(value);
  await input.blur();
}

async function open(page: Page, width = 390) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("/buy");
  await expect(page.getByTestId("buy-inputs")).toBeVisible();
}

async function confirmAll(page: Page) {
  await page.getByTestId("confirm-fmv").check();
  await page.getByTestId("confirm-gst").check();
  await page.getByTestId("confirm-standard").check();
}

async function noOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test("SELL still loads at / and links to BUY", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("scenario-entry")).toBeVisible();
  await page.getByTestId("to-buy").click();
  await expect(page.getByTestId("buy-inputs")).toBeVisible();
  await page.getByTestId("to-sell").click();
  await expect(page.getByTestId("scenario-entry")).toBeVisible();
});

test("reviewed example $1m / $200k with and without deposit; no result on Inputs", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "1000000");
  await expect(page.locator("#buyFmv")).toHaveValue("$1,000,000");
  await fill(page, "buyDownAmount", "200000");
  await expect(page.locator("#buyDownPercent")).toHaveValue("20");
  await confirmAll(page);
  await expect(page.getByTestId("buy-results")).toHaveCount(0);
  await expect(page.getByTestId("buy-contribution")).toHaveCount(0);
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-contribution")).toHaveText("$218,000.00");
  await expect(page.getByTestId("buy-ptt-total")).toHaveText("$18,000.00");
  await expect(page.getByTestId("buy-mortgage")).toHaveText("$800,000.00");
  await expect(page.getByTestId("buy-remaining")).toHaveText("$218,000.00");
  await expect(page.getByTestId("buy-partial")).toHaveCount(0);
  await expect(page.getByTestId("buy-closing-unsupplied")).toBeVisible();
  await noOverflow(page);
  await page.getByTestId("buy-edit-inputs").click();
  await expect(page.getByTestId("buy-contribution")).toHaveCount(0);
  await fill(page, "buyDeposit", "50000");
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-remaining")).toHaveText("$168,000.00");
  await expect(page.getByTestId("buy-mortgage")).toHaveText("$800,000.00");
});

test("percent entry syncs dollars; price change keeps the source", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "1000000");
  await fill(page, "buyDownPercent", "25");
  await expect(page.locator("#buyDownAmount")).toHaveValue("$250,000");
  await fill(page, "buyPrice", "800000");
  await expect(page.locator("#buyDownAmount")).toHaveValue("$200,000");
  await expect(page.locator("#buyDownPercent")).toHaveValue("25");
});

test("$3.5m PTT breakdown", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "3500000");
  await fill(page, "buyDownAmount", "700000");
  await confirmAll(page);
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-ptt-total")).toHaveText("$93,000.00");
  await expect(page.getByTestId("buy-ptt").locator(".buy-row")).toHaveCount(5);
});

test("missing confirmations and empty price block calculation with errors", async ({ page }) => {
  await open(page);
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-error-summary")).toBeVisible();
  await expect(page.getByTestId("buy-results")).toHaveCount(0);
  await fill(page, "buyPrice", "500000");
  await fill(page, "buyDownAmount", "100000");
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-error-summary")).toContainText("Confirm the taxable value");
  await expect(page.getByTestId("buy-error-summary")).toContainText("standard-case");
});

test("below-minimum down payment is rejected; editing FMV resets confirmation", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "1000000");
  await fill(page, "buyDownAmount", "50000");
  await expect(page.locator("#buyDownAmount-error")).toContainText("minimum");
  await confirmAll(page);
  await fill(page, "buyFmv", "900000");
  await expect(page.getByTestId("confirm-fmv")).not.toBeChecked();
});

test("below 20% shows a partial estimate state", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "1000000");
  await fill(page, "buyDownAmount", "100000");
  await confirmAll(page);
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-partial")).toContainText("insurance premium not yet calculated");
  await expect(page.getByTestId("buy-contribution")).toHaveText("$118,000.00");
  await expect(page.getByTestId("buy-results")).toContainText("(partial)");
});

test("credits above contribution show reconciliation, no cash due", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "1000000");
  await fill(page, "buyDownAmount", "200000");
  await fill(page, "buyDeposit", "300000");
  await confirmAll(page);
  await page.getByTestId("buy-calculate").click();
  await expect(page.getByTestId("buy-reconcile")).toBeVisible();
  await expect(page.getByTestId("buy-remaining")).toHaveText("Cannot be determined");
});

test("keyboard: checkboxes by Space, Calculate by Enter", async ({ page }) => {
  await open(page);
  await fill(page, "buyPrice", "600000");
  await fill(page, "buyDownAmount", "85000");
  for (const id of ["confirm-fmv", "confirm-gst", "confirm-standard"]) {
    await page.getByTestId(id).focus();
    await page.keyboard.press("Space");
    await expect(page.getByTestId(id)).toBeChecked();
  }
  await page.keyboard.press("Tab");
  await expect(page.getByTestId("buy-calculate")).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("buy-results")).toBeVisible();
  await expect(page.getByLabel("Purchase price (CAD)")).toHaveCount(0);
});

for (const width of [320, 390, 1280]) {
  test(`no overflow or overlap at ${width}px`, async ({ page }) => {
    await open(page, width);
    await noOverflow(page);
    await fill(page, "buyPrice", "3500000");
    await fill(page, "buyDownAmount", "700000.55");
    await fill(page, "buyClosing", "12345.67");
    await confirmAll(page);
    await noOverflow(page);
    await page.getByTestId("buy-calculate").click();
    await expect(page.getByTestId("buy-results")).toBeVisible();
    await noOverflow(page);
    const boxes = await page.locator(".buy-row dt, .buy-row dd").evaluateAll((els) =>
      els.map((e) => {
        const r = e.getBoundingClientRect();
        return { l: r.left, r: r.right, t: r.top, b: r.bottom };
      }),
    );
    for (let i = 0; i < boxes.length; i++)
      for (let j = i + 1; j < boxes.length; j++) {
        const a = boxes[i], b = boxes[j];
        const overlap = a.l < b.r - 1 && b.l < a.r - 1 && a.t < b.b - 1 && b.t < a.b - 1;
        expect(overlap, `overlap ${i}/${j}`).toBe(false);
      }
    if (process.env.VISUAL_DIR) {
      await page.screenshot({ path: `${process.env.VISUAL_DIR}/buy-results-${width}.png`, fullPage: true });
    }
  });
}
