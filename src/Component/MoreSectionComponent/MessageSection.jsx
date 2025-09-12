import React from "react";
import { ChevronLeft, Paperclip, Send } from "lucide-react";
import { assets } from "../../assets/data";

const formatWhen = (s) => {
  const d = new Date((s || "").replace(" ", "T"));
  if (isNaN(d.getTime())) return s || "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const time = d.toLocaleString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: true });
  return `${dd}-${mm}-${yyyy} / ${time}`;
};

const MessageSection = ({ ticket, messages = [], onBack }) => {
  const ticketInfo = [
    { label: "Ticket ID", value: ticket?.id ?? "—" },
    { label: "Subject", value: ticket?.subject ?? "—" },
    // keep label to preserve your UI; we show created date here
    { label: "First Repayment", value: ticket?.date ? formatWhen(ticket.date) : "—" },
  ];

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex min-h-screen p-4 flex-col justify-between bg-white">
        {/* Header */}
        <div>
          <div className="relative flex items-center justify-center mb-6">
            <ChevronLeft className="absolute left-0 cursor-pointer" onClick={onBack} />
            <h2 className="text-lg font-semibold text-gray-800">New Ticket</h2>
          </div>

          {/* Ticket Info */}
          <div className="bg-white border rounded-2xl p-4 shadow mb-6">
            {ticketInfo.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-700">{item.value}</span>
                </div>
                {index < ticketInfo.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="space-y-4 mb-6">
            {messages.length > 0 ? (
              messages.map((m, i) => {
                const isUser = String(m.sender || "").toLowerCase() !== "admin";
                return (
                  <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`${
                        isUser ? "bg-[#273e8e] text-white" : "bg-gray-200 text-gray-700"
                      } rounded-full px-6 py-3 shadow`}
                    >
                      {m.message}
                    </div>
                    <span className={`text-xs text-gray-500 mt-1 ${isUser ? "" : "ml-1"}`}>
                      {formatWhen(m.created_at)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-start">
                <div className="bg-gray-200 text-gray-700 rounded-full px-6 py-3 shadow">
                  No messages yet.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Message Input at Bottom (UI only; no reply API provided) */}
        <div className="relative">
          <textarea
            className="w-full border rounded-2xl px-4 py-3 resize-none h-[60px] pr-12"
            placeholder="Type a message…"
          />
          <button className="absolute top-7 -translate-y-1/2 right-4">
            <img src={assets.telegram} alt="Send" className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex min-h-screen bg-[#f5f6ff] flex-col">
        {/* Main Content */}
        <div className="flex-1 py-3 pb-24 overflow-y-auto">
          {/* Ticket Info Card */}
          <div className="bg-white rounded-xl p-4 mb-4 border-1 border-gray-500">
            {ticketInfo.map((item, index) => (
              <div key={index}>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-gray-500">{item.label}</span>
                  <span className="text-xs font-medium text-gray-700">{item.value}</span>
                </div>
                {index < ticketInfo.length - 1 && <hr className="border-gray-200" />}
              </div>
            ))}
          </div>

          {/* Messages */}
          <div className="space-y-4">
            {messages.length > 0 ? (
              messages.map((m, i) => {
                const isUser = String(m.sender || "").toLowerCase() !== "admin";
                return (
                  <div key={i} className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-3 text-[12px] ${
                        isUser 
                          ? "bg-[#273e8e] text-white" 
                          : "bg-gray-200 text-gray-700"
                      }`}
                    >
                      {m.message}
                    </div>
                    <span className={`text-[10px] text-gray-500 mt-1 ${isUser ? "" : "ml-1"}`}>
                      {formatWhen(m.created_at)}
                    </span>
                  </div>
                );
              })
            ) : (
              <div className="flex flex-col items-start">
                <div className="bg-gray-200 text-gray-700 rounded-2xl px-4 py-3">
                  No messages yet.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Bottom Message Input */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#f5f6ff] border-t border-gray-200 p-4">
          <div className="flex items-center bg-white rounded-2xl px-3 py-2">
            <button className="p-2">
              <Paperclip className="text-gray-500" size={20} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none text-sm px-2"
            />
            <button className="p-2">
              <Send className="text-gray-500" size={20} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MessageSection;
