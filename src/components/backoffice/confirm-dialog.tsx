"use client";

import { useEffect, useRef } from "react";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    cancelRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCancel();
      if (event.key === "Tab") {
        const dialog = cancelRef.current?.closest<HTMLElement>("[role='alertdialog']");
        const controls = Array.from(dialog?.querySelectorAll<HTMLElement>("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])") ?? []);
        const first = controls[0];
        const last = controls.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previouslyFocused?.focus();
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div className="bo-dialog-backdrop" onMouseDown={onCancel}>
      <div
        aria-describedby="bo-confirm-description"
        aria-labelledby="bo-confirm-title"
        aria-modal="true"
        className="bo-dialog"
        onMouseDown={(event) => event.stopPropagation()}
        role="alertdialog"
      >
        <h2 id="bo-confirm-title">{title}</h2>
        <p id="bo-confirm-description">{description}</p>
        <div className="bo-dialog-actions">
          <button className="bo-button bo-button-secondary" onClick={onCancel} ref={cancelRef} type="button">
            Cancelar
          </button>
          <button className="bo-button bo-button-danger" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
