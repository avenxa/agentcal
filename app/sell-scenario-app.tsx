"use client";

import { useEffect, useMemo, useState } from "react";

import { INITIAL_FORM_VALUES } from "../lib/engine/sell-calculator-form";
import {
  CURRENCY_FIELD_NAMES,
  createSellScenario,
  duplicateSellScenario,
  type SellScenario,
} from "../lib/scenarios/sell-scenario";
import {
  createBrowserSellScenarioRepository,
  type LoadResult,
  type SaveResult,
} from "../lib/scenarios/sell-scenario-storage";
import { SellScenarioEditor } from "./sell-scenario-editor";
import { SellScenarioEntry } from "./sell-scenario-entry";

type Session = {
  key: string;
  working: SellScenario;
  baseline: SellScenario | null;
  startsUnsaved: boolean;
};

const EMPTY_LOAD: LoadResult = { scenarios: [], status: "empty", retained: [] };

export function SellScenarioApp() {
  const repository = useMemo(() => createBrowserSellScenarioRepository(), []);
  const [loaded, setLoaded] = useState(false);
  const [stored, setStored] = useState<LoadResult>(EMPTY_LOAD);
  const [session, setSession] = useState<Session | null>(null);

  // localStorage is only readable in the browser, so the list loads after mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStored(repository.load());
    setLoaded(true);
  }, [repository]);

  function openNew() {
    // Untouched amounts start genuinely empty (muted "0" placeholder), not a typed "0".
    // Empty parses to $0 in the engine, so calculation is unchanged.
    const base = createSellScenario();
    const blank = { ...INITIAL_FORM_VALUES };
    for (const name of CURRENCY_FIELD_NAMES) blank[name] = "";
    const working = { ...base, formValues: blank };
    setSession({ key: working.id, working, baseline: null, startsUnsaved: false });
  }

  function openSaved(scenario: SellScenario) {
    setSession({
      key: `${scenario.id}-${Date.now()}`,
      working: scenario,
      baseline: scenario,
      startsUnsaved: false,
    });
  }

  function openDuplicate(source: SellScenario) {
    const copy = duplicateSellScenario(source);
    setSession({ key: copy.id, working: copy, baseline: null, startsUnsaved: true });
  }

  function save(scenario: SellScenario): SaveResult {
    const result = repository.save(scenario);
    if (result.ok) {
      setStored(repository.load());
    }
    return result;
  }

  function closeEditor() {
    setStored(repository.load());
    setSession(null);
  }

  if (session) {
    return (
      <SellScenarioEditor
        key={session.key}
        initialWorking={session.working}
        initialBaseline={session.baseline}
        startsUnsaved={session.startsUnsaved}
        onSave={save}
        onBack={closeEditor}
        onDuplicate={openDuplicate}
      />
    );
  }

  return (
    <SellScenarioEntry
      loaded={loaded}
      stored={stored}
      onNew={openNew}
      onOpen={openSaved}
      onDuplicate={openDuplicate}
    />
  );
}
