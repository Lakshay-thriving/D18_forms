"use client";
import React from "react";
import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#222]">Notifications</h1>
        <p className="text-sm text-gray-500 mt-1">Updates on your Guest Room Booking requests.</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col items-center justify-center p-16 text-center">
        <Bell className="w-12 h-12 text-gray-200 mb-4" />
        <h3 className="text-lg font-bold text-gray-900">No new notifications</h3>
        <p className="text-gray-500 text-sm max-w-sm mt-1">You are all caught up! New status updates for applications will appear here.</p>
      </div>
    </div>
  );
}
