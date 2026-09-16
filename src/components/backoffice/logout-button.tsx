import { logoutAction } from "@/lib/backoffice/auth-actions";
import { BackofficeIcon } from "./backoffice-icon";

export function LogoutButton() {
  return (
    <form action={logoutAction}>
      <button className="bo-nav-link bo-logout-button" type="submit">
        <span className="bo-nav-icon"><BackofficeIcon name="logout" /></span>
        <span>Sair</span>
      </button>
    </form>
  );
}
