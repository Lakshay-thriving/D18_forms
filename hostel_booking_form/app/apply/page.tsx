"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function NewBookingForm() {
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
    // @ts-ignore
    const val = type === "checkbox" ? e.target.checked : value;
    setFormData((prev) => ({ ...prev, [name]: val }));
  };

  const handleReset = () => {
    router.refresh();
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const totalGuests = Number(formData.totalMale) + Number(formData.totalFemale);

  const calculateNights = () => {
    if (!formData.arrivalDate || !formData.departureDate) return 0;
    const a = new Date(formData.arrivalDate).getTime();
    const d = new Date(formData.departureDate).getTime();
    const diff = (d - a) / (1000 * 60 * 60 * 24);
    return diff > 0 ? Math.ceil(diff) : 0;
  };

  // Reusable card container
  const Section = ({ title, num, children }: { title: string, num: string, children: React.ReactNode }) => (
    <section className="bg-white rounded-xl shadow-sm p-6 mb-4 border border-gray-100">
      <h3 className="text-base font-semibold text-[#0B3D91] border-b border-gray-100 pb-3 mb-4 flex items-center gap-2">
        <span className="w-6 h-6 rounded bg-[#F5F7FA] text-[#0B3D91] font-bold text-xs flex items-center justify-center">{num}</span>
        {title}
      </h3>
      {children}
    </section>
  );

  return (
    <div className="max-w-4xl mx-auto pb-24">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#222]">New Guest Room Booking</h1>
        <p className="text-sm text-gray-500 mt-1">Please fill in all details for your requisition.</p>
      </div>

      {error && (
        <div className="bg-[#ffebee] border border-[#ffcdd2] text-[#C62828] px-4 py-3 rounded-lg mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* 1. Applicant Details */}
        <Section title="Applicant Details" num="1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Applicant Name <span className="text-[#C62828]">*</span></label>
              <input required type="text" name="applicantName" value={formData.applicantName} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Designation <span className="text-[#C62828]">*</span></label>
              <input required type="text" name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Department / Section <span className="text-[#C62828]">*</span></label>
              <input required type="text" name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Employee Code / Entry No <span className="text-[#C62828]">*</span></label>
              <input required type="text" name="empCode" value={formData.empCode} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Contact Number <span className="text-[#C62828]">*</span></label>
              <input required type="tel" name="mobile" value={formData.mobile} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Email <span className="text-[#C62828]">*</span></label>
              <input required disabled type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed text-sm" />
            </div>
          </div>
        </Section>

        {/* 2. Guest Details */}
        <Section title="Guest Details" num="2">
          <div className="flex flex-col md:flex-row gap-6 mb-6 p-4 rounded-lg bg-[#F5F7FA] border border-gray-100 relative">
            <div className="flex-1 flex flex-col items-center">
              <label className="text-sm font-bold text-[#222] mb-2">Male Guests</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData(p => ({...p, totalMale: Math.max(0, p.totalMale - 1)}))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">-</button>
                <div className="w-6 text-center font-bold text-lg">{formData.totalMale}</div>
                <button type="button" onClick={() => setFormData(p => ({...p, totalMale: p.totalMale + 1}))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">+</button>
              </div>
            </div>
            <div className="w-px bg-gray-200 hidden md:block"></div>
            <div className="flex-1 flex flex-col items-center">
              <label className="text-sm font-bold text-[#222] mb-2">Female Guests</label>
              <div className="flex items-center gap-3">
                <button type="button" onClick={() => setFormData(p => ({...p, totalFemale: Math.max(0, p.totalFemale - 1)}))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">-</button>
                <div className="w-6 text-center font-bold text-lg">{formData.totalFemale}</div>
                <button type="button" onClick={() => setFormData(p => ({...p, totalFemale: p.totalFemale + 1}))} className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100">+</button>
              </div>
            </div>
            
            <div className="absolute right-6 top-1/2 -translate-y-1/2 text-center group cursor-help">
              <div className="text-[0.65rem] font-bold text-gray-400 uppercase">Total</div>
              <div className={`text-2xl font-black ${totalGuests > 2 ? 'text-[#C62828]' : 'text-[#0B3D91]'}`}>{totalGuests}</div>
              {totalGuests > 2 && (
                <div className="absolute bottom-full right-0 mb-2 w-32 bg-gray-900 text-white text-xs p-2 rounded shadow-lg text-center hidden group-hover:block">
                  Note: Max 2 guests per room
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#222] mb-1">Guest Name(s) <span className="text-[#C62828]">*</span></label>
              <textarea required name="guestNames" rows={2} value={formData.guestNames} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" placeholder="Enter names separated by commas" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Relation <span className="text-[#C62828]">*</span></label>
              <input required type="text" name="relation" value={formData.relation} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#222] mb-1">Contact Info <span className="text-[#C62828]">*</span></label>
              <input required type="text" name="guestContact" value={formData.guestContact} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-[#222] mb-1">Guest Address <span className="text-[#C62828]">*</span></label>
              <textarea required name="guestAddress" rows={2} value={formData.guestAddress} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
          </div>
        </Section>

        {/* 3. Visit Details */}
        <Section title="Visit Details" num="3">
          <label className="block text-sm font-semibold text-[#222] mb-1">Purpose of Visit <span className="text-[#C62828]">*</span></label>
          <textarea required name="purpose" rows={3} value={formData.purpose} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
        </Section>

        {/* 4. Room Selection */}
        <Section title="Room Selection" num="4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${formData.roomType === "CATEGORY_A_NON_AC" ? "border-[#0B3D91] ring-1 ring-[#0B3D91] bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <input type="radio" name="roomType" value="CATEGORY_A_NON_AC" checked={formData.roomType === "CATEGORY_A_NON_AC"} onChange={handleChange} className="sr-only" />
              <span className="flex flex-col flex-1">
                <span className="block text-sm font-bold text-[#222]">Non-AC Room</span>
                <span className="text-xs font-semibold text-[#F4A300] mt-1">₹400 / day / person</span>
              </span>
              <span className={`h-4 w-4 rounded-full border flex items-center justify-center mt-1 ${formData.roomType === "CATEGORY_A_NON_AC" ? "bg-[#0B3D91] border-transparent" : "bg-white border-gray-300"}`}>
                <span className="rounded-full bg-white w-1.5 h-1.5" />
              </span>
            </label>
            <label className={`relative flex cursor-pointer rounded-lg border p-4 shadow-sm focus:outline-none ${formData.roomType === "CATEGORY_B_AC" ? "border-[#0B3D91] ring-1 ring-[#0B3D91] bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}>
              <input type="radio" name="roomType" value="CATEGORY_B_AC" checked={formData.roomType === "CATEGORY_B_AC"} onChange={handleChange} className="sr-only" />
              <span className="flex flex-col flex-1">
                <span className="block text-sm font-bold text-[#222]">AC Room</span>
                <span className="text-xs font-semibold text-[#F4A300] mt-1">₹600 / day / person</span>
              </span>
              <span className={`h-4 w-4 rounded-full border flex items-center justify-center mt-1 ${formData.roomType === "CATEGORY_B_AC" ? "bg-[#0B3D91] border-transparent" : "bg-white border-gray-300"}`}>
                <span className="rounded-full bg-white w-1.5 h-1.5" />
              </span>
            </label>
          </div>
        </Section>

        {/* 5. Stay Duration */}
        <Section title="Stay Duration" num="5">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-[#222] mb-1">Arrival <span className="text-[#C62828]">*</span></label>
              <input required type="datetime-local" name="arrivalDate" value={formData.arrivalDate} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
            
            <div className="hidden sm:flex flex-col items-center justify-center pt-5 px-2">
              <div className="text-[#0B3D91] font-black text-lg">{calculateNights()}</div>
              <div className="text-[0.65rem] font-bold text-gray-400 uppercase">Nights</div>
            </div>

            <div className="flex-1 w-full">
              <label className="block text-sm font-semibold text-[#222] mb-1">Departure <span className="text-[#C62828]">*</span></label>
              <input required type="datetime-local" name="departureDate" value={formData.departureDate} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" />
            </div>
          </div>
        </Section>

        {/* 6. Payment Responsibility */}
        <Section title="Payment Responsibility" num="6">
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#222]">
              <input type="radio" name="paidBy" value="GUEST" checked={formData.paidBy === "GUEST"} onChange={handleChange} className="w-4 h-4 text-[#0B3D91] border-gray-300 focus:ring-[#0B3D91]" /> 
              Guest
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-[#222]">
              <input type="radio" name="paidBy" value="APPLICANT" checked={formData.paidBy === "APPLICANT"} onChange={handleChange} className="w-4 h-4 text-[#0B3D91] border-gray-300 focus:ring-[#0B3D91]" /> 
              Applicant
            </label>
          </div>
        </Section>

        {/* 7. Undertaking */}
        <Section title="Undertaking" num="7">
          <label className="flex items-start gap-3 cursor-pointer p-4 bg-[#F5F7FA] rounded-lg border border-gray-200 mb-4">
            <input required type="checkbox" name="undertakingAccepted" checked={formData.undertakingAccepted} onChange={handleChange} className="w-4 h-4 mt-0.5 text-[#0B3D91] border-gray-300 rounded focus:ring-[#0B3D91]" />
            <div>
              <p className="text-sm font-bold text-[#222]">I abide by the Institute Rules</p>
              <p className="text-xs text-gray-500 mt-1">I declare the information provided is valid, and the guest(s) will vacate on time without creating disruption.</p>
            </div>
          </label>
          
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-[#222] mb-1">Digital Signature <span className="text-[#C62828]">*</span></label>
            <input required type="text" name="applicantSignature" value={formData.applicantSignature} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" placeholder="Type applicant name" />
          </div>
        </Section>

        {/* 8. Remarks */}
        <Section title="General Remarks (Optional)" num="8">
          <textarea name="applicantRemarks" rows={2} value={formData.applicantRemarks} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B3D91] text-sm" placeholder="Any special arrangements..." />
        </Section>

        {/* Sticky Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-white border-t border-gray-200 p-4 z-40 bg-opacity-95 backdrop-blur shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
          <div className="max-w-4xl mx-auto flex items-center justify-end gap-4 px-6 md:px-0">
            <button type="button" onClick={handleReset} className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors">
              Reset Form
            </button>
            <button type="submit" disabled={loading} className="px-8 py-2.5 bg-[#0B3D91] hover:bg-[#082a63] text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center">
              {loading ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        </div>

      </form>
    </div>
  );
}
