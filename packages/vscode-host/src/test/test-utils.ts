import { JSDOM } from "jsdom";

export function givenUrl(url: string) {
  const { window } = new JSDOM("", { url });

  globalThis.window = window as any;
}
