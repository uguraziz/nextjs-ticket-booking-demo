import type { Metadata } from "next";
import "./globals.css";

/**
 * Google Fonts (next/font/google) yerine sistem fontlarını tercih ettik.
 * Nedeni: next/font/google build sırasında fonts.googleapis.com'a
 * erişim gerektirir; bazı kurumsal ağlar veya izole CI ortamları bu
 * isteği engelleyebilir (bu projede de öyle oldu). Sistem fontları hem
 * bu riski ortadan kaldırır hem de ekstra font indirme maliyeti olmadan
 * anında render edilir (performans açısından da makul bir tercih).
 */

export const metadata: Metadata = {
  title: "Booking Event",
  description: "Etkinlik ve bilet satış platformu (mülakat hazırlık projesi)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
