"use client";

import { useEffect, useRef, useState } from "react";

import { BackofficeIcon } from "./backoffice-icon";

export function MobileNavigation({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    const trigger = triggerRef.current;
    document.body.style.overflow = "hidden";
    panelRef.current?.querySelector<HTMLElement>("a, button")?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab" || !panelRef.current) return;
      const controls = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          "a, button, input, [tabindex]:not([tabindex='-1'])",
        ),
      );
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

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      trigger?.focus();
    };
  }, [open]);

  return (
    <div className="bo-mobile-navigation">
      <button
        aria-controls="bo-mobile-drawer"
        aria-expanded={open}
        aria-label="Abrir menu"
        className="bo-mobile-menu-button"
        onClick={() => setOpen(true)}
        ref={triggerRef}
        type="button"
      >
        <BackofficeIcon name="menu" />
      </button>
      <div className={`bo-mobile-drawer-layer${open ? " is-open" : ""}`}>
        <button
          aria-label="Fechar menu"
          className="bo-mobile-drawer-backdrop"
          onClick={() => setOpen(false)}
          tabIndex={open ? 0 : -1}
          type="button"
        />
        <div
          aria-label="Menu do backoffice"
          aria-modal="true"
          className="bo-mobile-drawer"
          id="bo-mobile-drawer"
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) setOpen(false);
          }}
          ref={panelRef}
          role="dialog"
        >
          <button
            aria-label="Fechar menu"
            className="bo-mobile-drawer-close"
            onClick={() => setOpen(false)}
            type="button"
          >
            <BackofficeIcon name="close" />
          </button>
          {children}
        </div>
      </div>
    </div>
  );
}
