"use client";

import { useActionState } from "react";

import {
  loginAction,
  type LoginActionState,
} from "@/lib/backoffice/auth-actions";

type LoginFormProps = {
  nextPath: string;
  notice?: string;
};

const initialState: LoginActionState = {};

export function LoginForm({ nextPath, notice }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="bo-login-form">
      <input name="nextPath" type="hidden" value={nextPath} />
      {notice ? <p className="bo-notice" role="status">{notice}</p> : null}
      <label htmlFor="login-email">Email</label>
      <input
        aria-describedby={state.fieldErrors?.email ? "login-email-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.email)}
        autoComplete="email"
        id="login-email"
        name="email"
        required
        type="email"
      />
      {state.fieldErrors?.email ? <small className="bo-field-error" id="login-email-error">{state.fieldErrors.email}</small> : null}
      <label htmlFor="login-password">Palavra-passe</label>
      <input
        aria-describedby={state.fieldErrors?.password ? "login-password-error" : undefined}
        aria-invalid={Boolean(state.fieldErrors?.password)}
        autoComplete="current-password"
        id="login-password"
        name="password"
        required
        type="password"
      />
      {state.fieldErrors?.password ? <small className="bo-field-error" id="login-password-error">{state.fieldErrors.password}</small> : null}
      {state.message ? (
        <p aria-live="polite" className="bo-form-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button className="bo-button bo-button-primary" disabled={pending} type="submit">
        {pending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}
