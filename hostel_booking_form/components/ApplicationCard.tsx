import { Calendar, Clock } from "lucide-react";
import { format, differenceInDays, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ApplicationCard({ booking }: { booking: any }) {

  const parseStatus = (status: string) => {
    let color = "bg-blue-100 text-blue-700";
    let dot = "bg-blue-600 border-blue-600";
    
    if (status === "COMPLETED") { color = "bg-green-100 text-green-600"; dot = "bg-green-500 border-green-500"; }
    else if (status.includes("REJECTED")) { color = "bg-red-100 text-red-600"; dot = "bg-red-500 border-red-500"; }
    else if (status.includes("PENDING") || status === "SUBMITTED") { color = "bg-yellow-100 text-yellow-700"; dot = "bg-yellow-400 border-yellow-400"; }
    
    return { color, dot };
  };

  const statusTheme = parseStatus(booking.status || "PENDING");
  const borderAccent = statusTheme.dot.split(" ")[1]; // extract border-color class

  const nights = differenceInDays(new Date(booking.departureDate), new Date(booking.arrivalDate));
  
  const steps = [
    { label: "Submitted", status: "COMPLETED" },
    { label: "JA", status: booking.status === "JA_REJECTED" ? "REJECTED" : (["JA_APPROVED_PENDING_AR", "AR_APPROVED_PENDING_CW", "COMPLETED", "AR_REJECTED", "CW_REJECTED"].includes(booking.status) ? "COMPLETED" : "PENDING") },
    { label: "AR", status: booking.status === "AR_REJECTED" ? "REJECTED" : (["AR_APPROVED_PENDING_CW", "COMPLETED", "CW_REJECTED"].includes(booking.status) ? "COMPLETED" : "PENDING") },
    { label: "CW", status: booking.status === "CW_REJECTED" ? "REJECTED" : (booking.status === "COMPLETED" ? "COMPLETED" : "PENDING") }
  ];

  const formatStatusText = (status: string) => {
    if (status === "COMPLETED") return "Approved";
    if (status.includes("REJECTED")) return "Rejected";
    return "Pending";
  }

  // SLA Calculation
  const createdDate = new Date(booking.createdAt || booking.arrivalDate);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60));
  
  let slaBadge = null;
  const isPending = booking.status === "PENDING" || booking.status === "SUBMITTED" || booking.status.includes("PENDING");
  if (isPending) {
    if (diffInHours > 48) {
      slaBadge = <span className="bg-red-50 text-[#C62828] px-2 py-0.5 rounded text-[0.65rem] font-bold border border-red-200">Delayed (&gt; 48h)</span>;
    } else if (diffInHours > 24) {
      slaBadge = <span className="bg-yellow-50 text-[#F4A300] px-2 py-0.5 rounded text-[0.65rem] font-bold border border-yellow-200">Pending {diffInHours}h</span>;
    }
  }

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border-l-4 hover:shadow-md transition overflow-hidden flex flex-col", borderAccent)}>
      <div className="p-5 flex flex-col h-full">
        
        {/* Top Row: Title & Request ID */}
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-base text-gray-800 leading-tight pr-4">{booking.guestNames}</h3>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-xs text-gray-400 font-medium tracking-wider">
              GR-2026-{booking.id ? booking.id.split('-')[0].substring(0, 4).toUpperCase() : "XX"}
            </span>
            {slaBadge}
          </div>
        </div>

        {/* Second Row: Dates, Time & Badge */}
        <div className="flex flex-col gap-2 mb-5 pb-5 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500 font-medium">
              <Calendar className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
              <span>{format(new Date(booking.arrivalDate), "d MMM")} &rarr; {format(new Date(booking.departureDate), "d MMM")} &bull; {nights > 0 ? nights : 1} night{nights !== 1 && 's'}</span>
            </div>
            <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0", statusTheme.color)}>
              {formatStatusText(booking.status)}
            </div>
          </div>
          
          <div className="flex items-center text-xs text-gray-400 font-medium">
            <Clock className="w-3.5 h-3.5 mr-2 shrink-0" />
            Applied {formatDistanceToNow(new Date(booking.createdAt || booking.arrivalDate), { addSuffix: true })}
          </div>
        </div>

        {/* Third Row: 4-step Stepper */}
        <div className="flex items-center justify-between relative mb-6 pt-2">
          <div className="absolute left-0 top-2.5 w-full h-[2px] bg-gray-200 -z-10"></div>
          {steps.map((step, idx) => {
            let circleClass = "bg-gray-200 text-transparent";
            let textClass = "text-gray-400";
            
            if (step.status === "COMPLETED") {
              circleClass = "bg-blue-600 border border-blue-600";
              textClass = "text-blue-600 font-medium";
            } else if (step.status === "REJECTED") {
              circleClass = "bg-red-500 border border-red-500";
              textClass = "text-red-500 font-medium";
            } else {
              const isCurrent = steps.findIndex(s => s.status === "PENDING") === idx;
              if (isCurrent && !steps.some(s => s.status === "REJECTED")) {
                circleClass = "bg-white border-[2px] border-blue-600 ring-4 ring-blue-50";
                textClass = "text-gray-800 font-medium";
              }
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 bg-white px-2 z-0">
                <div className={cn("w-3.5 h-3.5 rounded-full flex items-center justify-center", circleClass)}></div>
                <div className={cn("text-xs w-8 text-center leading-none", textClass)}>{step.label}</div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom CTA Row */}
        <div className="mt-auto pt-2 flex justify-end">
          <Link 
            href={`/status/${booking.id}`} 
            className="flex items-center gap-1.5 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-blue-700 transition"
          >
            View Tracker
          </Link>
        </div>
      </div>
    </div>
  );
}
