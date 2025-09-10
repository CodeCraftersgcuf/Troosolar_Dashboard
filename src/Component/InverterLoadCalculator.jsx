import React, { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import { assets } from "../assets/data";
import { Link } from "react-router-dom";
const InverterLoadCalculator = () => {
  // Sample appliance data matching the photo
  const applianceList = [
    { name: "Ceiling Fan", power: 70 },
    { name: "Laptop", power: 70 },
    { name: "LED Bulbs", power: 70 },
    { name: "Charger", power: 70 },
    { name: "Fridge", power: 70 },
    { name: "Washing machine", power: 70 },
    { name: "Rechargeable fan", power: 70 },
    { name: "OX Fan", power: 70 },
    { name: "65\" TV", power: 70 },
    { name: "CCTV Camera", power: 70 },
    { name: "Desktop", power: 70 },
    { name: "Pumping Machine", power: 70 },
    { name: "Phone Charger", power: 70 },
  ];

  // State for appliances with quantity
  const [appliances, setAppliances] = useState(
    applianceList.map(appliance => ({ ...appliance, quantity: 2, hours: 0 }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Home");
  const [selectedHouse, setSelectedHouse] = useState("1");

  // House types
  const houseData = [
    { id: "1", name: "1 Bedroom", image: assets.house1 },
    { id: "2", name: "2 Bedroom", image: assets.house2 },
    { id: "3", name: "3 Bedroom", image: assets.house3 },
    { id: "4", name: "Custom", image: assets.house4 },
  ];

  // Filter appliances based on search term
  const filteredAppliances = appliances.filter(appliance =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total power
  const totalOutput = appliances.reduce(
    (total, appliance) => total + (appliance.power * appliance.quantity * (appliance.hours || 1)),
    0
  );

  // Update quantity for an appliance
  const updateQuantity = (index, newQuantity) => {
    const updatedAppliances = [...appliances];
    // Find the actual index in the original array
    const originalIndex = appliances.findIndex(
      item => item.name === filteredAppliances[index].name
    );
    updatedAppliances[originalIndex].quantity = Math.max(0, newQuantity);
    setAppliances(updatedAppliances);
  };

  // Update usage hours for an appliance
  const updateHours = (index, hours) => {
    const updatedAppliances = [...appliances];
    // Find the actual index in the original array
    const originalIndex = appliances.findIndex(
      item => item.name === filteredAppliances[index].name
    );
    updatedAppliances[originalIndex].hours = Math.max(0, hours);
    setAppliances(updatedAppliances);
  };

  return (
    <>
    {/* Desktop View  */}
    <div className="min-h-screen sm:block hidden bg-[#f5f6ff] px-10 py-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium]">Inverter Load Calculator</h1>
        <p className="text-gray-500 mt-2 max-w-2xl text-base">
          Estimate total power needs to select a suitable inverter and battery size for efficient backup.
        </p>
      </div>

      {/* Main Grid */}
      <Link to="/" className="text-[#273e8e] underline text-left">Go Back</Link>
      <div className="grid grid-cols-12 gap-6 w-full mt-4">
        {/* Room Options */}
        <div className="col-span-2 flex flex-col gap-4">
          {houseData.map((house) => (
            <div
              key={house.id}
              className="bg-white p-4 flex flex-col justify-center items-center h-[110px] w-[110px] rounded-2xl border-2 border-[#273e8e] shadow-2xl cursor-pointer transition"
            >
              <img src={house.image} alt={house.name} className="w-8 h-8 object-contain" />
              <p className="mt-2 text-xs font-medium text-gray-700">{house.name}</p>
            </div>
          ))}
        </div>

        {/* Appliance Table */}
        <div className="col-span-6 space-y-4">
          {/* Search */}
          <div className="flex items-center w-full border-2 border-gray-300 rounded-xl bg-white px-4 py-3">
            <Search className="text-gray-400 w-6 h-6 mr-3" />
            <input
              type="text"
              className="w-full outline-none text-[16px] bg-transparent placeholder:text-gray-400"
              placeholder="Search appliances"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-5 text-[13px] text-gray-700 text-center">
            <p>Appliance</p>
            <p>Power (W)</p>
            <p>Quantity</p>
            <p>Total (W)</p>
            <p>Usage (hrs)</p>
          </div>

          {/* Appliance List */}
          <div className="rounded-2xl border bg-white p-4 divide-y">
            {filteredAppliances.map((item, index) => {
              const totalPower = item.power * item.quantity;
              
              return (
                <div
                  key={index}
                  className="grid grid-cols-5 items-center text-center py-3 text-sm"
                >
                  <p className="font-normal">{item.name}</p>
                  <p className="font-medium">{item.power}</p>

                  <div className="flex justify-center items-center gap-2">
                    <button 
                      className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                    >
                      <Minus size={16} />
                    </button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <button 
                      className="bg-[#273e8e] text-white rounded p-1.5 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus size={16} />
                    </button>
                  </div>

                  <p className="font-medium">{totalPower}</p>

                  <input
                    type="number"
                    value={item.hours}
                    onChange={(e) => updateHours(index, parseInt(e.target.value) || 0)}
                    placeholder="Hours"
                    className="w-16 mx-auto px-2 py-1 text-center outline-none rounded bg-gray-100 text-gray-500"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary Box */}
        <div className="col-span-4">
          <div className="bg-[#273e8e] text-white rounded-2xl px-1 py-2 flex justify-center items-center  gap-4 shadow-lg">
            <h2 className="text-xl font-medium w-[50%] text-center">Total Output</h2>
            <div className="bg-white h-[60px] w-[50%] rounded-xl px-1 flex justify-center items-center gap-2 text-[#273e8e]">
              <span className="text-2xl font-medium">{totalOutput}</span>
              <span className="text-lg">Watt</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Mobile View  */}
    <div className="min-h-screen bg-white sm:hidden block">
      {/* Header */}
      <div className="px-4 py-4">
        <h1 className="text-lg font-semibold text-black">Inverter load Calculator</h1>
      </div>

      {/* Home/Office Selection */}
      <div className="px-4 mb-4">
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedType("Home")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${
              selectedType === "Home" 
                ? "bg-[#273e8e] text-white" 
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => setSelectedType("Office")}
            className={`flex-1 py-3 px-4 rounded-lg font-medium ${
              selectedType === "Office" 
                ? "bg-[#273e8e] text-white" 
                : "bg-gray-200 text-gray-600"
            }`}
          >
            Office
          </button>
        </div>
      </div>

      {/* House Selection Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-4 gap-2">
          {houseData.map((house) => (
            <div
              key={house.id}
              onClick={() => setSelectedHouse(house.id)}
              className={`p-3 rounded-lg flex flex-col items-center ${
                selectedHouse === house.id 
                  ? "bg-blue-100 border-2 border-[#273e8e]" 
                  : "bg-white border border-gray-200"
              }`}
            >
              <img 
                src={house.image} 
                alt={house.name} 
                className="w-6 h-6 object-contain mb-1"
                style={{
                  filter: selectedHouse === house.id 
                    ? "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(224deg) brightness(89%) contrast(97%)"
                    : "none"
                }}
              />
              <p className="text-xs font-medium text-center">{house.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Title and Description */}
      <div className="px-4 mb-4">
        <h2 className="text-lg font-semibold text-black mb-2">
          Inverter Load Calculator for {houseData.find(h => h.id === selectedHouse)?.name} Apartment
        </h2>
        <p className="text-sm text-gray-600">
          An inverter load calculator helps estimate the total power needed to run selected appliances. It guides you in choosing the right inverter and battery size for efficient backup.
        </p>
      </div>

      {/* Search Bar */}
      <div className="px-4 mb-4">
        <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
          <Search className="text-gray-400 w-5 h-5 mr-2" />
          <input
            type="text"
            className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
            placeholder="Search appliance"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Appliance Table */}
      <div className="px-4 mb-4">
        {/* Table Headers */}
        <div className="grid grid-cols-5 text-xs font-medium text-gray-600 text-center mb-2">
          <p>Appliance</p>
          <p>Power</p>
          <p>Quantity</p>
          <p>Total</p>
          <p>Usage(hrs)</p>
        </div>

        {/* Appliance List */}
        <div className="bg-white rounded-lg border divide-y max-h-96 overflow-y-auto">
          {filteredAppliances.map((item, index) => {
            const totalPower = item.power * item.quantity;
            
            return (
              <div
                key={index}
                className="grid grid-cols-5 items-center text-center py-3 text-xs"
              >
                <p className="font-normal text-left pl-2">{item.name}</p>
                <p className="font-medium">{item.power}w</p>

                <div className="flex justify-center items-center gap-1">
                  <button 
                    className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                    onClick={() => updateQuantity(index, item.quantity - 1)}
                  >
                    <Minus size={12} />
                  </button>
                  <span className="w-6 text-center font-medium">{item.quantity}</span>
                  <button 
                    className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                    onClick={() => updateQuantity(index, item.quantity + 1)}
                  >
                    <Plus size={12} />
                  </button>
                </div>

                <p className="font-medium">{totalPower}w</p>

                <button className="bg-gray-200 text-gray-600 rounded px-2 py-1 text-xs">
                  Hrs
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Appliance Button */}
      <div className="px-4 mb-4">
        <button className="w-full bg-white border border-gray-300 rounded-lg py-3 flex items-center justify-center gap-2 text-gray-600">
          <Plus size={16} />
          <span className="text-sm">Add New Appliance</span>
        </button>
      </div>

      {/* Total Output - Fixed Bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#273e8e] text-white px-4 py-4 flex items-center justify-between">
        <h2 className="text-lg font-medium">Total Output</h2>
        <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2 text-[#273e8e]">
          <span className="text-2xl font-bold">{totalOutput.toLocaleString()}</span>
          <span className="text-sm">Watts</span>
        </div>
      </div>
    </div>
    </>
  );
};

export default InverterLoadCalculator;