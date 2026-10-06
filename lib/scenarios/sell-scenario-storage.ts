import {
  CURRENCY_FIELD_NAMES,
  SELL_SCENARIO_LOCALE,
  SELL_SCENARIO_SCHEMA_VERSION,
  type SellScenario,
} from "./sell-scenario.ts";
import { FEATURE_01_JURISDICTION } from "../engine/sell.ts";

export const SELL_SCENARIO_STORAGE_KEY = "agentcal.sell-scenarios.v1";

/** Minimal Storage surface so the adapter is testable and replaceable. */
export type KeyValueStorage = Pick<Storage, "getItem" | "setItem">;

export type LoadStatus = "empty" | "ok" | "corrupt" | "unavailable";

export type LoadResult = {
  scenarios: SellScenario[];
  status: LoadStatus;
  /** Records that failed validation; preserved verbatim on the next write. */
  retained: unknown[];
};

export type SaveResult = { ok: true } | { ok: false; reason: string };

/** Replaceable persistence contract; v1 is browser-local only. */
export interface SellScenarioRepository {
  load(): LoadResult;
  save(scenario: SellScenario): SaveResult;
}

type Envelope = { version: 1; scenarios: unknown[] };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSafeInt(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value);
}

function isIsoDate(value: unknown): value is string {
  return typeof value === "string" && !Number.isNaN(Date.parse(value));
}

const RESULT_INT_FIELDS = [
  "commissionBeforeGstCents",
  "gstOnCommissionCents",
  "fixedClosingCostsCents",
  "propertyTaxAdjustmentCents",
  "otherClosingAdjustmentsCents",
  "displayedSellingCostDeductionCents",
  "estimatedNetProceedsCents",
  "optionalPlanningTotalCents",
  "estimatedAfterPlanningCents",
] as const;

const RESULT_INPUT_INT_FIELDS = [
  "sellingPriceCents",
  "mortgagePayoutCents",
  "manualCommissionCents",
  "legalNotaryIncludingGstCents",
  "mortgageDischargeFeeCents",
  "mortgagePrepaymentPenaltyCents",
  "propertyTaxAdjustmentCents",
  "otherClosingAdjustmentsCents",
] as const;

function isResultSnapshot(value: unknown): boolean {
  if (!isRecord(value)) return false;
  if (typeof value.ruleVersion !== "string") return false;
  if (value.jurisdiction !== FEATURE_01_JURISDICTION) return false;
  if (value.commissionMode !== "bc-preset" && value.commissionMode !== "manual") {
    return false;
  }
  if (!RESULT_INT_FIELDS.every((field) => isSafeInt(value[field]))) return false;
  const inputs = value.inputs;
  if (!isRecord(inputs)) return false;
  if (!RESULT_INPUT_INT_FIELDS.every((field) => isSafeInt(inputs[field]))) {
    return false;
  }
  return isRecord(inputs.optionalPlanningCosts);
}

export function parseSellScenario(value: unknown): SellScenario | null {
  if (!isRecord(value)) return null;
  if (value.schemaVersion !== SELL_SCENARIO_SCHEMA_VERSION) return null;
  if (value.type !== "SELL") return null;
  if (typeof value.id !== "string" || value.id === "") return null;
  if (typeof value.name !== "string") return null;
  if (value.jurisdiction !== FEATURE_01_JURISDICTION) return null;
  if (value.locale !== SELL_SCENARIO_LOCALE) return null;
  if (typeof value.ruleVersion !== "string" || value.ruleVersion === "") return null;
  if (value.commissionMode !== "bc-preset" && value.commissionMode !== "manual") {
    return null;
  }
  if (!isRecord(value.formValues)) return null;
  const formValues = value.formValues;
  if (!CURRENCY_FIELD_NAMES.every((name) => typeof formValues[name] === "string")) {
    return null;
  }
  if (!isRecord(value.review)) return null;
  const review = value.review;
  if (
    typeof review.mortgage !== "boolean" ||
    typeof review.sellingCosts !== "boolean" ||
    typeof review.planningCosts !== "boolean"
  ) {
    return null;
  }
  if (value.savedResult !== null && !isResultSnapshot(value.savedResult)) return null;
  if (!isIsoDate(value.createdAt) || !isIsoDate(value.updatedAt)) return null;
  if (value.savedAt !== null && !isIsoDate(value.savedAt)) return null;

  return value as unknown as SellScenario;
}

export function sortScenarios(scenarios: SellScenario[]): SellScenario[] {
  return [...scenarios].sort((a, b) => {
    const delta = Date.parse(b.updatedAt) - Date.parse(a.updatedAt);
    return delta !== 0 ? delta : a.id.localeCompare(b.id);
  });
}

export function serializeScenarios(
  scenarios: SellScenario[],
  retained: unknown[] = [],
): string {
  const envelope: Envelope = {
    version: 1,
    scenarios: [...sortScenarios(scenarios), ...retained],
  };
  return JSON.stringify(envelope);
}

export function parseStoredScenarios(raw: string | null): LoadResult {
  if (raw === null) {
    return { scenarios: [], status: "empty", retained: [] };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { scenarios: [], status: "corrupt", retained: [] };
  }
  if (!isRecord(parsed) || parsed.version !== 1 || !Array.isArray(parsed.scenarios)) {
    return { scenarios: [], status: "corrupt", retained: [] };
  }
  const scenarios: SellScenario[] = [];
  const retained: unknown[] = [];
  const seen = new Set<string>();
  for (const record of parsed.scenarios) {
    const scenario = parseSellScenario(record);
    if (scenario && !seen.has(scenario.id)) {
      seen.add(scenario.id);
      scenarios.push(scenario);
    } else {
      retained.push(record);
    }
  }
  return { scenarios: sortScenarios(scenarios), status: "ok", retained };
}

export function createLocalSellScenarioRepository(
  getStorage: () => KeyValueStorage | null,
  now: () => number = Date.now,
): SellScenarioRepository {
  function readRaw(
    storage: KeyValueStorage,
  ): { raw: string | null } | { error: true } {
    try {
      return { raw: storage.getItem(SELL_SCENARIO_STORAGE_KEY) };
    } catch {
      return { error: true };
    }
  }

  return {
    load() {
      let storage: KeyValueStorage | null = null;
      try {
        storage = getStorage();
      } catch {
        storage = null;
      }
      if (!storage) {
        return { scenarios: [], status: "unavailable", retained: [] };
      }
      const read = readRaw(storage);
      if ("error" in read) {
        return { scenarios: [], status: "unavailable", retained: [] };
      }
      return parseStoredScenarios(read.raw);
    },

    save(scenario) {
      let storage: KeyValueStorage | null = null;
      try {
        storage = getStorage();
      } catch {
        storage = null;
      }
      if (!storage) {
        return { ok: false, reason: "Browser storage is unavailable." };
      }
      const read = readRaw(storage);
      if ("error" in read) {
        return { ok: false, reason: "Browser storage could not be read." };
      }
      const current = parseStoredScenarios(read.raw);
      try {
        if (current.status === "corrupt" && read.raw !== null) {
          // Never silently erase unreadable data: keep a copy first.
          storage.setItem(`${SELL_SCENARIO_STORAGE_KEY}.corrupt-${now()}`, read.raw);
        }
        const others = current.scenarios.filter((item) => item.id !== scenario.id);
        storage.setItem(
          SELL_SCENARIO_STORAGE_KEY,
          serializeScenarios([...others, scenario], current.retained),
        );
        return { ok: true };
      } catch {
        return { ok: false, reason: "Browser storage is full or blocked." };
      }
    },
  };
}

export function createBrowserSellScenarioRepository(): SellScenarioRepository {
  return createLocalSellScenarioRepository(() =>
    typeof window === "undefined" ? null : window.localStorage,
  );
}
