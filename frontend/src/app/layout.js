import "./globals.css";

export const metadata = {
  title: "Mandala 525 — Tour & Travel Umroh",
  description: "Sistem manajemen perjalanan umroh terintegrasi oleh Mandala Lima Dua Lima Tour & Travel.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
