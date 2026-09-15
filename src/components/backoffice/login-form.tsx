"use client";

import { useActionState } from "react";

import {
  loginAction,
  type LoginActionState,
} from "@/lib/backoffice/auth-actions";

type LoginFormProps = {
  nextPath: string;
};

const initialState: LoginActionState = {};

export function LoginForm({ nextPath }: LoginFormProps) {
  const [state, formAction, pending] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="bo-login-form">
      <input name="nextPath" type="hidden" value={nextPath} />
      <label htmlFor="login-email">Email</label>
      <input
        autoComplete="email"
        id="login-email"
        name="email"
        required
        type="email"
      />
      <label htmlFor="login-password">Password</label>
      <input
        autoComplete="current-password"
        id="login-password"
        name="password"
        required
        type="password"
      />
      {state.error ? (
        <p aria-live="polite" className="bo-form-error" role="alert">
          {state.error}
        </p>
      ) : null}
      <button className="bo-button bo-button-primary" disabled={pending} type="submit">
        {pending ? "A entrar…" : "Entrar"}
      </button>
    </form>
  );
}

