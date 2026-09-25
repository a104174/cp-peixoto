export type BackofficeIconName =
  | "archive"
  | "arrow"
  | "clients"
  | "close"
  | "dashboard"
  | "download"
  | "edit"
  | "eye"
  | "eye-off"
  | "logout"
  | "materials"
  | "menu"
  | "plus"
  | "quotes"
  | "save"
  | "search"
  | "trash";

type BackofficeIconProps = {
  name: BackofficeIconName;
  size?: number;
  className?: string;
};

const paths: Record<BackofficeIconName, React.ReactNode> = {
  archive: <><path d="M4 7.5h16"/><path d="M6 7.5V20h12V7.5"/><path d="M5 4h14l1 3.5H4L5 4Z"/><path d="M9 12h6"/></>,
  arrow: <><path d="m9 18 6-6-6-6"/></>,
  clients: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>,
  close: <><path d="M18 6 6 18"/><path d="m6 6 12 12"/></>,
  dashboard: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  download: <><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14a2 2 0 0 0 2-2v-3"/><path d="M3 16v3a2 2 0 0 0 2 2"/></>,
  edit: <><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L8 18l-4 1 1-4Z"/></>,
  eye: <><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.25"/></>,
  "eye-off": <><path d="m3 3 18 18"/><path d="M10.6 6.2A10.7 10.7 0 0 1 12 6c6 0 9.5 6 9.5 6a16.7 16.7 0 0 1-3.2 3.9"/><path d="M6.7 6.7C4.1 8.2 2.5 12 2.5 12a16.7 16.7 0 0 0 3.6 4.1A10.1 10.1 0 0 0 12 18c1 0 2-.2 2.9-.5"/></>,
  logout: <><path d="M10 17l5-5-5-5"/><path d="M15 12H3"/><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/></>,
  materials: <><path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 16 9 5 9-5"/></>,
  menu: <><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></>,
  plus: <><path d="M12 5v14"/><path d="M5 12h14"/></>,
  quotes: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8"/><path d="M8 17h6"/></>,
  save: <><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v5h8"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  trash: <><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="m19 6-1 14H6L5 6"/><path d="M10 11v5"/><path d="M14 11v5"/></>,
};

export function BackofficeIcon({ name, size = 18, className }: BackofficeIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7">
        {paths[name]}
      </g>
    </svg>
  );
}
