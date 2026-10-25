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

async function calculate(page: Page) {
  await page.getByTestId("calculate").click();
  await expect(page.getByTestId("results-view")).toBeVisible();
}

async function editInputs(page: Page) {
  await page.getByTestId("edit-inputs").click();
  await expect(page.getByTestId("inputs-view")).toBeVisible();
}

async function expectNoResultOnInputs(page: Page) {
  await expect(page.getByTestId("inputs-view")).toBeVisible();
  await expect(page.getByTestId("result-amount")).toHaveCount(0);
  await expect(page.getByTestId("estimated-net")).toHaveCount(0);
  await expect(page.getByTestId("results-view")).toHaveCount(0);
  const text = await page.getByTestId("scenario-editor").innerText();
  expect(text).not.toMatch(/Estimated net proceeds/i);
}

async function save(page: Page) {
  await page.getByTestId("save-scenario").click();
  await expect(page.getByTestId("saved-receipt")).toBeVisible();
}

async function expectNoHorizontalOverflow(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

test.describe("SELL v2 Inputs → Calculate → Results", () => {
  test("Entry → New opens a Draft on Inputs with no result", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "SELL Scenarios" })).toBeVisible();
    await expect(page.getByTestId("entry-empty")).toBeVisible();
    await page.getByTestId("new-scenario").click();
    await expect(page.getByRole("heading", { name: "SELL · Inputs" })).toBeVisible();
    await expect(page.getByTestId("scenario-name")).toHaveValue(/^Sell Scenario — \d{4}-\d{2}-\d{2}$/);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await expect(page.locator("#sellingPrice")).toHaveValue("");
    await expect(page.locator("#mortgagePayout")).toHaveValue("");
    await expect(page.locator("#mortgagePayout")).toHaveAttribute("placeholder", "0");
    await expect(page.getByTestId("calculate")).toHaveText("Calculate net proceeds");
    await expectNoResultOnInputs(page);
  });

  test("typing 1250000 shows no net result or competing dollar total", async ({ page }) => {
    await startNew(page);
    const input = page.locator("#sellingPrice");
    await input.focus();
    await page.keyboard.type("1250000");
    await expect(input).toHaveValue("1250000");
    await expect(input).toBeFocused();
    await expectNoResultOnInputs(page);
    const body = await page.locator("body").innerText();
    expect(body).not.toContain("1,212,463");
    expect(body).not.toContain("1,212,462");
    // Only the entered price may appear as a dollar amount near the field after blur.
    await input.blur();
    await expect(input).toHaveValue("$1,250,000");
    await expectNoResultOnInputs(page);
  });

  test("Calculate shows the $1.25M ledger with the final net last", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "1250000");
    await calculate(page);
    await expect(page.getByRole("heading", { name: "SELL · Results" })).toBeFocused();
    await expect(page.locator("#sellingPrice")).toHaveCount(0);
    const rows = page.getByTestId("ledger-row");
    await expect(rows).toHaveCount(5);
    await expect(rows.nth(0)).toContainText("Selling price");
    await expect(rows.nth(0)).toContainText("$1,250,000.00");
    await expect(rows.nth(1)).toContainText("Commission");
    await expect(rows.nth(1)).toContainText("negotiable");
    await expect(rows.nth(1)).toContainText("−$35,750.00");
    await expect(rows.nth(2)).toContainText("GST on commission (5%)");
    await expect(rows.nth(2)).toContainText("−$1,787.50");
    await expect(rows.nth(3)).toContainText("Mortgage payout");
    await expect(rows.nth(3)).toContainText("−$0.00");
    await expect(rows.nth(4)).toContainText("Other closing costs & adjustments");
    await expect(page.getByTestId("result-amount")).toHaveText("$1,212,463");
    await expect(page.getByTestId("net-exact")).toContainText("Exact $1,212,462.50");
    await expect(page.getByTestId("net-exact")).toContainText("rounded");
    await expect(page.getByTestId("result-status")).toHaveText("Preliminary");
    // Final net is the last element of the ledger, after every deduction.
    const lastTestId = await page
      .getByTestId("ledger")
      .locator("> li")
      .last()
      .getAttribute("data-testid");
    expect(lastTestId).toBe("estimated-net");
  });

  test("accepted vectors: $850k, $1M manual commission, mortgage $400k", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await editInputs(page);
    await fill(page, "#mortgagePayout", "400000");
    await calculate(page);
    await expect(page.getByTestId("result-amount")).toHaveText("$422,963");

    await editInputs(page);
    await fill(page, "#mortgagePayout", "0");
    await fill(page, "#sellingPrice", "1000000");
    await page.getByTestId("selling-toggle").click();
    await page.getByRole("radio", { name: "Manual amount" }).check();
    await fill(page, "#manualCommission", "29500");
    await calculate(page);
    const rows = page.getByTestId("ledger-row");
    await expect(rows.nth(1)).toContainText("−$29,500.00");
    await expect(rows.nth(2)).toContainText("−$1,475.00");
    await expect(page.getByTestId("result-amount")).toHaveText("$969,025");
  });

  test("Edit inputs shows prior values, hides the old result, recalculates", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await editInputs(page);
    await expect(page.locator("#sellingPrice")).toHaveValue("$850,000");
    await expect(page.getByTestId("calculate")).toHaveText("Recalculate & show results");
    await expectNoResultOnInputs(page);
    await fill(page, "#mortgagePayout", "400000");
    await expectNoResultOnInputs(page);
    await calculate(page);
    await expect(page.getByTestId("result-amount")).toHaveText("$422,963");
  });

  test("empty or invalid input cannot reach Results", async ({ page }) => {
    await startNew(page);
    await page.getByTestId("calculate").click();
    await expect(page.getByTestId("inputs-view")).toBeVisible();
    await expect(page.locator("#sellingPrice")).toHaveAttribute("aria-invalid", "true");
    await expect(page.locator("#sellingPrice")).toBeFocused();
    await fill(page, "#sellingPrice", "abc");
    await page.getByTestId("calculate").click();
    await expect(page.getByTestId("inputs-view")).toBeVisible();
    await expect(page.getByTestId("results-view")).toHaveCount(0);
    await fill(page, "#sellingPrice", "850000");
    await fill(page, "#mortgagePayout", "x");
    await page.getByTestId("calculate").click();
    await expect(page.getByTestId("inputs-view")).toBeVisible();
    await expect(page.locator("#mortgagePayout")).toBeFocused();
    await expectNoResultOnInputs(page);
  });

  test("Save → Entry → reopen opens Results under the saved basis", async ({ page }) => {
    await startNew(page);
    await page.getByTestId("scenario-name").fill("Sell — 123 Main Street");
    await fill(page, "#sellingPrice", "850000");
    await fill(page, "#mortgagePayout", "400000");
    await calculate(page);
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await expect(page.getByTestId("save-scenario")).toHaveCount(0);

    await page.getByTestId("back-to-entry").click();
    const card = page.getByTestId("scenario-card");
    await expect(card).toHaveCount(1);
    await expect(card).toContainText("$422,963");

    await page.reload();
    await page.getByRole("button", { name: "Open Sell — 123 Main Street" }).click();
    await expect(page.getByTestId("results-view")).toBeVisible();
    await expect(page.getByTestId("result-amount")).toHaveText("$422,963");
    await expect(page.getByTestId("result-status")).toHaveText("Saved result");
    await page.getByTestId("details-toggle").click();
    await expect(page.getByTestId("detail-rule-version")).toHaveText(RULE_VERSION);
    await expect(page.getByTestId("detail-jurisdiction")).toHaveText("CA-BC");
    await editInputs(page);
    await expect(page.locator("#sellingPrice")).toHaveValue("$850,000");
    await expect(page.locator("#mortgagePayout")).toHaveValue("$400,000");
  });

  test("Saved → edit → Updated; editing does not persist until saved", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await save(page);
    await editInputs(page);
    await fill(page, "#mortgagePayout", "100000");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Updated");
    await page.getByTestId("back-to-entry").click();
    await expect(page.getByTestId("leave-prompt")).toBeVisible();
    await page.getByTestId("discard-changes").click();
    await expect(page.getByTestId("scenario-card")).toContainText("$822,963");

    await page.getByRole("button", { name: /^Open/ }).first().click();
    await editInputs(page);
    await fill(page, "#mortgagePayout", "100000");
    await calculate(page);
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await expect(page.getByTestId("result-amount")).toHaveText("$722,963");
  });

  test("rename-only edit keeps the saved snapshot result", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await save(page);
    await page.getByTestId("scenario-name").fill("Renamed");
    await expect(page.getByTestId("result-status")).toHaveText("Saved result");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
  });

  test("Draft can be saved from Inputs and reopens on Inputs", async ({ page }) => {
    await startNew(page);
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await page.getByTestId("back-to-entry").click();
    const card = page.getByTestId("scenario-card");
    await expect(card).toContainText("No result yet");
    await card.getByRole("button", { name: /^Open/ }).click();
    await expect(page.getByTestId("inputs-view")).toBeVisible();
    await expectNoResultOnInputs(page);
  });

  test("Duplicate creates an unsaved copy on Inputs until saved", async ({ page }) => {
    await startNew(page);
    await page.getByTestId("scenario-name").fill("Original");
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await save(page);
    await page.getByTestId("duplicate-scenario").click();
    await expect(page.getByTestId("scenario-name")).toHaveValue("Copy of Original");
    await expect(page.getByTestId("inputs-view")).toBeVisible();
    await expect(page.locator("#sellingPrice")).toHaveValue("$850,000");
    await page.getByTestId("back-to-entry").click();
    await expect(page.getByTestId("leave-prompt")).toBeVisible();
    await page.getByTestId("discard-changes").click();
    await expect(page.getByTestId("scenario-card")).toHaveCount(1);

    await page.getByRole("button", { name: "Duplicate Original" }).click();
    await save(page);
    await page.getByTestId("back-to-entry").click();
    await expect(page.getByTestId("scenario-card")).toHaveCount(2);
  });

  test("mortgage above price warns on Inputs and yields a negative result", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "100000");
    await fill(page, "#mortgagePayout", "200000");
    await expect(page.getByTestId("mortgage-warning")).toHaveText(
      "Mortgage payout exceeds the expected selling price.",
    );
    await expectNoResultOnInputs(page);
    await calculate(page);
    const amount = page.getByTestId("result-amount");
    await expect(amount).toContainText("-");
    await expect(amount).toHaveClass(/result-negative/);
    await expect(page.getByTestId("negative-note")).toHaveText(
      "Estimated costs and mortgage exceed the selling price.",
    );
    await expect(page.getByTestId("results-mortgage-warning")).toBeVisible();
  });

  test("selling and planning inputs reach the ledger; planning stays separate", async ({ page }) => {
    await startNew(page, 1366);
    await fill(page, "#sellingPrice", "850000");
    await expect(page.locator("#legalNotary")).toBeHidden();
    await page.getByTestId("selling-toggle").click();
    await page.getByRole("radio", { name: "Manual amount" }).check();
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
    await calculate(page);
    // 850,000 − 10,000 − 500 GST − 1,500 − 300 − 2,000 − 500 + 250 = 835,450
    await expect(page.getByTestId("result-amount")).toHaveText("$835,450");
    await expect(page.getByTestId("planning-row")).toContainText("$700");
    await expect(page.getByTestId("after-planning-row")).toContainText("$834,750");
    await expect(page.getByTestId("ledger")).toContainText("Property-tax adjustment");
    await expect(page.getByTestId("ledger")).not.toContainText("Optional planning");
  });

  test("keyboard: Enter in a field calculates; Edit inputs is reachable", async ({ page }) => {
    await startNew(page);
    const input = page.locator("#sellingPrice");
    await input.focus();
    await page.keyboard.type("850000");
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("results-view")).toBeVisible();
    await page.getByTestId("edit-inputs").focus();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("inputs-view")).toBeVisible();
  });

  for (const width of [320, 390]) {
    test(`untouched optional amounts are empty with a "0" placeholder at ${width}px`, async ({ page }) => {
      await startNew(page, width);
      await expect(page.locator("#sellingPrice")).toHaveValue("");
      await expect(page.locator("#sellingPrice")).toHaveAttribute("placeholder", "Enter amount");
      await page.getByTestId("selling-toggle").click();
      await page.getByRole("radio", { name: "Manual amount" }).check();
      await page.getByTestId("planning-toggle").click();
      const plain = [
        "mortgagePayout",
        "manualCommission",
        "legalNotary",
        "mortgageDischarge",
        "prepaymentPenalty",
        "staging",
        "repairs",
        "inspectionAppraisal",
        "cleaning",
        "movingStorage",
        "overlapHousing",
        "otherPlanningCosts",
      ];
      for (const id of plain) {
        const input = page.locator(`#${id}`);
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("placeholder", "0");
        await input.focus();
        await expect(input).toHaveValue("");
      }
      for (const id of ["propertyTaxAdjustment", "otherClosingAdjustments"]) {
        const input = page.locator(`#${id}`);
        await expect(input).toHaveValue("");
        await expect(input).toHaveAttribute("placeholder", "0 or signed amount");
      }
      const mortgage = page.locator("#mortgagePayout");
      await mortgage.focus();
      await mortgage.pressSequentially("2500");
      await expect(mortgage).toHaveValue("2500");
      await mortgage.blur();
      await expect(mortgage).toHaveValue("$2,500");
      const signed = page.locator("#propertyTaxAdjustment");
      await signed.focus();
      await signed.pressSequentially("-500");
      await expect(signed).toHaveValue("-500");
      await signed.blur();
      // A cleared optional amount is $0 again and still calculates.
      await mortgage.focus();
      await mortgage.fill("");
      await mortgage.blur();
      await expect(mortgage).toHaveValue("");
      await fill(page, "#sellingPrice", "850000");
      await fill(page, "#propertyTaxAdjustment", "");
      await page.getByRole("radio", { name: "Typical BC preset" }).check();
      await calculate(page);
      await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
      await expectNoHorizontalOverflow(page);
    });
  }

  test("valid price stays Draft on Inputs; Save draft reopens on Inputs, not Results", async ({ page }) => {
    await startNew(page);
    await page.locator("#sellingPrice").focus();
    await page.keyboard.type("1250000");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await expect(page.getByTestId("lifecycle-badge")).not.toHaveText(/Calculated/);
    await expectNoResultOnInputs(page);
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await page.getByTestId("back-to-entry").click();
    const card = page.getByTestId("scenario-card");
    await expect(card).toContainText("Draft");
    await expect(card).toContainText("No result yet");

    await page.reload();
    await page.getByTestId("scenario-card").getByRole("button", { name: /^Open/ }).click();
    await expect(page.getByTestId("inputs-view")).toBeVisible();
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    await expect(page.locator("#sellingPrice")).toHaveValue("$1,250,000");
    await expectNoResultOnInputs(page);

    // Calculating the reopened draft is unsaved work until saved.
    await calculate(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Calculated");
    await expect(page.getByTestId("save-scenario")).toBeEnabled();
    await save(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await page.getByTestId("back-to-entry").click();
    await page.getByTestId("scenario-card").getByRole("button", { name: /^Open/ }).click();
    await expect(page.getByTestId("results-view")).toBeVisible();
    await expect(page.getByTestId("result-amount")).toHaveText("$1,212,463");
  });

  test("changed numbers on a saved Scenario need Calculate before saving", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await save(page);
    await editInputs(page);
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await fill(page, "#mortgagePayout", "100000");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Updated");
    await expect(page.getByTestId("save-scenario")).toHaveCount(0);
    await expect(page.getByTestId("save-needs-calculate")).toBeVisible();
    await expectNoResultOnInputs(page);
  });

  test("explicit saved zero and snapshot survive reopen, focus and blur", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await fill(page, "#mortgagePayout", "0");
    await calculate(page);
    await save(page);
    await page.getByTestId("back-to-entry").click();
    await page.getByTestId("scenario-card").getByRole("button", { name: /^Open/ }).click();
    await editInputs(page);
    const mortgage = page.locator("#mortgagePayout");
    await expect(mortgage).toHaveValue("$0");
    await mortgage.focus();
    await expect(mortgage).toHaveValue("0");
    await mortgage.blur();
    await expect(mortgage).toHaveValue("$0");
    await expect(page.getByTestId("lifecycle-badge")).toHaveText("Saved");
    await calculate(page);
    await expect(page.getByTestId("result-status")).toHaveText("Saved result");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await expect(page.getByTestId("save-scenario")).toHaveCount(0);
    await expect(page.getByTestId("saved-receipt")).toBeVisible();
  });

  test("Saved Results: receipt is status text, Done returns to Scenarios, Duplicate is subordinate", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);

    // Unsaved Results: prominent Save, no receipt, no Done; Duplicate is a small text action.
    await expect(page.getByTestId("save-scenario")).toBeVisible();
    await expect(page.getByTestId("save-scenario")).toHaveText("Save Scenario");
    await expect(page.getByTestId("saved-receipt")).toHaveCount(0);
    await expect(page.getByTestId("done-back")).toHaveCount(0);
    const saveBox = (await page.getByTestId("save-scenario").boundingBox())!;
    const dupBox = (await page.getByTestId("duplicate-scenario").boundingBox())!;
    expect(dupBox.width).toBeLessThan(saveBox.width);
    expect(dupBox.height).toBeGreaterThanOrEqual(44);
    expect(saveBox.y).toBeLessThan(dupBox.y);

    await save(page);
    const receipt = page.getByTestId("saved-receipt");
    await expect(receipt).toContainText("Scenario saved");
    await expect(receipt).toContainText("Stored in this browser. Reopen it from Scenarios.");
    await expect(receipt).toHaveAttribute("role", "status");
    expect(await receipt.evaluate((el) => el.tagName)).not.toBe("BUTTON");
    await expect(page.getByTestId("save-scenario")).toHaveCount(0);
    const done = page.getByTestId("done-back");
    await expect(done).toBeEnabled();
    await expect(done).toHaveText("Done — Back to Scenarios");
    const doneBox = (await done.boundingBox())!;
    expect(doneBox.height).toBeGreaterThanOrEqual(44);
    // Still on Results: Save must not auto-redirect.
    await expect(page.getByTestId("results-view")).toBeVisible();

    await done.click();
    await expect(page.getByTestId("scenario-card")).toHaveCount(1);
    await expect(page.getByTestId("scenario-card")).toContainText("$822,963");

    // Reopen the clean saved Scenario: still Saved result, receipt and Done, nothing recalculated.
    await page.getByTestId("scenario-card").getByRole("button", { name: /^Open/ }).click();
    await expect(page.getByTestId("result-status")).toHaveText("Saved result");
    await expect(page.getByTestId("saved-receipt")).toBeVisible();
    await page.getByTestId("done-back").click();
    await expect(page.getByTestId("scenario-card")).toHaveCount(1);
    await expect(page.getByTestId("leave-prompt")).toHaveCount(0);
  });

  test("failed save shows no receipt or Done; dirty saved Results offers Save changes and guards leaving", async ({ page }) => {
    await startNew(page);
    await fill(page, "#sellingPrice", "850000");
    await calculate(page);
    await page.evaluate(() => {
      const original = Storage.prototype.setItem;
      (window as unknown as { __restore: () => void }).__restore = () => {
        Storage.prototype.setItem = original;
      };
      Storage.prototype.setItem = () => {
        throw new Error("quota");
      };
    });
    await page.getByTestId("save-scenario").click();
    await expect(page.getByTestId("save-error")).toBeVisible();
    await expect(page.getByTestId("saved-receipt")).toHaveCount(0);
    await expect(page.getByTestId("done-back")).toHaveCount(0);
    await expect(page.getByTestId("save-scenario")).toBeEnabled();
    await page.evaluate(() => (window as unknown as { __restore: () => void }).__restore());
    await save(page);
    await expect(page.getByTestId("save-error")).toHaveCount(0);
    await expect(page.getByTestId("done-back")).toBeVisible();

    // Edit → recalculate: dirty again, Save changes replaces receipt/Done; back is guarded.
    await editInputs(page);
    await fill(page, "#mortgagePayout", "100000");
    await calculate(page);
    await expect(page.getByTestId("saved-receipt")).toHaveCount(0);
    await expect(page.getByTestId("done-back")).toHaveCount(0);
    await expect(page.getByTestId("save-scenario")).toHaveText("Save changes");
    await page.getByTestId("back-to-entry").click();
    await expect(page.getByTestId("leave-prompt")).toBeVisible();
    await page.getByRole("button", { name: "Keep editing" }).click();
    await save(page);
    await expect(page.getByTestId("done-back")).toBeVisible();
  });

  for (const [w, h] of [[320, 640], [390, 844], [1280, 800]] as const) {
    test(`Saved Results actions are reachable and do not overlap at ${w}px`, async ({ page }) => {
      await startNew(page);
      await page.setViewportSize({ width: w, height: h });
      await fill(page, "#sellingPrice", "850000");
      await calculate(page);
      await save(page);
      const done = page.getByTestId("done-back");
      const dup = page.getByTestId("duplicate-scenario");
      await done.scrollIntoViewIfNeeded();
      const a = (await done.boundingBox())!;
      const b = (await dup.boundingBox())!;
      expect(a.y + a.height).toBeLessThanOrEqual(b.y);
      expect(a.x).toBeGreaterThanOrEqual(0);
      expect(a.x + a.width).toBeLessThanOrEqual(w);
      await expectNoHorizontalOverflow(page);
      await dup.click();
      await expect(page.getByTestId("inputs-view")).toBeVisible();
      await expect(page.getByTestId("lifecycle-badge")).toHaveText("Draft");
    });
  }

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
    test(`no horizontal overflow in either mode at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await expectNoHorizontalOverflow(page);
      await page.getByTestId("new-scenario").click();
      await page.getByTestId("scenario-name").fill("A very long scenario name for responsive overflow testing");
      await fill(page, "#sellingPrice", "99999999");
      await page.getByTestId("selling-toggle").click();
      await page.getByTestId("planning-toggle").click();
      await expectNoHorizontalOverflow(page);
      await expectNoResultOnInputs(page);
      await calculate(page);
      await page.getByTestId("details-toggle").click();
      await expectNoHorizontalOverflow(page);
      await expect(page.getByTestId("result-amount")).toBeVisible();
      await expect(page.locator("input")).toHaveCount(1); // scenario name only; no price field
      await save(page);
      await page.getByTestId("back-to-entry").click();
      await expectNoHorizontalOverflow(page);
    });
  }

  test("visual evidence screenshots", async ({ page }) => {
    const dir = process.env.VISUAL_DIR;
    test.skip(!dir, "set VISUAL_DIR to capture screenshots");
    for (const [width, height] of [
      [390, 844],
      [1366, 900],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto("/");
      await page.evaluate(() => window.localStorage.clear());
      await page.reload();
      await page.getByTestId("new-scenario").click();
      await page.screenshot({ path: `${dir}/inputs-default-${width}.png` });
      await page.locator("#sellingPrice").focus();
      await page.keyboard.type("1250000");
      await page.screenshot({ path: `${dir}/inputs-typing-${width}.png` });
      await calculate(page);
      await page.screenshot({ path: `${dir}/results-${width}.png` });
      await editInputs(page);
      await page.screenshot({ path: `${dir}/edit-after-result-${width}.png` });
    }
  });
});
