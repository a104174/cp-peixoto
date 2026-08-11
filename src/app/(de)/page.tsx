import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { createLocalizedMetadata } from "@/lib/metadata";

export const metadata: Metadata = createLocalizedMetadata("de-CH");

export default function GermanHomePage() {
  return <LandingPage locale="de-CH" />;
}
