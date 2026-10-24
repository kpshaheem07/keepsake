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
];
export const VAULT_FIELDS = [
  { key: "title", label: "Heading (which API or secret)", type: "text", required: true },
  { key: "secret", label: "API code or secret", type: "secret" },
  { key: "purpose", label: "Purpose", type: "text" },
  { key: "link", label: "Link (website)", type: "url" },
  { key: "note", label: "Note", type: "area" },
];
