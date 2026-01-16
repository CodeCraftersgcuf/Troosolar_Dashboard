import React, { useState, useEffect } from "react";
import { Minus, Plus, Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const SolarPanelCalculator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const fromBundles = searchParams.get("fromBundles") === "true";
  const qParam = searchParams.get("q");
  
  // Appliance data matching the Excel spreadsheet
  const applianceList = [
    { name: "Television", power: 120 },
    { name: "Ceiling Fan", power: 70 },
    { name: "Chest Freezer", power: 20 },
    { name: "Desktop Computer", power: 200 },
    { name: "Extractor Fan", power: 12 },
    { name: "Fluorescent Lamp", power: 45 },
    { name: "Freezer", power: 220 },
    { name: "Fridge", power: 200 },
    { name: "Inverter Air Conditioner", power: 767 },
    { name: "Water Dispenser", power: 1300 },
    { name: "Printer", power: 120 },
    { name: "Laptop Computer", power: 70 },
    { name: "LED Light Bulb", power: 3 },
    { name: "Smart Inverter Microwave", power: 1000 },
    { name: "Fan", power: 70 },
    { name: "Projector", power: 250 },
    { name: "Refrigerator", power: 200 },
    { name: "Sandwich Maker", power: 1000 },
    { name: "Scanner", power: 150 },
    { name: "DSTV Box", power: 30 },
    { name: "Pumping Machine", power: 767 },
    { name: "Smart Washing Machine", power: 700 },
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

  // Restore saved data from localStorage if coming from bundles
  const getSavedData = () => {
    try {
      const saved = localStorage.getItem("solarCalculatorData");
      if (saved && fromBundles) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Failed to restore calculator data:", e);
    }
    return null;
  };

  const savedData = getSavedData();

  // State for appliances with quantity
  // Initial values matching the Excel spreadsheet
  const getInitialApplianceData = (name) => {
    const dataMap = {
      "Television": { quantity: 1, hours: 2 },
      "Ceiling Fan": { quantity: 1, hours: 6 },
      "Chest Freezer": { quantity: 0, hours: 24 },
      "Desktop Computer": { quantity: 0, hours: 4 },
      "Extractor Fan": { quantity: 1, hours: 1 },
      "Fluorescent Lamp": { quantity: 1, hours: 8 },
      "Freezer": { quantity: 1, hours: 6 },
      "Fridge": { quantity: 1, hours: 6 },
      "Inverter Air Conditioner": { quantity: 0, hours: 6 },
      "Water Dispenser": { quantity: 1, hours: 1 },
      "Printer": { quantity: 1, hours: 1 },
      "Laptop Computer": { quantity: 1, hours: 12 },
      "LED Light Bulb": { quantity: 9, hours: 12 },
      "Smart Inverter Microwave": { quantity: 0, hours: 1 },
      "Fan": { quantity: 1, hours: 10 },
      "Projector": { quantity: 1, hours: 1 },
      "Refrigerator": { quantity: 1, hours: 3 },
      "Sandwich Maker": { quantity: 1, hours: 1 },
      "Scanner": { quantity: 0, hours: 1 },
      "DSTV Box": { quantity: 1, hours: 12 },
      "Pumping Machine": { quantity: 0, hours: 1 },
      "Smart Washing Machine": { quantity: 0, hours: 2 },
    };
    return dataMap[name] || { quantity: 0, hours: 0 };
  };

  const [appliances, setAppliances] = useState(() => {
    if (savedData?.appliances) {
      return savedData.appliances;
    }
    return applianceList.map((appliance) => {
      const initialData = getInitialApplianceData(appliance.name);
      return { ...appliance, quantity: initialData.quantity, hours: initialData.hours };
    });
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [newApplianceName, setNewApplianceName] = useState("");
  const [newAppliancePower, setNewAppliancePower] = useState("");

  // Show/Hide results card after clicking "Calculate Savings"
  const [showCalc, setShowCalc] = useState(() => {
    if (savedData?.showCalc) {
      return savedData.showCalc;
    }
    return false;
  });
  
  // Editable calculation values
  const [calcValues, setCalcValues] = useState(() => {
    if (savedData?.calcValues) {
      return savedData.calcValues;
    }
    return {
      inverterCapacity: 200,
      inverterQuantity: 3,
      batteryCapacity: 40,
      batteryCapacityVoltage: 24,
      batteryQuantity: 1,
      solarPanelCapacity: 200,
      solarPanelQuantity: 2,
    };
  });

  // Restore showCalc state when coming from bundles
  useEffect(() => {
    if (fromBundles) {
      try {
        const saved = localStorage.getItem("solarCalculatorData");
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.showCalc) {
            setShowCalc(true);
          }
        }
      } catch (e) {
        console.warn("Failed to restore showCalc state:", e);
      }
    }
  }, [fromBundles]);

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
  
  // Total energy per day for each appliance (for table display)
  const getTotalEnergyPerDay = (appliance) => {
    return appliance.power * appliance.quantity * (appliance.hours || 0);
  };

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

  // Add custom appliance
  const handleAddCustomAppliance = () => {
    if (!newApplianceName.trim() || !newAppliancePower || Number(newAppliancePower) <= 0) {
      alert("Please enter a valid appliance name and wattage.");
      return;
    }

    const newAppliance = {
      name: newApplianceName.trim(),
      power: Number(newAppliancePower),
      quantity: 1,
      hours: 1
    };

    setAppliances([...appliances, newAppliance]);
    setNewApplianceName("");
    setNewAppliancePower("");
    setShowAddAppliance(false);
  };

  // Proceed -> /solar-bundles?q=<peakLoadW>
  // Save calculator data before navigating
  const handleProceed = () => {
    // Calculate values before saving
    const currentPeakLoadW = appliances.reduce(
      (sum, a) => sum + a.power * a.quantity,
      0
    );
    const currentDailyWh = appliances.reduce(
      (sum, a) => sum + a.power * a.quantity * (a.hours || 0),
      0
    );
    
    const q = Math.max(0, Math.round(currentPeakLoadW));
    
    // Save current state to localStorage
    const dataToSave = {
      appliances,
      calcValues,
      showCalc,
      peakLoadW: currentPeakLoadW,
      dailyWh: currentDailyWh,
    };
    
    try {
      localStorage.setItem("solarCalculatorData", JSON.stringify(dataToSave));
    } catch (e) {
      console.warn("Failed to save calculator data:", e);
    }
    
    navigate(`/solar-bundles?q=${q}`);
  };

  return (
    <>
      {/* Desktop View  */}
      <div className=" sm:block hidden min-h-screen bg-[#f5f6ff] px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Load Calculator</h1>
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
            <div className="grid grid-cols-6 font-medium text-gray-700 text-center gap-2">
              <p>Appliance</p>
              <p>Wattage</p>
              <p>Quantity</p>
              <p>Total Power (W)</p>
              <p>Usage (hrs/day)</p>
              <p>Total energy/day</p>
            </div>

            {/* Appliance List */}
            <div className="rounded-2xl border bg-white p-4 divide-y">
              {filteredAppliances.map((item, index) => {
                const totalPower = item.power * item.quantity;
                const totalEnergyPerDay = getTotalEnergyPerDay(item);

                return (
                  <div
                    key={index}
                    className="grid grid-cols-6 items-center text-center py-3 text-sm gap-2"
                  >
                    <p className="font-normal">{item.name}</p>
                    
                    <p className="font-medium">{item.power}w</p>

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

                    <p className="font-medium">{totalPower}w</p>

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
                      step="0.5"
                      className="w-16 mx-auto px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    />
                    
                    <p className="font-medium">{totalEnergyPerDay} Wh</p>
                  </div>
                );
              })}
            </div>

            {/* Add Custom Appliance Section */}
            {!showAddAppliance ? (
              <button
                className="bg-white border-2 border-[#273e8e] text-[#273e8e] rounded-full px-6 text-sm w-full py-5 mt-4 flex items-center justify-center gap-2 hover:bg-[#273e8e] hover:text-white transition-colors"
                onClick={() => setShowAddAppliance(true)}
              >
                <Plus size={18} />
                Add Custom Appliance
              </button>
            ) : (
              <div className="bg-white border-2 border-[#273e8e] rounded-xl p-4 mt-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-700">Add Custom Appliance</h3>
                  <button
                    onClick={() => {
                      setShowAddAppliance(false);
                      setNewApplianceName("");
                      setNewAppliancePower("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Appliance Name</label>
                    <input
                      type="text"
                      value={newApplianceName}
                      onChange={(e) => setNewApplianceName(e.target.value)}
                      placeholder="e.g., Air Conditioner"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Wattage (W)</label>
                    <input
                      type="number"
                      value={newAppliancePower}
                      onChange={(e) => setNewAppliancePower(e.target.value)}
                      placeholder="e.g., 1500"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowAddAppliance(false);
                        setNewApplianceName("");
                        setNewAppliancePower("");
                      }}
                      className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCustomAppliance}
                      className="flex-1 bg-[#273e8e] text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-[#1a2b6b] transition-colors"
                    >
                      Add Appliance
                    </button>
                  </div>
                </div>
              </div>
            )}

            <button
              className="bg-[#273e8e] text-white rounded-full px-6 text-sm w-full py-5 mt-4"
              onClick={() => setShowCalc(true)}
            >
              Calculate Savings
            </button>

            {/* === DYNAMIC CALCULATIONS (desktop) === */}
            {showCalc && (
              <div className="flex flex-col bg-amber-100/50 p-4 gap-3 text-sm rounded-2xl border-[2px] border-dashed border-[#E8A91D]">
                <h1 className="py-2 font-medium text-lg">Calculations</h1>
                
                <div className="flex justify-between items-center">
                  <span className={labelStyle}>Inverter capacity</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calcValues.inverterCapacity}
                      onChange={(e) => setCalcValues({...calcValues, inverterCapacity: Number(e.target.value) || 0})}
                      className="w-24 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">w</span>
                  </div>
                </div>
                <hr className="text-gray-400" />
                
                <div className="flex justify-between items-center">
                  <span className={labelStyle}>Inverter Quantity</span>
                  <input
                    type="number"
                    value={calcValues.inverterQuantity}
                    onChange={(e) => setCalcValues({...calcValues, inverterQuantity: Number(e.target.value) || 0})}
                    className="w-24 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    min="0"
                  />
                </div>
                <hr className="text-gray-400" />
                
                <div className="flex justify-between items-center">
                  <span className={labelStyle}>Battery Capacity</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calcValues.batteryCapacity}
                      onChange={(e) => setCalcValues({...calcValues, batteryCapacity: Number(e.target.value) || 0})}
                      className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">A-</span>
                    <input
                      type="number"
                      value={calcValues.batteryCapacityVoltage}
                      onChange={(e) => setCalcValues({...calcValues, batteryCapacityVoltage: Number(e.target.value) || 0})}
                      className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">V</span>
                  </div>
                </div>
                <hr className="text-gray-400" />
                
                <div className="flex justify-between items-center">
                  <span className={labelStyle}>Battery Capacity Quantity</span>
                  <input
                    type="number"
                    value={calcValues.batteryQuantity}
                    onChange={(e) => setCalcValues({...calcValues, batteryQuantity: Number(e.target.value) || 0})}
                    className="w-24 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    min="0"
                  />
                </div>
                <hr className="text-gray-400" />
                
                <div className="flex justify-between items-center">
                  <span className={labelStyle}>Solar Panel Capacity</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={calcValues.solarPanelCapacity}
                      onChange={(e) => setCalcValues({...calcValues, solarPanelCapacity: Number(e.target.value) || 0})}
                      className="w-24 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">w</span>
                  </div>
                </div>
                <hr className="text-gray-400" />
                
                <div className="flex justify-between items-center">
                  <span className={labelStyle}>Solar Panel Quantity</span>
                  <input
                    type="number"
                    value={calcValues.solarPanelQuantity}
                    onChange={(e) => setCalcValues({...calcValues, solarPanelQuantity: Number(e.target.value) || 0})}
                    className="w-24 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    min="0"
                  />
                </div>
              </div>
            )}

            {/* Proceed Button - Below Calculations */}
            {showCalc && (
              <button
                className="bg-[#273e8e] text-white rounded-full px-6 text-sm w-full py-5 mt-4"
                onClick={handleProceed}
              >
                Proceed
              </button>
            )}
          </div>

          {/* Summary Box */}
          <div className="col-span-5">
            <div className="bg-[#273e8e] w-full text-white rounded-2xl px-6 py-6 flex justify-between items-center gap-6 shadow-lg">
              {/* Total Power in Watts */}
              <div className="w-1/2">
                <h2 className="text-lg  mb-2">Total Load in Watts</h2>
                <div className="bg-white h-[60px] w-full rounded-xl flex justify-center items-center gap-2 text-[#273e8e] shadow-inner">
                  <span className="text-4xl font-bold">{peakLoadW.toLocaleString()}</span>
                  <span className="text-sm self-end pb-2">Watts</span>
                </div>
              </div>

              {/* Total Energy */}
              <div className="w-1/2">
                <h2 className="text-lg  mb-2">Total Energy</h2>
                <div className="bg-white h-[60px] w-full rounded-xl flex justify-center items-center gap-2 text-[#273e8e] shadow-inner">
                  <span className="text-4xl font-bold">{dailyWh.toLocaleString()}</span>
                  <span className="text-sm self-end pb-2">Wh</span>
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
          <div className="grid grid-cols-6 text-[9px] font-medium text-gray-600 text-center mb-2 gap-1">
            <p>Appliance</p>
            <p>Wattage</p>
            <p>Qty</p>
            <p>Total Power</p>
            <p>Usage (hrs/day)</p>
            <p>Energy/day</p>
          </div>

          {/* Appliance List */}
          <div className="bg-white rounded-lg border divide-y max-h-80 overflow-y-auto">
            {filteredAppliances.map((item, index) => {
              const totalPower = item.power * item.quantity;
              const totalEnergyPerDay = getTotalEnergyPerDay(item);

              return (
                <div
                  key={index}
                  className="grid grid-cols-6 items-center text-center py-2 text-[9px] gap-1"
                >
                  <div className="flex justify-center">
                    <button className="bg-[#273e8e] text-white rounded-full px-2 py-1 text-[6px] font-medium">
                      {item.name}
                    </button>
                  </div>
                  
                  <p className="font-medium text-[9px]">{item.power}w</p>

                  <div className="flex justify-center items-center gap-1">
                    <button
                      className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity - 1)}
                    >
                      <Minus size={10} />
                    </button>
                    <span className="w-5 text-center font-medium text-[9px]">
                      {item.quantity}
                    </span>
                    <button
                      className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus size={10} />
                    </button>
                  </div>

                  <p className="font-medium text-[9px]">{totalPower}w</p>

                  <input
                    type="number"
                    value={item.hours}
                    onChange={(e) => updateHours(index, e.target.value)}
                    onBlur={(e) => updateHours(index, e.target.value)}
                    placeholder="Hrs"
                    min="0"
                    step="0.5"
                    className="w-12 mx-auto px-1 py-0.5 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-[9px]"
                  />
                  
                  <p className="font-medium text-[9px]">{totalEnergyPerDay} Wh</p>
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
            <div className="bg-yellow-50 border-2 border-dashed border-yellow-400 rounded-lg p-4 shadow-sm">
              <h3 className="text-sm font-semibold text-black mb-3">
                Calculations
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                  <span className="text-gray-700 text-xs">Inverter capacity</span>
                  <input
                    type="number"
                    value={calcValues.inverterCapacity}
                    onChange={(e) => setCalcValues({...calcValues, inverterCapacity: Number(e.target.value) || 0})}
                    className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                    min="0"
                  />
                  <span className="text-xs text-gray-500">w</span>
                </div>
                <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                  <span className="text-gray-700 text-xs">Inverter Quantity</span>
                  <input
                    type="number"
                    value={calcValues.inverterQuantity}
                    onChange={(e) => setCalcValues({...calcValues, inverterQuantity: Number(e.target.value) || 0})}
                    className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                    min="0"
                  />
                </div>
                <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                  <span className="text-gray-700 text-xs">Battery Capacity</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={calcValues.batteryCapacity}
                      onChange={(e) => setCalcValues({...calcValues, batteryCapacity: Number(e.target.value) || 0})}
                      className="w-16 px-1 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">A-</span>
                    <input
                      type="number"
                      value={calcValues.batteryCapacityVoltage}
                      onChange={(e) => setCalcValues({...calcValues, batteryCapacityVoltage: Number(e.target.value) || 0})}
                      className="w-16 px-1 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">V</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                  <span className="text-gray-700 text-xs">Battery Capacity Quantity</span>
                  <input
                    type="number"
                    value={calcValues.batteryQuantity}
                    onChange={(e) => setCalcValues({...calcValues, batteryQuantity: Number(e.target.value) || 0})}
                    className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                    min="0"
                  />
                </div>
                <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                  <span className="text-gray-700 text-xs">Solar Panel Capacity</span>
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={calcValues.solarPanelCapacity}
                      onChange={(e) => setCalcValues({...calcValues, solarPanelCapacity: Number(e.target.value) || 0})}
                      className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                      min="0"
                    />
                    <span className="text-xs text-gray-500">w</span>
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-gray-300 pb-2">
                  <span className="text-gray-700 text-xs">Solar Panel Quantity</span>
                  <input
                    type="number"
                    value={calcValues.solarPanelQuantity}
                    onChange={(e) => setCalcValues({...calcValues, solarPanelQuantity: Number(e.target.value) || 0})}
                    className="w-20 px-2 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                    min="0"
                  />
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
                {peakLoadW.toLocaleString()}
              </span>
              <span className="text-sm ml-1">Watts</span>
            </div>
          </div>

          {/* Total Energy Section */}
          <div className="flex flex-col items-center gap-1">
            <h2 className="text-sm font-medium">Total Energy</h2>
            <div className="bg-white rounded-lg px-6 py-3 flex items-center justify-center text-[#273e8e]">
              <span className="text-xl font-bold">{dailyWh.toLocaleString()}</span>
              <span className="text-sm ml-1">Wh</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolarPanelCalculator;
