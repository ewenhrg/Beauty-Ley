import { Cormorant_Garamond, Outfit } from "next/font/google";

export const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

// Only the weights the site actually uses (normal, medium, semibold): each extra
// weight is another font file on the critical path.
export const cormorant = Cormorant_Garamond({
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant",
  display: "swap",
});
