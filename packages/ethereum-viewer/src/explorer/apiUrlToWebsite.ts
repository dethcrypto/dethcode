export function apiUrlToWebsite(url: string) {
  // This is a bit of a hack, but they all have the same URL scheme.
  return url
    .replace("//api.", "//")
    .replace("//api-", "//")
    .replace(/\/api$/, "");
}
