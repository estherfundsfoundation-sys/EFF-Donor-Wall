const GIVEBUTTER_TRANSACTIONS_URL =
  "https://api.givebutter.com/v1/transactions?sortByDesc=transacted_at";

const PUBLIC_WALL_FIELD = "Let EFF add me to the donor wall";
const PUBLIC_NAME_FIELD = "Name to display on the EFF Donor Wall";
const RECOGNITION_TYPE_FIELD = "Recognition type";

type UnknownRecord = Record<string, unknown>;

export type PublicSupporter = {
  id: string;
  name: string;
  tier: string;
  recognitionType: string;
};

function record(value: unknown): UnknownRecord {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as UnknownRecord)
    : {};
}

function text(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function firstText(source: UnknownRecord, keys: string[]): string {
  for (const key of keys) {
    const value = text(source[key]);
    if (value) return value;
  }
  return "";
}

function fieldEntries(value: unknown): Array<[string, string]> {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.flatMap((item) => {
      const entry = record(item);
      const label = firstText(entry, [
        "label",
        "name",
        "title",
        "question",
        "field_name",
      ]);
      const answer = firstText(entry, [
        "value",
        "answer",
        "response",
        "field_value",
      ]);
      return label && answer ? [[label, answer] as [string, string]] : [];
    });
  }

  return Object.entries(record(value)).flatMap(([label, answer]) => {
    const normalized = text(answer);
    return normalized ? [[label, normalized] as [string, string]] : [];
  });
}

function collectFields(transaction: UnknownRecord): Map<string, string> {
  const contact = record(transaction.contact);
  const campaign = record(transaction.campaign);
  const entries = [
    ...fieldEntries(transaction.custom_fields),
    ...fieldEntries(transaction.fields),
    ...fieldEntries(transaction.answers),
    ...fieldEntries(contact.custom_fields),
    ...fieldEntries(campaign.custom_fields),
  ];

  return new Map(
    entries.map(([label, value]) => [label.trim().toLowerCase(), value.trim()]),
  );
}

function fieldValue(fields: Map<string, string>, label: string): string {
  const exact = fields.get(label.toLowerCase());
  if (exact) return exact;

  const fragment = label.toLowerCase();
  for (const [key, value] of fields) {
    if (key.includes(fragment)) return value;
  }
  return "";
}

function isAffirmative(value: string): boolean {
  return /^(yes|y|true|1|please do|add me)$/i.test(value.trim());
}

function amountInDollars(transaction: UnknownRecord): number {
  const raw = Number(
    transaction.donated ?? transaction.amount ?? transaction.total ?? 0,
  );
  if (!Number.isFinite(raw) || raw <= 0) return 0;

  // Givebutter amounts are typically returned in the smallest currency unit.
  return raw >= 100 ? raw / 100 : raw;
}

function tierFor(total: number): string {
  if (total >= 2500) return "Legacy Partner";
  if (total >= 1000) return "Future Fulfilled Circle";
  if (total >= 500) return "Opportunity Partner";
  if (total >= 250) return "Education Advocate";
  if (total >= 100) return "Student Champion";
  if (total >= 25) return "Future Builder";
  return "Friend of EFF";
}

function publicName(transaction: UnknownRecord, fields: Map<string, string>) {
  const requestedName = fieldValue(fields, PUBLIC_NAME_FIELD);
  if (requestedName) return requestedName.slice(0, 100);

  const contact = record(transaction.contact);
  const company = record(transaction.company);
  const contactName = firstText(contact, [
    "name_display",
    "display_name",
    "company_name",
    "name",
  ]);
  if (contactName) return contactName.slice(0, 100);

  const companyName = firstText(company, ["name_display", "company_name", "name"]);
  if (companyName) return companyName.slice(0, 100);

  return firstText(transaction, ["contact_name", "donor_name", "name"]).slice(
    0,
    100,
  );
}

function isEligible(transaction: UnknownRecord, fields: Map<string, string>) {
  const captured = transaction.captured;
  const refunded = transaction.refunded;
  const anonymous =
    transaction.anonymous ??
    transaction.is_anonymous ??
    record(transaction.contact).anonymous;

  return (
    captured !== false &&
    text(captured).toLowerCase() !== "false" &&
    refunded !== true &&
    text(refunded).toLowerCase() !== "true" &&
    anonymous !== true &&
    text(anonymous).toLowerCase() !== "true" &&
    isAffirmative(fieldValue(fields, PUBLIC_WALL_FIELD))
  );
}

export async function getPublicSupporters(): Promise<PublicSupporter[]> {
  const token = process.env.GIVEBUTTER_API_KEY;
  if (!token) return [];

  try {
    const response = await fetch(GIVEBUTTER_TRANSACTIONS_URL, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 300 },
    });

    if (!response.ok) return [];

    const payload = record(await response.json());
    const transactions = Array.isArray(payload.data) ? payload.data : [];
    const totals = new Map<
      string,
      { id: string; name: string; total: number; recognitionType: string }
    >();

    for (const item of transactions) {
      const transaction = record(item);
      const fields = collectFields(transaction);
      if (!isEligible(transaction, fields)) continue;

      const name = publicName(transaction, fields);
      if (!name) continue;

      const contact = record(transaction.contact);
      const id =
        firstText(contact, ["id", "external_id"]) ||
        firstText(transaction, ["contact_id"]) ||
        name.toLowerCase();
      const recognitionType =
        fieldValue(fields, RECOGNITION_TYPE_FIELD) || "Individual";
      const existing = totals.get(id);

      totals.set(id, {
        id,
        name,
        total: (existing?.total ?? 0) + amountInDollars(transaction),
        recognitionType: recognitionType.slice(0, 40),
      });
    }

    return [...totals.values()]
      .map(({ id, name, total, recognitionType }) => ({
        id,
        name,
        tier: tierFor(total),
        recognitionType,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  } catch {
    return [];
  }
}

export const recognitionLevels = [
  { range: "$1–$24", name: "Friend of EFF" },
  { range: "$25–$99", name: "Future Builder" },
  { range: "$100–$249", name: "Student Champion" },
  { range: "$250–$499", name: "Education Advocate" },
  { range: "$500–$999", name: "Opportunity Partner" },
  { range: "$1,000–$2,499", name: "Future Fulfilled Circle" },
  { range: "$2,500+", name: "Legacy Partner" },
];
