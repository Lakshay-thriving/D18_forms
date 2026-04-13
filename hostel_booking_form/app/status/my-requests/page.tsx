"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { ApplicationCard } from "../../components/ApplicationCard";
import { Search, Filter, ArrowDownUp, ShieldCheck, Clock, XCircle, FileText } from "lucide-react";

export default function Dashboard() {
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState("");
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
    const matchesSearch = b.roomType.toLowerCase().includes(searchTerm.toLowerCase());
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
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      
      {/* Summary Stats Bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={total} icon={FileText} color="text-[#0B3D91]" border="border-t-[#0B3D91]" />
        <StatCard title="Pending" value={pending} icon={Clock} color="text-[#F4A300]" border="border-t-[#F4A300]" />
        <StatCard title="Approved" value={approved} icon={ShieldCheck} color="text-[#2E7D32]" border="border-t-[#2E7D32]" />
        <StatCard title="Rejected" value={rejected} icon={XCircle} color="text-[#C62828]" border="border-t-[#C62828]" />
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex flex-col md:flex-row gap-4 items-center mb-6">
        <div className="relative w-full md:flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search bookings..."
            className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0B3D91] transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-px h-6 bg-gray-200 hidden md:block mx-1"></div>

        <div className="relative w-full md:w-48">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <select 
            className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0B3D91] appearance-none text-sm font-medium cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending Approval</option>
            <option value="COMPLETED">Approved</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <button 
          onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium text-gray-700 md:ml-auto"
        >
          <ArrowDownUp className="w-4 h-4" />
          {sortOrder === "desc" ? "Newest First" : "Oldest First"}
        </button>
      </div>

      {/* Application Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-[#0B3D91]"><svg className="animate-spin w-8 h-8" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30" opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg></div>
      ) : filteredBookings.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-12 text-center h-48">
          <FileText className="w-10 h-10 text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium font-sm mt-1">No applications found in this view.</p>
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

function StatCard({ title, value, icon: Icon, color, border }: any) {
  return (
    <div className={`bg-white border-t-4 border-l border-r border-b border-gray-200 rounded-xl p-5 shadow-sm flex items-center justify-between hover:shadow transition-shadow ${border}`}>
      <div>
        <h4 className="text-[0.7rem] font-bold text-gray-500 uppercase tracking-widest mb-0.5">{title}</h4>
        <p className={`text-4xl font-extrabold ${color}`}>{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-gray-50 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
