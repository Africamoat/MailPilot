export function personalize(
  template: string,
  vars: Record<string, string>
): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? "");
}

export function nameFromEmail(email: string): string {
  const local = email.split("@")[0];
  const clean = local.replace(/[._0-9-]/g, " ").trim().split(/\s+/)[0];
  return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
}

export function companyFromEmail(email: string): string {
  const domain = email.split("@")[1] || "";
  // Remove TLD (.com, .co, .fr, etc.)
  const name = domain.split(".")[0];
  if (!name || ["gmail", "yahoo", "hotmail", "outlook", "live", "aol", "icloud", "protonmail"].includes(name.toLowerCase())) {
    return "";
  }
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isToday(date: string | null): boolean {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function addDays(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export const STATUS_LABELS: Record<string, string> = {
  not_contacted: "Non contacté",
  contacted: "Contacté",
  follow_up: "Relance",
  replied: "Répondu",
};

export const STATUS_COLORS: Record<string, string> = {
  not_contacted: "bg-gray-100 text-gray-700",
  contacted: "bg-blue-100 text-blue-700",
  follow_up: "bg-yellow-100 text-yellow-700",
  replied: "bg-green-100 text-green-700",
};

export const COUNTRIES = [
  "Côte d'Ivoire",
  "Sénégal",
  "Mali",
  "Burkina Faso",
  "Guinée",
  "Togo",
  "Bénin",
  "Niger",
  "Cameroun",
  "Congo",
];
