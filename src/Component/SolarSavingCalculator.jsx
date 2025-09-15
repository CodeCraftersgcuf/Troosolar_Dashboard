import { ChevronDown, ChevronLeft } from "lucide-react";
import React, { useState } from "react";
import HrLine from "../Component/MobileSectionResponsive/HrLine";

const SolarSavingCalculator = () => {
  // State management for form inputs
  const [formData, setFormData] = useState({
    generatorSize: '',
    hoursPerDay: '',
    maintenanceCost: '',
    gridSpend: '',
    solarBudget: '',
    duration: ''
  });

  // State for calculation results
  const [results, setResults] = useState({
    totalSavings: 0,
    genSpend: 0,
    solarSpend: 0,
    breakEvenPeriod: 0,
    duration: ''
  });

  // State for field validation errors
  const [fieldErrors, setFieldErrors] = useState({
    generatorSize: false,
    hoursPerDay: false,
    maintenanceCost: false,
    solarBudget: false,
    duration: false
  });

  // Generator size options
  const generatorSizes = [
    { value: '1kva', label: '1 KVA' },
    { value: '2kva', label: '2 KVA' },
    { value: '3kva', label: '3 KVA' },
    { value: '5kva', label: '5 KVA' },
    { value: '7.5kva', label: '7.5 KVA' },
    { value: '10kva', label: '10 KVA' },
    { value: '15kva', label: '15 KVA' },
    { value: '20kva', label: '20 KVA' },
    { value: '25kva', label: '25 KVA' },
    { value: '30kva', label: '30 KVA' },
    { value: '40kva', label: '40 KVA' },
    { value: '50kva', label: '50 KVA' },
    { value: '60kva', label: '60 KVA' },
    { value: '75kva', label: '75 KVA' },
    { value: '100kva', label: '100 KVA' },
    { value: '125kva', label: '125 KVA' },
    { value: '150kva', label: '150 KVA' },
    { value: '200kva', label: '200 KVA' },
    { value: '250kva', label: '250 KVA' },
    { value: '300kva', label: '300 KVA' }
  ];

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error for this field when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: false
      }));
    }
  };

  // Calculate solar savings
  const calculateSavings = () => {
    const {
      generatorSize,
      hoursPerDay,
      maintenanceCost,
      gridSpend,
      solarBudget,
      duration
    } = formData;

    // Validate required fields and highlight missing ones
    const errors = {
      generatorSize: !generatorSize,
      hoursPerDay: !hoursPerDay,
      maintenanceCost: !maintenanceCost,
      solarBudget: !solarBudget,
      duration: !duration
    };
    
    setFieldErrors(errors);
    
    // Check if any field is missing
    if (Object.values(errors).some(error => error)) {
      return;
    }

    // Convert string values to numbers
    const hours = parseFloat(hoursPerDay) || 0;
    const maintenance = parseFloat(maintenanceCost) || 0;
    const grid = parseFloat(gridSpend) || 0;
    const budget = parseFloat(solarBudget) || 0;
    const months = parseInt(duration) || 0;

    // Generator fuel consumption rates (liters per hour for different sizes)
    const fuelConsumptionRates = {
      '1kva': 0.5,
      '2kva': 0.8,
      '3kva': 1.2,
      '5kva': 2.0,
      '7.5kva': 3.0,
      '10kva': 4.0,
      '15kva': 6.0,
      '20kva': 8.0,
      '25kva': 10.0,
      '30kva': 12.0,
      '40kva': 16.0,
      '50kva': 20.0,
      '60kva': 24.0,
      '75kva': 30.0,
      '100kva': 40.0,
      '125kva': 50.0,
      '150kva': 60.0,
      '200kva': 80.0,
      '250kva': 100.0,
      '300kva': 120.0
    };

    // Current fuel price (Naira per liter) - you can make this dynamic
    const fuelPricePerLiter = 700;
    
    // Get fuel consumption rate for the selected generator size
    const fuelRate = fuelConsumptionRates[generatorSize] || 0;
    
    // Calculate monthly generator costs
    const monthlyFuelCost = (hours * 30 * fuelRate * fuelPricePerLiter);
    const totalMonthlyGenCost = monthlyFuelCost + maintenance + grid;
    
    // Calculate total generator spend over the duration
    const totalGenSpend = totalMonthlyGenCost * months;
    
    // Calculate solar spend (monthly payment based on budget and duration)
    const monthlySolarPayment = budget / months;
    const totalSolarSpend = budget;
    
    // Calculate savings
    const totalSavings = totalGenSpend - totalSolarSpend;
    
    // Calculate break-even period (when solar payments equal generator savings)
    const monthlySavings = totalMonthlyGenCost - monthlySolarPayment;
    const breakEvenPeriod = monthlySavings > 0 ? Math.ceil(monthlySolarPayment / monthlySavings) : 0;

    // Update results
    setResults({
      totalSavings: Math.max(0, totalSavings),
      genSpend: totalGenSpend,
      solarSpend: totalSolarSpend,
      breakEvenPeriod: breakEvenPeriod,
      duration: `${months} month${months > 1 ? 's' : ''}`
    });
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  return (
    <>
      {/* Desktop View  */}
      <div>
        <div className="min-h-screen hidden sm:block bg-[#f5f6ff] px-8 py-10">
          <h1 className="text-2xl font-medium mb-2">
            Solar Savings Calculator
          </h1>
          <p className="text-sm text-gray-500 mt-6 w-[56%] mb-6">
            A solar savings calculator estimates how much money you can save by
            switching to solar energy. It helps you understand long-term cost
            benefits based on electricity bills, location, and system size.
          </p>

          <div className="grid grid-cols-12 gap-6">
            {/* Left Form Section */}
            <div className="col-span-7 space-y-8">
              {/* Generator Details */}
              <div className="">
                <h2 className="text-lg font-medium text-[#273e8e] mb-4">
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl block font-medium">
                      Generator Details
                    </h1>
                    <div className="flex-1 h-px  bg-gray-400/40" />
                  </div>
                </h2>

                <div className="space-y-4">
                  <div>
                    <label className="block mb-2 text-[17px] ">
                      What is your current generator size?
                    </label>
                    <select 
                      className={`w-full border bg-white py-4 outline-none text-lg rounded-lg px-4 placeholder:text-gray-200 ${
                        fieldErrors.generatorSize 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-gray-300'
                      }`}
                      value={formData.generatorSize}
                      onChange={(e) => handleInputChange('generatorSize', e.target.value)}
                    >
                      <option value="">Select answer</option>
                      {generatorSizes.map((size) => (
                        <option key={size.value} value={size.value}>
                          {size.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-2 text-[17px]">
                      Hours you run your gen/day
                    </label>
                    <input
                      type="number"
                      placeholder="Type answer"
                      className={`w-full border rounded-lg px-4 py-4 bg-white outline-none ${
                        fieldErrors.hoursPerDay 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-gray-300'
                      }`}
                      value={formData.hoursPerDay}
                      onChange={(e) => handleInputChange('hoursPerDay', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-[17px]">
                      Gen maintenance cost/month (in Naira)
                    </label>
                    <input
                      type="number"
                      placeholder="Type answer (in naira)"
                      className={`w-full border rounded-lg px-4 py-4 bg-white outline-none ${
                        fieldErrors.maintenanceCost 
                          ? 'border-red-500 ring-2 ring-red-200' 
                          : 'border-gray-300'
                      }`}
                      value={formData.maintenanceCost}
                      onChange={(e) => handleInputChange('maintenanceCost', e.target.value)}
                    />
                  </div>

                  <div>
                    <label className="block mb-2 text-[17px] ">
                      Monthly Spend on grid in Naira (Optional)
                    </label>
                    <input
                      type="number"
                      placeholder="Type answer (in naira)"
                      className="w-full border border-gray-300 rounded-lg px-4  py-4  bg-white outline-none"
                      value={formData.gridSpend}
                      onChange={(e) => handleInputChange('gridSpend', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Plan Details */}

              <h2 className="text-lg font-medium text-[#273e8e] mb-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl block font-medium">
                    Troosolar Payment Plan Details
                  </h1>
                  <div className="flex-1 h-px  bg-gray-400/40" />
                </div>
              </h2>

              <div>
                <label className="block mb-1 text-lg">
                  What is your solar budget
                </label>
                <input
                  type="number"
                  placeholder="Type answer (in naira)"
                  className={`w-full border rounded-lg px-4 py-4 bg-white outline-none my-2 ${
                    fieldErrors.solarBudget 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-300'
                  }`}
                  value={formData.solarBudget}
                  onChange={(e) => handleInputChange('solarBudget', e.target.value)}
                />
              </div>

              <button 
                className="bg-[#273e8e] text-white rounded-full px-6 text-sm w-full py-5 mt-4"
                onClick={calculateSavings}
              >
                View how much you will be saving
              </button>
            </div>

            {/* Right Result Box */}
            <div className="col-span-5">
              <div className="relative w-[150px] mb-4">
                <select
                  className={`appearance-none w-full py-4 px-3 bg-white border rounded-lg text-sm text-gray-700 outline-none ${
                    fieldErrors.duration 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-300'
                  }`}
                  name="duration"
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange('duration', e.target.value)}
                >
                  <option value="">Select Duration</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="9">9 months</option>
                  <option value="11">11 months</option>
                  <option value="12">1 Year</option>
                  <option value="24">2 Years</option>
                </select>
                <ChevronDown
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={22}
                />
              </div>

              <div className="bg-yellow-100 border-dashed border-2 border-yellow-400 py-2 px-3 font-medium rounded-xl shadow">
                <p className="text-sm py-2 text-gray-600 mb-1">
                  By going solar with Troosolar, you save
                </p>
                <h2 className="text-3xl font-bold py-2 text-center text-white rounded-xl bg-[#E8A91D] mb-4">
                  {formatCurrency(results.totalSavings)}
                </h2>

                <ul className="space-y-4 px-2 text-sm">
                  <li className="flex justify-between">
                    <span className=" text-[15px] font-light">
                      Total Duration
                    </span>
                    <span className="text-[15px] font-light">{results.duration}</span>
                  </li>
                  <hr className="text-gray-300" />
                  <li className="flex justify-between">
                    <span className="text-[15px] font-light">
                      Gen spend over {results.duration}
                    </span>
                    <span className="font-semibold text-[#E8A91D]">
                      {formatCurrency(results.genSpend)}
                    </span>
                  </li>
                  <hr className="text-gray-300" />

                  <li className="flex justify-between">
                    <span className="text-[15px] font-light">
                      Solar spend over {results.duration}
                    </span>
                    <span className="font-semibold text-[#E8A91D]">
                      {formatCurrency(results.solarSpend)}
                    </span>
                  </li>
                  <hr className="text-gray-300" />

                  <li className="flex justify-between">
                    <span className="text-[15px] font-light">
                      Break even period
                    </span>
                    <span className="text-[15px] font-light">{results.breakEvenPeriod} months</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile View  */}
      <div>
        <div className="min-h-screen sm:hidden block bg-[#f5f6ff] px-4 pb-20">
          {/* Introduction */}
          <div className="mb-6">
            <h2 className="text-base font-semibold text-black-500   mb-2">
              What is a solar savings calculator?
            </h2>
            <p className="text-sm text-gray-600">
              A solar saving calculator estimates how much money you can save by
              switching to solar energy. It helps you understand long-term cost
              benefits based on electricity bills, location, and system size.
            </p>
          </div>

          {/* Generator Details */}
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
                    className={`w-full bg-white border rounded-lg px-3 py-3 text-sm appearance-none ${
                      fieldErrors.generatorSize 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-gray-300'
                    }`}
                    value={formData.generatorSize}
                    onChange={(e) => handleInputChange('generatorSize', e.target.value)}
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
                  Hours you run your gen/day
                </label>
                <input
                  type="number"
                  placeholder="Type answer"
                  className={`w-full bg-white border rounded-lg px-3 py-3 text-sm outline-none ${
                    fieldErrors.hoursPerDay 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-300'
                  }`}
                  value={formData.hoursPerDay}
                  onChange={(e) => handleInputChange('hoursPerDay', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gen maintenance cost/month (in Naira)
                </label>
                <input
                  type="number"
                  placeholder="Type answer (in naira)"
                  className={`w-full bg-white border rounded-lg px-3 py-3 text-sm outline-none ${
                    fieldErrors.maintenanceCost 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-300'
                  }`}
                  value={formData.maintenanceCost}
                  onChange={(e) => handleInputChange('maintenanceCost', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monthly Spend on grid in Naira (Optional)
                </label>
                <input
                  type="number"
                  placeholder="Type answer (in naira)"
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-3 text-sm outline-none"
                  value={formData.gridSpend}
                  onChange={(e) => handleInputChange('gridSpend', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Troosolar Payment Plan Details */}
          <div className="mb-6">
            <h3 className="text-base font-semibold text-[#273e8e] mb-4">
              Troosolar Payment Plan Details
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What is your solar budget
                </label>
                <input
                  type="number"
                  placeholder="Type answer (in naira)"
                  className={`w-full bg-white border rounded-lg px-3 py-3 text-sm outline-none ${
                    fieldErrors.solarBudget 
                      ? 'border-red-500 ring-2 ring-red-200' 
                      : 'border-gray-300'
                  }`}
                  value={formData.solarBudget}
                  onChange={(e) => handleInputChange('solarBudget', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select duration
                </label>
                <div className="relative">
                  <select 
                    className={`w-full bg-white border rounded-lg px-3 py-3 text-sm appearance-none ${
                      fieldErrors.duration 
                        ? 'border-red-500 ring-2 ring-red-200' 
                        : 'border-gray-300'
                    }`}
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                  >
                    <option value="">Select duration</option>
                    <option value="3">3 months</option>
                    <option value="6">6 months</option>
                    <option value="9">9 months</option>
                    <option value="11">11 months</option>
                    <option value="12">1 Year</option>
                    <option value="24">2 Years</option>
                  </select>
                  <ChevronDown
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 pointer-events-none"
                    size={16}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Savings Summary */}
          <div className="mb-6">
            <div className="bg-yellow-50 border border-yellow-300 border-dotted  rounded-lg p-5 shadow-md">
              <p className="text-xs text-black font-semibold mb-3">
                By going solar with Troosolar, you save
              </p>
              <div className="bg-[#E8A91D] text-white rounded-lg px-6 py-2 mb-4 items-center justify-center flex">
                <span className="text-3xl font-bold">{formatCurrency(results.totalSavings)}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-600 ">Total Duration</span>
                  <span className="font-medium">{results.duration}</span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-600">
                    Gen spend over {results.duration}
                  </span>
                  <span className="font-medium text-[#E8A91D]">{formatCurrency(results.genSpend)}</span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-600">
                    Solar spend over {results.duration}
                  </span>
                  <span className="font-medium text-[#E8A91D]">{formatCurrency(results.solarSpend)}</span>
                </div>
                <div className="flex justify-between border-b-1 border-gray-300 pb-2">
                  <span className="text-gray-600">Break even period</span>
                  <span className="font-medium">{results.breakEvenPeriod} months</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Button */}
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#f5f6ff] border-t border-gray-200">
            <button 
              className="w-full bg-[#273e8e] text-white rounded-lg py-3 text-sm font-medium"
              onClick={calculateSavings}
            >
              View How much you will be saving
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolarSavingCalculator;
