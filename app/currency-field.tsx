"use client";

import { useState } from "react";

import { formatFieldCad, parseCurrencyToCents } from "../lib/engine/currency";

type CurrencyFieldProps = {
  id: string;
  label: string;
  hint?: string;
  value: string;
  error?: string;
  allowNegative?: boolean;
  readOnly?: boolean;
  readOnlyCents?: number | null;
  emptyMeansBlank?: boolean;
  describedBy?: string;
  onChange: (value: string) => void;
};

export function CurrencyField({
  id,
  label,
  hint,
  value,
  error,
  allowNegative = false,
  readOnly = false,
  readOnlyCents = null,
  emptyMeansBlank = false,
  describedBy,
  onChange,
}: CurrencyFieldProps) {
  const [focused, setFocused] = useState(false);
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedByIds = [
    describedBy,
    hint ? hintId : undefined,
    error ? errorId : undefined,
  ]
    .filter(Boolean)
    .join(" ");
  const parsedValue = parseCurrencyToCents(value);
  const restingValue =
    parsedValue.status === "valid"
      ? formatFieldCad(parsedValue.cents)
      : parsedValue.status === "empty" && !emptyMeansBlank
        ? formatFieldCad(0)
        : value;

  if (readOnly) {
    return (
      <div className="amount-row">
        <div className="amount-row-text">
          <p className="amount-label">{label}</p>
          {hint ? (
            <p id={hintId} className="amount-hint">
              {hint}
            </p>
          ) : null}
        </div>
        <p className="amount-value tabular" aria-live="polite">
          {readOnlyCents === null ? "—" : formatFieldCad(readOnlyCents)}
        </p>
      </div>
    );
  }

  return (
    <div
      className={`amount-row ${focused ? "amount-row-editing" : ""} ${error ? "amount-row-error" : ""}`}
    >
      <label className="amount-row-text" htmlFor={id}>
        <span className="amount-label">{label}</span>
        {hint ? (
          <span id={hintId} className="amount-hint">
            {hint}
          </span>
        ) : null}
      </label>
      <input
        id={id}
        className="amount-input tabular"
        inputMode="decimal"
        autoComplete="off"
        spellCheck={false}
        value={focused ? value : restingValue}
        placeholder={
          emptyMeansBlank
            ? "Enter amount"
            : allowNegative
              ? "0 or signed amount"
              : "0"
        }
        aria-invalid={Boolean(error)}
        aria-describedby={describedByIds || undefined}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
      />
      {error ? (
        <p id={errorId} className="field-error" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
