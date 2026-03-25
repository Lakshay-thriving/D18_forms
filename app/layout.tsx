import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import Navigation from "../components/Navigation"; // I will create this

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
          <Navigation />
          {children}
        </Providers>
      </body>
    </html>
  );
}
