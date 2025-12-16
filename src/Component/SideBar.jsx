import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/data";
import { Sidebar_links } from "../assets/data";
import LinkComp from "./LinkComponent";
import API, { BASE_URL } from "../config/api.config";

const LOGOUT_URL = API && API.LOGOUT ? API.LOGOUT : `${BASE_URL}/logout`;
const USER_KEYS = [
  "user",
  "auth_user",
  "current_user",
  "profile",
  "logged_in_user",
  "loggedInUser",
];

// Mobile navigation items matching the photo - using mobile-specific icons
const mobileNavItems = [
  { name: "Home", link: "/", icon: assets.dashboard_mob },
  { name: "Store", link: "/homePage", icon: assets.ShopMgt_mob },
  { name: "Loans", link: "/loan", icon: assets.Loanmgt_mob },
  { name: "BNPL", link: "/bnpl-credit-check", icon: assets.creditMgt },
  { name: "Tools", link: "/tools", icon: assets.settings_mob },
  { name: "More", link: "/more", icon: assets.userGear_mob },
];

const SideBar = () => {
  const [menuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/dashboard");
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const clearAuthStorage = () => {
    try {
      localStorage.removeItem("access_token");
    } catch (e) {
      console.warn("Failed to remove access_token:", e);
    }
    USER_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
      } catch (e) {
        console.warn(`Failed to remove ${k}:`, e);
      }
    });
  };

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      const token = localStorage.getItem("access_token");
      if (token) {
        await axios.post(
          LOGOUT_URL,
          {},
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );
      }
    } catch {
      // swallow errors; we'll still clear client state
    } finally {
      clearAuthStorage();
      setLoggingOut(false);
      // adjust if your auth route differs
      navigate("/login", { replace: true });
    }
  };

  const getWidth = () => {
    const width = window.innerWidth;
    if (width <= 325) return "215px";
    if (width <= 375) return "325px";
    return "390px"; // Default for larger screens
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div
        className="hidden overflow-y-auto max-w-[250px] sm:block min-h-screen pb-10 transition-all duration-300 bg-[#273E8E] text-white"
        style={{ scrollbarWidth: "thin", scrollbarColor: "white #273E8E" }}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 relative">
          <Link to="/">
            <img src={assets.smLogo} alt="logo" className="w-full h-auto" />
          </Link>
        </div>

        {/* Menu Items */}
        <nav>
          {/* {!menuOpen && <h1 className="p-4 text-[16px]">General</h1>} */}
          <ul className="space-y-2">
            {Sidebar_links.map((x, index) => (
              <li key={index}>
                <LinkComp
                  name={x.name}
                  link={x.link}
                  icon={x.icon}
                  sub={x.sublinks}
                  isActiveCheck={activeLink === x.link}
                  onClick={() => setActiveLink(x.link)}
                  menuStatus={menuOpen}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* Logout Button */}
        <div className="pt-4 border-t-2 border-[#ffffff79] mx-4 mt-4 flex items-center justify-center">
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center p-2 py-4 cursor-pointer gap-2 text-white font-bold rounded-lg w-full hover:border hover:border-white disabled:opacity-60"
          >
            <img src={assets.logout} alt="logout" className="w-6 h-6" />
            {!menuOpen && (
              <span>{loggingOut ? "Logging out..." : "Logout"}</span>
            )}
          </button>
        </div>

        {/* Sidebar Footer Images */}
        <img src={assets.sidebar} alt="" />
        <img src={assets.sidebar} alt="" className="mt-2" />
      </div>

      {/* Mobile Bottom Navigation */}
      {!["/uploadDocument", "/uploadDetails", "/loanDetails", "/cart", "/linkAccount", "/loanCalculate", "/solar-bundles", "/solar-builder"].includes(
        location.pathname
      ) && (
        <div
          className="sm:hidden fixed z-50"
          style={{
            width: getWidth(),
            height: "60px",
            left: `calc(50% - ${getWidth()} / 2)`, // Center the div based on its dynamic width
            bottom: "23px",
            background: "#FFFFFF",
            border: "0.3px solid #CDCDCD",
            boxShadow: "5px 5px 10px rgba(109, 108, 108, 0.25)",
            borderRadius: "15px",
            boxSizing: "border-box",
          }}
        >
          <div className="flex items-center justify-around h-full px-4">
            {mobileNavItems.map((item, index) => {
              const isActive = location.pathname === item.link;
              return (
                <Link
                  key={index}
                  to={item.link}
                  className="flex flex-col items-center justify-center py-2 px-3 min-w-0 flex-1"
                  onClick={() => setActiveLink(item.link)}
                >
                  <div className="flex flex-col items-center">
                    <img
                      src={item.icon}
                      alt={item.name}
                      className={`w-6 h-6 mb-1 ${
                        isActive ? "opacity-100" : "opacity-60"
                      }`}
                      style={{
                        filter: isActive
                          ? "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(224deg) brightness(89%) contrast(97%)"
                          : "brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(100%) contrast(100%)",
                      }}
                    />
                    <span
                      className={`text-[8px] font-medium ${
                        isActive ? "text-[#273e8e]" : "text-gray-500"
                      }`}
                    >
                      {item.name}
                    </span>
                    {isActive && (
                      <div className="w-6 h-0.5 bg-[#273e8e] mt-1 rounded-full"></div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default SideBar;
