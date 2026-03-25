"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function AppDashboard() {
  const { data: session, status } = useSession();
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (session?.user?.email) {
      fetch(`/api/bookings?email=${session.user.email}`)
        .then(res => res.json())
        .then(data => {
          setBookings(data);
          setLoading(false);
        });
    }
  }, [session]);

  if (status === "loading" || loading) return <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>Loading Dashboard...</div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <div>
          <h2 style={{ fontSize: '2rem', textTransform: 'uppercase', letterSpacing: '2px' }}>Applicant Dashboard</h2>
          <p style={{ color: '#555', marginTop: '0.5rem' }}>View and manage your hostel applications</p>
        </div>
        <Link href="/apply" className="btn">
          + New Application
        </Link>
      </header>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "4rem" }}>
          You have no room booking applications. Click "New Application" to get started.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {bookings.map(b => (
            <div key={b.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Rooms for {b.guestNames}</h3>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  <strong>Stay:</strong> {new Date(b.arrivalDate).toLocaleDateString()} to {new Date(b.departureDate).toLocaleDateString()}
                </p>
                <p style={{ fontSize: '0.9rem', color: '#555' }}>
                  <strong>Current Status:</strong> <span className="badge">{b.status.replace(/_/g, " ")}</span>
                </p>
              </div>
              <Link href={`/status/${b.id}`} className="btn btn-outline" style={{ padding: '0.5rem 1rem' }}>
                View Tracker
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
