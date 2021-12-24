export function fileExtension(info: { CompilerVersion: string }) {
  if (info.CompilerVersion.startsWith("vyper:")) return ".vy";
  return ".sol";
}
