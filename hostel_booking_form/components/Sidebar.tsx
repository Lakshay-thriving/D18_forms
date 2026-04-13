"use client";
import React from "react";
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { LayoutDashboard, FileText, ClipboardList, Bell } from 'lucide-react';
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Determine what role the user is
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role;
  const isApplicant = role === "APPLICANT" || !role; // fallback
  const isAdmin = ["JA", "AR", "CW"].includes(role);

  const menuItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/apply', label: 'Guest Room Booking', icon: FileText },
  ];

  if (isApplicant) {
    menuItems.push({ href: '/status/my-requests', label: 'My Requests', icon: ClipboardList });
  }

  if (isAdmin) {
    if (role === "JA") menuItems.push({ href: '/ja', label: 'Applications', icon: ClipboardList });
    if (role === "AR") menuItems.push({ href: '/ar', label: 'Applications', icon: ClipboardList });
    if (role === "CW") menuItems.push({ href: '/cw', label: 'Applications', icon: ClipboardList });
  }

  menuItems.push({ href: '/notifications', label: 'Notifications', icon: Bell });

  return (
    <aside className="w-64 min-h-screen flex-shrink-0 bg-[#0B3D91] text-white fixed left-0 top-0 z-50 flex flex-col shadow-xl">
      {/* Top Section */}
      <div className="px-5 py-6 border-b border-white/10 flex items-center gap-3">
        <div className="w-12 h-12 bg-white rounded-md flex items-center justify-center shrink-0 shadow-inner overflow-hidden relative">
          <Image src="/iitropar logo.png" alt="IIT Ropar Logo" fill className="object-contain p-1" />
        </div>
        <div className="flex flex-col">
          <span className="font-extrabold text-sm tracking-wide leading-tight uppercase text-white">IIT ROPAR</span>
          <span className="text-[0.65rem] text-white/70 font-medium tracking-wide uppercase mt-0.5">Administrative ERP</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && item.href !== '#');
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-200",
                isActive 
                  ? "bg-white/15 text-white border-l-4 border-[#F4A300] rounded-l-none" 
                  : "text-white/70 hover:bg-white/10 hover:text-white border-l-4 border-transparent"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive ? "text-[#F4A300]" : "")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10 text-center">
        <p className="text-[0.65rem] text-white/50 tracking-wider">v2.1.0 © 2026</p>
        <p className="text-[0.65rem] text-white/50 tracking-wider">Indian Institute of Technology</p>
      </div>
    </aside>
  );
}
