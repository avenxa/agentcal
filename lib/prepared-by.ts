import { PREPARED_BY_STORAGE_KEY } from "./sell-copy.ts";

let cachedPreparedBy = "";
const listeners = new Set<() => void>();

function notifyPreparedByListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribePreparedBy(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getPreparedBySnapshot(): string {
  if (typeof window === "undefined") {
    return cachedPreparedBy;
  }
  try {
    cachedPreparedBy = window.localStorage.getItem(PREPARED_BY_STORAGE_KEY) ?? "";
  } catch {
    cachedPreparedBy = "";
  }
  return cachedPreparedBy;
}

export function getPreparedByServerSnapshot(): string {
  return "";
}

export function readPreparedBy(): string {
  return getPreparedBySnapshot();
}

export function writePreparedBy(value: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    const trimmed = value.trim();
    if (trimmed === "") {
      window.localStorage.removeItem(PREPARED_BY_STORAGE_KEY);
      cachedPreparedBy = "";
    } else {
      window.localStorage.setItem(PREPARED_BY_STORAGE_KEY, value);
      cachedPreparedBy = value;
    }
  } catch {
    cachedPreparedBy = value.trim() === "" ? "" : value;
  }
  notifyPreparedByListeners();
}
