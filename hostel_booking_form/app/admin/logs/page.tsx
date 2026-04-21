"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";

export default function AdminLogs() {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['admin-logs'],
    queryFn: async () => {
      const res = await fetch("/api/admin/logs");
      return res.json();
    }
  });

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#222]">System Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Audit trail of all administrative and user actions</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-500">
                <th className="p-4">Timestamp</th>
                <th className="p-4">User</th>
                <th className="p-4">Action</th>
                <th className="p-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading logs...</td></tr>
              ) : logs.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No logs found.</td></tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors text-sm">
                    <td className="p-4 whitespace-nowrap text-gray-500 flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="p-4 font-medium text-gray-800">{log.userEmail}</td>
                    <td className="p-4">
                      <span className="font-bold text-xs tracking-wider bg-gray-100 px-2 py-1 rounded text-gray-600">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{log.details || '-'}</td>
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
