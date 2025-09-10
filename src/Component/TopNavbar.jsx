// import React from "react";
// import { Bell } from "lucide-react";
// import { useLocation, useParams } from "react-router-dom";
// const TopNavbar = () => {
//   const name = "Qamardeen AbdulMalik";
//   const location = useLocation();
//   const { category } = useParams();
//   const changeBg =
//     location.pathname.includes("/tools") ||
//     location.pathname.includes("/solar-bundles") ||
//     location.pathname.includes("/homePage") ||
//     location.pathname.includes(`/product/${category}`);
//   return (
//     <div>
//       <header
//         className={`flex gap-3 items-center h-[90px] justify-end px-5 sm:pr-10 py-5 ${
//           changeBg ? "bg-[#273e8e]" : "bg-white"
//         }`}
//       >
//         <button
//           className={`rounded-lg flex justify-center items-center shadow-md h-10 w-10  transition-colors ${
//             changeBg ? "bg-[#ffffff]" : "bg-white"
//           }`}
//         >
//           <Bell size={24} />
//         </button>
//         <div className="bg-[#e9e9e9] h-16 w-16 rounded-full flex items-center justify-center">
//           <p className="text-[30px] text-[#909090] font-medium">QA</p>
//         </div>
//         <p
//           className={`${
//             changeBg ? "text-white" : "text-[#000000]"
//           } text-lg hidden sm:block`}
//         >
//           {name}
//         </p>
//       </header>
//     </div>
//   );
// };

// export default TopNavbar;
import React, { useEffect, useMemo, useState } from "react";
import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";

const CANDIDATE_KEYS = [
  "user",
  "auth_user",
  "current_user",
  "profile",
  "logged_in_user",
];

const readStoredUser = () => {
  for (const k of CANDIDATE_KEYS) {
    try {
      const raw = localStorage.getItem(k);
      if (!raw) continue;
      const obj = JSON.parse(raw);
      if (obj && typeof obj === "object") return obj;
    } catch {
      /* ignore bad JSON */
    }
  }
  return null;
};

const getDisplayName = (u) => {
  if (!u) return "Guest";
  return (
    u.full_name ||
    u.name ||
    [u.first_name, u.last_name].filter(Boolean).join(" ") ||
    "User"
  );
};

const getAvatarUrl = (u) => {
  if (!u) return "";
  return (
    u.avatar ||
    u.profile_picture ||
    u.photo ||
    u.image_url ||
    u.avatar_url ||
    ""
  );
};

const getInitials = (name) => {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("") || "U";
};

const TopNavbar = () => {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const name = useMemo(() => getDisplayName(user), [user]);
  const avatar = useMemo(() => getAvatarUrl(user), [user]);
  const initials = useMemo(() => getInitials(name), [name]);

  // Make navbar blue on these pages (added /product/:id)
  const changeBg =
    location.pathname.includes("/tools") ||
    location.pathname.includes("/solar-bundles") ||
    location.pathname.includes("/homePage") ||
    location.pathname.includes("/product/"); // covers /product/:id

  return (
    <div>
      <header
        className={`flex gap-3 items-center h-[90px] justify-end px-5 sm:pr-10 py-5 ${
          changeBg ? "bg-[#273e8e]" : "bg-white"
        }`}
      >
        <button
          className={`rounded-lg flex justify-center items-center shadow-md h-10 w-10 transition-colors ${
            changeBg ? "bg-[#ffffff]" : "bg-white"
          }`}
          aria-label="Notifications"
          title="Notifications"
        >
          <Bell size={24} />
        </button>

        {/* Avatar */}
        <div className="bg-[#e9e9e9] h-16 w-16 rounded-full overflow-hidden flex items-center justify-center">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="h-full w-full object-cover"
              loading="lazy"
            />
          ) : (
            <p className="text-[30px] text-[#909090] font-medium">{initials}</p>
          )}
        </div>

        {/* Name */}
        <p className={`${changeBg ? "text-white" : "text-[#000000]"} text-lg hidden sm:block`}>
          {name}
        </p>
      </header>
    </div>
  );
};

export default TopNavbar;
