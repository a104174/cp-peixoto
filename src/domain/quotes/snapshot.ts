import type { QuoteDraft } from "./types";

export function serializeQuoteDraft(draft: QuoteDraft): string {
  return JSON.stringify(draft);
}

export function quoteDraftHasUnsavedChanges(
  draft: QuoteDraft,
  savedSnapshot: string,
): boolean {
  return serializeQuoteDraft(draft) !== savedSnapshot;
}
