"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function StatusTracker() {
  const { id } = useParams();
  const [booking, setBooking] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/bookings/${id}`)
      .then(res => res.json())
      .then(data => {
        setBooking(data);
        setLoading(false);
      });
  }, [id]);

  if (loading) return <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>Loading tracker...</div>;
  if (!booking) return <div className="container" style={{ textAlign: "center", marginTop: "4rem" }}>Booking not found</div>;

  const steps = [
    { key: "SUBMITTED", label: "Submitted by Applicant" },
    { key: "JA_APPROVED_PENDING_AR", label: "JA Verification" },
    { key: "AR_APPROVED_PENDING_CW", label: "AR Approval" },
    { key: "COMPLETED", label: "Chief Warden Approval / Completed" }
  ];

  let currentStepIndex = steps.findIndex(s => s.key === booking.status);
  const isRejected = booking.status.includes("REJECTED");
  const isCompleted = booking.status === "COMPLETED";

  // If rejected, the process halted at the step prior to the rejection label
  if (isRejected) {
    if (booking.status === "JA_REJECTED") currentStepIndex = 0;
    else if (booking.status === "AR_REJECTED") currentStepIndex = 1;
    else if (booking.status === "CW_REJECTED") currentStepIndex = 2;
  }

  return (
    <div className="container">
      <section className="glass-panel" style={{ maxWidth: '800px', margin: '2rem auto' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '2rem', textTransform: 'uppercase' }}>Booking Status Tracker</h2>
        
        <div style={{ background: '#f9f9f9', border: '1px solid black', padding: '1.5rem', marginBottom: '2rem' }}>
          <p><strong>Applicant:</strong> {booking.applicantName} ({booking.empCode})</p>
          <p><strong>Dates:</strong> {new Date(booking.arrivalDate).toLocaleDateString()} to {new Date(booking.departureDate).toLocaleDateString()}</p>
          <p><strong>Room Type:</strong> {booking.roomType.replace(/_/g, " ")}</p>
          {booking.hostelAllotted && (
            <p style={{ marginTop: '1rem', fontWeight: 600 }}>
              HOSTEL ALLOTTED: {booking.hostelAllotted}
            </p>
          )}
        </div>

        {isRejected && (
          <div style={{ padding: '1.5rem', border: '2px solid black', background: '#000', color: '#fff', marginBottom: '2rem', fontWeight: 600 }}>
            NOTICE: APPLICATION REJECTED / SENT BACK
            <br />
            <span style={{ fontSize: '0.9rem', fontWeight: 400 }}>Stage: {booking.status.replace(/_/g, " ")}</span>
            
            {/* Displaying rejection comments */}
            <div style={{ marginTop: '1rem', padding: '1rem', background: '#222', borderLeft: '4px solid #fff' }}>
              <p style={{ margin: 0 }}><strong>Comment / Reason:</strong></p>
              {booking.status === "JA_REJECTED" && <p>{booking.jaRemarks || "No remarks provided."}</p>}
              {booking.status === "AR_REJECTED" && <p>{booking.arRemarks || "No remarks provided."}</p>}
              {booking.status === "CW_REJECTED" && <p>{booking.cwRemarks || "No remarks provided."}</p>}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {steps.map((step, index) => {
            let statusIcon = "—";
            let opacity = 0.5;
            
            if (currentStepIndex >= index || isCompleted) {
              statusIcon = "✓";
              opacity = 1;
            } else if (!isRejected && index === currentStepIndex + 1) {
              statusIcon = "O";
              opacity = 1;
            }

            return (
              <div key={step.key} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: 'white', border: `1px solid black`, opacity }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>[{statusIcon}]</span>
                <span style={{ fontWeight: 600, flex: 1, textTransform: 'uppercase' }}>{step.label}</span>
                {(currentStepIndex >= index || isCompleted) && <span style={{ fontSize: '0.875rem', fontWeight: 'bold' }}>DONE</span>}
              </div>
            );
          })}
        </div>

        {isCompleted && (
          <div style={{ textAlign: 'center', padding: '2rem', border: '2px dashed black', fontWeight: 600, marginTop: '2rem', textTransform: 'uppercase' }}>
            Guest Room Booking Confirmed!
          </div>
        )}
      </section>
    </div>
  );
}
