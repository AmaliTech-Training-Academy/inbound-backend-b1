export function canonicalizeRecipient(value) {
  if (typeof value !== "string") return null;
  
  const candidate = value.trim().toLowerCase();
  if (candidate.includes(' ') || candidate.includes('<') || candidate.includes('>')) {
    return null
  }

  const parts = candidate.split('@')
  if (parts.length !== 2) return null

  const [username, domain] = parts

  if (!username || !domain) return null
  if (!domain.includes('.') || domain.startsWith('.') || domain.endsWith('.')) {
    return null
  }

  return candidate
}
