import React, { useEffect, useMemo, useState } from "react";
import { TbPassword } from "react-icons/tb";
import { LuUserRound } from "react-icons/lu";
import {
  PiShoppingCartSimple,
  PiNotepadBold,
  PiUsersBold,
} from "react-icons/pi";
import { assets } from "../assets/data";

import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import SidebarOption from "../Component/MoreSectionComponent/SidebarOption";
import ChangePasswordPopUp from "../Component/MoreSectionComponent/ChangePasswordPopUp";
import OtpVerificationPopup from "../Component/MoreSectionComponent/OtpVerificationPopup";
import NewPasswordPopup from "../Component/MoreSectionComponent/NewPasswordPopup";
import TransactionHistory from "../Component/MoreSectionComponent/TransctionHistroy";
import Referrals from "../Component/MoreSectionComponent/Referrals";
import EditProfile from "../Component/MoreSectionComponent/EditProfileSection";
import KycDetails from "../Component/MoreSectionComponent/KycDetails";
import Support from "../Component/MoreSectionComponent/Support";
import MyOrders from "../Component/MoreSectionComponent/MyOrders"; // <-- NEW
import Notifications from "../Component/MoreSectionComponent/Notifications"; // <-- NEW
import {
  ChevronLeft,
  ChevronRight,
  User,
  ShoppingCart,
  FileText,
  TrendingUp,
  Users,
  Headphones,
  Settings,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CANDIDATE_KEYS = [
  "user",
  "auth_user",
  "current_user",
  "profile",
  "logged_in_user",
  "loggedInUser",
];

const readStoredUser = () => {
  for (const k of CANDIDATE_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return obj;
    } catch {
      /* ignore */
    }
  }
  return null;
};

const getDisplayName = (u) =>
  (
    u?.full_name ||
    u?.name ||
    [u?.first_name, u?.last_name].filter(Boolean).join(" ") ||
    ""
  ).trim();

const getEmail = (u) =>
  (u?.email || u?.user_email || u?.contact_email || "").trim();

const getAvatarUrl = (u) =>
  (
    u?.avatar ||
    u?.profile_image ||
    u?.photo ||
    u?.image_url ||
    u?.avatar_url ||
    ""
  ).trim();

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
};

// add this near your other state/handlers (above the return)
const sectionTitles = {
  editProfile: "Edit Profile",
  myOrders: "My Orders",
  transactionHistory: "Transaction History",
  creditScore: "Credit Score",
  referrals: "Referrals",
  support: "Support",
  maintenance: "Notifications",
};

const More = () => {
  const [activeSection, setActiveSection] = useState("editProfile");
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const [showOtpPopup, setShowOtpPopup] = useState(false);
  const [showNewPasswordPopup, setShowNewPasswordPopup] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const navigate = useNavigate();

  // user details
  const [user, setUser] = useState(null);
  useEffect(() => {
    setUser(readStoredUser());
  }, []);
  const displayName = useMemo(() => getDisplayName(user) || "User", [user]);
  const email = useMemo(() => getEmail(user) || "—", [user]);
  const avatar = useMemo(() => getAvatarUrl(user), [user]);
  const initials = useMemo(() => getInitials(displayName), [displayName]);

  // Logout functionality
  const handleLogout = () => {
    // Clear all stored user data
    CANDIDATE_KEYS.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        console.warn(`Failed to remove ${key}:`, e);
      }
    });

    // Clear access token
    try {
      localStorage.removeItem("access_token");
    } catch (e) {
      console.warn("Failed to remove access_token:", e);
    }

    // Navigate to login page
    navigate("/");
  };

  const handleEmailSubmit = (email) => {
    setUserEmail(email);
    setShowPasswordPopup(false);
    setShowOtpPopup(true);
  };

  const handleOtpVerify = () => {
    setShowOtpPopup(false);
    setShowNewPasswordPopup(true);
  };

  const handleResendOtp = () => {
    console.log("Resending OTP to:", userEmail);
  };

  const handleSaveNewPassword = () => {
    setShowNewPasswordPopup(false);
    alert("Password changed successfully!");
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case "myOrders":
        return <MyOrders />;
      case "transactionHistory":
        return <TransactionHistory />;
      case "referrals":
        return <Referrals />;
      case "kycDetails":
        return <KycDetails />;
      case "support":
        return <Support />;
      case "maintenance":
        return <Notifications onBack={() => setMobileViewSection("sidebar")} />;
      case "editProfile":
      default:
        return <EditProfile />;
    }
  };
  const [mobileViewSection, setMobileViewSection] = useState("sidebar");
  const handleMobileSectionChange = (section) => {
    setActiveSection(section);
    setMobileViewSection("content");
  };
  return (
    <>
      {/* Desktop View  */}
      <div className="sm:flex hidden min-h-screen w-full">
        <SideBar />
        <div className="w-full sm:w-[calc(100%-250px)]">
          <TopNavbar />
          <div className="bg-[#F5F7FF] p-5">
            <div className="min-h-screen bg-[#f5f6ff] flex flex-col md:flex-row px-4 md:px-8 py-6 gap-6 md:gap-8">
              {/* Sidebar Section */}
              <div className="w-full md:w-[40%]">
                <h2 className="text-2xl font-medium text-gray-700 mb-1">
                  More
                </h2>
                <p className="text-sm text-gray-500 mb-6">
                  Welcome to your dashboard
                </p>

                <div className="bg-[#273e8e] shadow-2xl h-[150px] text-white rounded-2xl p-4 mb-6  flex py-7 justify-start items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-[#e9e9e9] text-[#909090] flex items-center justify-center text-lg font-semibold mb-2 overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={displayName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white bg-[#8aa0ff] w-full h-full flex items-center justify-center">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div>
                    <p className=" text-[15px] mb-2">{displayName}</p>
                    <p className="text-xs text-gray-300">{email}</p>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-2xl border-[2px] border-gray-300">
                  <div onClick={() => setActiveSection("editProfile")}>
                    <SidebarOption
                      colorBg="bg-[#273E8E]"
                      icon={LuUserRound}
                      label="Profile Settings"
                    />
                  </div>

                  <div onClick={() => setActiveSection("myOrders")}>
                    <SidebarOption
                      colorBg="bg-[#8E2778]"
                      icon={PiShoppingCartSimple}
                      label="My Orders"
                    />
                  </div>

                  <div onClick={() => setActiveSection("transactionHistory")}>
                    <SidebarOption
                      colorBg="bg-[#8E2727]"
                      icon={PiNotepadBold}
                      label="Transaction History"
                    />
                  </div>
                  <div onClick={() => setActiveSection("kycDetails")}>
                    <SidebarOption
                      colorBg="bg-[#278E5B]"
                      image={assets.kwc}
                      label="KYC Details"
                    />
                  </div>

                  <div onClick={() => setActiveSection("referrals")}>
                    <SidebarOption
                      colorBg="bg-[#5C278E]"
                      icon={PiUsersBold}
                      label="Referrals"
                    />
                  </div>

                  <div onClick={() => setActiveSection("support")}>
                    <SidebarOption
                      colorBg="bg-[#27608E]"
                      image={assets.support}
                      label="Support"
                    />
                  </div>

                  <div onClick={() => setShowPasswordPopup(true)}>
                    <SidebarOption
                      colorBg="bg-[#8E2778]"
                      icon={TbPassword}
                      label="Change Password"
                    />
                  </div>
                </div>
              </div>

              {/* Active Section Display */}
              <div className="w-full md:w-[60%]">{renderActiveSection()}</div>

              {/* Popups */}
              {showPasswordPopup && (
                <ChangePasswordPopUp
                  onClose={() => setShowPasswordPopup(false)}
                  onEmailSubmit={handleEmailSubmit}
                />
              )}
              {showOtpPopup && (
                <OtpVerificationPopup
                  email={userEmail}
                  onVerify={handleOtpVerify}
                  onClose={() => setShowOtpPopup(false)}
                  onResend={handleResendOtp}
                />
              )}
              {showNewPasswordPopup && (
                <NewPasswordPopup
                  onSave={handleSaveNewPassword}
                  onClose={() => setShowNewPasswordPopup(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <div className="flex sm:hidden min-h-screen w-full bg-white pb-20">
        {mobileViewSection === "sidebar" ? (
          <div className="w-full">
            {/* Header */}
            <div className="flex items-center py-4 px-4 bg-[#273e8e] justify-between">
              <div className="flex items-center">
                <ChevronLeft className="text-white" />
              </div>
              <div className="flex-grow flex justify-center">
                <h1 className="text-lg font-semibold text-white">More</h1>
              </div>
            </div>

            {/* User Profile Section */}
            <div className="bg-[#273e8e] text-white p-4 px-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gray-300 overflow-hidden">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={displayName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-white/30 text-white flex items-center justify-center text-lg font-semibold">
                      {initials}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-white">
                    {displayName}
                  </p>
                  <p className="text-sm text-gray-300">{email}</p>
                </div>
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 space-y-3 mt-6">
              {/* Profile Settings */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("editProfile")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#273E8E] rounded-full flex items-center justify-center">
                    <User className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Profile Settings
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>

              {/* My Orders */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("myOrders")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8E2778] rounded-full flex items-center justify-center">
                    <ShoppingCart className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    My Orders
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>

              {/* Transaction History */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("transactionHistory")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8E2727] rounded-full flex items-center justify-center">
                    <FileText className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Transaction History
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>

              {/* Credit Score */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("creditScore")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#278E5B] rounded-full flex items-center justify-center">
                    <TrendingUp className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Credit Score
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>

              {/* Referrals */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("referrals")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#5C278E] rounded-full flex items-center justify-center">
                    <Users className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Referrals
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>

              {/* Support */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("support")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#27608E] rounded-full flex items-center justify-center">
                    <Headphones className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Support
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>

              {/* Maintenance */}
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={() => handleMobileSectionChange("maintenance")}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#8E8E27] rounded-full flex items-center justify-center">
                    <Settings className="text-white" size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    Maintenance
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </div>

            {/* Others Section */}
            <div className="px-4 mt-6">
              <h3 className="text-sm font-medium text-black mb-3">Others</h3>
              <div
                className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between cursor-pointer"
                onClick={handleLogout}
              >
                <div className="flex items-center gap-3">
                  <img src={assets.logout_mob} alt="Logout Mobile" />
                  <span className="text-sm font-medium text-red-600">
                    Logout
                  </span>
                </div>
                <ChevronRight className="text-gray-400" size={16} />
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full p-4">
            {/* Back Button */}
            <div
              className="flex items-center justify-between mb-4 text-black"
              onClick={() => setMobileViewSection("sidebar")}
            >
              <ChevronLeft />
              <span className="text-sm font-medium flex-grow text-center">
                {sectionTitles[activeSection] || "Settings"}
              </span>
            </div>

            {/* Active Section Content */}
            {renderActiveSection()}

            {/* Popups */}
            {showPasswordPopup && (
              <ChangePasswordPopUp
                onClose={() => setShowPasswordPopup(false)}
                onEmailSubmit={handleEmailSubmit}
              />
            )}
            {showOtpPopup && (
              <OtpVerificationPopup
                email={userEmail}
                onVerify={handleOtpVerify}
                onClose={() => setShowOtpPopup(false)}
                onResend={handleResendOtp}
              />
            )}
            {showNewPasswordPopup && (
              <NewPasswordPopup
                onSave={handleSaveNewPassword}
                onClose={() => setShowNewPasswordPopup(false)}
              />
            )}
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        {mobileViewSection === "sidebar" && <SideBar />}
      </div>
    </>
  );
};

export default More;
