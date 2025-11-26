import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Factory, ArrowRight, ArrowLeft, Zap, Wrench, FileText, CheckCircle, Battery, Sun, Monitor, Shield, Calendar } from 'lucide-react';

const BuyNowFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customerType: '',
        productCategory: '', // 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        optionType: '', // 'choose-system', 'build-system', 'audit'
        selectedProductPrice: 0,
        installerChoice: '', // 'troosolar', 'own'
        includeInsurance: false,
        address: '',
        state: '',
    });

    // --- Handlers ---

    const handleCustomerTypeSelect = (type) => {
        setFormData({ ...formData, customerType: type });
        setStep(2); // Go to Product Category
    };

    const handleCategorySelect = (category) => {
        setFormData({ ...formData, productCategory: category });

        // If category allows "System" options (Full Kit or Inverter+Battery), go to Method Selection
        if (category === 'full-kit' || category === 'inverter-battery') {
            setStep(3); // Method Selection (Choose/Build/Audit)
        } else {
            // For individual components, skip Method Selection and go straight to Checkout Options (simulated)
            const mockPrice = category === 'battery-only' ? 800000 : category === 'inverter-only' ? 500000 : 200000;
            setFormData(prev => ({ ...prev, productCategory: category, selectedProductPrice: mockPrice }));
            setStep(4); // Checkout Options
        }
    };

    const handleOptionSelect = (option) => {
        setFormData({ ...formData, optionType: option });
        if (option === 'choose-system') {
            // Simulate selecting a product
            const mockPrice = 2500000;
            setFormData(prev => ({ ...prev, selectedProductPrice: mockPrice }));
            setStep(4); // Checkout Options
        } else if (option === 'audit') {
            // For Buy Now, Audit might just redirect to the Audit flow or show a similar form. 
            // Assuming for now it follows a similar path or just alerts as per previous logic, 
            // but user requirements imply it's an option. 
            // Let's redirect to a simplified Audit request for Buy Now or just show the form.
            // For simplicity in this iteration, I'll use the same placeholder alert or redirect logic, 
            // but ideally this should link to the Audit steps.
            alert("Audit flow for Buy Now is similar to BNPL. Redirecting to BNPL Audit for now...");
            // In a real app, we'd duplicate the audit steps here or make them a shared component.
        } else {
            alert("This path is under construction.");
        }
    };

    const handleCheckoutSubmit = () => {
        setStep(5); // Invoice
    };

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Who are you purchasing for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleCustomerTypeSelect('residential')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Home size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">For Residential</h3>
                </button>
                <button onClick={() => handleCustomerTypeSelect('sme')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Building2 size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">For SMEs</h3>
                </button>
                <button onClick={() => handleCustomerTypeSelect('commercial')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Factory size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Commercial & Industrial</h3>
                </button>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="animate-fade-in">
            <button onClick={() => setStep(1)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Select Product Category
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
                {[
                    { id: 'full-kit', name: 'Solar Panels, Inverter & Battery', icon: Sun },
                    { id: 'inverter-battery', name: 'Inverter & Battery Solution', icon: Zap },
                    { id: 'battery-only', name: 'Battery Only', icon: Battery },
                    { id: 'inverter-only', name: 'Inverter Only', icon: Monitor },
                    { id: 'panels-only', name: 'Solar Panels Only', icon: Sun },
                ].map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategorySelect(cat.id)}
                        className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-6 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                        <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-[#273e8e]/10 transition-colors">
                            <cat.icon size={32} className="text-[#273e8e]" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-800">{cat.name}</h3>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="animate-fade-in">
            <button onClick={() => setStep(2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                How would you like to proceed?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                <button onClick={() => handleOptionSelect('choose-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-yellow-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Zap size={40} className="text-yellow-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Choose my solar system</h3>
                </button>
                <button onClick={() => handleOptionSelect('build-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-purple-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Wrench size={40} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Build My System</h3>
                </button>
                <button onClick={() => handleOptionSelect('audit')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-green-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <FileText size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Request Professional Audit</h3>
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(formData.optionType ? 3 : 2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Checkout Options</h2>

            {/* Installer Choice */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Installation Preference</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                        onClick={() => setFormData({ ...formData, installerChoice: 'troosolar' })}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${formData.installerChoice === 'troosolar'
                            ? 'border-[#273e8e] bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                            }`}
                    >
                        <div className="flex items-center mb-2">
                            <CheckCircle size={20} className={formData.installerChoice === 'troosolar' ? 'text-[#273e8e]' : 'text-gray-300'} />
                            <span className="ml-2 font-bold text-gray-800">Use TrooSolar Certified Installer</span>
                        </div>
                        <p className="text-sm text-gray-500 ml-7">Recommended. Includes 1-Year Installation Warranty.</p>
                    </button>

                    <button
                        onClick={() => setFormData({ ...formData, installerChoice: 'own' })}
                        className={`p-6 rounded-xl border-2 text-left transition-all ${formData.installerChoice === 'own'
                            ? 'border-[#273e8e] bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                            }`}
                    >
                        <div className="flex items-center mb-2">
                            <CheckCircle size={20} className={formData.installerChoice === 'own' ? 'text-[#273e8e]' : 'text-gray-300'} />
                            <span className="ml-2 font-bold text-gray-800">Use My Own Installer</span>
                        </div>
                        <p className="text-sm text-gray-500 ml-7">TrooSolar does not guarantee third-party installation.</p>
                    </button>
                </div>
            </div>

            {/* Insurance Option */}
            <div className="mb-8">
                <h3 className="text-lg font-bold mb-4 text-gray-800">Additional Protection</h3>
                <label className={`flex items-start p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.includeInsurance ? 'border-[#273e8e] bg-blue-50' : 'border-gray-200'
                    }`}>
                    <input
                        type="checkbox"
                        className="mt-1 h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                        checked={formData.includeInsurance}
                        onChange={(e) => setFormData({ ...formData, includeInsurance: e.target.checked })}
                    />
                    <div className="ml-3">
                        <span className="font-bold text-gray-800 flex items-center">
                            <Shield size={18} className="mr-2 text-[#273e8e]" /> Include Insurance
                        </span>
                        <p className="text-sm text-gray-500 mt-1">Protect your investment against damage and theft.</p>
                    </div>
                </label>
            </div>

            <button
                onClick={handleCheckoutSubmit}
                disabled={!formData.installerChoice}
                className={`w-full py-4 rounded-xl font-bold transition-colors ${formData.installerChoice
                    ? 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
            >
                Proceed to Invoice
            </button>
        </div>
    );

    const renderStep5 = () => {
        const basePrice = formData.selectedProductPrice;
        const installationFee = formData.installerChoice === 'troosolar' ? 50000 : 0;
        const insuranceFee = formData.includeInsurance ? basePrice * 0.005 : 0;
        // Material cost, delivery, inspection are fixed for demo if TrooSolar installs
        const materialCost = formData.installerChoice === 'troosolar' ? 50000 : 0;
        const deliveryFee = 25000;
        const inspectionFee = formData.installerChoice === 'troosolar' ? 10000 : 0;

        const total = basePrice + installationFee + insuranceFee + materialCost + deliveryFee + inspectionFee;

        return (
            <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Final Invoice</h2>

                <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center">
                            <div className="bg-gray-100 p-2 rounded-lg mr-4">
                                <Sun size={24} className="text-gray-600" />
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">Solar System Bundle</p>
                                <p className="text-sm text-gray-500">Selected Product</p>
                            </div>
                        </div>
                        <span className="font-bold">₦{new Intl.NumberFormat('en-NG').format(basePrice)}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                        <span>Delivery/Logistics</span>
                        <span>₦{deliveryFee.toLocaleString()}</span>
                    </div>

                    {formData.installerChoice === 'troosolar' && (
                        <>
                            <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                                <span>Material Cost</span>
                                <span>₦{materialCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                                <span>Installation Fee</span>
                                <span>₦{installationFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                                <span>Inspection Fee</span>
                                <span>₦{inspectionFee.toLocaleString()}</span>
                            </div>
                        </>
                    )}

                    {formData.includeInsurance && (
                        <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                            <span>Insurance (0.5%)</span>
                            <span>₦{insuranceFee.toLocaleString()}</span>
                        </div>
                    )}

                    <div className="border-t pt-4 mt-4">
                        <div className="flex justify-between items-center text-xl font-bold">
                            <span>Total Amount Due</span>
                            <span className="text-[#273e8e]">₦{total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {formData.installerChoice === 'troosolar' && (
                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start">
                        <CheckCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                        <p className="text-sm text-yellow-700">
                            Note: Installation fees may change after site inspection. Any difference will be updated and shared with you for a one-off payment before installation.
                        </p>
                    </div>
                )}

                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start">
                    <Calendar className="text-blue-600 mr-3 mt-1" size={20} />
                    <p className="text-sm text-blue-700">
                        Once payment is confirmed, you will be able to book a date for the audit/installation. Available slots will be 72 hours after payment confirmation.
                    </p>
                </div>

                <button className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors">
                    Pay Now
                </button>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Navbar Placeholder */}
            <div className="bg-white shadow-sm p-4 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl text-[#273e8e]">TrooSolar</div>
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:text-[#273e8e]">
                        Exit Application
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex items-center justify-center p-6">
                <div className="w-full max-w-6xl">
                    {/* Progress Bar */}
                    <div className="mb-12 max-w-xl mx-auto">
                        <div className="flex justify-between text-sm font-medium text-gray-400 mb-2">
                            <span className={step >= 1 ? "text-[#273e8e]" : ""}>Type</span>
                            <span className={step >= 2 ? "text-[#273e8e]" : ""}>Product</span>
                            <span className={step >= 3 ? "text-[#273e8e]" : ""}>Option</span>
                            <span className={step >= 4 ? "text-[#273e8e]" : ""}>Checkout</span>
                            <span className={step >= 5 ? "text-[#273e8e]" : ""}>Pay</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#273e8e] transition-all duration-500 ease-out"
                                style={{ width: `${(step / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                </div>
            </div>
        </div>
    );
};

export default BuyNowFlow;
