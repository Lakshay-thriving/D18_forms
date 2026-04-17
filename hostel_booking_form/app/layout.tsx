import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import AppShell from "../components/AppShell";

export const metadata: Metadata = {
  title: "IIT Ropar Guest Room Booking",
  description: "Hostel Guest Room Booking System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
