import React, { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";

const SolarPanelCalculator = () => {
  // Sample appliance data matching the photo
  const applianceList = [
    { name: "Ceiling Fan", power: 70 },
    { name: "Laptop", power: 70 },
    { name: "LED Bulbs", power: 70 },
    { name: "Charger", power: 70 },
    { name: "Fridge", power: 70 },
    { name: "Washing Machine", power: 70 },
    { name: "Rech Fan", power: 70 },
    { name: "OX Fan", power: 70 },
    { name: "65\" TV", power: 70 },
    { name: "CCTV Camera", power: 70 },
    { name: "Desktop", power: 70 },
    { name: "Charger", power: 70 },
    { name: "Charger", power: 70 },
    { name: "Charger", power: 70 },
  ];

  const labelStyle = "text-gray-600 text-[16px]";
  const valueStyle = "text-[16px]";

  const DetailRow = ({ label, value }) => (
    <>
      <div className="flex justify-between">
        <span className={labelStyle}>{label}</span>
        <span className={valueStyle}>{value}</span>
      </div>
      <hr className="text-gray-400" />
    </>
  );

  // State for appliances with quantity
  const [appliances, setAppliances] = useState(
    applianceList.map((appliance) => ({ ...appliance, quantity: 2, hours: 0 }))
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Filter appliances based on search term
  const filteredAppliances = appliances.filter((appliance) =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total power
  const totalOutput = appliances.reduce(
    (total, appliance) =>
      total + appliance.power * appliance.quantity * (appliance.hours || 1),
    0
  );

  // Update quantity for an appliance
  const updateQuantity = (index, newQuantity) => {
    const updatedAppliances = [...appliances];
    // Find the actual index in the original array
    const originalIndex = appliances.findIndex(
      (item) => item.name === filteredAppliances[index].name
    );
    updatedAppliances[originalIndex].quantity = Math.max(0, newQuantity);
    setAppliances(updatedAppliances);
  };

  // Update usage hours for an appliance
  const updateHours = (index, hours) => {
    const updatedAppliances = [...appliances];
    // Find the actual index in the original array
    const originalIndex = appliances.findIndex(
      (item) => item.name === filteredAppliances[index].name
    );
    updatedAppliances[originalIndex].hours = Math.max(0, hours);
    setAppliances(updatedAppliances);
  };

  return (
    <>
      {/* Desktop View  */}
      <div className=" sm:block hidden min-h-screen bg-[#f5f6ff] px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Solar Panel Calculator</h1>
          <p className="text-gray-500 mt-8 max-w-2xl text-base">
            A solar panel calculator estimates the number and size of solar
            panels needed based on your energy usage. It helps you design an
            efficient solar system for your homes, businesses, or off-grid
            setups.
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6 w-full">
          {/* Appliance Table */}
          <div className="col-span-7 space-y-4">
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
            <div className="grid grid-cols-4 font-medium text-gray-700 text-center">
              <p>Appliance</p>
              <p>Quantity</p>
              <p>Total Power (W)</p>
              <p>Usage (hrs)</p>
            </div>

            {/* Appliance List */}
            <div className="rounded-2xl border bg-white p-4 divide-y">
              {filteredAppliances.map((item, index) => {
                const totalPower = item.power * item.quantity;

                return (
                  <div
                    key={index}
                    className="grid grid-cols-4 items-center text-center py-3 text-sm"
                  >
                    <p className="font-normal">{item.name}</p>

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
                      onChange={(e) =>
                        updateHours(index, parseInt(e.target.value) || 0)
                      }
                      className="w-16 mx-auto px-2 py-1 text-center border rounded bg-gray-100"
                    />
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col bg-amber-100/50 p-2 px-4 gap-3 text-sm rounded-2xl border-[2px] border-dashed border-[#E8A91D]">
              <h1 className="py-3 font-medium text-lg">Calculations</h1>
              <DetailRow label="Solar Panel Capacity" value={`200w`} />
              <DetailRow label="Panel Quantiy" value={`4`} />
              <DetailRow label="Charge Controller qty" value={`1`} />
              <DetailRow label="Charge Controller" value={`20A-24A`} />
              <DetailRow label="Panel Bank (Kwats)" value={`1000`} />
              <div className="flex justify-between">
                <span className={labelStyle}>Panel Rack</span>
                <span className={valueStyle}>2</span>
              </div>
            </div>
          </div>

          {/* Summary Box */}
          <div className="col-span-5">
            <div className="bg-[#273e8e] w-full text-white rounded-2xl px-6 py-6 flex justify-between items-center gap-6 shadow-lg">
              {/* Total Power in Watts */}
              <div className="w-1/2">
                <h2 className="text-lg  mb-2">Total Load</h2>
                <div className="bg-white h-[60px] w-full rounded-xl flex justify-center items-center gap-2 text-[#273e8e] shadow-inner">
                  <span className="text-4xl font-bold">{totalOutput}</span>
                  <span className="text-sm self-end pb-2">Watts</span>
                </div>
              </div>

              {/* Total Energy in Watt-hours */}
              <div className="w-1/2">
                <h2 className="text-lg  mb-2">Inverter Rating</h2>
                <div className="bg-white h-[60px] w-full rounded-xl flex justify-center items-center gap-2 text-[#273e8e] shadow-inner">
                  <span className="text-4xl font-bold">{totalOutput * 4}</span>
                  <span className="text-sm self-end pb-2">VA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View  */}
      <div className="min-h-screen sm:hidden block bg-white pb-20">
        {/* Header */}
        <div className="px-4 py-3">
          <h1 className="text-base font-semibold text-black">Solar Panel Calculator</h1>
        </div>

        {/* Introduction */}
        <div className="px-4 mb-3">
          <h2 className="text-sm font-semibold text-black mb-2">
            Select your appliance and their corresponding load and quantity
          </h2>
          <p className="text-xs text-gray-600">
            A solar panel calculator estimates the number and size of solar panels needed based on your energy usage. It helps you design an efficient solar system for your homes, businesses, or off-grid setups.
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-3">
          <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search className="text-gray-400 w-4 h-4 mr-2" />
            <input
              type="text"
              className="flex-1 bg-transparent outline-none text-xs placeholder:text-gray-400"
              placeholder="Search appliance"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Appliance Table */}
        <div className="px-4 mb-3">
          {/* Table Headers */}
          <div className="grid grid-cols-4 text-[10px] font-medium text-gray-600 text-center mb-2">
            <p>Appliance</p>
            <p>Quantity</p>
            <p>Total Power</p>
            <p>Usage/Hrs</p>
          </div>

          {/* Appliance List */}
          <div className="bg-white rounded-lg border divide-y max-h-80 overflow-y-auto">
            {filteredAppliances.map((item, index) => {
              const totalPower = item.power * item.quantity;
              
              return (
                <div
                  key={index}
                  className="grid grid-cols-4 items-center text-center py-2 text-[10px]"
                >
                  <div className="flex justify-center">
                    <button className="bg-[#273e8e] text-white rounded-full px-2 py-1 text-[10px] font-medium">
                      {item.name}
                    </button>
                  </div>

                  <div className="flex justify-center items-center gap-1">
                    <button 
                      className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-5 text-center font-medium text-[10px]">{item.quantity}</span>
                    <button 
                      className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <p className="font-medium text-[10px]">{totalPower}w</p>

                  <button className="bg-gray-200 text-gray-600 rounded px-2 py-1 text-[10px]">
                    Hrs
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Add New Appliance Button */}
        <div className="px-4 mb-3">
          <button className="w-full bg-white border border-gray-300 rounded-lg py-2 flex items-center justify-center gap-2 text-gray-600">
            <Plus size={14} />
            <span className="text-xs">Add New Appliance</span>
          </button>
        </div>

        {/* Calculations Section */}
        <div className="px-4 mb-3">
  <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-sm">
    <h3 className="text-sm font-semibold text-black mb-3">Calculations</h3>
    <div className="space-y-3 text-sm">
      <div className="flex justify-between border-b-1 border-gray-300 pb-2">
        <span className="text-gray-700">Solar Panel Capacity</span>
        <span className="font-medium text-gray-900">200w</span>
      </div>
      <div className="flex justify-between border-b-1 border-gray-300 pb-2">
        <span className="text-gray-700">Panel Quantity</span>
        <span className="font-medium text-gray-900">4</span>
      </div>
      <div className="flex justify-between border-b-1 border-gray-300 pb-2">
        <span className="text-gray-700">Charge Controller</span>
        <span className="font-medium text-gray-900">20A-24V</span>
      </div>
      <div className="flex justify-between border-b-1 border-gray-300 pb-2">
        <span className="text-gray-700">Charge Controller qty</span>
        <span className="font-medium text-gray-900">1</span>
      </div>
      <div className="flex justify-between border-b-1 border-gray-300 pb-2">
        <span className="text-gray-700">Panel Bank (kwatts)</span>
        <span className="font-medium text-gray-900">1000</span>
      </div>
    </div>
  </div>
</div>


        {/* Total Output - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#273e8e] text-white px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">Total Load</h2>
            <div className="bg-white rounded-lg px-2 py-1 flex items-center gap-1 text-[#273e8e]">
              <span className="text-lg font-bold">{totalOutput.toLocaleString()}</span>
              <span className="text-[10px]">Watts</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-medium">Inverter Rating</h2>
            <div className="bg-white rounded-lg px-2 py-1 flex items-center gap-1 text-[#273e8e]">
              <span className="text-lg font-bold">1,200</span>
              <span className="text-[10px]">VA</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolarPanelCalculator;
