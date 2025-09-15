import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { ChevronRight } from "lucide-react";
import { Input } from "../Input";
import ProfileTabs from "./ProfileTabs";
import UpdateAddress from "./UpdateAddress";
import API, { BASE_URL } from "../../config/api.config";

// turn BASE_URL (http://localhost:8000/api) into origin (http://localhost:8000)
const API_ORIGIN = BASE_URL.replace(/\/api\/?$/, "");

const toAbsolute = (p) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  if (p.startsWith("/")) return `${API_ORIGIN}${p}`;
  // common: "users/xyz.jpg" saved in public/
  return `${API_ORIGIN}/${p}`;
};

const getLocalUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const EditProfile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [form, setForm] = useState({
    first_name: "",
    surname: "",
    email: "",
    phone: "",
    password: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [saving, setSaving] = useState(false);

  // Prefill from localStorage (from login response)
  useEffect(() => {
    const u = getLocalUser();
    if (!u) return;
    setForm({
      first_name: u.first_name || u.name?.split(" ")[0] || "",
      surname:
        u.surname || u.last_name || u.name?.split(" ").slice(1).join(" ") || "",
      email: u.email || "",
      phone: u.phone || u.phone_number || "",
      password: "",
    });
    if (u.profile_picture) setAvatarPreview(toAbsolute(u.profile_picture));
  }, []);

  const onChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onFileChange = (e) => {
    const file = e.target.files?.[0];
    setAvatarFile(file || null);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();

      if (form.first_name) fd.append("first_name", form.first_name);

      // support both "surname" and "last_name" (depends on UpdateRequest)
      if (form.surname) {
        fd.append("surname", form.surname);
        fd.append("last_name", form.surname);
      }

      if (form.email) fd.append("email", form.email);

      // support both "phone" and "phone_number"
      if (form.phone) {
        fd.append("phone", form.phone);
        fd.append("phone_number", form.phone);
      }

      if (form.password) fd.append("password", form.password);
      if (avatarFile) fd.append("profile_picture", avatarFile);

      const token = localStorage.getItem("access_token");
      await axios.post(API.UPDATE_USER, fd, {
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      // keep local user in sync (server returns only submitted fields)
      const current = getLocalUser() || {};
      const merged = {
        ...current,
        first_name: form.first_name || current.first_name,
        surname: form.surname || current.surname,
        last_name: form.surname || current.last_name,
        email: form.email || current.email,
        phone: form.phone || current.phone,
        phone_number: form.phone || current.phone_number,
        profile_picture: avatarFile ? avatarPreview : current.profile_picture,
      };
      localStorage.setItem("user", JSON.stringify(merged));

      toast.success("Profile updated");
    } catch (err) {
      toast.error(
        err?.response?.data?.message ||
          err.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full sm:bg-white bg-[#F5F7FF] p-4">
      {/* Tabs */}
      <ProfileTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {/* Profile Picture */}
      {activeTab === "profile" && (
        <div className="flex flex-col items-center mb-6">
          <label htmlFor="avatar" className="cursor-pointer">
            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-400 overflow-hidden">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt="profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                "QA"
              )}
            </div>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">Tap to change photo</p>
        </div>
      )}
      {/* Tab Content */}
      {activeTab === "profile" ? (
        <form className="space-y-4" onSubmit={onSubmit}>
          <Input
            id="firstName"
            name="first_name"
            label="First Name"
            placeholder="First Name"
            value={form.first_name}
            onChange={onChange}
          />
          <Input
            id="surname"
            name="surname"
            label="Surname"
            placeholder="Surname"
            value={form.surname}
            onChange={onChange}
          />
          <Input
            id="email"
            name="email"
            type="email"
            label="Email Address"
            placeholder="Enter Email Address"
            value={form.email}
            onChange={onChange}
          />
          <Input
            id="phone"
            name="phone"
            label="Phone Number"
            placeholder="Enter Phone Number"
            value={form.phone}
            onChange={onChange}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label="Password (optional)"
            placeholder="Enter new password"
            value={form.password}
            onChange={onChange}
            icon={<ChevronRight size={24} color="black" />}
          />

          <button
            type="submit"
            disabled={saving}
            className="w-full bg-[#273e8e] text-white text-sm py-4 rounded-full mt-4 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      ) : (
        <UpdateAddress />
      )}
    </div>
  );
};

export default EditProfile;
