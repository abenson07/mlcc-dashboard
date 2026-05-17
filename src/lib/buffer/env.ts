export function getBufferApiToken(): string | null {
  const token = process.env.BUFFER_API_TOKEN?.trim();
  return token || null;
}

export function getBufferOrganizationId(): string | null {
  const id = process.env.BUFFER_ORGANIZATION_ID?.trim();
  return id || null;
}
