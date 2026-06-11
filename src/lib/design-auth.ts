import { ensureDesignAccess, ensureDesignEditAccess } from './data-utils';

export async function canAccessDesign(
  doc: { id: string },
  userEmail: string,
): Promise<boolean> {
  return ensureDesignAccess(doc.id, userEmail);
}

export async function canEditDesign(
  doc: { id: string },
  userEmail: string,
): Promise<boolean> {
  return ensureDesignEditAccess(doc.id, userEmail);
}
