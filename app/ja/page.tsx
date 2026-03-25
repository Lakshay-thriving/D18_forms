"use client";
import { useEffect, useState } from "react";

export default function JADashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hostelAllotted, setHostelAllotted] = useState("");
  const [jaRemarks, setJaRemarks] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const hostels = [
    "Chenab Boys Hostel", "Satluj Boys Hostel", "Beas Boys Hostel", "Brahmaputra Boys Hostel",
    "Raavi Girls Hostel", "Brahmaputra Girls Hostel"
  ];

  const fetchBookings = () => {
    fetch("/api/bookings?status=SUBMITTED")
      .then(res => res.json())
      .then(data => { setBookings(data); setLoading(false); });
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (action === "APPROVE" && !hostelAllotted) return alert("Please assign a hostel before approving");
    setLoadingId(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: action === "APPROVE" ? "JA_APPROVED_PENDING_AR" : "JA_REJECTED",
        hostelAllotted: action === "APPROVE" ? hostelAllotted : null,
        jaRemarks, jaApprovedAt: new Date().toISOString()
      }),
    });
    setLoadingId(""); setProcessingId(""); setHostelAllotted(""); setJaRemarks("");
    fetchBookings();
  };

  if (loading) return <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>Loading JA Dashboard...</div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ textTransform: 'uppercase' }}>JUNIOR ASSISTANT DASHBOARD</h2>
        <p style={{ fontWeight: 'bold' }}>Pending Applications ({bookings.length})</p>
      </header>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>NO PENDING APPLICATIONS</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {bookings.map(b => (
            <div key={b.id} className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem' }}>
              <div>
                <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem', marginBottom: '1rem' }}>APPLICANT: {b.applicantName}</h3>
                <p><strong>Department:</strong> {b.department} | <strong>Mobile:</strong> {b.mobile}</p>
                <p><strong>Dates:</strong> {new Date(b.arrivalDate).toLocaleDateString()} to {new Date(b.departureDate).toLocaleDateString()}</p>
                <p><strong>Room Requested:</strong> {b.roomType.replace(/_/g, " ")}</p>
                <p><strong>Purpose:</strong> {b.purpose}</p>
                <div style={{ background: '#f1f1f1', padding: '1rem', border: '1px solid black', marginTop: '1rem' }}>
                  <strong>Guests ({b.totalMale + b.totalFemale}):</strong> {b.guestNames}
                </div>
              </div>

              <div style={{ padding: '1.5rem', border: '2px solid black' }}>
                <h4 style={{ marginBottom: '1rem', textTransform: 'uppercase' }}>ACTION PANEL</h4>
                <div className="form-group">
                  <label className="form-label">Assign Hostel*</label>
                  <select className="form-select" value={processingId === b.id ? hostelAllotted : ""} onChange={(e) => { setProcessingId(b.id); setHostelAllotted(e.target.value) }}>
                    <option value="">-- Select Hostel --</option>
                    {hostels.map(h => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks / Rejection Reason</label>
                  <textarea className="form-textarea" style={{ minHeight: '60px' }} value={processingId === b.id ? jaRemarks : ""} onChange={(e) => { setProcessingId(b.id); setJaRemarks(e.target.value) }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn" style={{ flex: 1, background: 'black', color: 'white' }} onClick={() => handleAction(b.id, "APPROVE")} disabled={loadingId === b.id}>{loadingId === b.id ? 'PROCESSING...' : 'APPROVE'}</button>
                  <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => handleAction(b.id, "REJECT")} disabled={loadingId === b.id}>REJECT</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
