import React, { useState, useEffect, useCallback } from "react";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";

import API from "../../config/api.config";
import axios from "axios";

const UpdateAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    address: "",
    state: "",
    phone_number: "",
  });

  const token = localStorage.getItem("access_token");

  // Load addresses from API on component mount
  const loadAddresses = useCallback(async () => {
    if (!token) {
      setError("Please log in to view addresses.");
      return;
    }
    
    try {
      setLoading(true);
      setError("");
      const response = await axios.get(API.Get_All_Addresses, {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data.status === "success" && Array.isArray(response.data.message)) {
        setAddresses(response.data.message);
      } else {
        setError("Failed to load addresses.");
      }
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to load addresses.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      setError("Please log in to save addresses.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (editingId) {
        // Update existing address
        const response = await axios.put(
          API.Update_Address(editingId),
          formData,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success") {
          // Reload addresses to get updated data
          await loadAddresses();
          alert("Address updated successfully!");
        } else {
          setError("Failed to update address.");
        }
      } else {
        // Add new address
        const response = await axios.post(
          API.Add_Address,
          formData,
          {
            headers: {
              Accept: "application/json",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.status === "success") {
          // Reload addresses to get updated data
          await loadAddresses();
          alert("Address added successfully!");
        } else {
          setError("Failed to add address.");
        }
      }

      // Reset form
      setFormData({
        title: "",
        address: "",
        state: "",
        phone_number: "",
      });
      setShowForm(false);
      setEditingId(null);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message || "Failed to save address.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (address) => {
    setFormData({
      title: address.title,
      address: address.address,
      state: address.state,
      phone_number: address.phone_number,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!token) {
      setError("Please log in to delete addresses.");
      return;
    }

    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        setLoading(true);
        setError("");
        
        const response = await axios.delete(API.Delete_Address(id), {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.data.status === "success") {
          // Reload addresses to get updated data
          await loadAddresses();
          alert("Address deleted successfully!");
        } else {
          setError("Failed to delete address.");
        }
      } catch (err) {
        setError(err?.response?.data?.message || err?.message || "Failed to delete address.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAddNew = () => {
    setFormData({
      title: "",
      address: "",
      state: "",
      phone_number: "",
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: "",
      address: "",
      state: "",
      phone_number: "",
    });
  };

  if (showForm) {
    return (
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={handleCancel}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={24} className="text-gray-700" />
          </button>
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {editingId ? "Edit Address" : "Add new address"}
            </h1>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Home, Office, Work"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Address Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* State Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                State
              </label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleInputChange}
                placeholder="Enter your state"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent outline-none"
                required
              />
            </div>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Save Button - Fixed at bottom */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#273e8e] text-white py-4 rounded-lg font-medium hover:bg-[#1f2f6e] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Saving..." : "Save address"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg text-sm">
          Loading addresses...
        </div>
      )}

      {/* Address Cards */}
      <div className="flex-1">
        {addresses.length > 0 ? (
          <div className="space-y-4">
            {addresses.map((address) => (
              <div
                key={address.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-gray-200"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Title
                    </span>
                    <span className="text-sm text-gray-900 font-medium">
                      {address.title}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Address
                    </span>
                    <span className="text-sm text-gray-900">
                      {address.address}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      State
                    </span>
                    <span className="text-sm text-gray-900">
                      {address.state}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Phone number
                    </span>
                    <span className="text-sm text-gray-900">
                      {address.phone_number}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-4">
                  <button
                    onClick={() => handleEdit(address)}
                    className="p-2 text-gray-600 hover:text-[#273e8e] transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(address.id)}
                    className="p-2 text-red-500 hover:text-red-700 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500 text-sm">No addresses saved yet</p>
          </div>
        )}
      </div>

      {/* Add New Address Button - Fixed at bottom */}
      <div className="mt-auto pt-6">
        <button
          onClick={handleAddNew}
          className="w-full bg-[#273e8e] text-white py-4 rounded-lg font-medium hover:bg-[#1f2f6e] transition-colors"
        >
          Add new address
        </button>
      </div>
    </div>
  );
};

export default UpdateAddress;
