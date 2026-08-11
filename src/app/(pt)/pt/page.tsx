import type { Metadata } from "next";

import { LandingPage } from "@/components/landing-page";
import { createLocalizedMetadata } from "@/lib/metadata";

export const metadata: Metadata = createLocalizedMetadata("pt-PT");

export default function PortugueseHomePage() {
  return <LandingPage locale="pt-PT" />;
}
