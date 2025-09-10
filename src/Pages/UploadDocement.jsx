
import React, { useMemo, useState } from "react";
import TopNavbar from "../Component/TopNavbar";
import SideBar from "../Component/SideBar";
import { assets } from "../assets/data";
import { Input } from "../Component/Input";
import { Link, useLocation, useNavigate } from "react-router-dom";
import LoanRepaymentCard from "../Component/LoanRepaymentCard";
import LoanPopUp from "../Component/LoanPopUp";
import { GiCheckMark } from "react-icons/gi";
import { ChevronLeft } from "lucide-react";
import axios from "axios";
import API from "../config/api.config";

const documentTypes = [
  { value: "", label: "-- Select a document --" },
  { value: "passport", label: "Passport" },
  { value: "id", label: "National ID" },
  { value: "license", label: "Driver's License" },
];

const repaymentDurations = [
  { value: "", label: "Select duration" },
  { value: "30", label: "30 days" },
  { value: "60", label: "60 days" },
  { value: "90", label: "90 days" },
];

const UploadDocument = () => {
  const navigate = useNavigate();
  const { state } = useLocation();

  // monoLoanId / monoCalc coming from CreditScore page; keep fallback from session
  const monoLoanId = useMemo(() => {
    if (state?.monoLoanId) return state.monoLoanId;
    try {
      const s = sessionStorage.getItem("last_mono_calc");
      return s ? JSON.parse(s)?.id : null;
    } catch {
      return null;
    }
  }, [state]);

  const monoCalc = useMemo(() => {
    if (state?.monoCalc) return state.monoCalc;
    try {
      const s = sessionStorage.getItem("last_mono_calc");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, [state]);

  // Step forms
  const [formData, setFormData] = useState({
    selectedDocument: "",
    selectedFile: null,
    beneficiaryName: "",
    beneficiaryRelationship: "",
    beneficiaryEmail: "",
    beneficiaryPhone: "",
    loanAmount: "",
    repaymentDuration: "",
    purpose: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false); // controls LoanPopUp visibility

  // Which step we're on (by route)
  const location = useLocation();
  const isUploadDocumentPage = location.pathname.includes("/uploadDocument");
  const isBeneficiaryPage = location.pathname.includes("/uploadDetails");
  const isLoanPage = location.pathname.includes("/loanDetails");

  const token = localStorage.getItem("access_token");

  const ensureAuth = () => {
    if (!token) {
      navigate("/login");
      return false;
    }
    if (!monoLoanId) {
      setError("Missing loan context. Please go back to Credit Score.");
      return false;
    }
    return true;
  };

  const handleChange = (e) => {
    const {id, name, value, files } = e.target;
     const key = name ?? id; 
    setFormData((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const labelForSelectedDoc = () => {
    const found = documentTypes.find((d) => d.value === formData.selectedDocument);
    return found?.label || formData.selectedDocument || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!ensureAuth()) return;
    setLoading(true);

    try {
      // 1) Upload Document -> /loan-application/{id} (multipart)
      if (isUploadDocumentPage) {
        if (!formData.selectedDocument || !formData.selectedFile) {
          setError("Please choose a document type and upload a file.");
          setLoading(false);
          return;
        }

        const fd = new FormData();
        fd.append("title_document", labelForSelectedDoc());
        fd.append("upload_document", formData.selectedFile);

        await axios.post(API.LOAN_APPLICATION_DOCS(monoLoanId), fd, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "multipart/form-data",
          },
        });

        navigate("/uploadDetails", { state: { monoLoanId, monoCalc } });
        return;
      }

      // 2) Beneficiary -> /beneficiary-detail/{id}
      if (isBeneficiaryPage) {
        const payload = {
          beneficiary_name: formData.beneficiaryName?.trim(),
          beneficiary_email: formData.beneficiaryEmail?.trim(),
          beneficiary_phone: formData.beneficiaryPhone?.trim(),
          beneficiary_relationship: formData.beneficiaryRelationship?.trim(),
        };

        await axios.post(API.BENEFICIARY_DETAIL(monoLoanId), payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        navigate("/loanDetails", { state: { monoLoanId, monoCalc } });
        return;
      }

      // 3) Loan Details -> /loan-details/{id}
      if (isLoanPage) {
        const payload = {
          loan_amount: Number(formData.loanAmount),
          repayment_duration: Number(formData.repaymentDuration),
        };

        await axios.post(API.LOAN_DETAILS(monoLoanId), payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // ✅ Only show modal after successful submit
        setShowSuccess(true);
        return;
      }
    } catch (err) {
      const resp = err?.response?.data;
      const msg = resp?.message || resp?.error || err?.message || "Request failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Data for the card: original calc + mono result (down payment etc)
  const calculation = useMemo(() => {
    try {
      const s = sessionStorage.getItem("last_calculation");
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }, []);

  return (
    <>
      {/* ======= DESKTOP ======= */}
      <div className="sm:flex hidden min-h-screen w-full bg-gray-50">
        <SideBar />
        <div className="w-full sm:w-[calc(100%-250px)]">
          <TopNavbar />
          <main className="bg-[#F5F7FF] p-5">
            {/* ===== STEP 1: Upload Document ===== */}
            {isUploadDocumentPage && (
              <div className="w-full md:w-1/2 py-4">
                <header className="mb-6">
                  <h1 className="text-2xl font-medium text-gray-800 mb-2">
                    Upload Documents (1 <span className="text-gray-400/80">/3</span>)
                  </h1>
                  <p className="text-gray-600">
                    Before you continue your application process, kindly upload required documents.
                  </p>
                  <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                    <div className="w-1/3 bg-[#273e8e] h-full rounded-full" />
                  </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="selectedDocument" className="block text-gray-700 mb-2">
                        Select Document
                      </label>
                      <select
                        id="selectedDocument"
                        name="selectedDocument"
                        value={formData.selectedDocument}
                        onChange={handleChange}
                        className="w-full p-4 bg-white border border-gray-300 rounded-md outline-none"
                        required
                      >
                        {documentTypes.map((doc) => (
                          <option key={doc.value} value={doc.value}>
                            {doc.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Upload Document</label>
                      <div className="border-2 bg-white py-14 outline-none border-gray-300 rounded-md p-6 text-center">
                        <input
                          type="file"
                          id="file-upload"
                          name="selectedFile"
                          className="hidden"
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="file-upload" className="inline-flex flex-col items-center justify-center cursor-pointer">
                          <img src={assets.uploadArea} alt="Upload document" className="mb-3" />
                          <p className="text-gray-500">
                            {formData.selectedFile
                              ? `Selected: ${formData.selectedFile.name}`
                              : "Select a clear copy of your document to upload"}
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-60"
                  >
                    {loading ? "Uploading..." : "Proceed"}
                  </button>
                </form>
              </div>
            )}

            {/* ===== STEP 2: Beneficiary ===== */}
            {isBeneficiaryPage && (
              <div className="w-full md:w-1/2 py-4">
                <header className="mb-6">
                  <h1 className="text-2xl font-medium text-gray-800 mb-2">
                    Beneficiary Details (2 <span className="text-gray-400/80">/3</span>)
                  </h1>
                  <p className="text-gray-600">Kindly add your beneficiary details</p>
                  <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                    <div className="w-2/3 bg-[#273e8e] h-full rounded-full" />
                  </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      id="beneficiaryName"
                      name="beneficiaryName"
                      label="Beneficiary Name"
                      placeholder="Enter Beneficiary Name"
                      value={formData.beneficiaryName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="beneficiaryRelationship"
                      name="beneficiaryRelationship"
                      label="Beneficiary Relationship"
                      placeholder="Enter Beneficiary Relationship"
                      value={formData.beneficiaryRelationship}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="beneficiaryEmail"
                      name="beneficiaryEmail"
                      label="Beneficiary Email"
                      placeholder="Enter Beneficiary Email"
                      type="email"
                      value={formData.beneficiaryEmail}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="beneficiaryPhone"
                      name="beneficiaryPhone"
                      label="Beneficiary Phone Number"
                      placeholder="Enter Beneficiary Phone Number"
                      type="tel"
                      value={formData.beneficiaryPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <div className="flex gap-4 items-center">
                    <Link
                      to="/uploadDocument"
                      state={{ monoLoanId, monoCalc }}
                      className="w-[30%] text-center py-4 px-3 border text-black text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
                    >
                      Back
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Proceed"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* ===== STEP 3: Loan Details ===== */}
            {isLoanPage && (
              <div className="w-full py-4 gap-8 flex">
                <div className="w-1/2">
                  <header className="mb-6">
                    <h1 className="text-2xl font-medium text-gray-800 mb-2">
                      Loan Details (3 <span className="text-gray-400/80">/3</span>)
                    </h1>
                    <p className="text-gray-600">Please provide your loan information</p>
                    <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                      <div className="w-full bg-[#273e8e] h-full rounded-full" />
                    </div>
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <Input
                        id="loanAmount"
                        name="loanAmount"
                        label="Loan Amount"
                        placeholder="Enter loan amount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        required
                      />

                      <div>
                        <label htmlFor="repaymentDuration" className="block text-gray-700 mb-2">
                          Repayment Duration
                        </label>
                        <select
                          id="repaymentDuration"
                          name="repaymentDuration"
                          value={formData.repaymentDuration}
                          onChange={handleChange}
                          className="w-full p-4 bg-white border border-gray-300 rounded-md outline-none"
                          required
                        >
                          {repaymentDurations.map((duration) => (
                            <option key={duration.value} value={duration.value}>
                              {duration.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex gap-4 items-center">
                      <Link
                        to="/uploadDetails"
                        state={{ monoLoanId, monoCalc }}
                        className="w-[30%] text-center py-4 px-3 border text-black text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
                      >
                        Back
                      </Link>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-60"
                      >
                        {loading ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="mt-20 h-full w-1/2">
                  <div className="bg-gray-300/60">
                    <LoanRepaymentCard calculation={calculation} monoCalc={monoCalc} />
                  </div>

                  {/* ✅ Modal shows only after a successful final submit */}
                  {showSuccess && (
                    <LoanPopUp
                      icon={<GiCheckMark size={22} color="white" />}
                      text="Your loan application has been submitted successfully"
                      link1Text="Back"
                      link1="/loanDetails"
                      link2Text="Loan Dashboard"
                      link2="loanDashboard"
                      imgBg="bg-[#008000]"
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ======= MOBILE ======= */}
      <div className="flex min-h-screen w-full bg-gray-50 sm:hidden">
        <div className="w-full">
          <main className="bg-[#F5F7FF] p-5">
            <div className="flex my-5">
              <ChevronLeft />
              <p className="absolute left-56">Loan Application</p>
            </div>

            {/* Step 1 - Mobile */}
            {isUploadDocumentPage && (
              <div className="w-full py-4">
                <header className="mb-6">
                  <h1 className="text-2xl font-medium text-gray-800 mb-2">
                    Upload Documents (1 <span className="text-gray-400/80">/3</span>)
                  </h1>
                  <p className="text-gray-600">
                    Before you continue your application process, kindly upload required documents.
                  </p>
                  <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                    <div className="w-1/3 bg-[#273e8e] h-full rounded-full" />
                  </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="selectedDocument" className="block text-gray-700 mb-2">
                        Select Document
                      </label>
                      <select
                        id="selectedDocument"
                        name="selectedDocument"
                        value={formData.selectedDocument}
                        onChange={handleChange}
                        className="w-full p-4 bg-white border border-gray-300 rounded-md outline-none"
                        required
                      >
                        {documentTypes.map((doc) => (
                          <option key={doc.value} value={doc.value}>
                            {doc.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-700 mb-2">Upload Document</label>
                      <div className="border-2 bg-white py-14 outline-none border-gray-300 rounded-md p-6 text-center">
                        <input
                          type="file"
                          id="file-upload-m"
                          name="selectedFile"
                          className="hidden"
                          onChange={handleChange}
                          required
                        />
                        <label htmlFor="file-upload-m" className="inline-flex flex-col items-center justify-center cursor-pointer">
                          <img src={assets.uploadArea} alt="Upload document" className="mb-3" />
                          <p className="text-gray-500">
                            {formData.selectedFile ? `Selected: ${formData.selectedFile.name}` : "Select a clear copy of your document to upload"}
                          </p>
                        </label>
                      </div>
                    </div>
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-60"
                  >
                    {loading ? "Uploading..." : "Proceed"}
                  </button>
                </form>
              </div>
            )}

            {/* Step 2 - Mobile */}
            {isBeneficiaryPage && (
              <div className="w-full py-4">
                <header className="mb-6">
                  <h1 className="text-2xl font-medium text-gray-800 mb-2">
                    Beneficiary Details (2 <span className="text-gray-400/80">/3</span>)
                  </h1>
                  <p className="text-gray-600">Kindly add your beneficiary details</p>
                  <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                    <div className="w-2/3 bg-[#273e8e] h-full rounded-full" />
                  </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <Input
                      id="beneficiaryName"
                      name="beneficiaryName"
                      label="Beneficiary Name"
                      placeholder="Enter Beneficiary Name"
                      value={formData.beneficiaryName}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="beneficiaryRelationship"
                      name="beneficiaryRelationship"
                      label="Beneficiary Relationship"
                      placeholder="Enter Beneficiary Relationship"
                      value={formData.beneficiaryRelationship}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="beneficiaryEmail"
                      name="beneficiaryEmail"
                      label="Beneficiary Email"
                      placeholder="Enter Beneficiary Email"
                      type="email"
                      value={formData.beneficiaryEmail}
                      onChange={handleChange}
                      required
                    />
                    <Input
                      id="beneficiaryPhone"
                      name="beneficiaryPhone"
                      label="Beneficiary Phone Number"
                      placeholder="Enter Beneficiary Phone Number"
                      type="tel"
                      value={formData.beneficiaryPhone}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  {error && <p className="text-red-600 text-sm">{error}</p>}

                  <div className="flex gap-4 items-center">
                    <Link
                      to="/uploadDocument"
                      state={{ monoLoanId, monoCalc }}
                      className="w-[30%] text-center py-4 px-3 border text-black text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
                    >
                      Back
                    </Link>
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-60"
                    >
                      {loading ? "Saving..." : "Proceed"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Step 3 - Mobile */}
            {isLoanPage && (
              <div className="w-full py-4 gap-8 flex flex-col">
                <div className="w-full">
                  <header className="mb-6">
                    <h1 className="text-2xl font-medium text-gray-800 mb-2">
                      Loan Details (3 <span className="text-gray-400/80">/3</span>)
                    </h1>
                    <p className="text-gray-600">Please provide your loan information</p>
                    <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                      <div className="w-full bg-[#273e8e] h-full rounded-full" />
                    </div>
                  </header>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                      <Input
                        id="loanAmount"
                        name="loanAmount"
                        label="Loan Amount"
                        placeholder="Enter loan amount"
                        type="number"
                        value={formData.loanAmount}
                        onChange={handleChange}
                        required
                      />
                      <div>
                        <label htmlFor="repaymentDuration" className="block text-gray-700 mb-2">
                          Repayment Duration
                        </label>
                        <select
                          id="repaymentDuration"
                          name="repaymentDuration"
                          value={formData.repaymentDuration}
                          onChange={handleChange}
                          className="w-full p-4 bg-white border border-gray-300 rounded-md outline-none"
                          required
                        >
                          {repaymentDurations.map((duration) => (
                            <option key={duration.value} value={duration.value}>
                              {duration.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {error && <p className="text-red-600 text-sm">{error}</p>}

                    <div className="flex gap-4 items-center">
                      <Link
                        to="/uploadDetails"
                        state={{ monoLoanId, monoCalc }}
                        className="w-[30%] text-center py-4 px-3 border text-black text-sm font-medium rounded-full hover:bg-gray-100 transition-colors"
                      >
                        Back
                      </Link>
                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-60"
                      >
                        {loading ? "Submitting..." : "Submit Application"}
                      </button>
                    </div>
                  </form>
                </div>

                <div className="w-full">
                  <div className="bg-gray-300/60">
                    <LoanRepaymentCard calculation={calculation} monoCalc={monoCalc} />
                  </div>

                  {showSuccess && (
                    <LoanPopUp
                      icon={<GiCheckMark size={22} color="white" />}
                      text="Your loan application has been submitted successfully"
                      link1Text="Back"
                      link1="/loanDetails"
                      link2Text="Loan Dashboard"
                      link2="loanDashboard"
                      imgBg="bg-[#008000]"
                    />
                  )}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
};

export default UploadDocument;
