import type { DocumentCategory, ExpenseCategory } from "@/types/database";

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  farmaci: "Farmaci",
  visite_mediche: "Visite mediche",
  badante: "Badante",
  trasporti: "Trasporti",
  casa: "Casa",
  alimentari: "Alimentari",
  altro: "Altro",
};

export const DOCUMENT_CATEGORY_LABELS: Record<DocumentCategory, string> = {
  medical: "Sanitari",
  legal: "Legali",
  financial: "Finanziari",
  other: "Altri",
};
