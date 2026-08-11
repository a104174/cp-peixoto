import { Barlow_Condensed, Host_Grotesk, Manrope } from "next/font/google";

export const headingFont = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-heading",
});

export const heroHeadingFont = Host_Grotesk({
  subsets: ["latin"],
  weight: ["600", "700"],
  display: "swap",
  variable: "--font-hero-heading",
});

export const bodyFont = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
});

export const fontVariables = `${headingFont.variable} ${heroHeadingFont.variable} ${bodyFont.variable}`;
