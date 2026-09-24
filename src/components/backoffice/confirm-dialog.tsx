"use client";

import { BackofficeDialog } from "./backoffice-dialog";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmingLabel?: string;
  pending?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmingLabel,
  pending = false,
  onCancel,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <BackofficeDialog onClose={onCancel} open={open}>
      <div
        aria-describedby="bo-confirm-description"
        aria-labelledby="bo-confirm-title"
        aria-modal="true"
        className="bo-dialog"
        role="alertdialog"
        data-bo-dialog
      >
        <h2 id="bo-confirm-title">{title}</h2>
        <p id="bo-confirm-description">{description}</p>
        <div className="bo-dialog-actions">
          <button
            aria-disabled={pending}
            className="bo-button bo-button-secondary"
            onClick={() => {
              if (!pending) onCancel();
            }}
            type="button"
          >
            Cancelar
          </button>
          <button
            className="bo-button bo-button-danger"
            disabled={pending}
            onClick={onConfirm}
            type="button"
          >
            {pending ? (confirmingLabel ?? confirmLabel) : confirmLabel}
          </button>
        </div>
      </div>
    </BackofficeDialog>
  );
}
