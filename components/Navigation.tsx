"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const { data: session } = useSession();
  const pathname = usePathname();

  if (pathname === '/login') return null;

  return (
    <nav style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e5e5e5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff' }}>
      <Link href="/" style={{ textDecoration: 'none', color: '#000', fontWeight: 'bold', fontSize: '1.2rem', letterSpacing: '-0.5px' }}>
        IIT ROPAR BOOKINGS
      </Link>

      <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
        {session ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#555' }}>
              Logged in as <strong>{(session.user as any)?.role}</strong> ({session.user?.email})
            </span>
            <button onClick={() => signOut()} className="btn btn-outline" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
              Sign Out
            </button>
          </>
        ) : (
          <Link href="/login" className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
