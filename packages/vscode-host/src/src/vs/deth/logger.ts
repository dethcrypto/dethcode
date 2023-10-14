/**
 * Prints a message to browser console, prefixed with magenta-colored `"[ecv:ide]"`
 */
export const log = console.log.bind(console, "\x1b[35m [ecv:ide]");
