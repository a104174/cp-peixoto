"use client";

import { BackofficeDialog } from "./backoffice-dialog";

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
          <button className="bo-button bo-button-secondary" onClick={onCancel} type="button">
            Cancelar
          </button>
          <button className="bo-button bo-button-danger" onClick={onConfirm} type="button">
            {confirmLabel}
          </button>
        </div>
      </div>
    </BackofficeDialog>
  );
}
