export const ITEM_FIELDS = [
  { key: "title", label: "Heading", type: "text", required: true },
  { key: "prompt", label: "Prompt or text", type: "area", big: true },
  { key: "purpose", label: "Purpose", type: "text" },
  { key: "link", label: "Link (website)", type: "url" },
  { key: "email", label: "Email used", type: "email" },
  { key: "password", label: "Password", type: "secret" },
  { key: "image", label: "Image", type: "image" },
  { key: "note", label: "Note", type: "area" },
  { key: "reminder", label: "Reminder date", type: "date" },
  { key: "files", label: "Files (PDF, TXT or images, up to 5)", type: "files" },
];
export const VAULT_FIELDS = [
  { key: "title", label: "Heading (which API or secret)", type: "text", required: true },
  { key: "secret", label: "API code or secret", type: "secret" },
  { key: "purpose", label: "Purpose", type: "text" },
  { key: "link", label: "Link (website)", type: "url" },
  { key: "note", label: "Note", type: "area" },
];

export const PROJECT_FIELDS = [
  { key: "title", label: "Project name", type: "text", required: true },
  { key: "desc", label: "Details", type: "area", big: true },
  { key: "tools", label: "Tools used", type: "area" },
  { key: "emails", label: "Emails used", type: "area" },
  { key: "password", label: "Login password", type: "secret" },
  { key: "domain", label: "Domain used", type: "text" },
  { key: "storage", label: "Storage system used", type: "text" },
  { key: "link", label: "Link to open the project", type: "url" },
  { key: "note", label: "Note", type: "area" },
  { key: "files", label: "Files (PDF, TXT or images, up to 5)", type: "files" },
];
export const CERT_FIELDS = [
  { key: "title", label: "Heading (what the certificate is for)", type: "text", required: true },
  { key: "files", label: "Files (PDF, TXT or images, up to 5)", type: "files" },
  { key: "note", label: "Note", type: "area" },
];
