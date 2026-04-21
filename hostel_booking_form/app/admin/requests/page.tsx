"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, Filter, Calendar } from "lucide-react";
import Link from "next/link";

export default function AdminRequests() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ['admin-requests'],
    queryFn: async () => {
      const res = await fetch("/api/bookings");
      return res.json();
    }
  });

  const filtered = bookings.filter((b: any) => {
    const searchLow = searchTerm.toLowerCase();
    const matchesSearch = 
      b.applicantName?.toLowerCase().includes(searchLow) ||
      b.email?.toLowerCase().includes(searchLow) ||
      b.empCode?.toLowerCase().includes(searchLow) ||
      b.id.includes(searchLow);
      
    if (statusFilter === "ALL") return matchesSearch;
    return matchesSearch && b.status === statusFilter;
  });

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      <div className="mb-6 flex justify-between items-end flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">All Booking Requests</h1>
          <p className="text-sm text-gray-500 mt-1">System-wide view of all guest room applications</p>
        </div>
        
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search basic details..."
              className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white text-gray-700"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="ALL">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="JA_APPROVED_PENDING_AR">With AR</option>
            <option value="AR_APPROVED_PENDING_CW">With CW</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-500">
                <th className="p-4">Applicant</th>
                <th className="p-4">Dates</th>
                <th className="p-4">Guests / Room</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">View</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading requests...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No requests found.</td></tr>
              ) : (
                filtered.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{b.applicantName}</div>
                      <div className="text-xs text-gray-500">{b.email} | {b.empCode}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Calendar className="w-3 h-3" />
                        {new Date(b.arrivalDate).toLocaleDateString()} - {new Date(b.departureDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <div>{b.totalMale + b.totalFemale} Guests</div>
                      <div className="text-xs text-gray-400">{b.roomType.replace('_', ' ')}</div>
                    </td>
                    <td className="p-4">
                      <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        b.status === 'COMPLETED' ? 'bg-green-100 text-green-700' :
                        b.status.includes('REJECTED') ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {b.status.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Link href={`/status/${b.id}`} className="text-[#0B3D91] hover:underline text-sm font-semibold">
                        Details →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
