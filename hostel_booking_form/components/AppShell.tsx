"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Image from "next/image";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  if (isLoginPage) {
    // Login page owns its full-screen layout
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-[#F5F7FA]">
      <Sidebar />
      <div className="flex-1 ml-72 min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 px-8 py-6 overflow-y-auto w-full max-w-[1400px] mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
