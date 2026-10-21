import { expect, type Page, test as base } from "@playwright/test";

const RULE_VERSION = "sell-bc-2026-08-09-v1";
const WIDTHS = [320, 390, 768, 834, 1280, 1366] as const;

const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(`console: ${message.text()}`);
      });
      await use(errors);
      expect(errors, "browser console/runtime errors").toEqual([]);
    },
    { auto: true },
  ],
});

async function startNew(page: Page, width = 390) {
  await page.setViewportSize({ width, height: 844 });
  await page.goto("/");
  await page.getByTestId("new-scenario").click();
  await expect(page.getByTestId("scenario-editor")).toBeVisible();
}

async function fill(page: Page, selector: string, value: string) {
  const input = page.locator(selector);
  await input.focus();
  await input.fill(value);
  await input.blur();
}

async function save(page: Page) {
  await page.getByTestId("save-scenario").click();
  await expect(page.getByTestId("save-status")).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("SELL Mobile UX Reset v1", () => {
  test("Entry → New Scenario opens a single-flow Draft with default name", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "SELL Scenarios" })).toBeVisible();
    await expect(page.getByTestId("entry-empty")).toBeVisible();
    await expect(page.getByTestId("tier1-disclaimer")).toBeVisible();

    await page.getByTestId("new-scenario").click();
    await expect(page.getByTestId("scenario-name")).toHaveValue(/^Sell Scenario — \d{4}-\d{2}-\d{2}$/);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await expect(page.getByTestId("readiness-count")).toHaveText("1 of 5 key assumptions confirmed");
    await expect(page.getByRole("tab")).toHaveCount(0);
    await expect(page.locator("#sellingPrice")).toHaveValue("");
    await expect(page.locator("#mortgagePayout")).toHaveValue("$0");
  });

  test("Draft shows no authoritative result and a disabled breakdown", async ({ page }) => {
    await startNew(page);
    await expect(page.getByTestId("result-amount")).toHaveText("Enter selling price");
    await expect(page.getByTestId("view-calculation")).toBeDisabled();
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
  });

  test("selling price returns the accepted deterministic result", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await expect(page.getByTestId("readiness-count")).toHaveText("2 of 5 key assumptions confirmed");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Calculated");
    await expect(page.getByTestId("hero-provenance")).toHaveText(
      "Preliminary estimate · Updates when inputs change",
    );
    await expect(page.getByTestId("hero")).not.toContainText(RULE_VERSION);
    await page.getByTestId("provenance-link").click();
    await expect(page.getByTestId("details-toggle")).toBeFocused();
    await expect(page.getByTestId("detail-rule-version")).toHaveText(RULE_VERSION);
    await expect(page.getByTestId("detail-jurisdiction")).toHaveText("CA-BC");
    await page.getByTestId("breakdown-toggle").click();
    await expect(page.getByTestId("key-breakdown")).toContainText("$850,000");
    await page.getByTestId("details-toggle").click();
    await expect(page.getByTestId("view-calculation")).toBeEnabled();
  });

  test("mortgage edit recalculates; $0 mortgage never blocks", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await fill(page, "#mortgagePayout", "400000");
    await expect(page.getByTestId("readiness-count")).toHaveText("3 of 5 key assumptions confirmed");
    await expect(page.getByTestId("result-amount")).toHaveText("$422,963");
    await page.getByTestId("breakdown-toggle").click();
    await expect(page.getByTestId("key-breakdown")).toContainText("− $400,000");
  });

  test("invalid current input removes the authoritative result", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await fill(page, "#sellingPrice", "abc");
    await expect(page.getByTestId("result-amount")).not.toContainText("$");
    await expect(page.getByTestId("result-amount")).toHaveText("—");
    await expect(page.getByTestId("breakdown-toggle")).toBeDisabled();
    await expect(page.getByTestId("hero-provenance")).toHaveText(
      "Correct the highlighted amount(s) to see the estimate.",
    );
    await expect(page.locator("#sellingPrice")).toHaveAttribute("aria-invalid", "true");
    await fill(page, "#sellingPrice", "850000");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await fill(page, "#mortgagePayout", "x");
    await expect(page.getByTestId("result-amount")).toHaveText("—");
    await expect(page.getByTestId("hero-provenance")).toHaveText(
      "Correct the highlighted amount(s) to see the estimate.",
    );
    await expect(page.getByTestId("hero-provenance")).not.toContainText("enter a selling price");
  });

  test("disclosure sections preserve in-session edits", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "900000");
    await page.getByTestId("planning-toggle").click();
    await fill(page, "#staging", "5000");
    await page.getByTestId("planning-toggle").click();
    await page.getByTestId("planning-toggle").click();
    await expect(page.locator("#sellingPrice")).toHaveValue("$900,000");
    await expect(page.locator("#staging")).toHaveValue("$5,000");
  });

  test("Save → Entry → reopen restores the Scenario and its provenance", async ({ page }) => {
    await startNew(page);
    await page.getByTestId("scenario-name").fill("Sell — 123 Main Street");
    await fill(page, "#sellingPrice", "850000");
    await fill(page, "#mortgagePayout", "400000");
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await expect(page.getByTestId("save-scenario")).toBeDisabled();

    await page.getByTestId("back-to-entry").click();
    const card = page.getByTestId("scenario-card");
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("Sell — 123 Main Street");
    await expect(card).toContainText("Saved");
    await expect(card).toContainText("$422,963");

    await page.reload();
    await page.getByRole("button", { name: "Open Sell — 123 Main Street" }).click();
    await expect(page.getByTestId("scenario-name")).toHaveValue("Sell — 123 Main Street");
    await expect(page.locator("#sellingPrice")).toHaveValue("$850,000");
    await expect(page.locator("#mortgagePayout")).toHaveValue("$400,000");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await expect(page.getByTestId("result-amount")).toHaveText("$422,963");
    await page.getByTestId("details-toggle").click();
    await expect(page.getByTestId("detail-rule-version")).toHaveText(RULE_VERSION);
    await expect(page.getByTestId("detail-jurisdiction")).toHaveText("CA-BC");
  });

  test("Saved → edit → Updated → save again", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await save(page);
    await fill(page, "#mortgagePayout", "100000");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Updated");
    await expect(page.getByTestId("save-scenario")).toBeEnabled();
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
  });

  test("Draft can be saved and reopened", async ({ page }) => {
    await startNew(page);
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await page.getByTestId("back-to-entry").click();
    const card = page.getByTestId("scenario-card");
    await expect(card).toContainText("Draft");
    await expect(card).toContainText("No result yet");
    await card.getByRole("button", { name: /^Open/ }).click();
    await expect(page.locator("#sellingPrice")).toHaveValue("");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
  });

  test("Duplicate creates an unsaved copy until explicitly saved", async ({ page }) => {
    await startNew(page);
    await page.getByTestId("scenario-name").fill("Original");
    await fill(page, "#sellingPrice", "850000");
    await save(page);
    await page.getByTestId("back-to-entry").click();
    await page.getByRole("button", { name: "Duplicate Original" }).click();
    await expect(page.getByTestId("scenario-name")).toHaveValue("Copy of Original");
    await expect(page.locator("#sellingPrice")).toHaveValue("$850,000");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Calculated");

    await page.getByTestId("back-to-entry").click();
    await expect(page.getByTestId("leave-prompt")).toBeVisible();
    await page.getByTestId("discard-changes").click();
    await expect(page.getByTestId("scenario-card")).toHaveCount(1);

    await page.getByRole("button", { name: "Duplicate Original" }).click();
    await save(page);
    await page.getByTestId("back-to-entry").click();
    await expect(page.getByTestId("scenario-card")).toHaveCount(2);
    await expect(page.getByTestId("scenario-card").first()).toContainText("Copy of Original");
  });

  test("Duplicate from Results opens an unsaved copy", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await save(page);
    await page.getByTestId("duplicate-scenario").click();
    await expect(page.getByTestId("scenario-name")).toHaveValue(/^Copy of Sell Scenario/);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Calculated");
  });

  test("mortgage warning still calculates a signed negative result", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "100000");
    await fill(page, "#mortgagePayout", "200000");
    await expect(page.getByTestId("mortgage-warning")).toHaveText(
      "Mortgage payout exceeds the expected selling price.",
    );
    const amount = page.getByTestId("result-amount");
    await expect(amount).toContainText("-");
    await expect(amount).toHaveClass(/result-negative/);
    await expect(page.getByTestId("negative-note")).toHaveText(
      "Estimated costs and mortgage exceed the selling price.",
    );
    await expect(page.getByTestId("results-mortgage-warning")).toBeVisible();
  });

  test("all accepted selling and planning inputs remain reachable and affect the result", async ({
    page,
  }) => {
    await startNew(page, 1366);
    await fill(page, "#sellingPrice", "850000");
    await expect(page.locator("#legalNotary")).toBeHidden();
    await page.getByTestId("selling-toggle").click();

    await expect(page.getByRole("radio", { name: "Typical BC preset" })).toBeChecked();
    for (const id of [
      "legalNotary",
      "mortgageDischarge",
      "prepaymentPenalty",
      "propertyTaxAdjustment",
      "otherClosingAdjustments",
    ]) {
      await expect(page.locator(`#${id}`)).toBeVisible();
    }
    await expect(page.locator("#selling-costs-panel").getByText("GST on commission", { exact: true })).toBeVisible();
    await page.getByRole("radio", { name: "Manual amount" }).check();
    await expect(page.locator("#manualCommission")).toBeVisible();
    await fill(page, "#manualCommission", "10000");
    await fill(page, "#legalNotary", "1500");
    await fill(page, "#mortgageDischarge", "300");
    await fill(page, "#prepaymentPenalty", "2000");
    await fill(page, "#propertyTaxAdjustment", "-500");
    await fill(page, "#otherClosingAdjustments", "250");

    await page.getByTestId("planning-toggle").click();
    for (const id of [
      "staging",
      "repairs",
      "inspectionAppraisal",
      "cleaning",
      "movingStorage",
      "overlapHousing",
      "otherPlanningCosts",
    ]) {
      await fill(page, `#${id}`, "100");
    }
    await expect(page.getByTestId("planning-total")).toContainText("$700");
    await expect(page.getByTestId("readiness-count")).toHaveText("4 of 5 key assumptions confirmed");
    // 850,000 − 10,000 − 500 GST − 1,500 − 300 − 2,000 − 500 + 250 = 835,450
    await expect(page.getByTestId("result-amount")).toHaveText("$835,450");
    await page.getByTestId("breakdown-toggle").click();
    await expect(page.getByTestId("planning-row")).toContainText("$700");
    await expect(page.getByTestId("after-planning-row")).toContainText("$834,750");
    await page.getByTestId("details-toggle").click();
    await page.getByTestId("view-calculation").click();
    await expect(page.getByRole("dialog")).toContainText(`Rule version ${RULE_VERSION}`);
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("view-calculation")).toBeFocused();
  });

  test("keyboard: next actions move focus to the field and open its section", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await page.getByTestId("action-mortgage").focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#mortgagePayout")).toBeFocused();

    await fill(page, "#mortgagePayout", "100");
    await page.getByTestId("action-selling").click();
    await expect(page.getByTestId("selling-toggle")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#legalNotary")).toBeFocused();

    await page.getByTestId("breakdown-toggle").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("breakdown-toggle")).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByTestId("key-breakdown")).toBeVisible();
  });

  test("first fold: selling price is visible and above the result at 320 and 390", async ({ page }) => {
    for (const [width, height] of [
      [320, 640],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await page.getByTestId("new-scenario").click();
      const price = await page.locator("#sellingPrice").boundingBox();
      const hero = await page.getByTestId("hero").boundingBox();
      expect(price).not.toBeNull();
      expect(hero).not.toBeNull();
      expect(price!.y).toBeGreaterThanOrEqual(0);
      expect(price!.y + price!.height).toBeLessThanOrEqual(height);
      expect(hero!.y).toBeGreaterThan(price!.y + price!.height);
      await expect(page.getByTestId("result-amount")).toHaveText("Enter selling price");
      await expect(page.getByRole("tab")).toHaveCount(0);
      await expect(page.locator("#sellingPrice")).toBeEditable();
      await page.locator("#sellingPrice").fill("850000");
      await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
      await expectNoHorizontalOverflow(page);
    }
  });

  test("first fold 390×844: empty hero and the $822,963 result are visible without scrolling", async ({
    page,
  }) => {
    await startNew(page, 390);
    const inFirstFold = async (testId: string) => {
      const box = await page.getByTestId(testId).boundingBox();
      expect(box, testId).not.toBeNull();
      expect(box!.y, `${testId} top`).toBeGreaterThanOrEqual(0);
      expect(box!.y + box!.height, `${testId} bottom`).toBeLessThanOrEqual(844);
    };
    await expect(page.getByTestId("result-amount")).toHaveText("Enter selling price");
    await inFirstFold("result-amount");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await page.locator("#sellingPrice").fill("850000");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await inFirstFold("result-amount");
    await inFirstFold("hero");
    expect(await page.evaluate(() => window.scrollY)).toBe(0);
  });

  test("BC preset: $1,000,000 → commission $29,500 + GST $1,475, net $969,025", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "1000000");
    await expect(page.getByTestId("result-amount")).toHaveText("$969,025");
    await page.getByTestId("selling-toggle").click();
    await page.getByTestId("details-toggle").click();
    await expect(page.getByTestId("scenario-editor")).toContainText("$29,500");
    await expect(page.getByTestId("scenario-editor")).toContainText("$1,475");
  });

  test("saved Scenario keeps ruleVersion and snapshot on rename; recalculates on input change", async ({
    page,
  }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await save(page);
    const read = () =>
      page.evaluate(() => {
        const raw = window.localStorage.getItem("agentcal.sell-scenarios.v1") ?? "[]";
        return JSON.stringify(JSON.parse(raw));
      });
    const before = await read();
    expect(before).toContain(RULE_VERSION);
    await page.getByTestId("scenario-name").fill("Renamed only");
    await save(page);
    const afterRename = JSON.parse(await read());
    const list = Array.isArray(afterRename) ? afterRename : (afterRename.scenarios ?? []);
    expect(JSON.stringify(list[0].savedResult)).toBe(JSON.stringify(JSON.parse(before)[0]?.savedResult ?? JSON.parse(before).scenarios[0].savedResult));
    expect(list[0].ruleVersion).toBe(RULE_VERSION);
    await fill(page, "#mortgagePayout", "400000");
    await expect(page.getByTestId("result-amount")).toHaveText("$422,963");
    await save(page);
    await expect(page.getByTestId("persistence-note")).toContainText("only in this browser");
  });

  test("malformed localStorage does not crash or silently erase data", async ({ page }) => {
    await page.addInitScript(() => {
      if (!window.localStorage.getItem("agentcal.sell-scenarios.v1")) {
        window.localStorage.setItem("agentcal.sell-scenarios.v1", "{not json");
      }
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByTestId("storage-corrupt")).toBeVisible();
    await page.getByTestId("new-scenario").click();
    await fill(page, "#sellingPrice", "850000");
    await save(page);
    const backup = await page.evaluate(() => {
      const key = Object.keys(window.localStorage).find((k) => k.includes(".corrupt-"));
      return key ? window.localStorage.getItem(key) : null;
    });
    expect(backup).toBe("{not json");
  });

  for (const width of WIDTHS) {
    test(`no horizontal overflow and usable layout at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expectNoHorizontalOverflow(page);
      await page.getByTestId("new-scenario").click();
      await page.getByTestId("scenario-name").fill("A very long scenario name for responsive overflow testing");
      await fill(page, "#sellingPrice", "99999999");
      await page.getByTestId("selling-toggle").click();
      await page.getByTestId("planning-toggle").click();
      await expectNoHorizontalOverflow(page);
      await page.getByTestId("details-toggle").click();
      await expectNoHorizontalOverflow(page);
      await expect(page.getByTestId("result-amount")).toBeVisible();
      await expect(page.getByTestId("save-scenario")).toBeVisible();
      await save(page);
      await page.getByTestId("back-to-entry").click();
      await expectNoHorizontalOverflow(page);
      await expect(page.getByTestId("scenario-card")).toBeVisible();
    });
  }

  test("visual evidence screenshots", async ({ page }) => {
    const dir = process.env.VISUAL_DIR;
    test.skip(!dir, "set VISUAL_DIR to capture Figma-comparison screenshots");
    for (const [width, height] of [
      [390, 844],
      [1366, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await page.getByTestId("new-scenario").click();
      await page.getByTestId("scenario-name").fill("Sell — 123 Main Street");
      await fill(page, "#sellingPrice", "1200000");
      await fill(page, "#mortgagePayout", "425000");
      await page.screenshot({ path: `${dir}/flow-${width}.png` });
      await page.getByTestId("breakdown-toggle").click();
      await page.screenshot({ path: `${dir}/breakdown-${width}.png`, fullPage: true });
      await save(page);
      await page.getByTestId("back-to-entry").click();
      await page.getByTestId("new-scenario").click();
      await page.getByTestId("save-scenario").click();
      await page.getByTestId("back-to-entry").click();
      await page.screenshot({ path: `${dir}/entry-${width}.png` });
    }
  });
});
