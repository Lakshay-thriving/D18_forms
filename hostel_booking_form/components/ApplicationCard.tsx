import { Calendar, ArrowRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";
import Link from "next/link";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function ApplicationCard({ booking }: { booking: any }) {

  const parseStatus = (status: string) => {
    let color = "bg-blue-100 text-blue-700";
    let dot = "bg-blue-500";
    
    if (status === "COMPLETED") { color = "bg-[#e8f5e9] text-[#2E7D32]"; dot = "bg-[#2E7D32]"; }
    else if (status.includes("REJECTED")) { color = "bg-[#ffebee] text-[#C62828]"; dot = "bg-[#C62828]"; }
    else if (status.includes("PENDING")) { color = "bg-amber-100 text-[#F4A300]"; dot = "bg-[#F4A300]"; }
    
    return { color, dot };
  };

  const statusTheme = parseStatus(booking.status);
  const borderAccent = statusTheme.dot.replace("bg-", "border-");

  const nights = differenceInDays(new Date(booking.departureDate), new Date(booking.arrivalDate));
  
  const steps = [
    { label: "Submitted", status: "COMPLETED" },
    { label: "JA Verified", status: booking.status === "JA_REJECTED" ? "REJECTED" : (["JA_APPROVED_PENDING_AR", "AR_APPROVED_PENDING_CW", "COMPLETED", "AR_REJECTED", "CW_REJECTED"].includes(booking.status) ? "COMPLETED" : "PENDING") },
    { label: "AR Approved", status: booking.status === "AR_REJECTED" ? "REJECTED" : (["AR_APPROVED_PENDING_CW", "COMPLETED", "CW_REJECTED"].includes(booking.status) ? "COMPLETED" : "PENDING") },
    { label: "Chief Warden", status: booking.status === "CW_REJECTED" ? "REJECTED" : (booking.status === "COMPLETED" ? "COMPLETED" : "PENDING") }
  ];

  return (
    <div className={cn("bg-white rounded-xl shadow-sm border-l-4 overflow-hidden flex flex-col", borderAccent, "border-y border-y-gray-100 border-r border-r-gray-100")}>
      <div className="p-5 flex flex-col h-full">
        
        {/* Top Row: Title & Status Badge */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-gray-800 text-base leading-tight pr-4">Rooms for {booking.guestNames}</h3>
          <div className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[0.65rem] font-bold uppercase tracking-widest whitespace-nowrap shrink-0", statusTheme.color)}>
            <span className={cn("w-1.5 h-1.5 rounded-full", statusTheme.dot)}></span>
            {booking.status.replace(/_/g, " ")}
          </div>
        </div>

        {/* Second Row: Date & Nights */}
        <div className="flex justify-between items-center text-sm text-gray-500 mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span className="font-medium text-[0.8rem]">{format(new Date(booking.arrivalDate), "MMM d")} - {format(new Date(booking.departureDate), "MMM d, yyyy")}</span>
          </div>
          <span className="font-bold text-[#0B3D91] bg-blue-50 px-2 py-0.5 rounded text-xs">{nights > 0 ? nights : 1} Night{nights !== 1 && 's'}</span>
        </div>

        {/* Third Row: 4-step Stepper */}
        <div className="flex items-center justify-between relative mb-5 pt-2">
          <div className="absolute left-0 top-3.5 w-full h-[2px] bg-gray-100 -z-10"></div>
          {steps.map((step, idx) => {
            let circleClass = "bg-white border-2 border-gray-200 text-transparent";
            let textClass = "text-gray-400";
            
            if (step.status === "COMPLETED") {
              circleClass = "bg-[#2E7D32] border-[#2E7D32]";
              textClass = "text-[#222] font-bold";
            } else if (step.status === "REJECTED") {
              circleClass = "bg-[#C62828] border-[#C62828]";
              textClass = "text-[#C62828] font-bold";
            } else {
              const isCurrent = steps.findIndex(s => s.status === "PENDING") === idx;
              if (isCurrent && !steps.some(s => s.status === "REJECTED")) {
                circleClass = "bg-white border-2 border-[#F4A300]";
                textClass = "text-[#F4A300] font-bold";
              }
            }

            return (
              <div key={idx} className="flex flex-col items-center gap-1.5 bg-white px-1 z-0">
                <div className={cn("w-3 h-3 rounded-full", circleClass)}></div>
                <div className={cn("text-[0.55rem] font-bold uppercase tracking-wider text-center w-12 leading-tight", textClass)}>{step.label}</div>
              </div>
            );
          })}
        </div>
        
        {/* Bottom Row */}
        <div className="mt-auto pt-2 flex justify-end">
          <Link 
            href={`/status/${booking.id}`} 
            className="flex items-center gap-1.5 text-xs text-[#0B3D91] font-bold hover:text-[#082a63] transition-colors py-1.5 px-3 rounded hover:bg-blue-50"
          >
            View Tracker <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
