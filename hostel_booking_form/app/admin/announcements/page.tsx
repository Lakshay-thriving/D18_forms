"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Power } from "lucide-react";

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({ title: "", content: "" });
  const [isCreating, setIsCreating] = useState(false);

  const { data: announcements = [], isLoading } = useQuery({
    queryKey: ['admin-announcements'],
    queryFn: async () => {
      const res = await fetch("/api/admin/announcements");
      return res.json();
    }
  });

  const mutation = useMutation({
    mutationFn: async ({ action, id, data }: any) => {
      let url = "/api/admin/announcements";
      let method = "POST";
      
      if (action === "TOGGLE") {
        method = "PATCH";
      } else if (action === "DELETE") {
        method = "DELETE";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "CREATE" ? data : { id, active: data })
      });
      if (!res.ok) throw new Error("Operation failed");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-announcements'] });
      if (isCreating) {
        setIsCreating(false);
        setFormData({ title: "", content: "" });
      }
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ action: "CREATE", data: formData });
  };

  return (
    <div className="w-full mx-auto space-y-6 pb-12">
      <div className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-[#222]">System Announcements</h1>
          <p className="text-sm text-gray-500 mt-1">Manage global notices displayed on the login page</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-2 bg-[#0B3D91] hover:bg-[#082a63] text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors"
        >
          <Plus className="w-4 h-4" /> {isCreating ? "Cancel" : "New Announcement"}
        </button>
      </div>

      {isCreating && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
          <h3 className="font-bold text-gray-800 mb-4">Create New Announcement</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
              <input 
                required 
                type="text" 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})} 
                placeholder="E.g., System Maintenance Scheduled"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Content / Details (Optional)</label>
              <textarea 
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0B3D91]"
                rows={3}
                value={formData.content} 
                onChange={e => setFormData({...formData, content: e.target.value})} 
                placeholder="Brief details about the announcement..."
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button 
                type="button" 
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={mutation.isPending}
                className="px-4 py-2 bg-[#0B3D91] hover:bg-[#082a63] text-white rounded-lg text-sm font-bold transition-colors"
              >
                {mutation.isPending ? "Publishing..." : "Publish Announcement"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wider font-semibold text-gray-500">
                <th className="p-4">Announcement</th>
                <th className="p-4">Created By</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">Loading announcements...</td></tr>
              ) : announcements.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-gray-400">No announcements found.</td></tr>
              ) : (
                announcements.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-gray-800">{item.title}</div>
                      <div className="text-xs text-gray-500 line-clamp-1">{item.content}</div>
                      <div className="text-[0.65rem] text-gray-400 mt-1">{new Date(item.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{item.createdBy}</td>
                    <td className="p-4">
                      <span className={`text-[0.65rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        item.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <button 
                        onClick={() => mutation.mutate({ action: 'TOGGLE', id: item.id, data: !item.active })} 
                        className={`p-1.5 rounded border border-gray-200 shadow-sm transition-colors ${item.active ? 'text-gray-400 hover:text-orange-500 bg-white hover:bg-orange-50' : 'text-green-600 bg-green-50'}`} 
                        title={item.active ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                      <button 
                        onClick={() => { if(confirm('Are you sure you want to delete this announcement?')) mutation.mutate({ action: 'DELETE', id: item.id }); }} 
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded bg-white border border-gray-200 shadow-sm" 
                        title="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
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
