"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function BookingForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    applicantName: "",
    designation: "",
    department: "",
    empCode: "",
    mobile: "",
    email: "",
    totalMale: 0,
    totalFemale: 0,
    guestNames: "",
    relation: "",
    guestAddress: "",
    guestContact: "",
    guestEmail: "",
    purpose: "",
    roomType: "CATEGORY_A_NON_AC",
    arrivalDate: "",
    departureDate: "",
    paidBy: "GUEST",
    undertakingAccepted: false,
    applicantSignature: "",
    applicantRemarks: ""
  });

  useEffect(() => {
    if (session?.user?.email) {
      setFormData(prev => ({ ...prev, email: session?.user?.email as string }));
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit booking");

      router.push(`/status/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalGuests = Number(formData.totalMale) + Number(formData.totalFemale);

  return (
    <div className="container" style={{ paddingBottom: '4rem' }}>
      <header style={{ textAlign: 'center', marginBottom: '3rem', paddingTop: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800 }}>Indian Institute of Technology Ropar</h1>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 500, color: 'var(--text-muted)' }}>Request for Reservation of Hostel Guest Room</h2>
      </header>

      {error && (
        <div style={{ border: '2px solid black', padding: '1rem', marginBottom: '1.5rem', fontWeight: 600 }}>
          ⚠ ERROR: {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <section className="glass-panel">
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>1. Applicant Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Applicant Name*</label>
              <input required type="text" name="applicantName" className="form-input" value={formData.applicantName} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Designation*</label>
              <input required type="text" name="designation" className="form-input" value={formData.designation} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Department / Section*</label>
              <input required type="text" name="department" className="form-input" value={formData.department} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Employee Code / Entry Number*</label>
              <input required type="text" name="empCode" className="form-input" value={formData.empCode} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Mobile Number*</label>
              <input required type="tel" name="mobile" className="form-input" value={formData.mobile} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Email (@iitrpr.ac.in)*</label>
              <input required type="email" name="email" className="form-input" disabled value={formData.email} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="glass-panel">
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>2. Guest Details</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1.5rem', marginTop: '1.5rem', background: 'var(--bg-alt)', padding: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Male Guests</label>
              <input type="number" min="0" name="totalMale" className="form-input" value={formData.totalMale} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Female Guests</label>
              <input type="number" min="0" name="totalFemale" className="form-input" value={formData.totalFemale} onChange={handleChange} />
            </div>
            <div className="form-group" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
              <label className="form-label mb-0">Total</label>
              <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{totalGuests}</span>
            </div>
          </div>
          {totalGuests > 2 && <span className="error-text" style={{ marginTop: '0.5rem', display: 'block' }}>Max 2 persons per room permitted.</span>}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Guest Name(s)*</label>
              <textarea required name="guestNames" className="form-textarea" value={formData.guestNames} onChange={handleChange} placeholder="Enter names if multiple" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="form-group">
                <label className="form-label">Relation with Applicant*</label>
                <input required type="text" name="relation" className="form-input" value={formData.relation} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Guest Contact Number*</label>
                <input required type="tel" name="guestContact" className="form-input" value={formData.guestContact} onChange={handleChange} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Guest Address*</label>
              <textarea required name="guestAddress" className="form-textarea" style={{ minHeight: '80px' }} value={formData.guestAddress} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="glass-panel">
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>3. Visit & Room Details</h3>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Purpose of Visit*</label>
            <textarea required name="purpose" className="form-textarea" style={{ minHeight: '80px' }} value={formData.purpose} onChange={handleChange} />
          </div>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid black', marginBottom: '0.5rem', cursor: 'pointer' }}>
              <input type="radio" name="roomType" value="CATEGORY_A_NON_AC" checked={formData.roomType === "CATEGORY_A_NON_AC"} onChange={handleChange} style={{ transform: 'scale(1.2)' }} />
              <span><strong>Category A (Non-AC)</strong> - ₹400/day/person</span>
            </label>
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem', border: '1px solid black', cursor: 'pointer' }}>
              <input type="radio" name="roomType" value="CATEGORY_B_AC" checked={formData.roomType === "CATEGORY_B_AC"} onChange={handleChange} style={{ transform: 'scale(1.2)' }} />
              <span><strong>Category B (AC)</strong> - ₹600/day/person</span>
            </label>
          </div>
        </section>

        <section className="glass-panel">
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>4. Stay Duration</h3>
          <div style={{ padding: '1rem', background: '#f1f1f1', borderLeft: '4px solid black', marginBottom: '1.5rem', fontWeight: 500 }}>
            NOTICE: Kindly apply at least 4 days in advance. Checkout time is 12:00 PM.
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
            <div className="form-group">
              <label className="form-label">Date and Time of Arrival*</label>
              <input required type="datetime-local" name="arrivalDate" className="form-input" value={formData.arrivalDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Date and Time of Departure*</label>
              <input required type="datetime-local" name="departureDate" className="form-input" value={formData.departureDate} onChange={handleChange} />
            </div>
          </div>
        </section>

        <section className="glass-panel">
          <h3 style={{ borderBottom: '2px solid var(--border-color)', paddingBottom: '0.5rem' }}>5. Payment & Undertaking</h3>
          <div className="form-group" style={{ marginTop: '1.5rem' }}>
            <label className="form-label">Payment Responsibility*</label>
            <div style={{ display: 'flex', gap: '2rem', marginTop: '0.5rem' }}>
              <label style={{ cursor: 'pointer', fontWeight: 600 }}><input type="radio" name="paidBy" value="GUEST" checked={formData.paidBy === "GUEST"} onChange={handleChange} /> GUEST</label>
              <label style={{ cursor: 'pointer', fontWeight: 600 }}><input type="radio" name="paidBy" value="APPLICANT" checked={formData.paidBy === "APPLICANT"} onChange={handleChange} /> APPLICANT</label>
            </div>
          </div>

          <div className="form-group" style={{ marginTop: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', cursor: 'pointer', padding: '1.5rem', background: '#f9f9f9', border: '1px solid var(--border-color)' }}>
              <input required type="checkbox" name="undertakingAccepted" checked={formData.undertakingAccepted} onChange={handleChange} style={{ transform: 'scale(1.5)', marginTop: '0.25rem' }} />
              <span style={{ fontWeight: 500 }}>
                I agree to verify that the above information is correct. I assure that the guest(s) will abide by the hostel rules. I agree to vacate the room on time as requested.
              </span>
            </label>
          </div>

          <div className="form-group" style={{ maxWidth: '400px', marginTop: '1.5rem' }}>
            <label className="form-label">Applicant Digital Signature*</label>
            <input required type="text" name="applicantSignature" className="form-input" placeholder="Type your full name to e-sign" value={formData.applicantSignature} onChange={handleChange} />
          </div>
        </section>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', maxWidth: '400px', fontSize: '1.2rem', padding: '1rem', borderRadius: 0 }} disabled={loading}>
            {loading ? "SUBMITTING..." : "SUBMIT APPLICATION"}
          </button>
        </div>
      </form>
    </div>
  );
}
