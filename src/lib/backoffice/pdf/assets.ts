import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

let logoPromise: Promise<Uint8Array> | null = null;

export async function loadQuotePdfLogo(): Promise<Uint8Array> {
  logoPromise ??= readFile(
    path.join(
      process.cwd(),
      "public",
      "brand",
      "cp-peixoto-logo.png",
    ),
  ).then((value) => new Uint8Array(value));
  return logoPromise;
}
