import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Input } from "../Input";
import MessageSection from "./MessageSection";
import axios from "axios";
import API, { BASE_URL } from "../../config/api.config";

const TICKETS_URL = API.TICKETS || `${BASE_URL}/website/tickets`;

const NewTicket = ({ onCancel, onCreated }) => {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // after-create view
  const [created, setCreated] = useState(null); // { id, subject, date, messages }

  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const handleSubmit = async () => {
    setError("");
    if (!subject.trim() || !body.trim()) {
      setError("Please enter a subject and a message.");
      return;
    }
    if (!token) {
      setError("Please log in to create a ticket.");
      return;
    }

    setSubmitting(true);
    try {
      const { data } = await axios.post(
        TICKETS_URL,
        { subject: subject.trim(), message: body.trim() },
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const payload = data?.data || data || {};
      const id = payload?.ticket_id ?? payload?.id;
      const messages = Array.isArray(payload?.messages) ? payload.messages : [];
      const subjectResp = payload?.subject ?? subject.trim();
      const date = payload?.date ?? new Date().toISOString();

      const normalized = { id, subject: subjectResp, date, messages };
      setCreated(normalized);

      // let the parent (Support) refresh its list if it passed a handler
      if (typeof onCreated === "function") {
        onCreated({ ticket_id: id, subject: subjectResp, date, messages });
      }
    } catch (e) {
      setError(
        e?.response?.data?.message || e?.message || "Failed to create ticket."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // After successful creation, show the conversation view in-place
  if (created) {
    return (
      <MessageSection
        ticket={created}
        messages={created.messages}
        onBack={() => {
          setCreated(null);
          if (typeof onCancel === "function") onCancel();
        }}
      />
    );
  }

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:flex min-h-screen flex-col justify-between">
        <div>
          <div className="relative flex items-center justify-center mb-6">
            <ChevronLeft
              className="absolute left-0 cursor-pointer"
              onClick={onCancel}
            />
            <p className="text-lg font-semibold text-gray-800">New Ticket</p>
          </div>

          {/* Subject */}
          <div className="mb-6">
            <Input
              id="subject"
              label="Subject"
              placeholder="Select ticket subject"
              icon={<ChevronRight size={20} color="black" />}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          {/* Message */}
          <div>
            <label
              htmlFor="message"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Message
            </label>
            <textarea
              id="message"
              rows="6"
              className="w-full p-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            {error ? (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            ) : null}
          </div>
        </div>

        {/* Send */}
        <div className="mt-10">
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center bg-[#273e8e] text-white font-medium text-sm rounded-full py-4 px-6 shadow hover:bg-[#1e2f75] transition disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send"}
          </button>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden block min-h-screen bg-[#f5f6ff]">
        {/* Main Content */}
        <div className=" flex-1 flex flex-col">
          {/* Subject Input */}
          <div className="mb-6 mt-4">
            <label className="block text-ms font-medium text-gray-700 mb-2">
              Subject
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Select ticket subject"
                className="w-full text-xs bg-white border border-gray-300 rounded-lg px-3 py-4 outline-none pr-10"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
              <ChevronRight
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                size={16}
              />
            </div>
          </div>

          {/* Message Input */}
          <div className="flex-1 mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              placeholder=""
              className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none resize-none h-64"
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            {error ? (
              <p className="text-xs text-red-600 mt-2">{error}</p>
            ) : null}
          </div>
        </div>

        {/* Fixed Bottom Send Button */}
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f5f6ff] border-t border-gray-200">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#273e8e] text-white rounded-full py-3 text-sm font-medium disabled:opacity-60"
            disabled={submitting}
          >
            {submitting ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </>
  );
};

export default NewTicket;
