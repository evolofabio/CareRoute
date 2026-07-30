import type { GroupRole } from "@/types/database";

export function canManageMedications(role: GroupRole) {
  return role === "admin" || role === "member";
}

export function canManageExpenses(role: GroupRole) {
  return role === "admin" || role === "member";
}

export function canManageDocuments(role: GroupRole) {
  return role === "admin" || role === "member";
}

export function canManageGroup(role: GroupRole) {
  return role === "admin";
}

export function isCaregiver(role: GroupRole) {
  return role === "caregiver";
}

export const ROLE_LABELS: Record<GroupRole, string> = {
  admin: "Amministratore",
  member: "Familiare",
  caregiver: "Operatore",
};
