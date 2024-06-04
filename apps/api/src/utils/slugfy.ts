/**
 * Returns a slugfied version of a text
 *
 * @param text - the text that will be slugfied
 */
export function slugify(text: string) {
  return text
    .normalize('NFD')
    .replace(/[^a-zA-Z\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
    .replace(/-+/g, '-')
}
