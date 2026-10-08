"use client";

import { formatWholeCad } from "../lib/engine/currency";
import {
  deriveStoredLifecycle,
  type SellScenario,
} from "../lib/scenarios/sell-scenario";
import type { LoadResult } from "../lib/scenarios/sell-scenario-storage";
import { TIER1_DISCLAIMER } from "../lib/sell-copy";

export function formatTimestamp(iso: string | null): string {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

type EntryProps = {
  loaded: boolean;
  stored: LoadResult;
  onNew: () => void;
  onOpen: (scenario: SellScenario) => void;
  onDuplicate: (scenario: SellScenario) => void;
};

export function SellScenarioEntry({
  loaded,
  stored,
  onNew,
  onOpen,
  onDuplicate,
}: EntryProps) {
  return (
    <div className="sc-shell" data-testid="scenario-entry">
      <header className="sc-entry-header">
        <h1 className="sc-title">SELL Scenarios</h1>
        <p className="sc-subtitle">
          Create a new estimate or continue where you left off.
        </p>
      </header>

      <button
        type="button"
        className="sc-primary-button"
        data-testid="new-scenario"
        onClick={onNew}
      >
        New SELL Scenario
      </button>

      {stored.status === "corrupt" ? (
        <p className="sc-notice sc-notice-warning" role="status" data-testid="storage-corrupt">
          Saved scenarios in this browser could not be read. Nothing has been
          erased; new saves keep a backup of the unreadable data.
        </p>
      ) : null}
      {stored.status === "unavailable" ? (
        <p className="sc-notice sc-notice-warning" role="status" data-testid="storage-unavailable">
          Browser storage is unavailable, so scenarios cannot be saved here.
        </p>
      ) : null}

      <h2 className="sc-section-title">Recent</h2>

      {loaded && stored.scenarios.length === 0 ? (
        <p className="sc-notice" data-testid="entry-empty">
          No saved scenarios yet. Start a new one to see it here.
        </p>
      ) : null}

      <ul className="sc-card-list" aria-label="Recent SELL scenarios">
        {stored.scenarios.map((scenario) => {
          const lifecycle = deriveStoredLifecycle(scenario);
          return (
            <li key={scenario.id} className="sc-card" data-testid="scenario-card">
              <div className="sc-card-head">
                <h3 className="sc-card-name">{scenario.name}</h3>
                <span className={`sc-badge sc-badge-${lifecycle.toLowerCase()}`}>
                  {lifecycle}
                </span>
              </div>
              <p className="sc-card-label">
                {scenario.savedResult ? "Estimated Net Proceeds" : "Result"}
              </p>
              <p
                className={`sc-card-amount tabular ${scenario.savedResult ? "" : "sc-card-amount-empty"}`}
              >
                {scenario.savedResult
                  ? formatWholeCad(scenario.savedResult.estimatedNetProceedsCents)
                  : "No result yet"}
              </p>
              <p className="sc-card-meta">
                Updated {formatTimestamp(scenario.updatedAt)}
              </p>
              <div className="sc-card-actions">
                <button
                  type="button"
                  className="sc-link-button"
                  aria-label={`Open ${scenario.name}`}
                  onClick={() => onOpen(scenario)}
                >
                  Open ›
                </button>
                <button
                  type="button"
                  className="sc-link-button sc-link-button-quiet"
                  aria-label={`Duplicate ${scenario.name}`}
                  onClick={() => onDuplicate(scenario)}
                >
                  Duplicate
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="sc-notice">
        Saved scenarios can be reopened here. They are stored in this browser
        only.
      </p>
      <p className="sc-caption" data-testid="tier1-disclaimer">
        {TIER1_DISCLAIMER}
      </p>
    </div>
  );
}
