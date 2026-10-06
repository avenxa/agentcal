import assert from "node:assert/strict";
import test from "node:test";

import { SELL_RULE_VERSION } from "../engine/sell.ts";
import {
  createSellScenario,
  defaultScenarioName,
  deriveCalculation,
  deriveLifecycle,
  deriveReadiness,
  deriveStoredLifecycle,
  duplicateSellScenario,
  hasSameEditableState,
  resolveDisplayedResult,
  saveSellScenario,
  type SellScenario,
} from "./sell-scenario.ts";
import {
  createLocalSellScenarioRepository,
  parseSellScenario,
  parseStoredScenarios,
  SELL_SCENARIO_STORAGE_KEY,
  serializeScenarios,
  sortScenarios,
  type KeyValueStorage,
} from "./sell-scenario-storage.ts";

const NOW = new Date("2026-10-06T15:30:00");

function withPrice(price: string, id = "a") {
  const scenario = createSellScenario({ id, now: NOW });
  scenario.formValues = { ...scenario.formValues, sellingPrice: price };
  return scenario;
}

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  const storage: KeyValueStorage = {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => void data.set(key, value),
  };
  return { storage, data };
}

test("create: defaults, name, provenance and Draft state", () => {
  const scenario = createSellScenario({ id: "x", now: NOW });
  assert.equal(scenario.schemaVersion, 1);
  assert.equal(scenario.type, "SELL");
  assert.equal(scenario.jurisdiction, "CA-BC");
  assert.equal(scenario.locale, "en-CA");
  assert.equal(scenario.ruleVersion, SELL_RULE_VERSION);
  assert.equal(scenario.name, "Sell Scenario — 2026-10-06");
  assert.equal(defaultScenarioName(NOW), scenario.name);
  assert.equal(scenario.commissionMode, "bc-preset");
  assert.equal(scenario.savedResult, null);
  assert.equal(scenario.savedAt, null);
  assert.equal(scenario.formValues.sellingPrice, "");
  assert.equal(
    deriveLifecycle(scenario, null, deriveCalculation(scenario).result),
    "Draft",
  );
});

test("create without options generates unique ids", () => {
  assert.notEqual(createSellScenario().id, createSellScenario().id);
});

test("duplicate: new id/timestamps, copied inputs, unsaved, Copy of name", () => {
  const source = saveSellScenario(withPrice("850000"), deriveCalculation(withPrice("850000")), NOW);
  source.review.mortgage = true;
  const later = new Date("2026-10-07T09:00:00");
  const copy = duplicateSellScenario(source, { id: "copy", now: later });
  assert.equal(copy.id, "copy");
  assert.equal(copy.name, `Copy of ${source.name}`);
  assert.equal(copy.formValues.sellingPrice, "850000");
  assert.equal(copy.review.mortgage, true);
  assert.equal(copy.savedAt, null);
  assert.equal(copy.savedResult, null);
  assert.equal(copy.createdAt, later.toISOString());
  assert.notEqual(copy.formValues, source.formValues);
  copy.formValues.sellingPrice = "1";
  assert.equal(source.formValues.sellingPrice, "850000");
});

test("lifecycle: Draft / Calculated / Saved / Updated", () => {
  const draft = createSellScenario({ id: "l", now: NOW });
  assert.equal(deriveLifecycle(draft, null, null), "Draft");

  const working = withPrice("850000", "l");
  const calc = deriveCalculation(working);
  assert.ok(calc.result);
  assert.equal(deriveLifecycle(working, null, calc.result), "Calculated");

  const saved = saveSellScenario(working, calc, NOW);
  assert.equal(deriveLifecycle(working, saved, calc.result), "Saved");

  const edited = { ...working, formValues: { ...working.formValues, mortgagePayout: "100000" } };
  const editedCalc = deriveCalculation(edited);
  assert.equal(deriveLifecycle(edited, saved, editedCalc.result), "Updated");

  const invalid = { ...working, formValues: { ...working.formValues, sellingPrice: "abc" } };
  assert.equal(deriveLifecycle(invalid, saved, deriveCalculation(invalid).result), "Draft");

  const draftSaved = saveSellScenario(draft, deriveCalculation(draft), NOW);
  assert.equal(deriveStoredLifecycle(draftSaved), "Draft");
  assert.equal(deriveStoredLifecycle(saved), "Saved");
});

test("dirty derivation compares editable state only", () => {
  const a = withPrice("850000");
  const b = withPrice("850000");
  b.updatedAt = "2030-01-01T00:00:00.000Z";
  assert.ok(hasSameEditableState(a, b));
  b.name = "Other";
  assert.ok(!hasSameEditableState(a, b));
  const c = withPrice("850000");
  c.review.planningCosts = true;
  assert.ok(!hasSameEditableState(a, c));
  const d = withPrice("850000");
  d.commissionMode = "manual";
  assert.ok(!hasSameEditableState(a, d));
});

test("save: snapshot, trimmed/blank name fallback, rule version", () => {
  const working = withPrice("850000");
  const calc = deriveCalculation(working);
  const saved = saveSellScenario({ ...working, name: "  " }, calc, NOW);
  assert.equal(saved.name, defaultScenarioName(NOW));
  assert.equal(saved.savedAt, NOW.toISOString());
  assert.equal(saved.savedResult?.estimatedNetProceedsCents, calc.result?.estimatedNetProceedsCents);
  assert.equal(saved.ruleVersion, SELL_RULE_VERSION);

  const draft = saveSellScenario(createSellScenario({ id: "d", now: NOW }), deriveCalculation(createSellScenario({ id: "d", now: NOW })), NOW);
  assert.equal(draft.savedResult, null);
  assert.ok(draft.savedAt);
});

test("saved result snapshot is preserved while clean and recalculated after edit", () => {
  const working = withPrice("850000");
  const calc = deriveCalculation(working);
  const saved = saveSellScenario(working, calc, NOW);
  // Simulate a snapshot produced under an older rule version.
  const historical = {
    ...saved,
    savedResult: { ...saved.savedResult!, ruleVersion: "sell-bc-historical", estimatedNetProceedsCents: 1 },
  } as unknown as SellScenario;
  const clean = resolveDisplayedResult(working, historical, calc);
  assert.equal(clean?.ruleVersion, "sell-bc-historical");
  assert.equal(clean?.estimatedNetProceedsCents, 1);

  const edited = { ...working, formValues: { ...working.formValues, mortgagePayout: "1000" } };
  const recalculated = resolveDisplayedResult(edited, historical, deriveCalculation(edited));
  assert.equal(recalculated?.ruleVersion, SELL_RULE_VERSION);
  assert.notEqual(recalculated?.estimatedNetProceedsCents, 1);
});

test("same inputs give the accepted deterministic Feature 01 result", () => {
  const calc = deriveCalculation(withPrice("850000"));
  // $850,000 → $822,963 whole-dollar summary (accepted Feature 01 behaviour).
  assert.equal(Math.round((calc.result?.estimatedNetProceedsCents ?? 0) / 100), 822_963);
});

test("readiness: five deterministic groups, never blocks result", () => {
  const empty = createSellScenario({ id: "r", now: NOW });
  const emptyCalc = deriveCalculation(empty);
  let readiness = deriveReadiness(empty, emptyCalc);
  assert.equal(readiness.total, 5);
  assert.equal(readiness.groups.length, 5);
  // Only the accepted BC preset commission counts for a blank new Scenario.
  assert.equal(readiness.confirmedCount, 1);
  assert.equal(readiness.nextGroup?.id, "price");

  const priced = withPrice("850000", "r");
  readiness = deriveReadiness(priced, deriveCalculation(priced));
  assert.equal(readiness.confirmedCount, 2);
  assert.equal(readiness.nextGroup?.id, "mortgage");
  assert.ok(deriveCalculation(priced).result, "result exists with 2 of 5");

  const full = withPrice("850000", "r");
  full.review = { mortgage: true, sellingCosts: true, planningCosts: true };
  readiness = deriveReadiness(full, deriveCalculation(full));
  assert.equal(readiness.confirmedCount, 5);
  assert.equal(readiness.nextGroup, null);
});

test("readiness: $0 mortgage is valid; errors unconfirm groups", () => {
  const scenario = withPrice("850000");
  scenario.review.mortgage = true;
  assert.ok(deriveReadiness(scenario, deriveCalculation(scenario)).groups[1].confirmed);

  scenario.formValues = { ...scenario.formValues, mortgagePayout: "abc", staging: "-5" };
  scenario.review = { mortgage: true, sellingCosts: true, planningCosts: true };
  const readiness = deriveReadiness(scenario, deriveCalculation(scenario));
  const byId = Object.fromEntries(readiness.groups.map((g) => [g.id, g.confirmed]));
  assert.equal(byId.mortgage, false);
  assert.equal(byId["planning-costs"], false);
  assert.equal(byId["selling-costs"], true);

  scenario.commissionMode = "manual";
  scenario.formValues = { ...scenario.formValues, manualCommission: "-1" };
  assert.equal(
    deriveReadiness(scenario, deriveCalculation(scenario)).groups[2].confirmed,
    false,
  );
});

test("serialization round trip and parse guards", () => {
  const saved = saveSellScenario(withPrice("850000"), deriveCalculation(withPrice("850000")), NOW);
  const draft = saveSellScenario(createSellScenario({ id: "draft", now: NOW }), deriveCalculation(createSellScenario({ id: "draft", now: NOW })), NOW);
  const parsed = parseStoredScenarios(serializeScenarios([saved, draft]));
  assert.equal(parsed.status, "ok");
  assert.equal(parsed.scenarios.length, 2);
  assert.deepEqual(parsed.scenarios.find((s) => s.id === "a"), saved);
  assert.equal(parsed.retained.length, 0);

  assert.equal(parseSellScenario(null), null);
  assert.equal(parseSellScenario({ ...saved, schemaVersion: 2 }), null);
  assert.equal(parseSellScenario({ ...saved, type: "BUY" }), null);
  assert.equal(parseSellScenario({ ...saved, jurisdiction: "CA-ON" }), null);
  assert.equal(parseSellScenario({ ...saved, locale: "fr-CA" }), null);
  assert.equal(parseSellScenario({ ...saved, id: "" }), null);
  assert.equal(parseSellScenario({ ...saved, commissionMode: "x" }), null);
  assert.equal(parseSellScenario({ ...saved, formValues: { sellingPrice: "1" } }), null);
  assert.equal(parseSellScenario({ ...saved, review: { mortgage: 1 } }), null);
  assert.equal(parseSellScenario({ ...saved, savedResult: { nope: true } }), null);
  assert.equal(parseSellScenario({ ...saved, createdAt: "not a date" }), null);
  assert.equal(parseSellScenario({ ...saved, savedAt: 5 }), null);
});

test("storage sorts by most recently updated first", () => {
  const older = { ...withPrice("1", "old"), updatedAt: "2026-10-01T00:00:00.000Z" };
  const newer = { ...withPrice("1", "new"), updatedAt: "2026-10-05T00:00:00.000Z" };
  assert.deepEqual(sortScenarios([older, newer]).map((s) => s.id), ["new", "old"]);
  const parsed = parseStoredScenarios(serializeScenarios([older, newer]));
  assert.deepEqual(parsed.scenarios.map((s) => s.id), ["new", "old"]);
});

test("ruleVersion and result snapshot survive a storage round trip", () => {
  const { storage } = memoryStorage();
  const repo = createLocalSellScenarioRepository(() => storage);
  const working = withPrice("850000");
  const saved = saveSellScenario(working, deriveCalculation(working), NOW);
  assert.deepEqual(repo.save(saved), { ok: true });
  const loaded = repo.load();
  assert.equal(loaded.scenarios[0].ruleVersion, SELL_RULE_VERSION);
  assert.deepEqual(loaded.scenarios[0].savedResult, saved.savedResult);
});

test("repository upserts by id", () => {
  const { storage } = memoryStorage();
  const repo = createLocalSellScenarioRepository(() => storage);
  const working = withPrice("850000");
  repo.save(saveSellScenario(working, deriveCalculation(working), NOW));
  const edited = { ...working, formValues: { ...working.formValues, sellingPrice: "900000" } };
  repo.save(saveSellScenario(edited, deriveCalculation(edited), new Date("2026-10-07T00:00:00")));
  repo.save(saveSellScenario(withPrice("1", "b"), deriveCalculation(withPrice("1", "b")), NOW));
  const loaded = repo.load();
  assert.equal(loaded.scenarios.length, 2);
  assert.equal(loaded.scenarios.find((s) => s.id === "a")?.formValues.sellingPrice, "900000");
});

test("malformed localStorage: no crash, corrupt data is backed up not erased", () => {
  const { storage, data } = memoryStorage({ [SELL_SCENARIO_STORAGE_KEY]: "{not json" });
  const repo = createLocalSellScenarioRepository(() => storage, () => 123);
  const loaded = repo.load();
  assert.equal(loaded.status, "corrupt");
  assert.deepEqual(loaded.scenarios, []);
  assert.equal(data.get(SELL_SCENARIO_STORAGE_KEY), "{not json", "load never mutates");

  const working = withPrice("850000");
  assert.deepEqual(repo.save(saveSellScenario(working, deriveCalculation(working), NOW)), { ok: true });
  assert.equal(data.get(`${SELL_SCENARIO_STORAGE_KEY}.corrupt-123`), "{not json");
  assert.equal(repo.load().scenarios.length, 1);

  for (const raw of ["[]", '{"version":2,"scenarios":[]}', '{"version":1}', "null", '"x"']) {
    assert.equal(parseStoredScenarios(raw).status, "corrupt", raw);
  }
});

test("unknown/invalid records are retained verbatim on save", () => {
  const saved = saveSellScenario(withPrice("850000"), deriveCalculation(withPrice("850000")), NOW);
  const future = { schemaVersion: 2, id: "future", type: "SELL", extra: { keep: true } };
  const { storage, data } = memoryStorage({
    [SELL_SCENARIO_STORAGE_KEY]: JSON.stringify({ version: 1, scenarios: [saved, future, 42] }),
  });
  const repo = createLocalSellScenarioRepository(() => storage);
  const loaded = repo.load();
  assert.equal(loaded.scenarios.length, 1);
  assert.equal(loaded.retained.length, 2);

  const other = withPrice("1", "other");
  repo.save(saveSellScenario(other, deriveCalculation(other), NOW));
  const raw = JSON.parse(data.get(SELL_SCENARIO_STORAGE_KEY)!);
  assert.equal(raw.scenarios.length, 4);
  assert.deepEqual(raw.scenarios.slice(2), [future, 42]);
});

test("unavailable or failing storage reports without throwing", () => {
  const none = createLocalSellScenarioRepository(() => null);
  assert.equal(none.load().status, "unavailable");
  assert.equal(none.save(withPrice("1")).ok, false);

  const throwing: KeyValueStorage = {
    getItem: () => {
      throw new Error("blocked");
    },
    setItem: () => {
      throw new Error("blocked");
    },
  };
  const repo = createLocalSellScenarioRepository(() => throwing);
  assert.equal(repo.load().status, "unavailable");
  assert.equal(repo.save(withPrice("1")).ok, false);

  const full: KeyValueStorage = {
    getItem: () => null,
    setItem: () => {
      throw new Error("quota");
    },
  };
  assert.equal(createLocalSellScenarioRepository(() => full).save(withPrice("1")).ok, false);
});
