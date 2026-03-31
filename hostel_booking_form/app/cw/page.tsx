"use client";
import { useEffect, useState } from "react";

export default function CWDashboard() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cwRemarks, setCwRemarks] = useState("");
  const [cwSignature, setCwSignature] = useState("");
  const [processingId, setProcessingId] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const fetchBookings = () => {
    fetch("/api/bookings?status=AR_APPROVED_PENDING_CW")
      .then(res => res.json())
      .then(data => { setBookings(data); setLoading(false); });
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    if (!cwSignature.trim()) return alert("Please provide your digital signature");
    setLoadingId(id);
    await fetch(`/api/bookings/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status: action === "APPROVE" ? "COMPLETED" : "CW_REJECTED",
        cwRemarks, cwSignature, cwApprovedAt: new Date().toISOString()
      }),
    });
    setLoadingId(""); setProcessingId(""); setCwSignature(""); setCwRemarks("");
    fetchBookings();
  };

  if (loading) return <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>Loading CW Dashboard...</div>;

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ marginBottom: '2rem' }}>
        <h2 style={{ textTransform: 'uppercase' }}>CHIEF WARDEN DASHBOARD</h2>
        <p style={{ fontWeight: 'bold' }}>Pending Final Approvals ({bookings.length})</p>
      </header>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: "center", padding: "3rem" }}>NO PENDING FINAL APPROVALS</div>
      ) : (
        <div style={{ display: 'grid', gap: '2rem' }}>
          {bookings.map(b => (
            <div key={b.id} className="glass-panel" style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: '2rem' }}>
              <div>
                <h3 style={{ borderBottom: '1px solid black', paddingBottom: '0.5rem', marginBottom: '1rem' }}>APPLICANT: {b.applicantName}</h3>
                <p><strong>Department:</strong> {b.department} | <strong>Mobile:</strong> {b.mobile}</p>
                <p><strong>Dates:</strong> {new Date(b.arrivalDate).toLocaleDateString()} to {new Date(b.departureDate).toLocaleDateString()}</p>
                <p><strong>Room Requested:</strong> {b.roomType.replace(/_/g, " ")}</p>
                <p><strong>Hostel Allotted by JA:</strong> <span style={{ fontWeight: 'bold' }}>{b.hostelAllotted}</span></p>
                {b.arRemarks && <p><strong>AR Remarks:</strong> {b.arRemarks} (Signed: {b.arSignature})</p>}
                <div style={{ background: '#f1f1f1', padding: '1rem', border: '1px solid black', marginTop: '1rem' }}>
                  <strong>Guests ({b.totalMale + b.totalFemale}):</strong> {b.guestNames}
                </div>
              </div>

              <div style={{ padding: '1.5rem', border: '2px solid black' }}>
                <h4 style={{ marginBottom: '1rem', textTransform: 'uppercase' }}>ACTION PANEL</h4>
                
                <div className="form-group">
                  <label className="form-label">Digital Signature*</label>
                  <input type="text" className="form-input" placeholder="Type name to sign" value={processingId === b.id ? cwSignature : ""} onChange={(e) => { setProcessingId(b.id); setCwSignature(e.target.value) }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Remarks / Rejection Reason</label>
                  <textarea className="form-textarea" style={{ minHeight: '60px' }} value={processingId === b.id ? cwRemarks : ""} onChange={(e) => { setProcessingId(b.id); setCwRemarks(e.target.value) }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button className="btn" style={{ flex: 1, background: 'black', color: 'white' }} onClick={() => handleAction(b.id, "APPROVE")} disabled={loadingId === b.id}>{loadingId === b.id ? 'PROCESSING...' : 'FINAL APPROVE'}</button>
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
