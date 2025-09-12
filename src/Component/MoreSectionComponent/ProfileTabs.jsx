import React from "react";

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-full p-1 flex mb-6 max-w-[250px]">
      <button
        onClick={() => onTabChange("profile")}
        className={`px-3 py-2 rounded-full text-xs font-medium transition-all ${
          activeTab === "profile"
            ? "bg-[#273e8e] text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Update Profile
      </button>
      <button
        onClick={() => onTabChange("address")}
        className={`px-4 py-2 rounded-full text-xs font-medium transition-all ${
          activeTab === "address"
            ? "bg-[#273e8e] text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Update Address
      </button>
    </div>
  );
};

export default ProfileTabs;
