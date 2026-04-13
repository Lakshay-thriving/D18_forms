"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { User, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const getAvatarColor = (name: string) => {
  const colors = ["bg-[#0B3D91]", "bg-[#2E7D32]", "bg-[#C62828]", "bg-[#F4A300]", "bg-slate-800"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function Header() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (pathname === '/login') return null;

  const pathParts = pathname.split('/').filter(Boolean);
  let breadcrumb = "Home";
  let pageTitle = "Booking Portal";
  
  if (pathParts.length > 0) {
    if (pathParts[0].includes('apply')) {
      breadcrumb = "Home > Guest Room Booking";
      pageTitle = "Guest Room Booking";
    } else if (['status', 'ja', 'ar', 'cw'].includes(pathParts[0])) {
      breadcrumb = "Home > Applications";
      pageTitle = "Applications Dashboard";
    } else if (pathParts[0] === 'profile') {
      breadcrumb = "Home > User Profile";
      pageTitle = "User Profile";
    }
  }

  const emailUser = session?.user?.email?.split('@')[0] || "User";
  const initials = emailUser.substring(0, 2).toUpperCase();
  const avatarColor = getAvatarColor(emailUser);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (session?.user as any)?.role || "USER";

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex justify-between items-center px-8 shrink-0 sticky top-0 z-40">
      <div>
        <h2 className="text-xl font-bold text-[#222] leading-tight">
          {pageTitle}
        </h2>
        <div className="text-xs text-gray-500 font-medium mt-0.5">
          {breadcrumb}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {session ? (
          <div className="flex items-center gap-4">
            <div className="text-right flex flex-col justify-center">
              <div className="text-sm font-bold text-[#222] leading-none mb-1">
                {emailUser}
              </div>
              <div className="text-[0.65rem] font-black text-[#0B3D91] uppercase tracking-widest leading-none">
                {role}
              </div>
            </div>
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-sm ring-2 ring-gray-100 hover:ring-gray-300 transition-all cursor-pointer focus:outline-none", avatarColor)}
              >
                {initials}
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden py-1 z-50">
                  <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                    <p className="text-sm font-bold text-[#222] truncate">{emailUser}</p>
                    <p className="text-[0.65rem] font-bold text-[#F4A300] uppercase tracking-wider">{role}</p>
                  </div>
                  <Link 
                    href="/profile" 
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:text-[#0B3D91] transition-colors"
                  >
                    <User className="w-4 h-4" /> View Profile
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-[#C62828] hover:bg-red-50 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500 font-medium">Not logged in</div>
        )}
      </div>
    </header>
  );
}
