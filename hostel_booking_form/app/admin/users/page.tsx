"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, ShieldAlert, Edit2, Shield } from "lucide-react";

export default function UserManagement() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState("ALL");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const res = await fetch("/api/admin/users");
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ id, action, data }: any) => {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action, data })
      });
      if (!res.ok) throw new Error("Failed to update user");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    }
  });

  const filtered = users.filter((u: any) => filter === "ALL" || u.status === filter);

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">User Management</h1>
          <p className="text-sm text-gray-500 mt-1">Approve registrations and manage roles</p>
        </div>
        <select 
          className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91] bg-white text-gray-700"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="ALL">All Users</option>
          <option value="PENDING">Pending Approval</option>
          <option value="APPROVED">Approved</option>
          <option value="BLOCKED">Blocked</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-500">
                <th className="p-4">Name / Email</th>
                <th className="p-4">Emp Code</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading users...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-gray-400">No users found.</td></tr>
              ) : (
                filtered.map((u: any) => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{u.name}</div>
                      <div className="text-xs text-gray-500">{u.email}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">{u.empCode || '-'}</td>
                    <td className="p-4">
                      <select 
                        value={u.role}
                        onChange={(e) => mutation.mutate({ id: u.id, action: 'UPDATE_ROLE', data: e.target.value })}
                        disabled={mutation.isPending || u.role === 'ADMIN'}
                        className="text-xs font-bold bg-blue-50 text-[#0B3D91] border border-blue-100 rounded px-2 py-1 outline-none"
                      >
                        <option value="STUDENT">STUDENT</option>
                        <option value="JA">JA</option>
                        <option value="AR">AR</option>
                        <option value="CW">CW</option>
                        {u.role === 'ADMIN' && <option value="ADMIN">ADMIN</option>}
                      </select>
                    </td>
                    <td className="p-4">
                      <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        u.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                        u.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      {u.status === 'PENDING' && (
                        <>
                          <button onClick={() => mutation.mutate({ id: u.id, action: 'UPDATE_STATUS', data: 'APPROVED' })} className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-white border border-gray-200 shadow-sm" title="Approve">
                            <CheckCircle size={16} />
                          </button>
                          <button onClick={() => mutation.mutate({ id: u.id, action: 'UPDATE_STATUS', data: 'REJECTED' })} className="p-1.5 text-red-600 hover:bg-red-50 rounded bg-white border border-gray-200 shadow-sm" title="Reject">
                            <XCircle size={16} />
                          </button>
                        </>
                      )}
                      
                      {u.status === 'APPROVED' && u.role !== 'ADMIN' && (
                        <button onClick={() => mutation.mutate({ id: u.id, action: 'UPDATE_STATUS', data: 'BLOCKED' })} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded bg-white border border-gray-200 shadow-sm" title="Block User">
                          <ShieldAlert size={16} />
                        </button>
                      )}
                      
                      {u.status === 'BLOCKED' && (
                        <button onClick={() => mutation.mutate({ id: u.id, action: 'UPDATE_STATUS', data: 'APPROVED' })} className="p-1.5 text-orange-600 hover:bg-orange-50 rounded bg-white border border-gray-200 shadow-sm" title="Unblock User">
                          <Shield size={16} />
                        </button>
                      )}
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
