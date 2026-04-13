"use client";
import React from "react";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Users, Building, MapPin, Phone, Briefcase, FileText, CheckCircle, XCircle } from "lucide-react";
import { format } from "date-fns";

export default function ApplicationDetails() {
  const { id } = useParams();

  const { data: booking, isLoading, isError } = useQuery({
    queryKey: ['booking', id],
    queryFn: async () => {
      const res = await fetch(`/api/bookings/${id}`);
      return res.json();
    },
    enabled: !!id,
  });

  if (isLoading) return <div className="flex justify-center p-20 text-[#0B3D91]"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30" opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg></div>;
  if (isError || !booking) return <div className="text-center p-20 text-[#C62828] font-bold bg-white rounded-lg shadow-sm border border-red-100">Failed to load booking details.</div>;

  const isRejected = booking.status.includes("REJECTED");
  const isCompleted = booking.status === "COMPLETED";
  const steps = ["Submitted", "JA Verified", "AR Approved", "CW Approved"];
  
  let currentStepIndex = 0;
  if (booking.status === "JA_APPROVED_PENDING_AR") currentStepIndex = 1;
  else if (booking.status === "AR_APPROVED_PENDING_CW") currentStepIndex = 2;
  else if (booking.status === "COMPLETED") currentStepIndex = 4;

  if (isRejected) {
    if (booking.status === "JA_REJECTED") currentStepIndex = 1;
    else if (booking.status === "AR_REJECTED") currentStepIndex = 2;
    else if (booking.status === "CW_REJECTED") currentStepIndex = 3;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header */}
      <h1 className="text-2xl font-bold text-[#222]">Booking Tracker</h1>

      {/* Stepper Logic Pipeline */}
      <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-8 mt-4">
        
        <div className="relative flex items-center justify-between max-w-2xl mx-auto px-4 z-0 mt-4 mb-4">
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[3px] bg-gray-100 -z-10"></div>
          
          {/* Progress Bar foreground */}
          <div 
            className={`absolute left-0 top-1/2 -translate-y-1/2 h-[3px] transition-all -z-10 ${isRejected ? 'bg-[#C62828]' : 'bg-[#2E7D32]'}`}
            style={{ width: `${Math.min(currentStepIndex, steps.length - 1) * 33.33}%` }}
          ></div>

          {steps.map((step, idx) => {
            const isCompletedStage = idx < currentStepIndex || (isCompleted && idx === 3);
            const isCurrentRejectedStage = isRejected && idx === currentStepIndex;
            const isPendingStage = idx === currentStepIndex && !isRejected;

            let circleClass = "bg-white border-[3px] border-gray-200 text-transparent";
            let textClass = "text-gray-400";
            
            if (isCompletedStage) {
              circleClass = "bg-[#2E7D32] border-[#2E7D32] text-white shadow-md";
              textClass = "text-[#222] font-bold";
            } else if (isCurrentRejectedStage) {
              circleClass = "bg-[#C62828] border-[#C62828] text-white shadow-md shadow-red-500/20";
              textClass = "text-[#C62828] font-bold";
            } else if (isPendingStage) {
              circleClass = "bg-white border-[3px] border-[#F4A300] text-[#F4A300] shadow-md";
              textClass = "text-[#F4A300] font-bold";
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-3 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${circleClass}`}>
                  {isCompletedStage && <CheckCircle className="w-5 h-5" />}
                  {isCurrentRejectedStage && <XCircle className="w-5 h-5" />}
                  {isPendingStage && <div className="w-2.5 h-2.5 rounded-full bg-[#F4A300]"></div>}
                </div>
                <div className={`text-[0.65rem] uppercase tracking-widest ${textClass}`}>{step}</div>
              </div>
            );
          })}
        </div>

        {isRejected && (
          <div className="mt-8 bg-[#ffebee] border border-red-200 rounded-lg p-5 text-red-900 shadow-sm">
            <h4 className="font-bold flex items-center gap-2 mb-2"><XCircle className="w-5 h-5 text-[#C62828]" /> Application Rejected</h4>
            <div className="text-sm bg-white p-3 rounded border border-red-100 shadow-sm font-medium">
              <span className="text-xs uppercase font-bold text-gray-500 block mb-1">Reason:</span>
              {booking.jaRemarks || booking.arRemarks || booking.cwRemarks || "No remarks were provided by the administrator."}
            </div>
          </div>
        )}
      </section>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Guest Details */}
        <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="px-5 py-4 border-b border-gray-100 bg-[#F5F7FA]">
            <h3 className="font-bold text-[#0B3D91] flex items-center gap-2"><Users className="w-4 h-4" /> Guest Information</h3>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest block mb-1">Names</span>
              <p className="font-semibold text-gray-900 text-sm">{booking.guestNames}</p>
            </div>
            <div className="flex justify-between">
              <div>
                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest block mb-1">Relation</span>
                <p className="font-semibold text-gray-900 text-sm">{booking.relation}</p>
              </div>
              <div className="text-right">
                <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest block mb-1">Total Guests</span>
                <p className="font-semibold text-gray-900 text-sm">{booking.totalMale + booking.totalFemale} (Max 2)</p>
              </div>
            </div>
            <div>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest block mb-1">Contact</span>
              <p className="font-semibold text-gray-900 text-sm flex items-center gap-1.5"><Phone className="w-3 h-3 text-gray-400" /> {booking.guestContact}</p>
            </div>
            <div>
              <span className="text-[0.65rem] font-bold text-gray-400 uppercase tracking-widest block mb-1">Address</span>
              <p className="font-semibold text-gray-900 text-sm flex items-start gap-1.5"><MapPin className="w-3 h-3 text-gray-400 shrink-0 mt-0.5" /> {booking.guestAddress}</p>
            </div>
          </div>
        </section>

        {/* Stay & Applicant */}
        <div className="space-y-6">
          <section className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 border-b border-gray-100 bg-[#F5F7FA]">
              <h3 className="font-bold text-[#0B3D91] flex items-center gap-2"><Building className="w-4 h-4" /> Accommodation</h3>
            </div>
            <div className="p-5 space-y-3">
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-semibold text-gray-500">Arrival</span>
                <p className="font-bold text-gray-900 text-sm">{format(new Date(booking.arrivalDate), "PPp")}</p>
              </div>
              <div className="flex justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-semibold text-gray-500">Departure</span>
                <p className="font-bold text-gray-900 text-sm">{format(new Date(booking.departureDate), "PPp")}</p>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-xs font-semibold text-gray-500">Category</span>
                <span className="bg-blue-50 text-[#0B3D91] px-2.5 py-1 rounded-md text-[0.7rem] font-bold border border-blue-100">
                  {booking.roomType.replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </section>

          <section className="bg-white border border-gray-200 rounded-xl shadow-sm p-5">
            <h3 className="font-bold text-[#222] text-sm flex items-center gap-2 mb-3"><Briefcase className="w-4 h-4 text-gray-500" /> Authorized Applicant</h3>
            <div className="space-y-2">
              <p className="font-semibold text-gray-800 text-sm">{booking.applicantName}</p>
              <p className="text-xs font-medium text-gray-500">{booking.department} ({booking.designation}) • {booking.empCode}</p>
              <p className="text-xs font-bold text-[#0B3D91] mt-2 block pt-2 border-t border-gray-100">Paid By: <span className="opacity-80 ml-1">{booking.paidBy}</span></p>
            </div>
          </section>
        </div>
        
        <div className="md:col-span-2 bg-white border border-gray-200 rounded-xl shadow-sm p-6 mt-2">
          <h3 className="font-bold text-[#0B3D91] flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-[#0B3D91]" /> Detailed Purpose</h3>
          <p className="font-medium text-gray-700 text-sm leading-relaxed p-4 bg-gray-50 rounded-lg border border-gray-100">
            {booking.purpose}
          </p>
        </div>

      </div>

    </div>
  );
}
