import React from "react";

const ProfileTabs = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-full p-1 flex mb-6 w-full max-w-[380px]">
      <button
        type="button"
        onClick={() => onTabChange("profile")}
        className={`flex-1 px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
          activeTab === "profile"
            ? "bg-[#273e8e] text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
        }`}
      >
        Update Profile
      </button>
      <button
        type="button"
        onClick={() => onTabChange("address")}
        className={`flex-1 px-3 py-2.5 rounded-full text-xs sm:text-sm font-medium transition-all ${
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
