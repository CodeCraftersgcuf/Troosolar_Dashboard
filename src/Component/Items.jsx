// import React from "react";
// import { Link } from "react-router-dom";

// // props:
// // - categories: [{ id, name, icon }, ...]
// // - loading: boolean
// const Items = ({ categories = [], loading = false }) => {
//   // Skeletons while loading
//   if (loading) {
//     return (
//       <>
//         {/* Desktop */}
//         <div className="w-full sm:block hidden mt-4 overflow-x-auto">
//           <div className="flex gap-4 px-4 py-4 min-w-fit">
//             {Array.from({ length: 8 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-white rounded-2xl shadow-sm shrink-0 animate-pulse"
//               >
//                 <div className="w-[70px] h-[70px] rounded-full bg-gray-200" />
//                 <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Mobile */}
//         <div className="w-full sm:hidden block mt-4 px-4">
//           <div className="grid grid-cols-4 gap-4">
//             {Array.from({ length: 8 }).map((_, i) => (
//               <div
//                 key={i}
//                 className="flex flex-col items-center justify-center w-full h-[140px] bg-white rounded-2xl shadow-sm animate-pulse"
//               >
//                 <div className="w-[70px] h-[70px] rounded-full bg-gray-200" />
//                 <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
//               </div>
//             ))}
//           </div>
//         </div>
//       </>
//     );
//   }

//   // No categories
//   if (!categories.length) {
//     return (
//       <div className="text-white/90 text-sm px-4">
//         No categories found.
//       </div>
//     );
//   }

//   return (
//     <>
//       {/* Desktop view */}
//       <div className="w-full sm:block hidden mt-4 overflow-x-auto">
//         <div className="flex gap-4 px-4 py-4 min-w-fit">
//           {categories.map((cat) => (
//             <Link key={cat.id} to={`/product/${cat.id}`}>
//               <div className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-white rounded-2xl shadow-sm shrink-0">
//                 <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#0000ff]/10 overflow-hidden">
//                   {/* Use backend icon if present, else simple fallback */}
//                   {cat.icon ? (
//                     <img
//                       src={cat.icon}
//                       alt={cat.name}
//                       className="h-[40px] w-[40px] object-contain"
//                     />
//                   ) : (
//                     <span className="text-xs text-blue-700">{cat.name?.[0] || "?"}</span>
//                   )}
//                 </div>
//                 <h1 className="mt-2 text-center text-blue-700 text-sm">
//                   {cat.title}
//                 </h1>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>

//       {/* Mobile view */}
//       <div className="w-full sm:hidden block mt-4 px-4">
//         <div className="grid grid-cols-4 gap-4">
//           {categories.map((cat) => (
//             <Link to={`/product/${cat.id}`} key={cat.id}>
//               <div className="flex flex-col items-center justify-center w-full h-[140px] bg-white rounded-2xl shadow-sm">
//                 <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#0000ff]/10 overflow-hidden">
//                   {cat.icon ? (
//                     <img
//                       src={cat.icon}
//                       alt={cat.name}
//                       className="h-[50px] w-[50px] object-contain"
//                     />
//                   ) : (
//                     <span className="text-xs text-blue-700">{cat.name?.[0] || "?"}</span>
//                   )}
//                 </div>
//                 <h1 className="mt-2 text-center text-blue-700 text-xs font-medium">
//                   {cat.name}
//                 </h1>
//               </div>
//             </Link>
//           ))}
//         </div>
//       </div>
//     </>
//   );
// };

import React from "react";
import { Link } from "react-router-dom";

const Items = ({ categories = [], loading = false }) => {
  // Base URL to prepend to the relative image URL
  const baseUrl = "https://troosolar.hmstech.org";

  // Loading skeletons
  if (loading) {
    return (
      <>
        {/* Desktop */}
        <div className="w-full sm:block hidden mt-4 overflow-x-auto">
          <div className="flex gap-4 px-4 py-4 min-w-fit">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-white rounded-2xl shadow-sm shrink-0 animate-pulse"
              >
                <div className="w-[70px] h-[70px] rounded-full bg-gray-200" />
                <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="w-full sm:hidden block mt-4 px-4 ">
          <div className="grid grid-cols-2 min-[390px]:grid-cols-3 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="flex flex-col items-center justify-center w-full h-[116px] bg-white rounded-2xl shadow-sm animate-pulse"
              >
                <div className="w-[56px] h-[56px] rounded-full bg-gray-200" />
                <div className="mt-2 h-3 w-16 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (!categories.length) {
    return (
      <div className="text-white/90 text-sm px-4">No categories found.</div>
    );
  }

  return (
    <>
      {/* Desktop */}
      <div className="w-full sm:block hidden mt-4 overflow-x-auto">
        <div className="flex gap-4 px-4 py-4 min-w-fit">
          {categories.map((cat) => (
            <Link key={cat.id} to={`/product/${cat.id}`}>
              <div className="flex flex-col items-center justify-center w-[120px] h-[120px] bg-white rounded-2xl shadow-sm shrink-0">
                <div className="flex items-center justify-center w-[70px] h-[70px] rounded-full bg-[#0000ff]/10 overflow-hidden">
                  {cat.icon ? (
                    <img
                      // Prepend the base URL to the relative path
                      src={`${baseUrl}${cat.icon}`}
                      alt={cat.title || cat.name}
                      className="h-[48] w-[48] object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-blue-700">
                      {(cat.title || cat.name || "?")[0]}
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-center text-blue-700 text-sm">
                  {cat.title || cat.name}
                </h1>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile */}
      <div className="w-full sm:hidden block mt-4 px-2 ">
        <div className="grid grid-cols-3 max-[320px]:grid-cols-2 min-[390px]:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link to={`/product/${cat.id}`} key={cat.id}>
              <div className="flex flex-col items-center justify-center w-full h-[89px] max-sm:w-[89px] bg-white rounded-2xl shadow-sm">
                <div className="flex items-center justify-center w-[47px] h-[47px] rounded-full bg-[#0000ff]/10 overflow-hidden">
                  {cat.icon ? (
                    <img
                      // Prepend the base URL to the relative path
                      src={`${baseUrl}${cat.icon}`}
                      alt={cat.title || cat.name}
                      className="h-10 w-10 object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="text-xs text-blue-700 ">
                      {(cat.title || cat.name || "?")[0]}
                    </span>
                  )}
                </div>
                <h1 className="mt-2 text-center text-blue-700 text-[9px] font-medium">
                  {cat.title || cat.name}
                </h1>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default Items;
