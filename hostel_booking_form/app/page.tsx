"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ApplicationCard } from "@/components/ApplicationCard";
import { Search, Filter, ArrowDownUp, ShieldCheck, Clock, XCircle, FileText } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc");

  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ['my-bookings', session?.user?.email],
    queryFn: async () => {
      // Inline api fetch to safely ensure no api library drops
      const res = await fetch(`/api/bookings?email=${session?.user?.email}`);
      return res.json();
    },
    enabled: !!session?.user?.email,
  });

  const total = bookings.length;
  const approved = bookings.filter((b: any) => b.status === "COMPLETED").length;
  const rejected = bookings.filter((b: any) => b.status.includes("REJECTED")).length;
  const pending = total - approved - rejected;

  const filteredBookings = bookings.filter((b: any) => {
    const searchLow = searchTerm.toLowerCase();
    const shortId = `gr-2026-${b.id ? b.id.split('-')[0].substring(0, 4).toLowerCase() : "xx"}`;
    
    let matchesSearch = true;
    if (searchTerm) {
      if (filterCategory === "ALL") {
        matchesSearch = b.guestNames?.toLowerCase().includes(searchLow) ||
          shortId.includes(searchLow) ||
          b.applicantName?.toLowerCase().includes(searchLow) ||
          b.roomType?.toLowerCase().includes(searchLow) ||
          b.arrivalDate?.toLowerCase().includes(searchLow);
      } else if (filterCategory === "GUEST") {
        matchesSearch = b.guestNames?.toLowerCase().includes(searchLow);
      } else if (filterCategory === "ID") {
        matchesSearch = shortId.includes(searchLow);
      } else if (filterCategory === "APPLICANT") {
        matchesSearch = b.applicantName?.toLowerCase().includes(searchLow);
      } else if (filterCategory === "ROOM") {
        matchesSearch = b.roomType?.toLowerCase().includes(searchLow);
      }
    }
      
    if (statusFilter === "ALL") return matchesSearch;
    if (statusFilter === "COMPLETED") return matchesSearch && b.status === "COMPLETED";
    if (statusFilter === "REJECTED") return matchesSearch && b.status.includes("REJECTED");
    if (statusFilter === "PENDING") return matchesSearch && !b.status.includes("REJECTED") && b.status !== "COMPLETED";
    return matchesSearch;
  }).sort((a: any, b: any) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return sortOrder === "desc" ? dateB - dateA : dateA - dateB;
  });

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Applications" value={total} icon={FileText} />
        <StatCard title="Pending" value={pending} icon={Clock} />
        <StatCard title="Approved" value={approved} icon={ShieldCheck} />
        <StatCard title="Rejected" value={rejected} icon={XCircle} />
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center mb-6">
        
        {/* Category Dropdown */}
        <div className="w-full sm:w-40 relative shrink-0">
          <select 
            className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] appearance-none text-sm cursor-pointer font-medium text-gray-700"
            value={filterCategory}
            onChange={(e) => {
              setFilterCategory(e.target.value);
              // Update placeholder when category changes visually
            }}
          >
            <option value="ALL">All Fields</option>
            <option value="GUEST">Guest Name</option>
            <option value="ID">Application ID</option>
            <option value="APPLICANT">Applicant Name</option>
            <option value="ROOM">Room Type</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0B3D91] pointer-events-none" />
        </div>

        <div className="relative w-full sm:flex-1 md:max-w-md shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder={filterCategory === "ALL" ? "Search entirely..." : `Search entirely by ${filterCategory.toLowerCase()}...`}
            className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] transition-shadow text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex w-full sm:w-auto gap-3 ml-auto">
          <div className="w-full sm:w-40 relative">
            <select 
              className="w-full pl-3 pr-8 py-2 bg-white border border-gray-200 rounded-lg outline-none focus:border-[#0B3D91] focus:ring-1 focus:ring-[#0B3D91] appearance-none text-sm cursor-pointer"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        </div>

        <button 
          onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm font-medium text-gray-700 sm:ml-auto"
        >
          <ArrowDownUp className="w-4 h-4" />
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>
    </div>

      {/* Application Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-[#0B3D91]"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30" opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg></div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
          <FileText className="w-12 h-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-800">No applications found</h3>
          <p className="text-gray-500 font-medium text-sm mt-1 max-w-sm mb-6">Start by creating a new booking application for your guests.</p>
          <a href="/apply" className="bg-[#0B3D91] text-white px-5 py-2.5 rounded-lg text-sm font-bold shadow hover:bg-[#082a63] transition-colors focus:ring-4 focus:ring-blue-100 flex items-center justify-center gap-2">
            + New Booking
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filteredBookings.map((booking: any) => (
            <ApplicationCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}

    </div>
  );
}

function StatCard({ title, value, icon: Icon }: any) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md transition">
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
        <p className="text-xl font-semibold text-gray-800">{value}</p>
      </div>
      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gray-50 text-gray-400">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
}
