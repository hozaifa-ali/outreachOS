/** Generates a URL-safe slug from a string */
export function generateSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 64);
}

/** Generates a unique slug by appending a random suffix */
export function generateUniqueSlug(input: string): string {
  const base = generateSlug(input);
  const suffix = Math.random().toString(36).substring(2, 8);
  return `${base}-${suffix}`;
}
