import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "../components/Providers";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

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
          <div className="flex min-h-screen bg-[#F5F7FA]">
            <Sidebar />
            <div className="flex-1 ml-72 min-h-screen flex flex-col">
              <Header />
              <main className="flex-1 px-8 py-6 overflow-y-auto w-full max-w-[1400px] mx-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
