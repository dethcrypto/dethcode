/**
 * @see /packages/entrypoint/README.md
 */
export function patchForWorkingInIframe() {
  if (window.parent === window) return;

  const keyboard = (navigator as any).keyboard;
  if (keyboard) {
    // keyboard.getLayoutMap = async () => {
    //   window.parent.postMessage(
    //     { type: "getLayoutMap", args: [] },
    //     "*"
    //   );
    //   return res.map(([key, value]) => [key, value]);
    // };
  }
}
