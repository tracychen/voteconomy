import "./globals.css";
import { Toaster } from "../components/ui/toaster";

import { Poppins } from "next/font/google";

// If loading a variable font, you don't need to specify the font weight
const poppins = Poppins({
  weight: "400",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={poppins.className}>
      <body>{children}</body>
      <Toaster />
    </html>
  );
}
