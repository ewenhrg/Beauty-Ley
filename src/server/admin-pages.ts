export const ADMIN_NAV = [
  { id: "dashboard", href: "/admin", label: "Tableau de bord", icon: "dashboard" },
  { id: "calendrier", href: "/admin/calendrier", label: "Calendrier", icon: "calendar" },
  { id: "rendez-vous", href: "/admin/rendez-vous", label: "Rendez-vous", icon: "list" },
  { id: "clients", href: "/admin/clients", label: "Clientes", icon: "people" },
  { id: "prestations", href: "/admin/prestations", label: "Prestations", icon: "sparkle" },
  { id: "equipe", href: "/admin/equipe", label: "Équipe", icon: "team" },
  { id: "parametres", href: "/admin/parametres", label: "Paramètres", icon: "settings" },
  { id: "comptes", href: "/admin/comptes", label: "Comptes", icon: "users" },
] as const;

export type AdminPageId = (typeof ADMIN_NAV)[number]["id"];

export const ADMIN_PAGE_IDS: AdminPageId[] = ADMIN_NAV.map((item) => item.id);

export const OWNER_ID = "owner";
export const OWNER_USERNAMES = new Set(["admin", "owner"]);
