import { ChevronDown } from "lucide-react";
import React, { useState, useRef } from "react";

// Fixed per-capacity data from SOLAR/GENERATOR COST SAVINGS ANALYSIS spreadsheet.
// Only Monthly Service Cost, Monthly PHCN Bill, and Cost of Generator are customer-editable.
const GENERATOR_DATA = {
  "1.2kva": {
    label: "1.2kVA / 1.5kVA / 1.8kVA",
    hourlyFuelL: 0.65,
    defaultMonthlyService: 20000,
    defaultMonthlyPHCN: 5000,
    defaultCostOfGenerator: 130000,
    costOfSolarSystem: 0, // spreadsheet uses maintenance-only for this column (150k over 5y)
  },
  "3.6kva": {
    label: "3.6kVA / 4kVA",
    hourlyFuelL: 1.5,
    defaultMonthlyService: 20000,
    defaultMonthlyPHCN: 5000,
    defaultCostOfGenerator: 0,
    costOfSolarSystem: 2600000,
  },
  "6.5kva": {
    label: "5kVA / 6kVA / 6.5kVA",
    hourlyFuelL: 3.0,
    defaultMonthlyService: 20000,
    defaultMonthlyPHCN: 5000,
    defaultCostOfGenerator: 0,
    costOfSolarSystem: 4500000,
  },
  "8.5kva": {
    label: "7.5kVA / 8kVA / 8.5kVA",
    hourlyFuelL: 4.75,
    defaultMonthlyService: 20000,
    defaultMonthlyPHCN: 5000,
    defaultCostOfGenerator: 0,
    costOfSolarSystem: 7500000,
  },
  "11kva": {
    label: "10kVA / 11kVA",
    hourlyFuelL: 6.25,
    defaultMonthlyService: 20000,
    defaultMonthlyPHCN: 5000,
    defaultCostOfGenerator: 0,
    costOfSolarSystem: 11000000,
  },
  "12kva-diesel": {
    label: "12kVA - Diesel",
    hourlyFuelL: 2.9,
    defaultMonthlyService: 20000,
    defaultMonthlyPHCN: 5000,
    defaultCostOfGenerator: 0,
    costOfSolarSystem: 14000000,
    fuelCostPerLitre: 1000, // Diesel default
  },
};

// Solar maintenance (Naira) from spreadsheet – fixed, not customer-editable
const SOLAR_MAINTENANCE_5_YEARS = 150000;

const SolarSavingCalculator = () => {
  const [generatorSize, setGeneratorSize] = useState("");
  // Only these three values are customer-editable (per spreadsheet)
  const [monthlyServiceCost, setMonthlyServiceCost] = useState("20000");
  const [monthlyPHCNBill, setMonthlyPHCNBill] = useState("5000");
  const [costOfGenerator, setCostOfGenerator] = useState("130000");

  const [results, setResults] = useState({
    totalSavings: 0,
    genSpend: 0,
    solarSpend: 0,
    totalMonthlyEnergyBill: 0,
  });
  const [hasCalculated, setHasCalculated] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const resultRef = useRef(null);

  const generatorSizes = Object.entries(GENERATOR_DATA).map(([value, d]) => ({
    value,
    label: d.label,
  }));

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const calculateSavings = () => {
    if (!generatorSize) return;
    setIsCalculating(true);
    setHasCalculated(false);
    resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });

    // Small delay so user sees "Calculating..." and result area scrolls into view
    setTimeout(() => {
      const genData = GENERATOR_DATA[generatorSize];
      if (!genData) {
        setIsCalculating(false);
        return;
      }

      const fuelPerLitre =
        genData.fuelCostPerLitre ?? 750; // Default Petrol 750; Diesel 1000
      const hoursPerDay = 4; // Fixed default from spreadsheet
      const service = parseFloat(monthlyServiceCost) || 0;
      const phcn = parseFloat(monthlyPHCNBill) || 0;
      const genCapEx = parseFloat(costOfGenerator) || 0;

      // Total Daily Cost of Fuel = Hourly Fuel Consumption * Daily Hours * Cost Per Litre
      const totalDailyFuelCost =
        genData.hourlyFuelL * hoursPerDay * fuelPerLitre;
      // Total Monthly Cost of Fuel = Total Daily Cost of Fuel * 30
      const totalMonthlyFuelCost = totalDailyFuelCost * 30;
      // Total Monthly Generator Expenses = Total Monthly Cost of Fuel + Monthly Service Cost
      const totalMonthlyGenExpenses = totalMonthlyFuelCost + service;
      // Total Monthly Energy Bill = Total Monthly Generator Expenses + Monthly PHCN Bill
      const totalMonthlyEnergyBill = totalMonthlyGenExpenses + phcn;

      // Estimated Total Energy Cost for 5 Years = (Total Monthly Energy Bill * 60) + Cost of Generator
      const totalEnergyBill5Years = totalMonthlyEnergyBill * 60;
      const totalGenSpend5Years = totalEnergyBill5Years + genCapEx;

      // Total Cost of Solar System & Maintenance for 5 Years = Cost of Solar System + 150,000
      const totalSolarSpend5Years =
        (genData.costOfSolarSystem || 0) + SOLAR_MAINTENANCE_5_YEARS;

      // Cost Savings after 5 years = Gen 5yr total - Solar 5yr total
      const totalSavings = totalGenSpend5Years - totalSolarSpend5Years;

      setResults({
        totalSavings: Math.max(0, totalSavings),
        genSpend: totalGenSpend5Years,
        solarSpend: totalSolarSpend5Years,
        totalMonthlyEnergyBill,
      });
      setHasCalculated(true);
      setIsCalculating(false);
    }, 400);
  };

  const handleGeneratorSizeChange = (value) => {
    setGeneratorSize(value);
    const genData = GENERATOR_DATA[value];
    if (genData) {
      setMonthlyServiceCost(String(genData.defaultMonthlyService));
      setMonthlyPHCNBill(String(genData.defaultMonthlyPHCN));
      setCostOfGenerator(String(genData.defaultCostOfGenerator || 0));
    }
  };

  const canCalculate = !!generatorSize;

  return (
    <>
      {/* Desktop View */}
      <div>
        <div className="min-h-screen hidden sm:block bg-[#f5f6ff] px-8 py-10">
          <h1 className="text-2xl font-medium mb-2">Solar Savings Calculator</h1>
          <p className="text-sm text-gray-500 mt-6 w-[56%] mb-6">
            A solar savings calculator estimates how much money you can save by
            switching to solar energy. It helps you understand long-term cost
            benefits based on electricity bills, location, and system size.
          </p>

          <div className="grid grid-cols-12 gap-6">
            <div className="col-span-7 space-y-8">
              <h2 className="text-lg font-medium text-[#273e8e] mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl block font-medium">Generator Details</h1>
                  <div className="flex-1 h-px bg-gray-400/40" />
                </div>
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block mb-2 text-[17px]">
                    What is your current generator size?
                  </label>
                  <select
                    className="w-full border bg-white py-4 outline-none text-lg rounded-lg px-4 border-gray-300"
                    value={generatorSize}
                    onChange={(e) =>
                      handleGeneratorSizeChange(e.target.value)
                    }
                  >
                    <option value="">Select answer</option>
                    {generatorSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="text-sm text-gray-500 -mt-1">
                  Default values: Fuel cost ₦750/litre (Petrol) or ₦1,000 (Diesel for 12kVA), 4 hours/day usage. Other figures are from our analysis.
                </p>

                <div>
                  <label className="block mb-2 text-[17px]">
                    Monthly Service Cost (Naira)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 20,000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-4 bg-white outline-none focus:ring-2 focus:ring-[#273e8e] focus:border-[#273e8e]"
                    value={monthlyServiceCost}
                    onChange={(e) => setMonthlyServiceCost(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[17px]">
                    Monthly PHCN Bill (Naira)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 5,000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-4 bg-white outline-none focus:ring-2 focus:ring-[#273e8e] focus:border-[#273e8e]"
                    value={monthlyPHCNBill}
                    onChange={(e) => setMonthlyPHCNBill(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block mb-2 text-[17px]">
                    Cost of Generator (Naira)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="e.g. 130,000"
                    className="w-full border border-gray-300 rounded-lg px-4 py-4 bg-white outline-none focus:ring-2 focus:ring-[#273e8e] focus:border-[#273e8e]"
                    value={costOfGenerator}
                    onChange={(e) => setCostOfGenerator(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="button"
                className="bg-[#273e8e] text-white rounded-full px-6 text-sm w-full py-5 mt-4 cursor-pointer hover:bg-[#1f2f6e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                onClick={calculateSavings}
                disabled={!canCalculate || isCalculating}
              >
                {isCalculating
                  ? "Calculating…"
                  : "View how much you will be saving"}
              </button>
            </div>

            <div className="col-span-5" ref={resultRef}>
              <div
                className={`bg-yellow-100 border-dashed border-2 border-yellow-400 py-4 px-4 font-medium rounded-xl shadow transition-all ${
                  hasCalculated ? "ring-2 ring-[#273e8e] ring-offset-2" : ""
                }`}
              >
                <p className="text-sm py-2 text-gray-600 mb-1">
                  By going solar with Troosolar, you save (over 5 years)
                </p>
                <h2 className="text-3xl font-bold py-3 text-center text-white rounded-xl bg-[#E8A91D] mb-4">
                  {hasCalculated || results.totalSavings > 0
                    ? formatCurrency(results.totalSavings)
                    : "—"}
                </h2>

                {(hasCalculated || results.genSpend > 0) && (
                  <ul className="space-y-4 px-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-[15px] font-light">
                        Total Duration
                      </span>
                      <span className="text-[15px] font-light">5 Years</span>
                    </li>
                    <hr className="text-gray-300" />
                    <li className="flex justify-between">
                      <span className="text-[15px] font-light">
                        Gen spend over 5 years
                      </span>
                      <span className="font-semibold text-[#E8A91D]">
                        {formatCurrency(results.genSpend)}
                      </span>
                    </li>
                    <hr className="text-gray-300" />
                    <li className="flex justify-between">
                      <span className="text-[15px] font-light">
                        Solar spend over 5 years
                      </span>
                      <span className="font-semibold text-[#E8A91D]">
                        {formatCurrency(results.solarSpend)}
                      </span>
                    </li>
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div>
        <div className="min-h-screen sm:hidden block bg-[#f5f6ff] px-4 pb-24">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-black-500 mb-2">
              What is a solar savings calculator?
            </h2>
            <p className="text-sm text-gray-600">
              A solar saving calculator estimates how much money you can save by
              switching to solar energy. It helps you understand long-term cost
              benefits based on electricity bills, location, and system size.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold text-[#273e8e] mb-4">
              Generator Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your current generator size?
                </label>
                <div className="relative">
                  <select
                    className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm appearance-none outline-none"
                    value={generatorSize}
                    onChange={(e) =>
                      handleGeneratorSizeChange(e.target.value)
                    }
                  >
                    <option value="">Select answer</option>
                    {generatorSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Service Cost (Naira)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 20,000"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
                  value={monthlyServiceCost}
                  onChange={(e) => setMonthlyServiceCost(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly PHCN Bill (Naira)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 5,000"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
                  value={monthlyPHCNBill}
                  onChange={(e) => setMonthlyPHCNBill(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cost of Generator (Naira)
                </label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 130,000"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
                  value={costOfGenerator}
                  onChange={(e) => setCostOfGenerator(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-300 border-dotted rounded-lg p-5 shadow-md">
              <p className="text-xs text-black font-semibold mb-3">
                By going solar with Troosolar, you save (over 5 years)
              </p>
              <div className="bg-[#E8A91D] text-white rounded-lg px-6 py-3 mb-4 items-center justify-center flex">
                <span className="text-2xl font-bold">
                  {hasCalculated || results.totalSavings > 0
                    ? formatCurrency(results.totalSavings)
                    : "—"}
                </span>
              </div>
              {(hasCalculated || results.genSpend > 0) && (
                <div className="space-y-3 text-xs">
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Total Duration</span>
                    <span className="font-medium">5 Years</span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Gen spend over 5 years</span>
                    <span className="font-medium text-[#E8A91D]">
                      {formatCurrency(results.genSpend)}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-gray-300 pb-2">
                    <span className="text-gray-600">Solar spend over 5 years</span>
                    <span className="font-medium text-[#E8A91D]">
                      {formatCurrency(results.solarSpend)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f5f6ff] border-t border-gray-200">
            <button
              type="button"
              className="w-full bg-[#273e8e] text-white rounded-lg py-3 text-sm font-medium cursor-pointer hover:bg-[#1f2f6e] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              onClick={calculateSavings}
              disabled={!canCalculate || isCalculating}
            >
              {isCalculating
                ? "Calculating…"
                : "View how much you will be saving"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolarSavingCalculator;
