import { expect, type Page, test } from "@playwright/test";

const WIDTHS = [320, 390, 768, 834, 1280, 1366] as const;

async function visibleResult(page: Page) {
  return page.getByTestId("result-amount");
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
    await expect(page.getByTestId("sticky-summary-toggle")).toHaveCount(0);
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

test.describe("Seller Net Proceeds consultation", () => {
  test("empty scenario opens on Price with View calculation disabled", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByRole("heading", { name: "Seller Net Proceeds" })).toBeVisible();
    await expect(page.getByTestId("tier1-disclaimer")).toBeVisible();
    await expect(page.getByTestId("topic-price")).toHaveAttribute(
      "aria-current",
      "true",
    );
    await expect(page.getByTestId("topic-price")).toContainText("Enter selling price");
    await expect(page.getByTestId("topic-planning")).toContainText("$0");
    await expect(await visibleResult(page)).toHaveText("Enter selling price");
    await expect(page.getByTestId("view-calculation")).toBeDisabled();
  });

  test("valid price recalculates immediately and enables the breakdown", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await fillSellingPrice(page, "850000");

    await expect(page.getByTestId("topic-price")).toContainText("$850,000");
    await expect(await visibleResult(page)).toHaveText("$822,963");
    await expect(page.getByTestId("view-calculation")).toBeEnabled();
  });

  test("editable currency rows format at rest and edit inline by keyboard", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/");

    await expect(page.getByLabel("Expected selling price")).toHaveValue("");
    await expect(page.getByLabel("Expected selling price")).toHaveAttribute(
      "placeholder",
      "Enter amount",
    );

    await page.getByTestId("topic-mortgage").click();
    const mortgagePayout = page.getByLabel("Mortgage payout");
    await expect(mortgagePayout).toHaveValue("$0");
    await mortgagePayout.focus();
    await expect(mortgagePayout).toHaveValue("0");
    await expect(mortgagePayout).toHaveCSS("outline-width", "2px");

    await page.getByTestId("topic-selling-costs").click();
    const sellingCostLabels = [
      "Legal/notary, incl. GST",
      "Mortgage discharge fee",
      "Prepayment penalty",
      "Property-tax adjustment",
      "Other closing adjustments",
    ];
    for (const label of sellingCostLabels) {
      await expect(page.getByLabel(label)).toHaveValue("$0");
    }

    await page.getByLabel("Manual amount").check();
    await expect(page.getByLabel("Manual commission amount")).toHaveValue("$0");

    const legalNotary = page.getByLabel("Legal/notary, incl. GST");
    await legalNotary.focus();
    await legalNotary.fill("1500");
    await page.keyboard.press("Tab");
    await expect(legalNotary).toHaveValue("$1,500");
    await expect(page.getByLabel("Mortgage discharge fee")).toBeFocused();
    await expect(page.getByLabel("Mortgage discharge fee")).toHaveValue("0");

    await page.getByTestId("topic-planning").click();
    await page.getByTestId("planning-toggle").click();
    const planningLabels = [
      "Staging/preparation",
      "Repairs/renovations",
      "Inspection/appraisal",
      "Cleaning",
      "Moving/storage",
      "Overlap or temporary-housing costs",
      "Other planning costs",
    ];
    for (const label of planningLabels) {
      await expect(page.getByLabel(label)).toHaveValue("$0");
    }
  });

  test("result amount slot stays stable while empty copy is de-emphasized", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);
    await expect(page.getByTestId("sticky-summary-toggle")).toHaveCount(0);

    const resultContext = page.getByTestId("result-context");
    const amountSlot = resultContext.locator(".result-amount-slot");
    const resultCard = resultContext.locator(".result-card");
    const result = await visibleResult(page);
    const emptySlotHeight = await amountSlot.evaluate(
      (element) => element.getBoundingClientRect().height,
    );
    const emptyCardHeight = await resultCard.evaluate(
      (element) => element.getBoundingClientRect().height,
    );

    await expect(result).toHaveText("Enter selling price");
    await expect(result).toHaveCSS("color", "rgb(102, 112, 110)");
    await expect(result).toHaveCSS("font-size", "22px");
    await expect(result).toHaveCSS("font-weight", "400");
    expect(emptySlotHeight).toBe(60);

    await fillSellingPrice(page, "850000");
    await expect(result).toHaveText("$822,963");
    await expect(result).toHaveCSS("color", "rgb(18, 63, 70)");
    await expect(result).toHaveCSS("font-size", "36px");
    await expect(result).toHaveCSS("font-weight", "700");
    expect(
      await amountSlot.evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(emptySlotHeight);
    expect(
      await resultCard.evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(emptyCardHeight);

    await fillSellingPrice(page, "");
    await expect(result).toHaveText("Enter selling price");
    expect(
      await amountSlot.evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(emptySlotHeight);
    expect(
      await resultCard.evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(emptyCardHeight);

    await fillSellingPrice(page, "0");
    await expect(result).toHaveText("—");
    await expect(result).toHaveCSS("font-size", "36px");
    await expect(result).toHaveCSS("font-weight", "700");
    expect(
      await amountSlot.evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(emptySlotHeight);

    await fillSellingPrice(page, "100000");
    await page.getByTestId("topic-mortgage").click();
    await page.locator("#mortgagePayout").fill("120000");
    await page.locator("#mortgagePayout").blur();
    await expect(result).toHaveText("-$27,350");
    await expect(result).toHaveCSS("color", "rgb(184, 74, 74)");
    await expect(result).toHaveCSS("font-size", "36px");
    await expect(result).toHaveCSS("font-weight", "700");
    expect(
      await amountSlot.evaluate((element) => element.getBoundingClientRect().height),
    ).toBe(emptySlotHeight);
  });

  test("Help keeps the tax note without duplicating the top disclaimer", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    const disclaimer =
      "Estimate only — not a quote, approval, or professional advice.";
    const topDisclaimer = page.getByTestId("tier1-disclaimer");

    await page.getByRole("button", { name: "Help" }).click();
    const helpPanel = page.locator("#help-panel");

    await expect(helpPanel).toContainText(
      "Capital gains tax and BC home flipping tax are not calculated.",
    );
    await expect(helpPanel.getByText(disclaimer, { exact: true })).toHaveCount(0);
    await expect(topDisclaimer).toHaveText(disclaimer);
    await expect(page.getByTestId("notice-group")).toBeVisible();
    await expect(page.getByTestId("notice-group").locator("#help-panel")).toHaveCount(1);
    await expect(page.getByTestId("notice-group").getByTestId("tier1-disclaimer")).toHaveCount(1);

    const groupedStyles = await page.evaluate(() => {
      const group = document.querySelector('[data-testid="notice-group"]') as HTMLElement;
      const help = document.querySelector("#help-panel") as HTMLElement;
      const disclaimerNode = document.querySelector(
        '[data-testid="tier1-disclaimer"]',
      ) as HTMLElement;
      return {
        groupBorder: getComputedStyle(group).borderTopWidth,
        groupBackground: getComputedStyle(group).backgroundColor,
        helpBorder: getComputedStyle(help).borderTopWidth,
        helpBackground: getComputedStyle(help).backgroundColor,
        disclaimerMargin: getComputedStyle(disclaimerNode).marginBottom,
      };
    });
    expect(groupedStyles.groupBorder).not.toBe("0px");
    expect(groupedStyles.groupBackground).not.toBe("rgba(0, 0, 0, 0)");
    expect(groupedStyles.helpBorder).toBe("0px");
    expect(groupedStyles.disclaimerMargin).toBe("0px");

    await expect(page.getByTestId("result-disclaimer")).toHaveText(disclaimer);
    await expect(page.getByTestId("result-disclaimer")).toHaveCount(1);
    await expect(page.getByText(disclaimer, { exact: true })).toHaveCount(2);

    await page.getByRole("button", { name: "Help" }).click();
    await expect(page.getByTestId("notice-group")).toHaveCount(0);
    await expect(page.locator("#help-panel")).toHaveCount(0);
    await expect(topDisclaimer).toBeVisible();
    const closedDisclaimer = await topDisclaimer.evaluate((element) => {
      const style = getComputedStyle(element);
      return {
        background: style.backgroundColor,
        border: style.borderTopWidth,
        marginBottom: style.marginBottom,
      };
    });
    expect(closedDisclaimer.background === "rgba(0, 0, 0, 0)" || closedDisclaimer.border === "0px").toBe(true);
    expect(Number.parseFloat(closedDisclaimer.marginBottom)).toBeGreaterThan(0);
  });

  test("canonical empty result at 1366 uses de-emphasized instruction styles", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1366, height: 768 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const result = page.getByTestId("result-amount");
    await expect(page.getByTestId("sticky-summary-toggle")).toHaveCount(0);
    await expect(result).toHaveCount(1);
    await expect(page.getByTestId("view-calculation")).toHaveCount(1);
    await expect(page.locator(".result-card")).toHaveCount(1);
    await expect(result).toHaveText("Enter selling price");
    await expect(result).toHaveClass(/result-empty/);
    await expect(result).toHaveCSS("color", "rgb(102, 112, 110)");
    await expect(result).toHaveCSS("font-size", "22px");
    await expect(result).toHaveCSS("font-weight", "400");
    await expect(result).toHaveCSS("line-height", "40px");

    const inspection = await result.evaluate((element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return {
        tag: element.tagName,
        className: element.className,
        text: element.textContent,
        fontSize: style.fontSize,
        fontWeight: style.fontWeight,
        color: style.color,
        lineHeight: style.lineHeight,
        display: style.display,
        visibility: style.visibility,
        ariaHidden: element.getAttribute("aria-hidden"),
        width: rect.width,
        height: rect.height,
        top: rect.top,
        left: rect.left,
      };
    });
    expect(inspection.ariaHidden).toBeNull();
    expect(inspection.width).toBeGreaterThan(0);
    expect(inspection.height).toBeGreaterThan(0);
    console.log("1366 empty-result computed styles", inspection);

    const copies = await page.evaluate(() => {
      const matches = Array.from(document.querySelectorAll("body *")).filter(
        (node) => node.childElementCount === 0 && node.textContent === "Enter selling price",
      );
      return matches.map((node) => {
        const style = getComputedStyle(node);
        const rect = node.getBoundingClientRect();
        return {
          testId: node.getAttribute("data-testid"),
          className: (node as HTMLElement).className,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          color: style.color,
          visible: rect.width > 0 && rect.height > 0,
        };
      });
    });
    const visibleCopies = copies.filter((copy) => copy.visible);
    expect(visibleCopies.some((copy) => copy.testId === "result-amount")).toBe(
      true,
    );
    console.log("1366 Enter selling price copies", copies);
    await expect(page.getByTestId("tier1-disclaimer")).toHaveCount(1);
    await expect(page.getByTestId("result-disclaimer")).toHaveCount(1);
    await expect(
      page.getByText(
        "Estimate only — not a quote, approval, or professional advice.",
        { exact: true },
      ),
    ).toHaveCount(2);

    await page.screenshot({
      path: "test-results/empty-result-1366x768.png",
      fullPage: true,
    });
  });

  test("topics are directly reachable and Planning starts collapsed", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await page.getByTestId("topic-mortgage").click();
    await expect(page.getByLabel("Mortgage payout")).toBeVisible();

    await page.getByTestId("topic-selling-costs").click();
    await expect(
      page.getByRole("group", { name: "Total brokerage commission" }),
    ).toBeVisible();

    await page.getByTestId("topic-planning").click();
    const toggle = page.getByTestId("planning-toggle");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("#planning-optional-costs")).toBeHidden();

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByLabel("Staging/preparation")).toBeVisible();
  });

  test("blocking sale-price error disables View calculation", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await fillSellingPrice(page, "0");

    await expect(page.locator("#sellingPrice-error")).toHaveText(
      "Enter an amount greater than $0.",
    );
    await expect(await visibleResult(page)).toHaveText("—");
    await expect(page.getByTestId("view-calculation")).toBeDisabled();
  });

  test("mortgage warning still calculates a signed negative result", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await fillSellingPrice(page, "100000");
    await page.getByTestId("topic-mortgage").click();
    await page.locator("#mortgagePayout").fill("120000");
    await page.locator("#mortgagePayout").blur();

    await expect(page.getByTestId("mortgage-warning")).toHaveText(
      "Mortgage payout exceeds the expected selling price.",
    );
    await expandStickySummary(page);
    await expect(page.getByTestId("negative-note")).toBeVisible();
  });

  test("View calculation returns focus to the trigger", async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await page.goto("/");
    await fillSellingPrice(page, "850000");

    await expandStickySummary(page);
    const trigger = page.getByTestId("view-calculation");
    await trigger.click();
    await expect(page.getByRole("heading", { name: "View calculation" })).toBeVisible();
    await page.getByRole("button", { name: "Close" }).click();
    await expect(trigger).toBeFocused();
  });

  test("phone and tablet put editing first and use a sticky bottom summary", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page.evaluate(() => document.fonts.ready);

    const order = await page.evaluate(() => {
      const disclaimer = document.querySelector('[data-testid="tier1-disclaimer"]');
      const editing = document.querySelector(".editing-region");
      const result = document.querySelector('[data-testid="result-context"]');
      const sellingPrice = document.querySelector("#sellingPrice");
      const positions = [disclaimer, editing, result].map((node) =>
        node ? Array.from(document.querySelectorAll("body *")).indexOf(node) : -1,
      );
      return {
        disclaimerBeforeEditing: positions[0] < positions[1],
        editingBeforeResult: positions[1] < positions[2],
        sellingPriceTop: sellingPrice?.getBoundingClientRect().top ?? 0,
        resultTop: result?.getBoundingClientRect().top ?? 0,
        resultPosition: result ? getComputedStyle(result).position : "",
      };
    });
    expect(order.disclaimerBeforeEditing).toBe(true);
    expect(order.editingBeforeResult).toBe(true);
    expect(order.resultPosition).toBe("fixed");
    expect(order.sellingPriceTop).toBeLessThan(order.resultTop);

    const toggle = page.getByTestId("sticky-summary-toggle");
    await expect(toggle).toBeVisible();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(toggle).toContainText("Show details");
    await expect(page.getByTestId("result-amount")).toHaveText("Enter selling price");
    await expect(page.getByTestId("result-amount")).toHaveCSS("color", "rgb(102, 112, 110)");
    await expect(page.getByTestId("result-amount")).toHaveCSS("font-size", "16px");
    await expect(page.getByTestId("result-amount")).toHaveCSS("font-weight", "400");

    const collapsedHeight = await page.getByTestId("result-context").evaluate((element) =>
      element.getBoundingClientRect().height,
    );
    expect(collapsedHeight).toBeGreaterThanOrEqual(56);
    expect(collapsedHeight).toBeLessThanOrEqual(72);

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(toggle).toContainText("Hide details");
    await expect(page.getByTestId("view-calculation")).toBeVisible();
    await expect(page.getByTestId("result-disclaimer")).toBeVisible();

    await page.keyboard.press("Enter");
    await expect(toggle).toHaveAttribute("aria-expanded", "false");

    await fillSellingPrice(page, "850000");
    await expect(page.getByTestId("result-amount")).toHaveText("$822,963");
    await expect(page.getByTestId("result-amount")).toHaveCSS("font-size", "20px");
    await expect(page.getByTestId("result-amount")).toHaveCSS("font-weight", "700");

    await toggle.focus();
    await page.keyboard.press("Space");
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator(".result-context-line").first()).toBeVisible();
  });

  test("sticky summary hides while a text field is focused and does not cover input or errors", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 500 });
    await page.goto("/");

    const result = page.getByTestId("result-context");
    const sellingPrice = page.locator("#sellingPrice");
    await sellingPrice.focus();
    await expect(result).toHaveAttribute("data-input-focused", "true");

    const overlap = await page.evaluate(() => {
      const bar = document.querySelector('[data-testid="result-context"]') as HTMLElement;
      const input = document.querySelector("#sellingPrice") as HTMLElement;
      const barRect = bar.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const style = getComputedStyle(bar);
      return {
        visibility: style.visibility,
        barTop: barRect.top,
        viewportHeight: window.innerHeight,
        inputBottom: inputRect.bottom,
        overlap:
          barRect.top < inputRect.bottom &&
          barRect.bottom > inputRect.top &&
          barRect.left < inputRect.right &&
          barRect.right > inputRect.left,
      };
    });
    expect(overlap.visibility).toBe("hidden");
    expect(overlap.overlap).toBe(false);
    expect(overlap.barTop).toBeGreaterThanOrEqual(overlap.viewportHeight);

    await sellingPrice.fill("0");
    const error = page.locator("#sellingPrice-error");
    await expect(error).toBeVisible();
    const errorOverlap = await page.evaluate(() => {
      const bar = document.querySelector('[data-testid="result-context"]') as HTMLElement;
      const input = document.querySelector("#sellingPrice") as HTMLElement;
      const errorNode = document.querySelector("#sellingPrice-error") as HTMLElement;
      const barRect = bar.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      const errorRect = errorNode.getBoundingClientRect();
      return {
        overlapInput:
          barRect.top < inputRect.bottom &&
          barRect.bottom > inputRect.top &&
          barRect.left < inputRect.right &&
          barRect.right > inputRect.left,
        overlapError:
          barRect.top < errorRect.bottom &&
          barRect.bottom > errorRect.top &&
          barRect.left < errorRect.right &&
          barRect.right > errorRect.left,
      };
    });
    expect(errorOverlap.overlapInput).toBe(false);
    expect(errorOverlap.overlapError).toBe(false);

    await sellingPrice.blur();
    await expect(result).toHaveAttribute("data-input-focused", "false");
    await expect(result).toBeVisible();

    await page.getByTestId("topic-selling-costs").click();
    const lastField = page.getByLabel("Other closing adjustments");
    await lastField.scrollIntoViewIfNeeded();
    await lastField.focus();
    await expect(result).toHaveAttribute("data-input-focused", "true");
    const lastFieldOverlap = await page.evaluate(() => {
      const bar = document.querySelector('[data-testid="result-context"]') as HTMLElement;
      const input = document.querySelector("#otherClosingAdjustments") as HTMLElement;
      const barRect = bar.getBoundingClientRect();
      const inputRect = input.getBoundingClientRect();
      return {
        visibility: getComputedStyle(bar).visibility,
        overlap:
          barRect.top < inputRect.bottom &&
          barRect.bottom > inputRect.top &&
          barRect.left < inputRect.right &&
          barRect.right > inputRect.left,
      };
    });
    expect(lastFieldOverlap.visibility).toBe("hidden");
    expect(lastFieldOverlap.overlap).toBe(false);
  });

  test("View calculation button aligns with result-card content", async ({
    page,
  }) => {
    for (const width of [390, 834, 1366]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await fillSellingPrice(page, "850000");
      await expandStickySummary(page);

      const alignment = await page.evaluate(() => {
        const card = document.querySelector(".result-card") as HTMLElement;
        const line = card.querySelector(".result-context-line") as HTMLElement;
        const button = card.querySelector(
          '[data-testid="view-calculation"]',
        ) as HTMLElement;
        const caption = card.querySelector(
          '[data-testid="result-disclaimer"]',
        ) as HTMLElement;
        const cardBox = card.getBoundingClientRect();
        const lineBox = line.getBoundingClientRect();
        const buttonBox = button.getBoundingClientRect();
        const captionBox = caption.getBoundingClientRect();
        const styles = getComputedStyle(card);
        const padLeft = Number.parseFloat(styles.paddingLeft);
        const padRight = Number.parseFloat(styles.paddingRight);
        return {
          buttonLeft: buttonBox.left,
          buttonRight: buttonBox.right,
          lineLeft: lineBox.left,
          lineRight: lineBox.right,
          captionLeft: captionBox.left,
          captionRight: captionBox.right,
          contentLeft: cardBox.left + padLeft,
          contentRight: cardBox.right - padRight,
        };
      });

      expect(Math.abs(alignment.buttonLeft - alignment.lineLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(alignment.buttonRight - alignment.lineRight)).toBeLessThanOrEqual(1);
      expect(Math.abs(alignment.buttonLeft - alignment.captionLeft)).toBeLessThanOrEqual(1);
      expect(Math.abs(alignment.buttonRight - alignment.captionRight)).toBeLessThanOrEqual(1);
    }
  });

  for (const width of WIDTHS) {
    test(`no page-level horizontal scroll at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await fillSellingPrice(page, "850000");

      const overflow = await page.evaluate(() => {
        const root = document.documentElement;
        const shell = document.querySelector(".page-shell") as HTMLElement | null;
        const layout = document.querySelector(".consultation-layout") as HTMLElement | null;
        const workspace = document.querySelector(".topic-workspace") as HTMLElement | null;
        const statement = document.querySelector(
          ".living-statement",
        ) as HTMLElement | null;
        const statementCard = document.querySelector(
          ".living-statement .result-card",
        ) as HTMLElement | null;
        const assumptions = document.querySelector(
          ".assumption-list",
        ) as HTMLElement | null;
        return {
          clientWidth: root.clientWidth,
          scrollWidth: root.scrollWidth,
          resultAmountCount: document.querySelectorAll(
            '[data-testid="result-amount"]',
          ).length,
          viewCalculationCount: document.querySelectorAll(
            '[data-testid="view-calculation"]',
          ).length,
          resultCardCount: document.querySelectorAll(".result-card").length,
          layoutDisplay: layout ? getComputedStyle(layout).display : "",
          livingStatementDisplay: statement
            ? getComputedStyle(statement).display
            : "",
          livingStatementPosition: statement
            ? getComputedStyle(statement).position
            : "",
          assumptionDisplay: assumptions
            ? getComputedStyle(assumptions).display
            : "",
          pagePaddingLeft: shell ? getComputedStyle(shell).paddingLeft : "",
          layoutGap: layout
            ? getComputedStyle(layout).columnGap || getComputedStyle(layout).gap
            : "",
          topicPadding: workspace ? getComputedStyle(workspace).paddingTop : "",
          statementPadding: statementCard
            ? getComputedStyle(statementCard).paddingTop
            : "",
        };
      });

      expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth + 1);
      expect(overflow.resultAmountCount).toBe(1);
      expect(overflow.viewCalculationCount).toBe(1);
      expect(overflow.resultCardCount).toBe(1);
      expect(overflow.livingStatementDisplay).not.toBe("none");
      if (width >= 1280) {
        await expect(page.getByTestId("sticky-summary-toggle")).toHaveCount(0);
        expect(overflow.layoutDisplay).toBe("grid");
        expect(overflow.livingStatementPosition).toBe("sticky");
        expect(overflow.assumptionDisplay).not.toBe("none");
        expect(Number.parseFloat(overflow.pagePaddingLeft)).toBeGreaterThanOrEqual(40);
        expect(Number.parseFloat(overflow.layoutGap)).toBeGreaterThanOrEqual(32);
        expect(Number.parseFloat(overflow.topicPadding)).toBeGreaterThanOrEqual(28);
        expect(Number.parseFloat(overflow.statementPadding)).toBeGreaterThanOrEqual(30);
      } else {
        await expect(page.getByTestId("sticky-summary-toggle")).toBeVisible();
        expect(overflow.layoutDisplay).toBe("flex");
        expect(overflow.livingStatementPosition).toBe("fixed");
        expect(overflow.assumptionDisplay).toBe("none");
        if (width >= 834) {
          expect(Number.parseFloat(overflow.pagePaddingLeft)).toBeGreaterThanOrEqual(32);
          expect(Number.parseFloat(overflow.topicPadding)).toBeGreaterThanOrEqual(24);
        }
      }
    });
  }
});
