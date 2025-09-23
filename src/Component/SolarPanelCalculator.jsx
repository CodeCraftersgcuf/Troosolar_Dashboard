import React, { useState } from "react";
import { Minus, Plus, Search } from "lucide-react";

const SolarPanelCalculator = () => {
  // Sample appliance data matching the photo
  const applianceList = [
    { name: "Ceiling Fan", power: 70 },
    { name: "Laptop", power: 70 },
    { name: "LED Bulbs", power: 70 },
    
    { name: "Fridge", power: 70 },
    { name: "Washing Machine", power: 70 },
    { name: "Rech Fan", power: 70 },
    { name: "OX Fan", power: 70 },
    { name: '65" TV', power: 70 },
    { name: "CCTV Camera", power: 70 },
    { name: "Desktop", power: 70 },
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
  // NOTE: default hours = 1 so calculations aren't zeroed out
  const [appliances, setAppliances] = useState(
    applianceList.map((appliance) => ({ ...appliance, quantity: 2, hours: 1 }))
  );
  const [searchTerm, setSearchTerm] = useState("");

  // Show/Hide results card after clicking "Calculate Savings"
  const [showCalc, setShowCalc] = useState(false);

  // ---- Assumptions for solar sizing (kept internal; tweak as needed) ----
  const panelWatt = 200; // W per panel
  const sunHours = 4; // peak-sun-hours/day
  const systemVoltage = 24; // 12/24/48V system
  const derate = 0.75; // system losses (wiring, temp, dust, etc.)
  const powerFactor = 0.8; // inverter PF
  const maxPerController = 60; // max A per controller (common MPPT rating)

  const roundUp = (n, step = 1) => Math.ceil(n / step) * step;
  const nextStandardAmps = (i) => {
    const standard = [10, 15, 20, 30, 40, 50, 60, 80, 100, 125, 150, 200];
    return standard.find((a) => a >= i) ?? standard[standard.length - 1];
  };

  // Filter appliances based on search term
  const filteredAppliances = appliances.filter((appliance) =>
    appliance.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total power (your original display — Watts*qty*(hrs||1))
  const totalOutput = appliances.reduce(
    (total, appliance) =>
      total + appliance.power * appliance.quantity * (appliance.hours || 1),
    0
  );

  // Peak (instantaneous) load in Watts (ignores hours)
  const peakLoadW = appliances.reduce(
    (sum, a) => sum + a.power * a.quantity,
    0
  );

  // Daily energy in Wh (uses actual hours)
  const dailyWh = appliances.reduce(
    (sum, a) => sum + a.power * a.quantity * (a.hours || 0),
    0
  );

  // Inverter sizing (VA) from peak load
  const inverterVA = roundUp(peakLoadW / powerFactor, 100);

  // Required array Wp from daily energy, sun hours and derating
  const requiredArrayWp =
    dailyWh > 0 ? Math.ceil(dailyWh / (sunHours * derate)) : 0;

  // Number of panels
  const panelQty =
    requiredArrayWp > 0 ? Math.ceil(requiredArrayWp / panelWatt) : 0;

  // Array power in kW
  const panelBankkW = (panelQty * panelWatt) / 1000;

  // Array current @ system DC bus
  const arrayCurrentA =
    systemVoltage > 0 ? (panelQty * panelWatt) / systemVoltage : 0;

  // Controller size & qty
  const controllerNeededA = arrayCurrentA * 1.25; // 125% buffer
  const singleControllerA = nextStandardAmps(controllerNeededA); // rounded to standard
  const controllerQty =
    controllerNeededA <= maxPerController
      ? 1
      : Math.ceil(controllerNeededA / maxPerController);
  const controllerShownA =
    controllerQty === 1 ? singleControllerA : maxPerController;

  // Quick rack estimate: 2 panels per rack
  const panelRackQty = Math.ceil(panelQty / 2);

  // Update quantity for an appliance
  const updateQuantity = (index, newQuantity) => {
    const updatedAppliances = [...appliances];
    const originalIndex = appliances.findIndex(
      (item) => item.name === filteredAppliances[index].name
    );
    updatedAppliances[originalIndex].quantity = Math.max(0, newQuantity);
    setAppliances(updatedAppliances);
  };

  // Update usage hours for an appliance
  const updateHours = (index, hours) => {
    const updatedAppliances = [...appliances];
    const originalIndex = appliances.findIndex(
      (item) => item.name === filteredAppliances[index].name
    );
    updatedAppliances[originalIndex].hours = Math.max(0, Number(hours) || 0);
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
                        updateHours(index, e.target.value)
                      }
                      onBlur={(e) =>
                        updateHours(index, e.target.value)
                      }
                      placeholder="Hours"
                      min="0"
                      step="1"
                      className="w-16 mx-auto px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    />
                  </div>
                );
              })}
            </div>

            <button
              className="bg-[#273e8e] text-white rounded-full px-6 text-sm w-full py-5 mt-4"
              onClick={() => setShowCalc(true)}
            >
              Calculate Savings
            </button>

            {/* === DYNAMIC CALCULATIONS (desktop) === */}
            {showCalc && (
              <div className="flex flex-col bg-amber-100/50 p-2 px-4 gap-3 text-sm rounded-2xl border-[2px] border-dashed border-[#E8A91D]">
                <h1 className="py-3 font-medium text-lg">Calculations</h1>
                <DetailRow
                  label="Solar Panel Capacity"
                  value={`${panelWatt}w / panel`}
                />
                <DetailRow label="Panel Quantiy" value={`${panelQty}`} />
               
                <DetailRow
                  label="Panel Bank (Kwats)"
                  value={`${panelBankkW.toFixed(2)}`}
                />
                <div className="flex justify-between">
                  <span className={labelStyle}>Panel Rack</span>
                  <span className={valueStyle}>{panelRackQty}</span>
                </div>
              </div>
            )}
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

              {/* Inverter Rating */}
              <div className="w-1/2">
                <h2 className="text-lg  mb-2">Inverter Rating</h2>
                <div className="bg-white h-[60px] w-full rounded-xl flex justify-center items-center gap-2 text-[#273e8e] shadow-inner">
                  <span className="text-4xl font-bold">{inverterVA}</span>
                  <span className="text-sm self-end pb-2">VA</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View  */}
      <div className="min-h-screen sm:hidden block bg-[#f5f6ff] pb-20">
        {/* Introduction */}
        <div className="px-4 mb-3">
          <h2 className="text-[13px] font-semibold text-black mb-2">
            Select your appliance and their corresponding load and quantity
          </h2>
          <p className="text-[12px] text-gray-600">
            A solar panel calculator estimates the number and size of solar
            panels needed based on your energy usage. It helps you design an
            efficient solar system for your homes, businesses, or off-grid
            setups.
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-3">
          <div className="flex items-center bg-white rounded-lg px-3 py-3">
            <Search className="text-gray-400 w-5 h-5 mr-2" />
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
                    <button className="bg-[#273e8e] text-white rounded-full px-2 py-1 text-[6px] font-medium">
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
                    <span className="w-5 text-center font-medium text-[10px]">
                      {item.quantity}
                    </span>
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

        {/* === DYNAMIC CALCULATIONS (mobile) === */}
        {showCalc && (
          <div className="px-4 mb-3">
            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-black mb-3">
                Calculations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-700">Solar Panel Capacity</span>
                  <span className="font-medium text-gray-900">
                    {panelWatt}w / panel
                  </span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-700">Panel Quantity</span>
                  <span className="font-medium text-gray-900">{panelQty}</span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-700">Charge Controller</span>
                  <span className="font-medium text-gray-900">
                    {controllerShownA}A-{systemVoltage}V
                  </span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-700">Charge Controller qty</span>
                  <span className="font-medium text-gray-900">
                    {controllerQty}
                  </span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-700">Panel Bank (kwatts)</span>
                  <span className="font-medium text-gray-900">
                    {panelBankkW.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-700">Panel Rack</span>
                  <span className="font-medium text-gray-900">
                    {panelRackQty}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Total Output - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#273e8e] text-white px-4 py-3 flex items-center justify-between space-x-4">
          {/* Total Load Section */}
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-medium">Total Load</h2>
            <div className="bg-white rounded-lg px-6 py-3 flex items-center justify-center text-[#273e8e]">
              <span className="text-xl font-bold">
                {totalOutput.toLocaleString()}
              </span>
              <span className="text-sm ml-1">Watts</span>
            </div>
          </div>

          {/* Inverter Rating Section */}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-sm font-medium">Inverter Rating</h2>
            <div className="bg-white rounded-lg px-6 py-3 flex items-center justify-center text-[#273e8e]">
              <span className="text-xl font-bold">{inverterVA}</span>
              <span className="text-sm ml-1">VA</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolarPanelCalculator;
