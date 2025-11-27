import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, Factory, ArrowRight, ArrowLeft, Zap, Wrench, FileText, CheckCircle, Battery, Sun, Monitor, Upload, CreditCard, Camera, Clock, Download, AlertCircle, Calendar, Loader } from 'lucide-react';
import LoanCalculator from '../../Component/LoanCalculator';
import axios from 'axios';
import API from '../../config/api.config';

const BNPLFlow = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [customerTypes, setCustomerTypes] = useState([]);
    const [auditTypes, setAuditTypes] = useState([]);
    const [loanConfig, setLoanConfig] = useState(null);
    const [addOns, setAddOns] = useState([]);
    const [states, setStates] = useState([]);
    const [loading, setLoading] = useState(false);
    const [applicationId, setApplicationId] = useState(null);
    const [applicationStatus, setApplicationStatus] = useState('pending');
    const [guarantorId, setGuarantorId] = useState(null);
    const [invoiceData, setInvoiceData] = useState(null);

    const [formData, setFormData] = useState({
        customerType: '',
        productCategory: '', // 'full-kit', 'inverter-battery', 'battery-only', 'inverter-only', 'panels-only'
        optionType: '', // 'choose-system', 'build-system', 'audit'
        auditType: '', // 'home-office', 'commercial'
        address: '',
        state: '',
        stateId: null,
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

    // --- Effects ---
    React.useEffect(() => {
        const fetchConfig = async () => {
            try {
                const [custRes, auditRes, loanConfigRes, addOnsRes, statesRes] = await Promise.all([
                    axios.get(API.CONFIG_CUSTOMER_TYPES).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_AUDIT_TYPES).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_LOAN_CONFIGURATION).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_ADD_ONS, { params: { type: 'bnpl' } }).catch(() => ({ data: { status: 'error' }, status: 404 })),
                    axios.get(API.CONFIG_STATES).catch(() => ({ data: { status: 'error' }, status: 404 }))
                ]);
                
                // Only set data if API call was successful (not 404)
                if (custRes.status !== 404 && custRes.data?.status === 'success') {
                    setCustomerTypes(custRes.data.data);
                }
                if (auditRes.status !== 404 && auditRes.data?.status === 'success') {
                    setAuditTypes(auditRes.data.data);
                }
                if (loanConfigRes.status !== 404 && loanConfigRes.data?.status === 'success') {
                    setLoanConfig(loanConfigRes.data.data);
                }
                if (addOnsRes.status !== 404 && addOnsRes.data?.status === 'success') {
                    setAddOns(addOnsRes.data.data || []);
                }
                if (statesRes.status !== 404 && statesRes.data?.status === 'success') {
                    setStates(statesRes.data.data || []);
                }
            } catch (error) {
                // Silently fail - APIs may not be implemented yet
                console.log("Configuration APIs not available yet:", error.message);
            }
            
            // Fallback to defaults if APIs fail or return 404
            if (customerTypes.length === 0) {
                setCustomerTypes([
                    { id: 'residential', label: 'For Residential' },
                    { id: 'sme', label: 'For SMEs' },
                    { id: 'commercial', label: 'Commercial & Industrial' }
                ]);
            }
            if (auditTypes.length === 0) {
                setAuditTypes([
                    { id: 'home-office', label: 'Home / Office' },
                    { id: 'commercial', label: 'Commercial / Industrial' }
                ]);
            }
        };
        fetchConfig();
    }, []);

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

    // --- Render Steps ---

    const renderStep1 = () => (
        <div className="animate-fade-in">
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Who are you purchasing for?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {(customerTypes.length > 0 ? customerTypes : [
                    { id: 'residential', label: 'For Residential' },
                    { id: 'sme', label: 'For SMEs' },
                    { id: 'commercial', label: 'Commercial & Industrial' }
                ]).map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleCustomerTypeSelect(type.id)}
                        className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                        <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                            {type.id === 'residential' && <Home size={40} className="text-[#273e8e]" />}
                            {type.id === 'sme' && <Building2 size={40} className="text-[#273e8e]" />}
                            {type.id === 'commercial' && <Factory size={40} className="text-[#273e8e]" />}
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">{type.label}</h3>
                    </button>
                ))}
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
        <div className="animate-fade-in">
            <button onClick={() => setStep(3)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-3xl font-bold text-center mb-8 text-[#273e8e]">
                Select Audit Type
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {(auditTypes.length > 0 ? auditTypes : [
                    { id: 'home-office', label: 'Home / Office' },
                    { id: 'commercial', label: 'Commercial / Industrial' }
                ]).map((type) => (
                    <button
                        key={type.id}
                        onClick={() => handleAuditTypeSelect(type.id)}
                        className="group bg-white border-2 border-gray-100 hover:border-[#273e8e] rounded-2xl p-8 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                    >
                        <div className="bg-blue-50 p-6 rounded-full mb-6 group-hover:bg-[#273e8e]/10 transition-colors">
                            <FileText size={40} className="text-[#273e8e]" />
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">{type.label}</h3>
                    </button>
                ))}
            </div>
        </div>
    );

    const renderStep5 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(4)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Property Details</h2>
            <form onSubmit={handleAddressSubmit} className="space-y-4">
                {states.length > 0 ? (
                    <select
                        required
                        className="w-full p-3 border rounded-lg"
                        onChange={e => {
                            const stateId = e.target.value ? Number(e.target.value) : null;
                            const selectedState = states.find(s => s.id === stateId);
                            setFormData({ ...formData, state: selectedState?.name || '', stateId });
                        }}
                    >
                        <option value="">Select State</option>
                        {states.filter(s => s.is_active).map((state) => (
                            <option key={state.id} value={state.id}>{state.name}</option>
                        ))}
                    </select>
                ) : (
                    <input type="text" placeholder="State" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({ ...formData, state: e.target.value })} />
                )}
                <input type="text" placeholder="Address" required className="w-full p-3 border rounded-lg" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                <input type="text" placeholder="Landmark (Optional)" className="w-full p-3 border rounded-lg" onChange={e => setFormData({ ...formData, landmark: e.target.value })} />
                <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Floors (Optional)" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, floors: e.target.value })} />
                    <input type="number" placeholder="Rooms (Optional)" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, rooms: e.target.value })} />
                </div>
                
                {/* Gated Estate Section */}
                <div className="mt-4">
                    <label className="flex items-center space-x-2 cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={formData.isGatedEstate} 
                            onChange={e => setFormData({ ...formData, isGatedEstate: e.target.checked })} 
                            className="h-5 w-5 text-[#273e8e] focus:ring-[#273e8e] border-gray-300 rounded"
                        />
                        <span className="text-gray-700">Is this property in a gated estate?</span>
                    </label>
                </div>
                
                {formData.isGatedEstate && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <input 
                            type="text" 
                            placeholder="Estate Name *" 
                            required={formData.isGatedEstate}
                            className="p-3 border rounded-lg" 
                            onChange={e => setFormData({ ...formData, estateName: e.target.value })} 
                        />
                        <input 
                            type="text" 
                            placeholder="Estate Address *" 
                            required={formData.isGatedEstate}
                            className="p-3 border rounded-lg" 
                            onChange={e => setFormData({ ...formData, estateAddress: e.target.value })} 
                        />
                    </div>
                )}
                
                <button 
                    type="submit" 
                    disabled={formData.isGatedEstate && (!formData.estateName || !formData.estateAddress)}
                    className={`w-full py-4 rounded-xl font-bold transition-colors ${
                        formData.isGatedEstate && (!formData.estateName || !formData.estateAddress)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                    }`}
                >
                    Continue
                </button>
                {formData.isGatedEstate && (!formData.estateName || !formData.estateAddress) && (
                    <p className="text-sm text-red-600 text-center">
                        Please fill in Estate Name and Estate Address
                    </p>
                )}
            </form>
        </div>
    );

    const renderStep6 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto text-center">
            <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl">
                <AlertCircle size={64} className="text-yellow-600 mx-auto mb-6" />
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Commercial Audit Request</h2>
                <p className="text-gray-600 mb-6">
                    Commercial and industrial audits require manual review by our team. 
                    We will contact you within 24-48 hours to discuss your requirements.
                </p>
                <button onClick={() => navigate('/')} className="bg-[#273e8e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors">
                    Return to Dashboard
                </button>
            </div>
        </div>
    );

    const renderStep7 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e] border-b pb-4">Audit Invoice</h2>
            <div className="space-y-4 mb-8">
                <div className="flex justify-between">
                    <span>Audit Fee</span>
                    <span className="font-bold">₦50,000</span>
                </div>
                <div className="border-t pt-4 font-bold text-xl flex justify-between">
                    <span>Total</span>
                    <span className="text-[#273e8e]">₦50,000</span>
                </div>
            </div>
            <button className="w-full bg-[#273e8e] text-white py-4 rounded-xl font-bold hover:bg-[#1a2b6b] transition-colors">
                Proceed to Payment
            </button>
        </div>
    );

    const renderStep8 = () => {
        // Calculate total amount including compulsory add-ons (Insurance for BNPL)
        const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
        const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
            ? (formData.selectedProductPrice * insuranceAddOn.calculation_value) / 100
            : (insuranceAddOn?.price || 0);
        
        // Use API data if available, otherwise use defaults
        // Material cost, installation fee, delivery fee, inspection fee should come from API
        // For now, using defaults but structure allows for API integration
        const materialCost = 50000; // Should come from API/state selection
        const installationFee = 50000; // Should come from API/state selection
        const deliveryFee = 25000; // Should come from API/state/delivery location selection
        const inspectionFee = 10000; // Should come from API
        
        const totalAmount = formData.selectedProductPrice + insuranceFee + materialCost + installationFee + deliveryFee + inspectionFee;

        return (
            <div className="animate-fade-in max-w-4xl mx-auto">
                <button onClick={() => setStep(formData.optionType ? 3 : 2)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                    <ArrowLeft size={16} className="mr-2" /> Back
                </button>
                <LoanCalculator 
                    totalAmount={totalAmount} 
                    onConfirm={handleLoanConfirm}
                    loanConfig={loanConfig}
                />
            </div>
        );
    };

    const renderStep10 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <button onClick={() => setStep(8)} className="mb-6 flex items-center text-gray-500 hover:text-[#273e8e]">
                <ArrowLeft size={16} className="mr-2" /> Back
            </button>
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Credit Check Method</h2>
            <div className="space-y-4">
                <button
                    onClick={() => {
                        setFormData({ ...formData, creditCheckMethod: 'auto' });
                        setStep(11);
                    }}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${formData.creditCheckMethod === 'auto'
                        ? 'border-[#273e8e] bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                        }`}
                >
                    <div className="flex items-center mb-2">
                        <CheckCircle size={20} className={formData.creditCheckMethod === 'auto' ? 'text-[#273e8e]' : 'text-gray-300'} />
                        <span className="ml-2 font-bold text-gray-800">Automatic (BVN Verification)</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">Fast and automated credit check using your BVN.</p>
                </button>
                <button
                    onClick={() => {
                        setFormData({ ...formData, creditCheckMethod: 'manual' });
                        setStep(11);
                    }}
                    className={`w-full p-6 rounded-xl border-2 text-left transition-all ${formData.creditCheckMethod === 'manual'
                        ? 'border-[#273e8e] bg-blue-50'
                        : 'border-gray-200 hover:border-blue-200'
                        }`}
                >
                    <div className="flex items-center mb-2">
                        <CheckCircle size={20} className={formData.creditCheckMethod === 'manual' ? 'text-[#273e8e]' : 'text-gray-300'} />
                        <span className="ml-2 font-bold text-gray-800">Manual (Bank Statement Review)</span>
                    </div>
                    <p className="text-sm text-gray-500 ml-7">Manual review of your bank statements (takes longer).</p>
                </button>
            </div>
        </div>
    );
    const submitApplication = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            if (!token) {
                alert("Please login to continue");
                navigate('/login');
                return;
            }

            // Step 1: Create loan calculation first (required by backend)
            let loanCalculationId = null;
            if (formData.loanDetails) {
                try {
                    const loanCalcPayload = {
                        product_amount: formData.selectedProductPrice,
                        loan_amount: formData.loanDetails.totalRepayment,
                        repayment_duration: formData.loanDetails.tenor
                    };
                    
                    const loanCalcResponse = await axios.post(API.LOAN_CALCULATION, loanCalcPayload, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json',
                            Accept: 'application/json'
                        }
                    });

                    if (loanCalcResponse.data?.data?.id) {
                        loanCalculationId = loanCalcResponse.data.data.id;
                    } else if (loanCalcResponse.data?.id) {
                        loanCalculationId = loanCalcResponse.data.id;
                    }
                } catch (calcError) {
                    console.error("Loan calculation error:", calcError);
                    // Continue anyway - backend might handle it differently
                }
            }

            // Step 2: Submit BNPL application
            const formDataToSend = new FormData();

            // Basic Fields
            formDataToSend.append('customer_type', formData.customerType);
            formDataToSend.append('product_category', formData.productCategory);
            formDataToSend.append('loan_amount', formData.loanDetails?.totalRepayment || formData.selectedProductPrice);
            formDataToSend.append('repayment_duration', formData.loanDetails?.tenor || 6);
            formDataToSend.append('credit_check_method', formData.creditCheckMethod || 'auto');
            
            // Add loan calculation ID if available
            if (loanCalculationId) {
                formDataToSend.append('loan_calculation_id', loanCalculationId);
            }

            // Personal Details
            formDataToSend.append('personal_details[full_name]', formData.fullName);
            formDataToSend.append('personal_details[bvn]', formData.bvn);
            formDataToSend.append('personal_details[phone]', formData.phone);
            formDataToSend.append('personal_details[email]', formData.email);
            formDataToSend.append('personal_details[social_media]', formData.socialMedia || '');

            // Property Details - Always send all fields (backend requires estate fields when property_details is present)
            formDataToSend.append('property_details[state]', formData.state || '');
            formDataToSend.append('property_details[address]', formData.address || '');
            formDataToSend.append('property_details[landmark]', formData.landmark || '');
            formDataToSend.append('property_details[floors]', formData.floors || '');
            formDataToSend.append('property_details[rooms]', formData.rooms || '');
            formDataToSend.append('property_details[is_gated_estate]', formData.isGatedEstate ? 1 : 0);
            // Always send estate fields (required by backend when property_details is present)
            formDataToSend.append('property_details[estate_name]', formData.isGatedEstate ? (formData.estateName || '') : '');
            formDataToSend.append('property_details[estate_address]', formData.isGatedEstate ? (formData.estateAddress || '') : '');
            
            // Add state_id and add_on_ids if available
            if (formData.stateId) formDataToSend.append('state_id', formData.stateId);
            
            // Add compulsory BNPL add-ons (Insurance)
            const compulsoryAddOns = addOns.filter(a => a.is_compulsory_bnpl).map(a => a.id);
            if (compulsoryAddOns.length > 0) {
                compulsoryAddOns.forEach(id => formDataToSend.append('add_on_ids[]', id));
            }

            // Files
            if (formData.bankStatement) formDataToSend.append('bank_statement', formData.bankStatement);
            if (formData.livePhoto) formDataToSend.append('live_photo', formData.livePhoto);

            const response = await axios.post(API.BNPL_APPLY, formDataToSend, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setApplicationId(response.data.data.loan_application.id);
                setApplicationStatus(response.data.data.loan_application.status);
                setStep(12); // Go to Status/Pending screen
            }
        } catch (error) {
            console.error("Application Submit Error:", error);
            const errorMessage = error.response?.data?.message || 
                                (error.response?.data?.errors ? JSON.stringify(error.response.data.errors) : null) ||
                                "Failed to submit application. Please check all required fields.";
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const renderStep11 = () => (
        <div className="animate-fade-in max-w-4xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Final Application</h2>
            <form onSubmit={submitApplication} className="space-y-6">
                {/* Personal Details Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Personal Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="text" placeholder="Full Name" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, fullName: e.target.value })} />
                        <input type="text" placeholder="BVN" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, bvn: e.target.value })} />
                        <input type="tel" placeholder="Phone Number" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                        <input type="email" placeholder="Email Address" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, email: e.target.value })} />
                        <div className="col-span-2">
                            <input 
                                type="text" 
                                placeholder="Social Media Handle *" 
                                required 
                                className="w-full p-3 border rounded-lg" 
                                value={formData.socialMedia}
                                onChange={e => setFormData({ ...formData, socialMedia: e.target.value })} 
                            />
                            <p className="text-xs text-gray-500 mt-1">* Social media handle is required for verification (e.g., @username or facebook.com/username)</p>
                            {formData.socialMedia && formData.socialMedia.trim().length === 0 && (
                                <p className="text-xs text-red-600 mt-1">Social media handle cannot be empty</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Property Details Section */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Property Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {states.length > 0 ? (
                            <select
                                required
                                className="p-3 border rounded-lg"
                                onChange={e => {
                                    const stateId = e.target.value ? Number(e.target.value) : null;
                                    const selectedState = states.find(s => s.id === stateId);
                                    setFormData({ ...formData, state: selectedState?.name || '', stateId });
                                }}
                            >
                                <option value="">Select State</option>
                                {states.filter(s => s.is_active).map((state) => (
                                    <option key={state.id} value={state.id}>{state.name}</option>
                                ))}
                            </select>
                        ) : (
                            <input type="text" placeholder="State" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, state: e.target.value })} />
                        )}
                        <input type="text" placeholder="Address" required className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, address: e.target.value })} />
                        <input type="text" placeholder="Landmark" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, landmark: e.target.value })} />
                        <input type="number" placeholder="Floors" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, floors: e.target.value })} />
                        <input type="number" placeholder="Rooms" className="p-3 border rounded-lg" onChange={e => setFormData({ ...formData, rooms: e.target.value })} />
                    </div>
                    <div className="mt-4">
                        <label className="flex items-center space-x-2">
                            <input type="checkbox" checked={formData.isGatedEstate} onChange={e => setFormData({ ...formData, isGatedEstate: e.target.checked })} />
                            <span>Is this in a gated estate?</span>
                        </label>
                    </div>
                    {formData.isGatedEstate && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <input 
                                type="text" 
                                placeholder="Estate Name *" 
                                required={formData.isGatedEstate}
                                className="p-3 border rounded-lg" 
                                onChange={e => setFormData({ ...formData, estateName: e.target.value })} 
                            />
                            <input 
                                type="text" 
                                placeholder="Estate Address *" 
                                required={formData.isGatedEstate}
                                className="p-3 border rounded-lg" 
                                onChange={e => setFormData({ ...formData, estateAddress: e.target.value })} 
                            />
                        </div>
                    )}
                </div>

                {/* File Uploads */}
                <div>
                    <h3 className="text-lg font-bold mb-4 text-gray-800 border-b pb-2">Required Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <p className="mb-2 font-medium">Bank Statement (Last 6 Months)</p>
                            <input type="file" required accept=".pdf,.jpg,.png" onChange={e => setFormData({ ...formData, bankStatement: e.target.files[0] })} />
                        </div>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                            <p className="mb-2 font-medium">Live Photo / Selfie</p>
                            <input type="file" required accept=".jpg,.png" onChange={e => setFormData({ ...formData, livePhoto: e.target.files[0] })} />
                        </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress))} 
                    className={`w-full py-4 rounded-xl font-bold transition-colors ${
                        loading || (formData.isGatedEstate && (!formData.estateName || !formData.estateAddress))
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-[#273e8e] text-white hover:bg-[#1a2b6b]'
                    }`}
                >
                    {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                {formData.isGatedEstate && (!formData.estateName || !formData.estateAddress) && (
                    <p className="text-sm text-red-600 mt-2 text-center">
                        Please fill in Estate Name and Estate Address
                    </p>
                )}
            </form>
        </div>
    );

    // Status polling effect
    React.useEffect(() => {
        if (step === 12 && applicationId) {
            const pollInterval = setInterval(async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    const response = await axios.get(API.BNPL_STATUS(applicationId), {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data.status === 'success' && response.data.data?.loan_application) {
                        const status = response.data.data.loan_application.status;
                        setApplicationStatus(status);
                        
                        if (status === 'approved') {
                            clearInterval(pollInterval);
                            setStep(13); // Go to approval screen
                        } else if (status === 'rejected') {
                            clearInterval(pollInterval);
                            // Could show rejection screen
                        } else if (status === 'counter_offer') {
                            clearInterval(pollInterval);
                            // Could show counter offer screen
                        }
                    }
                } catch (error) {
                    console.error("Status polling error:", error);
                }
            }, 30000); // Poll every 30 seconds
            
            return () => clearInterval(pollInterval);
        }
    }, [step, applicationId]);

    const renderStep12 = () => (
        <div className="animate-fade-in max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-8 text-[#273e8e]">Application Submitted</h2>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-blue-100">
                <Clock size={64} className="text-[#273e8e] mx-auto mb-6 animate-pulse" />
                <p className="text-xl font-medium text-gray-800 mb-4">Your application is under review.</p>
                <p className="text-gray-600 mb-4">We are processing your details. This usually takes 24-48 hours.</p>
                <p className="text-sm text-gray-500 mb-8">Status: <span className="font-bold text-[#273e8e]">{applicationStatus}</span></p>
                <div className="flex gap-4 justify-center">
                    <button 
                        onClick={async () => {
                            try {
                                const token = localStorage.getItem('access_token');
                                const response = await axios.get(API.BNPL_STATUS(applicationId), {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                
                                if (response.data.status === 'success' && response.data.data?.loan_application) {
                                    const status = response.data.data.loan_application.status;
                                    setApplicationStatus(status);
                                    
                                    if (status === 'approved') {
                                        setStep(13);
                                    } else {
                                        alert(`Current status: ${status}. Please check again later.`);
                                    }
                                }
                            } catch (error) {
                                alert("Failed to check status. Please try again later.");
                            }
                        }} 
                        className="bg-[#273e8e] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#1a2b6b] transition-colors"
                    >
                        Check Status Now
                    </button>
                    <button onClick={() => navigate('/')} className="text-gray-600 px-6 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors">
                        Return to Dashboard
                    </button>
                </div>
            </div>
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

    const handleGuarantorInvite = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const response = await axios.post(API.BNPL_GUARANTOR_INVITE, {
                loan_application_id: applicationId,
                full_name: formData.guarantorName,
                phone: formData.guarantorPhone,
                email: formData.guarantorEmail,
                relationship: formData.guarantorRelationship
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data.status === 'success') {
                setGuarantorId(response.data.data.id);
                alert("Guarantor details saved. You can now download the form.");
            }
        } catch (error) {
            console.error("Guarantor Invite Error:", error);
            alert("Failed to save guarantor details.");
        } finally {
            setLoading(false);
        }
    };

    const handleGuarantorUpload = async (file) => {
        if (!file) return;
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
            const uploadData = new FormData();
            uploadData.append('guarantor_id', guarantorId);
            uploadData.append('signed_form', file);

            const response = await axios.post(API.BNPL_GUARANTOR_UPLOAD, uploadData, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.status === 'success') {
                setStep(21); // Proceed to Invoice
            }
        } catch (error) {
            console.error("Guarantor Upload Error:", error);
            alert("Failed to upload guarantor form.");
        } finally {
            setLoading(false);
        }
    };

    const renderStep17 = () => (
        <div className="animate-fade-in max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold mb-6 text-[#273e8e]">Guarantor Information</h2>

            {!guarantorId ? (
                <form onSubmit={handleGuarantorInvite} className="space-y-4">
                    <p className="text-gray-600 mb-4">Please provide details of your guarantor.</p>
                    <input
                        type="text"
                        placeholder="Guarantor Full Name"
                        required
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorName: e.target.value })}
                    />
                    <input
                        type="tel"
                        placeholder="Guarantor Phone"
                        required
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorPhone: e.target.value })}
                    />
                    <input
                        type="email"
                        placeholder="Guarantor Email (Optional)"
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorEmail: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Relationship (e.g. Spouse, Colleague)"
                        className="w-full p-3 border rounded-lg"
                        onChange={(e) => setFormData({ ...formData, guarantorRelationship: e.target.value })}
                    />
                    <button type="submit" disabled={loading} className="w-full bg-[#273e8e] text-white py-3 rounded-xl font-bold">
                        {loading ? 'Saving...' : 'Save & Continue'}
                    </button>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="bg-green-50 border border-green-200 p-4 rounded-lg flex items-center">
                        <CheckCircle className="text-green-600 mr-3" size={20} />
                        <p className="text-sm text-green-700">Guarantor details saved successfully.</p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-800 mb-2">Step 1: Download Form</h3>
                        <button 
                            onClick={async () => {
                                try {
                                    const token = localStorage.getItem('access_token');
                                    // Generate or fetch guarantor form PDF
                                    // This should call an API endpoint to generate/download the form
                                    const response = await axios.get(`${API.BNPL_GUARANTOR_INVITE.replace('/invite', '/form')}?loan_application_id=${applicationId}`, {
                                        headers: { Authorization: `Bearer ${token}` },
                                        responseType: 'blob'
                                    });
                                    
                                    // Create download link
                                    const url = window.URL.createObjectURL(new Blob([response.data]));
                                    const link = document.createElement('a');
                                    link.href = url;
                                    link.setAttribute('download', `guarantor-form-${applicationId}.pdf`);
                                    document.body.appendChild(link);
                                    link.click();
                                    link.remove();
                                } catch (error) {
                                    console.error("Download error:", error);
                                    // Fallback: show alert with instructions
                                    alert("Please contact support to get your guarantor form, or download it from your application dashboard.");
                                }
                            }}
                            className="w-full border-2 border-[#273e8e] text-[#273e8e] py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors flex items-center justify-center mb-4"
                        >
                            <Download size={20} className="mr-2" /> Download Guarantor Form
                        </button>
                        <p className="text-xs text-gray-500 text-center">
                            Download the form, have your guarantor sign it, then upload it below.
                        </p>
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="font-bold text-gray-800 mb-2">Step 2: Upload Signed Form</h3>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#273e8e] transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                onChange={(e) => handleGuarantorUpload(e.target.files[0])}
                                accept=".pdf,.jpg,.png"
                            />
                            {loading ? (
                                <Loader className="animate-spin mx-auto text-[#273e8e]" />
                            ) : (
                                <>
                                    <Upload className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-500">Click to upload signed form</p>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Fetch invoice data when step 21 loads
    React.useEffect(() => {
        if (step === 21 && applicationId) {
            const fetchInvoice = async () => {
                try {
                    const token = localStorage.getItem('access_token');
                    // This should call an API to get the final invoice/order summary
                    // For now, we'll calculate from formData, but ideally should come from API
                    const insuranceAddOn = addOns.find(a => a.is_compulsory_bnpl);
                    const insuranceFee = insuranceAddOn && insuranceAddOn.calculation_type === 'percentage'
                        ? (formData.selectedProductPrice * insuranceAddOn.calculation_value) / 100
                        : (insuranceAddOn?.price || formData.selectedProductPrice * 0.005);
                    
                    setInvoiceData({
                        product_price: formData.selectedProductPrice,
                        material_cost: 50000,
                        installation_fee: 50000,
                        delivery_fee: 25000,
                        inspection_fee: 10000,
                        insurance_fee: insuranceFee,
                        total: formData.selectedProductPrice + 50000 + 50000 + 25000 + 10000 + insuranceFee
                    });
                } catch (error) {
                    console.error("Failed to fetch invoice:", error);
                }
            };
            fetchInvoice();
        }
    }, [step, applicationId]);

    const renderStep21 = () => {
        const invoice = invoiceData || {
            product_price: formData.selectedProductPrice,
            material_cost: 50000,
            installation_fee: 50000,
            delivery_fee: 25000,
            inspection_fee: 10000,
            insurance_fee: formData.selectedProductPrice * 0.005,
            total: formData.selectedProductPrice + 50000 + 50000 + 25000 + 10000 + (formData.selectedProductPrice * 0.005)
        };

        return (
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
                    <span className="font-bold">₦{Number(invoice.product_price || 0).toLocaleString()}</span>
                </div>

                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Material Cost (Cables, Breakers, etc.)</span>
                    <span>₦{Number(invoice.material_cost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Installation Fee</span>
                    <span>₦{Number(invoice.installation_fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Delivery/Logistics</span>
                    <span>₦{Number(invoice.delivery_fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Inspection Fee</span>
                    <span>₦{Number(invoice.inspection_fee || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-gray-600 pl-14">
                    <span>Insurance (0.5%)</span>
                    <span>₦{Number(invoice.insurance_fee || 0).toLocaleString()}</span>
                </div>

                <div className="border-t pt-4 mt-4">
                    <div className="flex justify-between items-center text-xl font-bold">
                        <span>Total</span>
                        <span className="text-[#273e8e]">₦{Number(invoice.total || 0).toLocaleString()}</span>
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
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col" >
            {/* Navbar Placeholder */}
            < div className="bg-white shadow-sm p-4 sticky top-0 z-50" >
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="font-bold text-xl text-[#273e8e]">TrooSolar</div>
                    <button onClick={() => navigate('/')} className="text-gray-600 hover:text-[#273e8e]">
                        Exit Application
                    </button>
                </div>
            </div >

            {/* Main Content */}
            < div className="flex-grow flex items-center justify-center p-6" >
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
            </div >
        </div >
    );
};

export default BNPLFlow;
