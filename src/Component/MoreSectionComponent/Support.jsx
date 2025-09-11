// import React, { useState } from 'react';
// import { PiTicket } from "react-icons/pi";
// import NewTicket from './NewTicket';

// const TABS = ['Pending', 'Answered', 'Closed'];

// const ticketsData = [
//   { id: '123', date: '5 May, 25 - 06:22 AM', status: 'Pending' },
//   { id: '124', date: '4 May, 25 - 10:30 AM', status: 'Pending' },
//   { id: '125', date: '3 May, 25 - 02:15 PM', status: 'Answered' },
//   { id: '126', date: '2 May, 25 - 09:00 AM', status: 'Pending' },
//   { id: '127', date: '1 May, 25 - 04:45 PM', status: 'Closed' },
//   { id: '128', date: '30 Apr, 25 - 11:00 AM', status: 'Pending' },
// ];




// const Support = () => {
//   const [activeTab, setActiveTab] = useState('Pending');
//   const filteredTickets = ticketsData.filter(ticket => ticket.status === activeTab);
//   const [newTicket,setNewTicket] = useState(false);
//   return (
//     <div className="min-h-screen  flex items-center justify-center p-4 font-sans">
//       <div className="bg-white rounded-xl shadow-lg border-gray-300 border p-6 w-full max-w-2xl">
//         {
//           newTicket ? <NewTicket/> : <div>
//             {/* Header */}
//         <h2 className="text-xl text-gray-800 mb-6 text-center">
//           Support Tickets
//         </h2>

//         {/* Tabs */}
//         <div className="flex border-2 border-gray-300/30 rounded-full justify-start gap-2 p-3 mb-6 w-full max-w-[70%]">
//           {TABS.map(tab => (
//             <button
//               key={tab}
//               onClick={() => setActiveTab(tab)}
//               className={`flex-1 py-2 px-2 text-xs  transition duration-200 text-center rounded-full ${
//                 activeTab === tab
//                   ? 'bg-[#273e8e] text-white'
//                   : 'text-gray-400'
//               }`}
//             >
//               {tab}
//             </button>
//           ))}
//         </div>

//         {/* Tickets List */}
//         <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
//           {filteredTickets.length ? (
//             filteredTickets.map(({ id, date, status }) => (
//               <div
//                 key={id}
//                 className="flex items-center justify-between bg-white rounded-2xl p-4 border-gray-400 border transition-shadow duration-200 hover:shadow-sm cursor-pointer"
//               >
//                 <div className="flex items-center space-x-4">
//                   <div className="p-3 bg-[#cccccc] rounded-full">
//                     <PiTicket size={24} className="text-black" />
//                   </div>
//                   <div className='space-y-2'>
//                     <p className="text-[#000000]">Ticket ID - {id}</p>
//                     <p className="text-[#000000] text-xs">{date}</p>
//                   </div>
//                 </div>
//                 <span className="bg-[#FFA50033] text-[#FFA500]  px-1.5 py-1.5 rounded-[10px] text-xs">
//                   {status}
//                 </span>
//               </div>
//             ))
//           ) : (
//             <p className="text-center text-gray-500 py-10">
//               No tickets in this category.
//             </p>
//           )}
//         </div>

//         {/* Create Ticket Button */}
//         <div onClick={()=>setNewTicket(!newTicket)} className="mt-8 flex items-center justify-center bg-[#273e8e] text-white rounded-full py-4 px-6 shadow cursor-pointer hover:bg-[#1f3270] transition">
//           Create New Ticket
//         </div>
//           </div>
//         }
//       </div>
//     </div>
//   );
// };

// export default Support;
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { PiTicket } from "react-icons/pi";
import { ChevronLeft } from "lucide-react";
import NewTicket from "./NewTicket";
import API, { BASE_URL } from "../../config/api.config";

const TABS = ["Pending", "Answered", "Closed"];

const normalizeStatus = (raw) => {
  const s = String(raw || "").toLowerCase();
  if (s === "answered") return "Answered";
  if (s === "closed" || s === "complete" || s === "completed") return "Closed";
  return "Pending";
};

const formatWhen = (s) => {
  const d = new Date((s || "").replace(" ", "T"));
  if (isNaN(d.getTime())) return s || "—";
  const day = d.getDate();
  const month = d.toLocaleString("en-GB", { month: "short" });
  const yy = String(d.getFullYear()).slice(-2);
  const time = d.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${day} ${month}, ${yy} - ${time}`;
};

const TICKETS_URL = API.TICKETS || `${BASE_URL}/website/tickets`;

const Support = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const [newTicket, setNewTicket] = useState(false);

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [selectedId, setSelectedId] = useState(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const loadTickets = async () => {
    if (!token) {
      setErr("Please log in to view your tickets.");
      setTickets([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setErr("");
      const { data } = await axios.get(TICKETS_URL, {
        headers: { Accept: "application/json", Authorization: `Bearer ${token}` },
      });
      const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const norm = list.map((t) => ({
        id: t.id,
        subject: t.subject || `Ticket #${t.id}`,
        status: normalizeStatus(t.status),
        created_at: t.created_at,
        messages: Array.isArray(t.messages) ? t.messages : [],
      }));
      setTickets(norm);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "Failed to load tickets.");
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredTickets = useMemo(
    () => tickets.filter((t) => t.status === activeTab),
    [tickets, activeTab]
  );

  const selectedTicket = useMemo(
    () => tickets.find((t) => String(t.id) === String(selectedId)) || null,
    [tickets, selectedId]
  );

  const handleAfterCreate = async (created) => {
    // setNewTicket(false);
    await loadTickets();
    const newId = created?.ticket_id ?? created?.id;
    if (newId) {
      setSelectedId(String(newId));
      setActiveTab("Pending");
    }
  };

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex min-h-screen items-center justify-center p-4 font-sans">
        <div className="bg-white rounded-xl shadow-lg border-gray-300 border p-6 w-full max-w-2xl">
          {newTicket ? (
            <NewTicket
              onCancel={() => setNewTicket(false)}  // back button closes the composer
              onCreated={handleAfterCreate}         // just refresh tickets; don't close
            />
          ) : (
            <div>
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl text-gray-800 text-center flex-1">Support Tickets</h2>
                <button
                  onClick={loadTickets}
                  className="ml-3 text-xs rounded-full border px-3 py-1 text-gray-600 hover:bg-gray-50"
                  title="Refresh"
                >
                  Refresh
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-2 border-gray-300/30 rounded-full justify-start gap-2 p-3 mb-6 w-full max-w-[70%]">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => {
                      setActiveTab(tab);
                      setSelectedId(null);
                    }}
                    className={`flex-1 py-2 px-2 text-xs transition duration-200 text-center rounded-full ${activeTab === tab ? "bg-[#273e8e] text-white" : "text-gray-400"
                      }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tickets List */}
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {loading && (
                  <div className="text-center text-gray-500 py-10">Loading…</div>
                )}

                {!loading && err && (
                  <div className="text-center text-red-600 py-10">{err}</div>
                )}

                {!loading && !err && filteredTickets.length === 0 && (
                  <p className="text-center text-gray-500 py-10">
                    No tickets in this category.
                  </p>
                )}

                {!loading &&
                  !err &&
                  filteredTickets.length > 0 &&
                  filteredTickets.map(({ id, created_at, status, subject }) => (
                    <div
                      key={id}
                      onClick={() => setSelectedId(id)}
                      className="flex items-center justify-between bg-white rounded-2xl p-4 border-gray-400 border transition-shadow duration-200 hover:shadow-sm cursor-pointer"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="p-3 bg-[#cccccc] rounded-full">
                          <PiTicket size={24} className="text-black" />
                        </div>
                        <div className="space-y-2">
                          <p className="text-[#000000]">
                            Ticket ID - {id}
                            {subject ? (
                              <span className="text-gray-500 text-xs"> &nbsp;• {subject}</span>
                            ) : null}
                          </p>
                          <p className="text-[#000000] text-xs">{formatWhen(created_at)}</p>
                        </div>
                      </div>
                      <span
                        className={`px-1.5 py-1.5 rounded-[10px] text-xs ${status === "Closed"
                            ? "bg-green-100 text-green-700"
                            : status === "Answered"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-[#FFA50033] text-[#FFA500]"
                          }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Conversation for selected ticket */}
              {selectedTicket ? (
                <div className="mt-6 border rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-800">
                      Ticket #{selectedTicket.id} — Messages
                    </h3>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-3">
                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                      selectedTicket.messages.map((m, i) => {
                        const isAdmin =
                          String(m.sender || "").toLowerCase() === "admin";
                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-xl text-sm ${isAdmin
                                ? "bg-indigo-50 text-indigo-900"
                                : "bg-gray-100 text-gray-800"
                              }`}
                          >
                            <div className="text-[11px] opacity-70 mb-1">
                              {isAdmin ? "Support" : "You"} • {formatWhen(m.created_at)}
                            </div>
                            <div>{m.message}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-sm">No messages yet.</div>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Create Ticket Button */}
              <div
                onClick={() => setNewTicket(true)}
                className="mt-8 flex items-center justify-center bg-[#273e8e] text-white rounded-full py-4 px-6 shadow cursor-pointer hover:bg-[#1f3270] transition"
              >
                Create New Ticket
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden block min-h-screen bg-white pb-20">
        {newTicket ? (
          <NewTicket
            onCancel={() => setNewTicket(false)}
            onCreated={handleAfterCreate}
          />
        ) : (
          <>
           

            {/* Main Content */}
            <div className="px-4 mt-6">
              {/* Tabs */}
              <div className="bg-gray-100 rounded-full p-1 mb-6">
                <div className="flex">
                  {TABS.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => {
                        setActiveTab(tab);
                        setSelectedId(null);
                      }}
                      className={`flex-1 py-2 px-3 text-sm font-medium transition duration-200 text-center rounded-full ${
                        activeTab === tab 
                          ? "bg-[#273e8e] text-white" 
                          : "text-gray-500"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {loading && (
                  <div className="text-center text-gray-500 py-10">Loading…</div>
                )}

                {!loading && err && (
                  <div className="text-center text-red-600 py-10">{err}</div>
                )}

                {!loading && !err && filteredTickets.length === 0 && (
                  <p className="text-center text-gray-500 py-10">
                    No tickets in this category.
                  </p>
                )}

                {!loading &&
                  !err &&
                  filteredTickets.length > 0 &&
                  filteredTickets.map(({ id, created_at, status }) => (
                    <div
                      key={id}
                      onClick={() => setSelectedId(id)}
                      className="bg-gray-50 rounded-xl p-4 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <PiTicket size={20} className="text-gray-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Ticket ID - {id}
                          </p>
                          <p className="text-xs text-gray-500">{formatWhen(created_at)}</p>
                        </div>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          status === "Closed"
                            ? "bg-green-100 text-green-700"
                            : status === "Answered"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {status}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Conversation for selected ticket */}
              {selectedTicket ? (
                <div className="mt-6 border rounded-xl p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800">
                      Ticket #{selectedTicket.id} — Messages
                    </h3>
                    <button
                      onClick={() => setSelectedId(null)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="max-h-56 overflow-y-auto space-y-3">
                    {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                      selectedTicket.messages.map((m, i) => {
                        const isAdmin =
                          String(m.sender || "").toLowerCase() === "admin";
                        return (
                          <div
                            key={i}
                            className={`p-3 rounded-xl text-sm ${
                              isAdmin
                                ? "bg-indigo-50 text-indigo-900"
                                : "bg-white text-gray-800"
                            }`}
                          >
                            <div className="text-[11px] opacity-70 mb-1">
                              {isAdmin ? "Support" : "You"} • {formatWhen(m.created_at)}
                            </div>
                            <div>{m.message}</div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-500 text-sm">No messages yet.</div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Fixed Bottom Button */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200">
              <button
                onClick={() => setNewTicket(true)}
                className="w-full bg-[#273e8e] text-white rounded-full py-3 text-sm font-medium"
              >
                Create New Ticket
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default Support;
