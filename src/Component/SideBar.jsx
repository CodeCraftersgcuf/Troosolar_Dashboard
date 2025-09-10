// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import { assets } from "../assets/data";
// import { Sidebar_links } from "../assets/data";
// import LinkComp from "./LinkComponent";

// const SideBar = () => {
//   const [menuOpen, setMenuOpen] = useState(false);
//   const [activeLink, setActiveLink] = useState("/dashboard");

//   return (
//     <div className="hidden overflow-clip max-w-[250px] sm:block min-h-lvh pb-10  transition-all duration-300 bg-[#273E8E] text-white"
//       style={{
//         scrollbarWidth: "thin",
//         scrollbarColor: "white #273E8E",
//       }}
//     >
//       {/* Sidebar Header */}
//       <div className="flex items-center justify-between px-4 relative">
//         <Link to="/">
//           <img src={assets.smLogo} alt="logo" className="w-full h-auto" />
//         </Link>
//       </div>

//       {/* Menu Items */}
//       <nav>
//         {!menuOpen && <h1 className="p-4 text-[16px]">General</h1>}
//         <ul className="space-y-2">
//           {Sidebar_links.map((x, index) => (
//             <li key={index}>
//               <LinkComp
//                 name={x.name}
//                 link={x.link}
//                 icon={x.icon}
//                 sub={x.sublinks}
//                 isActiveCheck={activeLink === x.link}
//                 onClick={() => setActiveLink(x.link)}
//                 menuStatus={menuOpen}
//               />
//             </li>
//           ))}
//         </ul>
//       </nav>

//       {/* Logout Button */}
//       <div className="pt-4 border-t-2 border-[#ffffff79] mx-4 mt-4 flex items-center justify-center">
//         <button className="flex items-center p-2 py-4 cursor-pointer gap-2 text-white font-bold rounded-lg w-full hover:border hover:border-white">
//           <img src={assets.logout} alt="logout" className="w-6 h-6" />
//           {!menuOpen && <span>Logout</span>}
//         </button>
//       </div>
//       <img src={assets.sidebar} alt="" />
//     </div>
//   );
// };

// export default SideBar;
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { assets } from "../assets/data";
import { Sidebar_links } from "../assets/data";
import LinkComp from "./LinkComponent";
import API, { BASE_URL } from "../config/api.config";

const LOGOUT_URL = (API && API.LOGOUT) ? API.LOGOUT : `${BASE_URL}/logout`;
const USER_KEYS = ["user", "auth_user", "current_user", "profile", "logged_in_user", "loggedInUser"];

const SideBar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("/dashboard");
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();

  const clearAuthStorage = () => {
    try { localStorage.removeItem("access_token"); } catch {}
    USER_KEYS.forEach(k => { try { localStorage.removeItem(k); } catch {} });
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
          { headers: { Accept: "application/json", Authorization: `Bearer ${token}` } }
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

  return (
    <div
      className="hidden overflow-clip max-w-[250px] sm:block min-h-lvh pb-10 transition-all duration-300 bg-[#273E8E] text-white"
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
        {!menuOpen && <h1 className="p-4 text-[16px]">General</h1>}
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
          {!menuOpen && <span>{loggingOut ? "Logging out..." : "Logout"}</span>}
        </button>
      </div>

      <img src={assets.sidebar} alt="" />
    </div>
  );
};

export default SideBar;
