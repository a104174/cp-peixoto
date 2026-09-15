import { logoutAction } from "@/lib/backoffice/auth-actions";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="bo-nav-link bo-logout-button" type="submit">
        Sair
      </button>
    </form>
  );
}

