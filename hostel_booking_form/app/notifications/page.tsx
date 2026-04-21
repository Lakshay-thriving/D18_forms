"use client";
import React, { useEffect } from "react";
import { Bell, CheckCircle, Info, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const res = await fetch("/api/notifications");
      return res.json();
    }
  });

  const markRead = useMutation({
    mutationFn: async () => {
      await fetch("/api/notifications", { method: 'PATCH' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    }
  });

  useEffect(() => {
    if (data?.notifications?.some((n: any) => !n.read)) {
      markRead.mutate();
    }
  }, [data, markRead]);

  const notifications = data?.notifications || [];

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#222]">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Updates on your Guest Room Booking requests.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-16 text-center text-gray-400">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-16 text-center">
            <Bell className="w-12 h-12 text-gray-200 mb-4" />
            <h3 className="text-lg font-bold text-gray-900">No new notifications</h3>
            <p className="text-gray-500 text-sm max-w-sm mt-1">You are all caught up! New status updates for applications will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((n: any) => (
              <div key={n.id} className={`p-5 flex gap-4 ${n.read ? 'bg-white' : 'bg-blue-50/50'}`}>
                <div className={`mt-0.5 shrink-0 ${n.type === 'success' ? 'text-green-500' : n.type === 'error' ? 'text-red-500' : 'text-blue-500'}`}>
                  {n.type === 'success' ? <CheckCircle size={20} /> : n.type === 'error' ? <AlertTriangle size={20} /> : <Info size={20} />}
                </div>
                <div>
                  <h4 className={`text-sm ${n.read ? 'font-semibold text-gray-800' : 'font-bold text-[#222]'}`}>{n.title}</h4>
                  <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                  <p className="text-[0.65rem] text-gray-400 mt-2 font-medium">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
