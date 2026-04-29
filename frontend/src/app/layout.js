import "./globals.css";

export const metadata = {
  title: "ERP Travel Umroh — Sistem Manajemen Terintegrasi",
  description: "Sistem ERP terintegrasi untuk manajemen perjalanan umroh. Booking, pembayaran, dokumen, dan perlengkapan dalam satu platform.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
