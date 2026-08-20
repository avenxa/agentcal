import { expect, type Page, test } from "@playwright/test";

const WIDTHS = [320, 390, 768, 834, 1280, 1366] as const;

const TIER1 = "Estimate only — not a quote, approval, or professional advice.";
const TAX_NOTE =
  "Capital gains tax and BC home flipping tax are not calculated. Use an adviser-supplied amount only as a manual adjustment.";
const REFERRAL =
  "Confirm mortgage figures with a mortgage broker or lender, legal and closing amounts with a lawyer or notary, and tax treatment with an accountant.";

function countOccurrences(haystack: string, needle: string): number {
  return needle.length === 0 ? 0 : haystack.split(needle).length - 1;
}

function expectOnceEach(text: string) {
  expect(countOccurrences(text, TIER1)).toBe(1);
  expect(countOccurrences(text, TAX_NOTE)).toBe(1);
}

function expectDisclaimerPairOnceAtEnd(text: string) {
  const normalized = text.replaceAll("\r\n", "\n").trimEnd();
  expectOnceEach(normalized);
  expect(normalized.endsWith(`${TIER1}\n${TAX_NOTE}`)).toBe(true);
}

async function fillSellingPrice(page: Page, amount: string) {
  const sellingPrice = page.locator("#sellingPrice");
  await sellingPrice.focus();
  await sellingPrice.fill(amount);
  await sellingPrice.blur();
}

async function expandStickySummary(page: Page) {
  const viewport = page.viewportSize();
  if (viewport && viewport.width >= 1280) {
    return;
  }

  const toggle = page.getByTestId("sticky-summary-toggle");
  await expect(page.getByTestId("result-context")).toHaveAttribute(
    "data-input-focused",
    "false",
  );
  await expect(toggle).toBeVisible();
  if ((await toggle.getAttribute("aria-expanded")) !== "true") {
    await toggle.click();
  }
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
}

async function openEstimateSummary(page: Page) {
  await expandStickySummary(page);
  const trigger = page.getByTestId("estimate-summary-open");
  await expect(trigger).toBeEnabled();
  await trigger.click();
  await expect(page.getByTestId("estimate-summary")).toBeVisible();
}

async function fillFieldById(page: Page, id: string, amount: string) {
  const field = page.locator(`#${id}`);
  await field.focus();
  await field.fill(amount);
  await field.blur();
}

async function fillReferenceScenario(page: Page) {
  await fillSellingPrice(page, "850000");
  await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
  await page.getByTestId("topic-mortgage").click();
  await fillFieldById(page, "mortgagePayout", "420000");
  await page.getByTestId("topic-selling-costs").click();
  await fillFieldById(page, "legalNotary", "1500");
  await fillFieldById(page, "mortgageDischarge", "300");
  await fillFieldById(page, "prepaymentPenalty", "1000");
  await fillFieldById(page, "propertyTaxAdjustment", "-400");
  await page.getByTestId("topic-planning").click();
  const planningToggle = page.getByTestId("planning-toggle");
  if ((await planningToggle.getAttribute("aria-expanded")) !== "true") {
    await planningToggle.click();
  }
  await fillFieldById(page, "staging", "5000");
  await expandStickySummary(page);
  await expect(page.getByTestId("result-amount")).toHaveText("$399,763");
}

test.describe("Estimate summary export", () => {
  test("export actions stay disabled without a valid result", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expandStickySummary(page);

    await expect(page.getByTestId("estimate-summary-open")).toBeDisabled();

    await fillSellingPrice(page, "0");
    await expect(page.getByTestId("estimate-summary-open")).toBeDisabled();
    await expect(page.getByTestId("view-calculation")).toBeDisabled();
  });

  test("artifact renders the current result without a second calculation path", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await fillReferenceScenario(page);
    await openEstimateSummary(page);

    await expect(page.getByTestId("estimate-narration")).toContainText(
      "the estimated net proceeds are $399,763",
    );
    await expect(page.getByTestId("estimate-narration")).toContainText(
      "After optional planning costs of $5,000, the estimate is $394,763",
    );
    await expect(page.getByTestId("estimate-narration")).not.toContainText(TIER1);
    await expect(page.getByTestId("estimate-narration")).not.toContainText(
      TAX_NOTE,
    );
    await expect(page.getByTestId("estimate-net-whole")).toHaveText("$399,763");
    await expect(page.getByTestId("estimate-net-exact")).toHaveText(
      "$399,762.50 exact",
    );
    await expect(page.getByTestId("estimate-after-planning")).toContainText(
      "$394,763",
    );
    await expect(page.getByTestId("estimate-rule-version")).toHaveText(
      "Rule version sell-bc-2026-08-09-v1",
    );
    await expect(page.getByTestId("estimate-jurisdiction")).toHaveText(
      "Jurisdiction CA-BC",
    );
    await expect(page.getByTestId("estimate-generated-at")).toContainText(
      "Generated",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Selling price",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "$850,000",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Mortgage payout",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Commission mode, rate and GST",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Legal/notary, incl. GST",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Mortgage discharge fee",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Prepayment penalty",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Property-tax adjustment",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Other closing adjustments",
    );
    await expect(page.getByTestId("estimate-assumptions")).toContainText(
      "Optional planning costs",
    );
    await expect(page.getByTestId("estimate-tier2")).toContainText(REFERRAL);
    await expect(page.getByTestId("estimate-tier2")).toContainText(TIER1);
    await expect(page.getByTestId("estimate-tier2")).toContainText(TAX_NOTE);
    await expect(page.getByTestId("estimate-tier2")).toContainText(
      "lawyer or notary",
    );
    const artifactText = await page.getByTestId("estimate-artifact").innerText();
    expectOnceEach(artifactText);
    const emailText = await page.getByTestId("estimate-email-content").inputValue();
    expectDisclaimerPairOnceAtEnd(emailText);
    await expect(page.locator(".estimate-email-prompt")).toHaveText(
      "Paste the copied text into a new email in your own mail client.",
    );
    await expect(page.locator(".estimate-email-prompt")).not.toContainText(
      "client email",
    );
    await expect(page.getByRole("heading", { name: "View calculation" })).toHaveCount(
      0,
    );
    await expect(page.getByTestId("estimate-email-content")).toBeVisible();
    await expect(
      page.getByRole("textbox", { name: "Email content" }),
    ).toBeVisible();
  });

  test("print preview hides chrome and interactive controls", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await fillSellingPrice(page, "850000");
    await openEstimateSummary(page);

    let printCalled = false;
    await page.exposeFunction("reportPrint", () => {
      printCalled = true;
    });
    await page.evaluate(() => {
      window.print = () => {
        (window as unknown as { reportPrint: () => void }).reportPrint();
      };
    });
    await page.getByTestId("estimate-print").click();
    expect(printCalled).toBe(true);

    await page.emulateMedia({ media: "print" });

    const chrome = [
      page.getByTestId("estimate-back"),
      page.getByTestId("estimate-print"),
      page.getByTestId("estimate-copy"),
      page.getByTestId("estimate-mailto"),
      page.getByTestId("estimate-prepared-by"),
      page.getByTestId("estimate-prepared-by-clear"),
      page.getByTestId("estimate-email-content"),
    ];
    for (const control of chrome) {
      await expect(control).toBeHidden();
    }

    const printVisibility = await page.evaluate(() => {
      const hiddenInPrint = (testId: string) => {
        const element = document.querySelector(
          `[data-testid="${testId}"]`,
        ) as HTMLElement | null;
        if (!element) {
          return { missing: true, display: "", clientRects: 0 };
        }
        return {
          missing: false,
          display: getComputedStyle(element).display,
          clientRects: element.getClientRects().length,
        };
      };
      const artifact = document.querySelector(
        '[data-testid="estimate-artifact"]',
      ) as HTMLElement;
      return {
        back: hiddenInPrint("estimate-back"),
        print: hiddenInPrint("estimate-print"),
        copy: hiddenInPrint("estimate-copy"),
        mailto: hiddenInPrint("estimate-mailto"),
        preparedBy: hiddenInPrint("estimate-prepared-by"),
        email: hiddenInPrint("estimate-email-content"),
        artifactDisplay: getComputedStyle(artifact).display,
        artifactWidth: artifact.getBoundingClientRect().width,
        noPrintDisplays: Array.from(
          document.querySelectorAll(".no-print"),
        ).map((node) => getComputedStyle(node).display),
      };
    });
    expect(printVisibility.noPrintDisplays.length).toBeGreaterThan(0);
    expect(
      printVisibility.noPrintDisplays.every((display) => display === "none"),
    ).toBe(true);
    expect(printVisibility.back.clientRects).toBe(0);
    expect(printVisibility.print.clientRects).toBe(0);
    expect(printVisibility.copy.clientRects).toBe(0);
    expect(printVisibility.mailto.clientRects).toBe(0);
    expect(printVisibility.preparedBy.clientRects).toBe(0);
    expect(printVisibility.email.clientRects).toBe(0);
    expect(printVisibility.artifactDisplay).not.toBe("none");
    expect(printVisibility.artifactWidth).toBeGreaterThan(0);

    await expect(page.getByTestId("estimate-artifact")).toBeVisible();
    await expect(page.getByTestId("estimate-narration")).toBeVisible();
    await expect(page.getByTestId("topic-rail")).toBeHidden();
    const printedArtifact = await page.getByTestId("estimate-artifact").innerText();
    expectOnceEach(printedArtifact);
    await expect(page.getByTestId("estimate-narration")).not.toContainText(TIER1);

    await page.screenshot({
      path: "test-results/estimate-summary-print-preview-1280.png",
      fullPage: true,
    });
    await page.pdf({
      path: "test-results/estimate-summary-print.pdf",
      printBackground: true,
    });
  });

  test("clipboard copies editable email content and mailto has no recipient", async ({
    page,
    context,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto("/");
    await fillSellingPrice(page, "850000");
    await openEstimateSummary(page);

    await page.evaluate(() => {
      const box = window as unknown as { __copiedText?: string };
      box.__copiedText = "";
      const clipboard = navigator.clipboard;
      clipboard.writeText = async (text: string) => {
        box.__copiedText = text;
      };
    });

    const editor = page.getByTestId("estimate-email-content");
    await editor.focus();
    await editor.fill("Edited email body for the client.");
    await page.getByTestId("estimate-copy").click();

    await expect(page.getByTestId("estimate-copy-status")).toHaveText(
      "Copied. Paste this into a new email in your own mail client.",
    );
    const copied = await page.evaluate(
      () => (window as unknown as { __copiedText?: string }).__copiedText,
    );
    expect(copied).toBe("Edited email body for the client.");

    const mailto = page.getByTestId("estimate-mailto");
    await expect(mailto).toHaveAttribute("href", /^mailto:\?/);
    const href = await mailto.getAttribute("href");
    expect(href).not.toMatch(/mailto:[^?]+@/);
    expect(href).toContain("subject=");
    expect(href).toContain("body=");
    const decodedMailto = decodeURIComponent(href ?? "");
    expect(decodedMailto).toContain("Estimated net proceeds:");
    const mailtoBody = decodedMailto.split("body=")[1] ?? "";
    expectDisclaimerPairOnceAtEnd(mailtoBody);
    await expect(page.locator('input[type="email"]')).toHaveCount(0);
  });

  test("Prepared by persists on the device and can be cleared", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.evaluate(() => localStorage.clear());
    await fillSellingPrice(page, "850000");
    await openEstimateSummary(page);

    const field = page.getByTestId("estimate-prepared-by");
    await expect(field).toHaveValue("");
    await field.fill("Jordan Lee, Example Realty");
    await expect(page.getByTestId("estimate-prepared-by-line")).toHaveText(
      "Prepared by: Jordan Lee, Example Realty",
    );

    const stored = await page.evaluate(
      () => localStorage.getItem("agentcal.preparedBy"),
    );
    expect(stored).toBe("Jordan Lee, Example Realty");

    await page.reload();
    await fillSellingPrice(page, "850000");
    await openEstimateSummary(page);
    await expect(page.getByTestId("estimate-prepared-by")).toHaveValue(
      "Jordan Lee, Example Realty",
    );

    await page.getByTestId("estimate-prepared-by-clear").click();
    await expect(page.getByTestId("estimate-prepared-by")).toHaveValue("");
    await expect(page.getByTestId("estimate-prepared-by-line")).toHaveText(
      "Prepared by:",
    );
    const cleared = await page.evaluate(
      () => localStorage.getItem("agentcal.preparedBy"),
    );
    expect(cleared).toBeNull();
  });

  test("going back and changing inputs regenerates the artifact from the current result", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await fillSellingPrice(page, "850000");
    await openEstimateSummary(page);
    await expect(page.getByTestId("estimate-net-whole")).toHaveText("$822,963");

    await page.getByTestId("estimate-back").click();
    await expect(page.getByTestId("estimate-summary")).toHaveCount(0);
    await fillSellingPrice(page, "900000");
    await openEstimateSummary(page);
    await expect(page.getByTestId("estimate-net-whole")).not.toHaveText(
      "$822,963",
    );
    await expect(page.getByTestId("estimate-narration")).toContainText(
      "selling price of $900,000",
    );
  });

  test("new interactive controls are keyboard reachable with accessible names", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await fillSellingPrice(page, "850000");
    await page.getByTestId("estimate-summary-open").focus();
    await expect(page.getByTestId("estimate-summary-open")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.getByTestId("estimate-summary")).toBeVisible();

    await page.getByRole("button", { name: "Print / Save as PDF" }).focus();
    await expect(page.getByTestId("estimate-print")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("estimate-copy")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByTestId("estimate-mailto")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("textbox", { name: "Email content" })).toBeFocused();

    const sizes = await page.evaluate(() => {
      const ids = [
        "estimate-print",
        "estimate-copy",
        "estimate-mailto",
        "estimate-prepared-by",
        "estimate-prepared-by-clear",
      ];
      return ids.map((id) => {
        const rect = (
          document.querySelector(`[data-testid="${id}"]`) as HTMLElement
        ).getBoundingClientRect();
        return { id, height: rect.height, width: rect.width };
      });
    });
    for (const size of sizes) {
      expect(size.height).toBeGreaterThanOrEqual(44);
      expect(size.width).toBeGreaterThanOrEqual(44);
    }
  });

  for (const width of WIDTHS) {
    test(`artifact view has no horizontal scroll at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await fillSellingPrice(page, "850000");
      await openEstimateSummary(page);

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        return {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
        };
      });
      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
      await expect(page.getByTestId("estimate-artifact")).toBeVisible();
    });
  }
});
