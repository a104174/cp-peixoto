"use client";

import { useActionState, useRef, useState } from "react";

import { BackofficeIcon } from "@/components/backoffice/backoffice-icon";
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
  const [showPassword, setShowPassword] = useState(false);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  function togglePasswordVisibility() {
    setShowPassword((visible) => !visible);
    passwordInputRef.current?.focus();
  }

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
      <div className="bo-password-field">
        <input
          ref={passwordInputRef}
          aria-describedby={state.fieldErrors?.password ? "login-password-error" : undefined}
          aria-invalid={Boolean(state.fieldErrors?.password)}
          autoComplete="current-password"
          id="login-password"
          name="password"
          required
          type={showPassword ? "text" : "password"}
        />
        <button
          aria-label={showPassword ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
          aria-pressed={showPassword}
          className="bo-password-toggle"
          onClick={togglePasswordVisibility}
          onMouseDown={(event) => event.preventDefault()}
          type="button"
        >
          <BackofficeIcon name={showPassword ? "eye-off" : "eye"} size={18} />
        </button>
      </div>
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
