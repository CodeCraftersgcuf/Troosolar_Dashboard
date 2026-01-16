import React, { useState } from "react";
import { Minus, Plus, Search, X } from "lucide-react";
import { assets } from "../assets/data";
import { Link } from "react-router-dom";
const InverterLoadCalculator = () => {
  // Comprehensive appliance data from the Excel spreadsheet
  const applianceList = [
    // TVs
    { name: "22 Inch LED TV", power: 20 },
    { name: "32 Inch LED TV", power: 55 },
    { name: "42 Inch LED TV", power: 70 },
    { name: "46 Inch LED TV", power: 70 },
    { name: "55 Inch LED TV", power: 100 },
    { name: "65 Inch LED TV", power: 150 },
    { name: "82 Inch LED TV", power: 250 },
    { name: "Television", power: 120 },
    
    // Kitchen Appliances
    { name: "Air Fryer", power: 1500 },
    { name: "Coffee Machine", power: 1500 },
    { name: "Dishwasher", power: 1500 },
    { name: "Electric Kettle", power: 3000 },
    { name: "Electric Pressure Cooker", power: 1000 },
    { name: "Electric Stove", power: 2000 },
    { name: "Electric Water Heater", power: 1500 },
    { name: "Food Processor", power: 400 },
    { name: "Food Dehydrator", power: 800 },
    { name: "Deep Fryer", power: 1000 },
    { name: "Electric Iron", power: 1000 },
    { name: "Smart Inverter Microwave", power: 1000 },
    { name: "Electric Oven", power: 2150 },
    { name: "Pressure Cooker", power: 700 },
    { name: "Sandwich Maker", power: 1000 },
    { name: "Steam Iron", power: 2500 },
    { name: "Toaster", power: 1200 },
    { name: "Cooker Hood", power: 100 },
    { name: "Kitchen Extractor Fan", power: 200 },
    
    // Refrigeration
    { name: "Double Door Refrigerator", power: 220 },
    { name: "Chest Freezer", power: 20 },
    { name: "Freezer", power: 220 },
    { name: "Fridge", power: 200 },
    { name: "Fridge & Freezer", power: 400 },
    { name: "Refrigerator", power: 200 },
    { name: "Table Top Fridge", power: 65 },
    { name: "Wine Cooler", power: 100 },
    
    // Fans
    { name: "Ceiling Fan", power: 70 },
    { name: "Standing Fan", power: 70 },
    { name: "Table Fan", power: 25 },
    { name: "Wall Fan", power: 60 },
    { name: "Ox Fan", power: 150 },
    { name: "Fan", power: 70 },
    
    // Computers & Electronics
    { name: "Desktop Computer", power: 200 },
    { name: "Laptop Computer", power: 100 },
    { name: "Gaming Computer", power: 600 },
    { name: "Computer Monitor", power: 30 },
    { name: "Tablet Computer", power: 10 },
    { name: "Tablet Charger", power: 15 },
    { name: "Game Console", power: 200 },
    { name: "Playstation 4", power: 90 },
    { name: "Playstation 5", power: 200 },
    { name: "Xbox One", power: 110 },
    { name: "DVD Player", power: 60 },
    { name: "Projector", power: 250 },
    { name: "Home Sound System", power: 95 },
    
    // Lighting
    { name: "LED Light Bulb", power: 3 },
    { name: "LED Light Bulb (6W)", power: 6 },
    { name: "LED Light Bulb (10W)", power: 10 },
    { name: "LED Light Bulb (12W)", power: 12 },
    { name: "LED Light Bulb (18W)", power: 18 },
    { name: "LED Light Bulb (32W)", power: 32 },
    { name: "LED Halogen Light Bulb", power: 100 },
    { name: "Fluorescent Lamp", power: 45 },
    { name: "Table Lamp", power: 65 },
    
    // Air Conditioning & Climate
    { name: "Inverter Air Conditioner (1HP)", power: 767 },
    { name: "Inverter Air Conditioner (1.5HP)", power: 1200 },
    { name: "Inverter Air Conditioner (2HP)", power: 1600 },
    { name: "Inverter Air Conditioner", power: 767 },
    { name: "Air Purifier", power: 30 },
    { name: "Dehumidifier", power: 240 },
    { name: "Humidifier", power: 40 },
    
    // Water & Dispensers
    { name: "Water Dispenser", power: 100 },
    { name: "Hot Water Dispenser", power: 1300 },
    { name: "Electric Boiler", power: 14000 },
    { name: "Aquarium Pump", power: 50 },
    
    // Laundry
    { name: "Washing Machine", power: 800 },
    { name: "Smart Washing Machine", power: 800 },
    { name: "Washing Machine & Dryer", power: 2400 },
    { name: "Clothes Dryer", power: 5000 },
    
    // Personal Care
    { name: "Hair Blow Dryer", power: 1500 },
    { name: "Heated Hair Rollers", power: 400 },
    { name: "Hair Straighteners", power: 300 },
    { name: "Electric Shaver", power: 20 },
    
    // Office Equipment
    { name: "Printer", power: 120 },
    { name: "Inkjet Printer", power: 30 },
    { name: "Laser Printer", power: 800 },
    { name: "Scanner", power: 20 },
    { name: "Paper Shredder", power: 220 },
    { name: "Sewing Machine", power: 100 },
    { name: "Soldering Iron", power: 60 },
    
    // Entertainment & Communication
    { name: "DSTV Box", power: 30 },
    { name: "Home Internet Router", power: 15 },
    { name: "WiFi Router", power: 10 },
    
    // Tools & Equipment
    { name: "Electric Drill", power: 850 },
    { name: "Cordless Drill Charger", power: 150 },
    { name: "Electric Mower", power: 1500 },
    { name: "Lawnmower", power: 1400 },
    { name: "Electric Garage Door", power: 400 },
    { name: "Vacuum Cleaner", power: 900 },
    { name: "Treadmill", power: 900 },
    
    // Pumps & Motors
    { name: "Pumping Machine (0.5HP)", power: 2500 },
    { name: "Pumping Machine (1HP)", power: 5000 },
    { name: "Pumping Machine (1.5HP)", power: 7500 },
    { name: "Pumping Machine (2HP)", power: 10000 },
    { name: "Pumping Machine", power: 2500 },
    
    // Other Appliances
    { name: "Extractor Fan", power: 12 },
    { name: "Jacuzzi", power: 7500 },
    { name: "Steriliser", power: 650 },
  ];

  // State for appliances with quantity
  const [appliances, setAppliances] = useState(
    applianceList.map((appliance) => ({ ...appliance, quantity: 0, hours: 0 }))
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("Home");
  const [selectedHouse, setSelectedHouse] = useState(null);
  const [showAddAppliance, setShowAddAppliance] = useState(false);
  const [newApplianceName, setNewApplianceName] = useState("");
  const [newAppliancePower, setNewAppliancePower] = useState("");

  // House types
  const houseData = [
    { id: "1", name: "1 Bedroom", image: assets.house1 },
    { id: "2", name: "2 Bedroom", image: assets.house2 },
    { id: "3", name: "3 Bedroom", image: assets.house3 },
    { id: "4", name: "Custom", image: assets.house4 },
  ];

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
      hours: 0
    };

    setAppliances([...appliances, newAppliance]);
    setNewApplianceName("");
    setNewAppliancePower("");
    setShowAddAppliance(false);
  };

  return (
    <>
      {/* Desktop View  */}
      <div className="min-h-screen sm:block hidden bg-[#f5f6ff] px-10 py-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium">Inverter Load Calculator</h1>
          <p className="text-gray-500 mt-2 max-w-2xl text-base">
            Estimate total power needs to select a suitable inverter and battery
            size for efficient backup.
          </p>
        </div>

        {/* Main Grid */}
        <Link to="/" className="text-[#273e8e] underline text-left">
          Go Back
        </Link>
        <div className="grid grid-cols-12 gap-6 w-full mt-4">
          {/* Room Options */}
          <div className="col-span-2 flex flex-col gap-4">
            {houseData.map((house) => (
              <div
                key={house.id}
                onClick={() => setSelectedHouse(house.id)}
                className={`bg-white p-4 flex flex-col justify-center items-center h-[110px] w-[110px] rounded-2xl shadow-2xl cursor-pointer transition ${
                  selectedHouse === house.id
                    ? "border-2 border-[#273e8e]"
                    : "border-2 border-gray-300"
                }`}
              >
                <img
                  src={house.image}
                  alt={house.name}
                  className="w-8 h-8 object-contain"
                />
                <p className="mt-2 text-xs font-medium text-gray-700">
                  {house.name}
                </p>
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
                      onChange={(e) =>
                        updateHours(index, parseInt(e.target.value) || 0)
                      }
                      placeholder="Hours"
                      className="w-16 mx-auto px-2 py-1 text-center outline-none rounded bg-gray-100 text-gray-500"
                    />
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
                      placeholder="e.g., Custom Device"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Wattage (W)</label>
                    <input
                      type="number"
                      value={newAppliancePower}
                      onChange={(e) => setNewAppliancePower(e.target.value)}
                      placeholder="e.g., 500"
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
          </div>

          {/* Summary Box */}
          <div className="col-span-4">
            <div className="bg-[#273e8e] text-white rounded-2xl px-1 py-2 flex justify-center items-center  gap-4 shadow-lg">
              <h2 className="text-xl font-medium w-[50%] text-center">
                Total Output
              </h2>
              <div className="bg-white h-[60px] w-[50%] rounded-xl px-1 flex justify-center items-center gap-2 text-[#273e8e]">
                <span className="text-2xl font-medium">{totalOutput}</span>
                <span className="text-lg">Watt</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View  */}
      <div className="min-h-screen bg-[#f5f6ff] sm:hidden block">
        {/* Home/Office Selection */}
        <div className="px-3 mb-4 bg-white max-w-[180px] border border-gray-300 rounded-4xl py-3">
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedType("Home")}
              className={`py-2 px-5 rounded-full font-medium text-[12px] transition-all duration-300 ease-in-out ${
                selectedType === "Home"
                  ? "bg-[#273e8e] text-white"
                  : " text-gray-600"
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setSelectedType("Office")}
              className={`py-2 px-5 rounded-full font-medium text-[12px] transition-all duration-300 ease-in-out ${
                selectedType === "Office"
                  ? "bg-[#273e8e] text-white"
                  : "text-gray-600"
              }`}
            >
              Office
            </button>
          </div>
        </div>

        {/* House Selection Cards */}
        <div className="px-4 mb-6">
          <div className="grid grid-cols-4 gap-2 ">
            {houseData.map((house) => (
              <div
                key={house.id}
                onClick={() => setSelectedHouse(house.id)}
                className={`p-3 py-4 rounded-lg flex flex-col items-center ${
                  selectedHouse === house.id
                    ? "bg-white border-2 border-[#273e8e]"
                    : "bg-white border border-gray-200"
                }`}
              >
                <img
                  src={house.image}
                  alt={house.name}
                  className="w-6 h-6 object-contain mb-1"
                />
                <p className="text-[8px] font-medium text-center">
                  {house.name}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Title and Description */}
        <div className="px-4 mb-4">
          <h2 className="text-[14px] font-semibold text-black mb-2">
            Inverter Load Calculator
            {selectedHouse
              ? ` for ${
                  houseData.find((h) => h.id === selectedHouse)?.name
                } Apartment`
              : ""}
          </h2>
          <p className="text-[12px] text-gray-600">
            An inverter load calculator helps estimate the total power needed to
            run selected appliances. It guides you in choosing the right
            inverter and battery size for efficient backup.
          </p>
        </div>

        {/* Search Bar */}
        <div className="px-4 mb-4">
          <div className="flex items-center bg-white rounded-lg px-3 py-3">
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
                    <span className="w-6 text-center font-medium">
                      {item.quantity}
                    </span>
                    <button
                      className="bg-[#273e8e] text-white rounded p-1 cursor-pointer"
                      onClick={() => updateQuantity(index, item.quantity + 1)}
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <p className="font-medium">{totalPower}w</p>

                  <input
                    type="number"
                    value={item.hours}
                    onChange={(e) =>
                      updateHours(index, parseInt(e.target.value) || 0)
                    }
                    placeholder="Hrs"
                    min="0"
                    className="w-12 mx-auto px-1 py-1 text-center border rounded bg-white outline-none focus:border-[#273e8e] text-xs"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Add Custom Appliance Section */}
        <div className="px-4 mb-4">
          {!showAddAppliance ? (
            <button
              className="w-full bg-white border-2 border-[#273e8e] text-[#273e8e] rounded-lg py-3 flex items-center justify-center gap-2 hover:bg-[#273e8e] hover:text-white transition-colors"
              onClick={() => setShowAddAppliance(true)}
            >
              <Plus size={16} />
              <span className="text-sm">Add Custom Appliance</span>
            </button>
          ) : (
            <div className="bg-white border-2 border-[#273e8e] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-gray-700">Add Custom Appliance</h3>
                <button
                  onClick={() => {
                    setShowAddAppliance(false);
                    setNewApplianceName("");
                    setNewAppliancePower("");
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Appliance Name</label>
                  <input
                    type="text"
                    value={newApplianceName}
                    onChange={(e) => setNewApplianceName(e.target.value)}
                    placeholder="e.g., Custom Device"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e] text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Wattage (W)</label>
                  <input
                    type="number"
                    value={newAppliancePower}
                    onChange={(e) => setNewAppliancePower(e.target.value)}
                    placeholder="e.g., 500"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[#273e8e] focus:ring-1 focus:ring-[#273e8e] text-sm"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowAddAppliance(false);
                      setNewApplianceName("");
                      setNewAppliancePower("");
                    }}
                    className="flex-1 border-2 border-gray-300 text-gray-700 rounded-lg px-3 py-2 text-xs font-medium hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCustomAppliance}
                    className="flex-1 bg-[#273e8e] text-white rounded-lg px-3 py-2 text-xs font-medium hover:bg-[#1a2b6b] transition-colors"
                  >
                    Add Appliance
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Total Output - Fixed Bottom */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#273e8e] text-white px-4 py-4 flex items-center justify-between">
          <h2 className="text-lg font-medium">Total Output</h2>
          <div className="bg-white rounded-lg px-4 py-2 flex items-center gap-2 text-[#273e8e]">
            <span className="text-2xl font-bold">
              {totalOutput.toLocaleString()}
            </span>
            <span className="text-sm">Watts</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default InverterLoadCalculator;
