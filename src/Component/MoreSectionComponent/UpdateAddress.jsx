import React, { useState, useEffect } from "react";
import { ChevronLeft, Edit, Trash2 } from "lucide-react";

const UpdateAddress = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    address: "",
    state: "",
    phoneNumber: "",
    isDefault: false,
  });

  // Load addresses from localStorage on component mount
  useEffect(() => {
    const savedAddresses = localStorage.getItem("userAddresses");
    if (savedAddresses) {
      setAddresses(JSON.parse(savedAddresses));
    }
  }, []);

  // Save addresses to localStorage whenever addresses change
  useEffect(() => {
    localStorage.setItem("userAddresses", JSON.stringify(addresses));
  }, [addresses]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (editingId) {
      // Update existing address
      setAddresses((prev) =>
        prev.map((addr) =>
          addr.id === editingId ? { ...addr, ...formData, id: editingId } : addr
        )
      );
    } else {
      // Add new address
      const newAddress = {
        id: Date.now(),
        ...formData,
      };
      setAddresses((prev) => [...prev, newAddress]);
    }

    // Reset form
    setFormData({
      address: "",
      state: "",
      phoneNumber: "",
      isDefault: false,
    });
    setShowForm(false);
    setEditingId(null);
    alert("Address saved successfully!");
  };

  const handleEdit = (address) => {
    setFormData({
      address: address.address,
      state: address.state,
      phoneNumber: address.phoneNumber,
      isDefault: address.isDefault,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      setAddresses((prev) => prev.filter((addr) => addr.id !== id));
    }
  };

  const handleAddNew = () => {
    setFormData({
      address: "",
      state: "",
      phoneNumber: "",
      isDefault: false,
    });
    setEditingId(null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      address: "",
      state: "",
      phoneNumber: "",
      isDefault: false,
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
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent outline-none"
                required
              />
            </div>

            {/* Default Address Checkbox */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="isDefault"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-5 h-5 text-[#273e8e] bg-gray-100 border-gray-300 rounded focus:ring-[#273e8e] focus:ring-2"
              />
              <label
                htmlFor="isDefault"
                className="text-sm font-medium text-gray-700"
              >
                Mark as default address
              </label>
            </div>
          </form>
        </div>

        {/* Save Button - Fixed at bottom */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleSubmit}
            className="w-full bg-[#273e8e] text-white py-4 rounded-lg font-medium hover:bg-[#1f2f6e] transition-colors"
          >
            Save address
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
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
                    <span className="text-sm text-gray-900">{address.state}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500">
                      Phone number
                    </span>
                    <span className="text-sm text-gray-900">
                      {address.phoneNumber}
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
