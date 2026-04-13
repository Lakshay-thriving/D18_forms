"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, Save, User as UserIcon, X } from "lucide-react";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({
    fullName: "Lakshay User",
    empCode: "EMP-2026-X",
    mobile: "9876543210",
    email: "lakshay@iitrpr.ac.in",
    department: "Computer Science",
    designation: "Assistant Professor",
  });
  
  // Temporary state for edits before save
  const [editForm, setEditForm] = useState({ ...profile });

  // Mobile Validation helper
  const isMobileValid = editForm.mobile.match(/^[0-9]{10}$/);
  // Email Validation helper
  const isEmailValid = editForm.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  
  const canSave = isMobileValid && isEmailValid && editForm.fullName && editForm.empCode && editForm.department;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarPreview(url);
    }
  };

  const handleSave = () => {
    if (!canSave) return;
    setProfile(editForm);
    setIsEditing(false);
    setSuccessMsg("Profile saved successfully");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const handleCancel = () => {
    setEditForm({ ...profile });
    setIsEditing(false);
    setSuccessMsg("");
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[#222]">User Profile</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your administrative details and contact settings.</p>
      </div>

      {successMsg && (
        <div className="bg-[#e8f5e9] border border-[#2E7D32] text-[#2E7D32] px-4 py-3 rounded-lg mb-6 shadow-sm font-semibold text-sm flex items-center gap-2">
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
          {successMsg}
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Section: Profile Image */}
        <div className="w-full md:w-[35%] bg-[#F5F7FA] border-r border-gray-200 p-8 flex flex-col items-center justify-center min-h-[300px]">
          <div className="relative group mb-6">
            <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md bg-white flex items-center justify-center">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <UserIcon className="w-16 h-16 text-gray-300" />
              )}
            </div>
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <Camera className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            className="hidden" 
            accept="image/*"
          />
          
          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
          >
            Upload Photo
          </button>
          
          <p className="text-[0.65rem] text-gray-400 font-medium text-center uppercase tracking-widest mt-4">Max size: 2MB (JPG/PNG)</p>
        </div>


        {/* Right Section: Form Fields */}
        <div className="w-full md:w-[65%] p-8">
          <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
            <h3 className="text-lg font-bold text-[#0B3D91]">Identity Details</h3>
            {!isEditing && (
              <button 
                onClick={() => setIsEditing(true)} 
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
              >
                Edit Profile
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Full Name <span className="text-[#C62828]">*</span></label>
              <input 
                name="fullName"
                type="text" 
                value={isEditing ? editForm.fullName : profile.fullName}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${isEditing ? 'border-[#0B3D91]/30 focus:ring-2 focus:ring-[#0B3D91] text-gray-900 bg-blue-50/10' : 'border-transparent bg-gray-50 text-gray-800 font-semibold'}`}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Entry Number / Code <span className="text-[#C62828]">*</span></label>
              <input 
                name="empCode"
                type="text" 
                value={isEditing ? editForm.empCode : profile.empCode}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${isEditing ? 'border-[#0B3D91]/30 focus:ring-2 focus:ring-[#0B3D91] text-gray-900 bg-blue-50/10' : 'border-transparent bg-gray-50 text-gray-800 font-semibold'}`}
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Mobile Number <span className="text-[#C62828]">*</span></label>
              <input 
                name="mobile"
                type="tel" 
                value={isEditing ? editForm.mobile : profile.mobile}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${isEditing ? (!isMobileValid && editForm.mobile.length > 0 ? 'border-[#C62828] ring-1 ring-[#C62828] bg-red-50/30' : 'border-[#0B3D91]/30 focus:ring-2 focus:ring-[#0B3D91] text-gray-900 bg-blue-50/10') : 'border-transparent bg-gray-50 text-gray-800 font-semibold'}`}
              />
              {isEditing && !isMobileValid && editForm.mobile.length > 0 && <span className="text-xs text-[#C62828] font-bold mt-1 block">10-digit format required</span>}
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Email Address <span className="text-[#C62828]">*</span></label>
              <input 
                name="email"
                type="email" 
                value={isEditing ? editForm.email : profile.email}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${isEditing ? (!isEmailValid && editForm.email.length > 0 ? 'border-[#C62828] ring-1 ring-[#C62828] bg-red-50/30' : 'border-[#0B3D91]/30 focus:ring-2 focus:ring-[#0B3D91] text-gray-900 bg-blue-50/10') : 'border-transparent bg-gray-50 text-gray-800 font-semibold'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Department <span className="text-[#C62828]">*</span></label>
              <input 
                name="department"
                type="text" 
                value={isEditing ? editForm.department : profile.department}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${isEditing ? 'border-[#0B3D91]/30 focus:ring-2 focus:ring-[#0B3D91] text-gray-900 bg-blue-50/10' : 'border-transparent bg-gray-50 text-gray-800 font-semibold'}`}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Designation (Optional)</label>
              <input 
                name="designation"
                type="text" 
                value={isEditing ? editForm.designation : profile.designation}
                onChange={handleChange}
                disabled={!isEditing}
                className={`w-full px-4 py-2.5 bg-white border rounded-lg text-sm transition-all focus:outline-none ${isEditing ? 'border-[#0B3D91]/30 focus:ring-2 focus:ring-[#0B3D91] text-gray-900 bg-blue-50/10' : 'border-transparent bg-gray-50 text-gray-800 font-semibold'}`}
              />
            </div>

          </div>

          {/* Edit State Footer */}
          {isEditing ? (
            <div className="mt-8 flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
              <button 
                onClick={handleCancel} 
                className="px-6 py-2.5 bg-white border border-gray-300 text-gray-600 text-sm font-bold rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
              <button 
                onClick={handleSave} 
                disabled={!canSave}
                className={`px-8 py-2.5 text-white text-sm font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${canSave ? 'bg-[#0B3D91] hover:bg-[#082a63] cursor-pointer shadow-sm' : 'bg-gray-300 cursor-not-allowed'}`}
              >
                <Save className="w-4 h-4" /> Save Profile
              </button>
            </div>
          ) : (
            <div className="mt-8 pt-4 border-t border-gray-100 text-right">
              <p className="text-[0.65rem] text-gray-400 font-bold uppercase tracking-widest">Last updated: Today</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
