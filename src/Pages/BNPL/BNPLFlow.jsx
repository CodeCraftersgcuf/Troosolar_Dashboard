import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Factory, ArrowRight, ArrowLeft, Zap, Wrench, FileText, CheckCircle, Battery, Sun, Monitor, Upload, CreditCard, Camera, Clock, Download, AlertCircle, Calendar } from 'lucide-react';
import LoanCalculator from '../../Component/LoanCalculator';

const BNPLFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        customerType: '',
        productCategory: '', // 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        optionType: '', // 'choose-system', 'build-system', 'audit'
        auditType: '', // 'home-office', 'commercial'
        address: '',
        state: '',
        houseNo: '',
        landmark: '',
        floors: '',
        rooms: '',
        selectedProductPrice: 0,
        loanDetails: null,
        creditCheckMethod: '', // 'auto', 'manual'
        bvn: '',
        fullName: '',
        email: '',
        phone: '',
        socialMedia: '',
        isGatedEstate: false,
        estateName: '',
        estateAddress: '',
        bankStatement: null,
        livePhoto: null,
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
            // For individual components, skip Method Selection and go straight to Product Selection (simulated)
            // In a real app, this might go to a specific catalog for that component
            const mockPrice = category === 'battery-only' ? 800000 : category === 'inverter-only' ? 500000 : 200000;
            setFormData(prev => ({ ...prev, productCategory: category, selectedProductPrice: mockPrice }));
            setStep(8); // Skip to Loan Calculator for single items
        }
    };

    const handleOptionSelect = (option) => {
        setFormData({ ...formData, optionType: option });
        if (option === 'audit') {
            setStep(4); // Audit Type Selection
        } else if (option === 'choose-system') {
            // Simulate selecting a product
            const mockPrice = 2500000;
            setFormData(prev => ({ ...prev, selectedProductPrice: mockPrice }));
            setStep(8); // Loan Calculator
        } else {
            alert("This path is under construction.");
        }
    };

    const handleAuditTypeSelect = (type) => {
        setFormData({ ...formData, auditType: type });
        if (type === 'commercial') {
            setStep(6); // Commercial Notification
        } else {
            setStep(5); // Home/Office Details Form
        }
    };

    const handleAddressSubmit = (e) => {
        e.preventDefault();
        setStep(7); // Audit Invoice
    };

    const handleLoanConfirm = (loanDetails) => {
        setFormData({ ...formData, loanDetails });
        setStep(10); // Credit Check Method
    };

    const handleCreditCheckSelect = (method) => {
        setFormData({ ...formData, creditCheckMethod: method });
        setStep(11); // Application Form
    };

    const handleApplicationSubmit = (e) => {
        e.preventDefault();
        setStep(12); // Wait Screen
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
                    <p className="text-gray-500 text-sm">Power your home with clean energy.</p>
                </button>
                <button onClick={() => handleCustomerTypeSelect('sme')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Building2 size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">For SMEs</h3>
                    <p className="text-gray-500 text-sm">Reliable power for your small business.</p>
                </button>
                <button onClick={() => handleCustomerTypeSelect('commercial')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Factory size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Commercial & Industrial</h3>
                    <p className="text-gray-500 text-sm">Large-scale energy solutions.</p>
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
                    <p className="text-gray-500 text-sm">Select from our curated bundles.</p>
                </button>
                <button onClick={() => handleOptionSelect('build-system')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-purple-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Wrench size={40} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Build My System</h3>
                    <p className="text-gray-500 text-sm">Customize your own setup.</p>
                </button>
                <button onClick={() => handleOptionSelect('audit')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-green-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <FileText size={40} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Request Professional Audit</h3>
                    <p className="text-gray-500 text-sm">Get an expert assessment (Paid Service).</p>
                </button>
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <button onClick={() => setStep(3)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Select Audit Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => handleAuditTypeSelect('home-office')} className="bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-xl p-6 hover:shadow-lg transition-all text-left flex items-center">
                    <Home size={32} className="text-[#273e8e] mr-4" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Home / Office</h3>
                        <p className="text-gray-500 text-sm">For residential and small office spaces.</p>
                    </div>
                </button>
                <button onClick={() => handleAuditTypeSelect('commercial')} className="bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-xl p-6 hover:shadow-lg transition-all text-left flex items-center">
                    <Factory size={32} className="text-[#273e8e] mr-4" />
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Commercial / Industrial</h3>
                        <p className="text-gray-500 text-sm">For large facilities and factories.</p>
                    </div>
                </button>
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(4)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Property Details</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            placeholder="e.g. Lagos"
                            value={formData.state}
                            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">House No.</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            placeholder="e.g. 12B"
                            value={formData.houseNo}
                            onChange={(e) => setFormData({ ...formData, houseNo: e.target.value })}
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Name</label>
                    <input
                        type="text"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                        placeholder="Enter street name"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Landmark</label>
                    <input
                        type="text"
                        required
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                        placeholder="Nearby landmark"
                        value={formData.landmark}
                        onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. of Floors</label>
                        <input
                            type="number"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            placeholder="0"
                            value={formData.floors}
                            onChange={(e) => setFormData({ ...formData, floors: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">No. of Rooms</label>
                        <input
                            type="number"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            placeholder="0"
                            value={formData.rooms}
                            onChange={(e) => setFormData({ ...formData, rooms: e.target.value })}
                        />
                    </div>
                </div>
                <button type="submit" className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors mt-6">
                    Generate Invoice
                </button>
            </form>
        </div>
    );

    const renderStep6 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={40} className="text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Request Received</h2>
            <p className="text-gray-600 text-lg mb-8">
                Our team will contact you within 24 - 48 hours to discuss your energy audit for your Commercial/Industrial facility.
            </p>
            <button onClick={() => navigate('/')} className="bg-[#273e8e] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#1a2b6b] transition-colors">
                Return to Home
            </button>
        </div>
    );

    const renderStep7 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Audit Invoice</h2>
            <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                    <span className="text-gray-600">Audit Fee (Base)</span>
                    <span className="font-bold">₦50,000</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-gray-600">Logistics ({formData.state})</span>
                    <span className="font-bold">₦15,000</span>
                </div>
                <div className="flex justify-between pt-4 border-t text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-[#273e8e]">₦65,000</span>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start">
                <Calendar className="text-blue-600 mr-3 mt-1" size={20} />
                <p className="text-sm text-blue-700">
                    Once payment is confirmed, you will be able to book a date for the audit. Available slots will be 48 hours after payment confirmation.
                </p>
            </div>

            <button className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors">
                Proceed to Payment
            </button>
        </div>
    );

    const renderStep8 = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => setStep(formData.optionType ? 3 : 2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-[#273e8e]">Loan Calculator</h2>
                <p className="text-gray-500">
                    Estimated for product value: <span className="font-bold text-black">₦{new Intl.NumberFormat('en-NG').format(formData.selectedProductPrice)}</span>
                </p>
                {formData.selectedProductPrice < 1500000 && (
                    <div className="mt-4 bg-red-50 border border-red-200 p-4 rounded-lg flex items-start">
                        <AlertCircle className="text-red-600 mr-3 mt-1" size={20} />
                        <p className="text-sm text-red-700">
                            Your order total does not meet the minimum ₦1.5m amount required for credit financing. To qualify for Buy Now, Pay Later, please add more items to your cart.
                        </p>
                    </div>
                )}
            </div>
            <LoanCalculator
                totalAmount={formData.selectedProductPrice}
                onConfirm={handleLoanConfirm}
            />
        </div>
    );

    const renderStep10 = () => (
        <div className="animate-fade-in max-w-4xl mx-auto">
            <button onClick={() => setStep(8)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Credit Check & Verification
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button onClick={() => handleCreditCheckSelect('auto')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <CreditCard size={40} className="text-[#273e8e]" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Automatic Credit Check</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Fast and secure. Requires a small non-refundable fee.
                    </p>
                    <span className="bg-[#273e8e] text-white px-4 py-2 rounded-full text-sm font-bold">
                        Pay Fee
                    </span>
                </button>

                <button onClick={() => handleCreditCheckSelect('manual')} className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center">
                    <div className="bg-purple-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                        <Upload size={40} className="text-purple-600" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 text-gray-800">Manual Upload</h3>
                    <p className="text-gray-500 text-sm mb-4">
                        Upload your 12-month bank statement manually.
                    </p>
                    <span className="bg-purple-600 text-white px-4 py-2 rounded-full text-sm font-bold">
                        Upload File
                    </span>
                </button>
            </div>
        </div>
    );

    const renderStep11 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(10)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Application Form</h2>
            <form onSubmit={handleApplicationSubmit} className="space-y-6">

                {/* Personal Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            value={formData.fullName}
                            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">BVN</label>
                        <input
                            type="text"
                            required
                            maxLength="11"
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            value={formData.bvn}
                            onChange={(e) => setFormData({ ...formData, bvn: e.target.value })}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                        <input
                            type="tel"
                            required
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Handle (Facebook/Instagram)</label>
                    <input
                        type="text"
                        required
                        placeholder="@username"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                        value={formData.socialMedia}
                        onChange={(e) => setFormData({ ...formData, socialMedia: e.target.value })}
                    />
                </div>

                {/* Address & Estate */}
                <div className="border-t pt-4">
                    <label className="flex items-center space-x-3 mb-4">
                        <input
                            type="checkbox"
                            className="h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                            checked={formData.isGatedEstate}
                            onChange={(e) => setFormData({ ...formData, isGatedEstate: e.target.checked })}
                        />
                        <span className="text-gray-700 font-medium">Do you live in a gated estate?</span>
                    </label>

                    {formData.isGatedEstate && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg animate-fade-in">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estate Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                                    value={formData.estateName}
                                    onChange={(e) => setFormData({ ...formData, estateName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Estate Address</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#273e8e] focus:border-transparent"
                                    value={formData.estateAddress}
                                    onChange={(e) => setFormData({ ...formData, estateAddress: e.target.value })}
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Uploads */}
                <div className="border-t pt-4 space-y-4">
                    {formData.creditCheckMethod === 'manual' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Upload 12-Month Bank Statement</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#273e8e] transition-colors cursor-pointer">
                                <Upload className="mx-auto text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Click to upload PDF, JPG, or PNG</p>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Live Photo Verification</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#273e8e] transition-colors cursor-pointer bg-gray-50">
                            <Camera className="mx-auto text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Take a live photo</p>
                        </div>
                    </div>
                </div>

                <button type="submit" className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors mt-6">
                    Submit Application
                </button>
            </form>
        </div>
    );

    const renderStep12 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock size={40} className="text-[#273e8e]" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Application Under Review</h2>
            <p className="text-gray-600 text-lg mb-8">
                We are reviewing your application. You will receive feedback within 24 - 48 hours.
            </p>
            <button
                onClick={() => setStep(13)} // Simulate Approval
                className="text-sm text-gray-400 underline hover:text-[#273e8e]"
            >
                [Demo: Simulate Approval]
            </button>
        </div>
    );

    const renderStep13 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Application Status
            </h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-green-200">
                <div className="flex items-center mb-6">
                    <CheckCircle size={32} className="text-green-600 mr-4" />
                    <h3 className="text-2xl font-bold text-green-700">Loan Approved!</h3>
                </div>
                <p className="text-gray-600 mb-8">
                    Congratulations! Your loan application has been approved. Please proceed to download the Guarantor Form.
                </p>
                <button
                    onClick={() => setStep(17)}
                    className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
                >
                    Proceed to Guarantor Form
                </button>
            </div>
        </div>
    );

    const renderStep17 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Guarantor Form</h2>
            <p className="text-gray-600 mb-6">
                Please download the Guarantor Form below, have it signed by your guarantor, and bring it along with undated signed cheques on the day of installation.
            </p>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start">
                <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                <p className="text-sm text-yellow-700">
                    Note: A credit check will also be conducted on your guarantor. If your guarantor does not qualify, your loan will not be disbursed.
                </p>
            </div>

            <button className="w-full border-2 border-[#273e8e] text-[#273e8e] py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center mb-4">
                <Download size={20} className="mr-2" /> Download Form
            </button>

            <button
                onClick={() => setStep(21)}
                className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors"
            >
                I Agree & Continue
            </button>
        </div>
    );

    const renderStep21 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Order Summary & Invoice</h2>

            <div className="space-y-4 mb-8">
                <div className="flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="bg-gray-100 p-2 rounded-lg mr-4">
                            <Sun size={24} className="text-gray-600" />
                        </div>
                        <div>
                            <p className="font-bold text-gray-800">Solar System Bundle</p>
                            <p className="text-sm text-gray-500">Inverter + Batteries + Panels</p>
                        </div>
                    </div>
                    <span className="font-bold">₦{new Intl.NumberFormat('en-NG').format(formData.selectedProductPrice)}</span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Material Cost (Cables, Breakers, etc.)</span>
                    <span>₦50,000</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Installation Fee</span>
                    <span>₦50,000</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Delivery/Logistics</span>
                    <span>₦25,000</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Inspection Fee</span>
                    <span>₦10,000</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Insurance (0.5%)</span>
                    <span>₦{(formData.selectedProductPrice * 0.005).toLocaleString()}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-[#273e8e]">₦{(formData.selectedProductPrice + 50000 + 50000 + 25000 + 10000 + (formData.selectedProductPrice * 0.005)).toLocaleString()}</span>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg mb-6 flex items-start">
                <AlertCircle className="text-yellow-600 mr-3 mt-1" size={20} />
                <p className="text-sm text-yellow-700">
                    Installation fees may change after site inspection. Any difference will be updated and shared with you for a one-off payment before installation.
                </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-8">
                <h4 className="font-bold text-[#273e8e] mb-2">Payment Schedule</h4>
                <div className="flex justify-between text-sm mb-1">
                    <span>Initial Deposit (30%)</span>
                    <span className="font-bold">₦{(formData.loanDetails?.depositAmount || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span>Monthly Repayment</span>
                    <span className="font-bold">₦{(formData.loanDetails?.monthlyRepayment || 0).toLocaleString()}</span>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6 flex items-start">
                <Calendar className="text-blue-600 mr-3 mt-1" size={20} />
                <p className="text-sm text-blue-700">
                    Within 24 – 48 hours, our team will contact you to schedule your installation date.
                </p>
            </div>

            <button className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors">
                Proceed to Checkout
            </button>
        </div>
    );

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
                            <span className={step >= 11 ? "text-[#273e8e]" : ""}>Apply</span>
                            <span className={step >= 12 ? "text-[#273e8e]" : ""}>Approval</span>
                            <span className={step >= 21 ? "text-[#273e8e]" : ""}>Finish</span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-[#273e8e] transition-all duration-500 ease-out"
                                style={{ width: `${(step / 21) * 100}%` }}
                            />
                        </div>
                    </div>

                    {step === 1 && renderStep1()}
                    {step === 2 && renderStep2()}
                    {step === 3 && renderStep3()}
                    {step === 4 && renderStep4()}
                    {step === 5 && renderStep5()}
                    {step === 6 && renderStep6()}
                    {step === 7 && renderStep7()}
                    {step === 8 && renderStep8()}
                    {step === 10 && renderStep10()}
                    {step === 11 && renderStep11()}
                    {step === 12 && renderStep12()}
                    {step === 13 && renderStep13()}
                    {step === 17 && renderStep17()}
                    {step === 21 && renderStep21()}
                </div>
            </div>
        </div>
    );
};

export default BNPLFlow;
