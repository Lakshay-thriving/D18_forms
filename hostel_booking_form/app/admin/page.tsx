"use client";

import { useQuery } from "@tanstack/react-query";
import { Users, FileText, Bell, Activity } from "lucide-react";
import Link from "next/link";

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await fetch("/api/admin/stats");
      return res.json();
    }
  });

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#222]">System Administration</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of IIT Ropar Hostel Management Portal</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-10"><svg className="animate-spin w-8 h-8 text-[#0B3D91]" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeDasharray="30" opacity="0.25"></circle><path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path></svg></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} icon={Users} color="bg-blue-50 text-blue-600" />
          <StatCard title="Pending Approvals" value={stats?.pendingUsers || 0} icon={Users} color="bg-yellow-50 text-yellow-600" />
          <StatCard title="Total Bookings" value={stats?.totalBookings || 0} icon={FileText} color="bg-green-50 text-green-600" />
          <StatCard title="Active Announcements" value={stats?.activeAnnouncements || 0} icon={Bell} color="bg-purple-50 text-purple-600" />
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-800">Quick Actions</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-4">
          <ActionLink href="/admin/users" title="Manage Users" desc="Approve, reject, or assign roles to users" icon={Users} />
          <ActionLink href="/admin/requests" title="View All Requests" desc="Monitor all booking requests system-wide" icon={FileText} />
          <ActionLink href="/admin/logs" title="System Logs" desc="Track logins, approvals, and form submissions" icon={Activity} />
          <ActionLink href="/admin/announcements" title="Announcements" desc="Create system-wide notices" icon={Bell} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function ActionLink({ href, title, desc, icon: Icon }: any) {
  return (
    <Link href={href} className="flex items-start gap-4 p-4 rounded-lg bg-gray-50 hover:bg-[#0B3D91]/5 transition-colors border border-transparent hover:border-[#0B3D91]/20">
      <div className="w-10 h-10 rounded bg-white shadow-sm flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-[#0B3D91]" />
      </div>
      <div>
        <h3 className="font-bold text-[#222] mb-1">{title}</h3>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
    </Link>
  );
}
