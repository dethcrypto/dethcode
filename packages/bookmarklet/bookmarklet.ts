/**
 * How to turn this into a bookmarklet:
 * - Replace `return href.` in function body with `location.href = location.href.`
 * - Prefix with `javascript: `
 * - Paste it into the readme or test it in your browser
 */
export function toDethNet(href: string): string {
  return href.replace(/\.\w+(\/)/, ".deth.net/");
}
