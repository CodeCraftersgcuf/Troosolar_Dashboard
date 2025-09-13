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
  { value: "", label: "Select Document" }, // cleaner placeholder (works on desktop too)
  { value: "passport", label: "Passport" },
  { value: "id", label: "National ID" },
  { value: "license", label: "Driver's License" },
];

const relationshipOptions = [
  "Spouse",
  "Parent",
  "Sibling",
  "Child",
  "Relative",
  "Friend",
  "Other",
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

  // Step flags (based on path)
  const location = useLocation();
  const isUploadDocumentPage = location.pathname.includes("/uploadDocument");
  const isBeneficiaryPage = location.pathname.includes("/uploadDetails");

  // Forms
  const [formData, setFormData] = useState({
    selectedDocument: "",
    selectedFile: null,
    beneficiaryName: "",
    beneficiaryRelationship: "",
    beneficiaryEmail: "",
    beneficiaryPhone: "",
  });

  // UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

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
    const { id, name, value, files } = e.target;
    const key = name ?? id;
    setFormData((prev) => ({
      ...prev,
      [key]: files ? files[0] : value,
    }));
  };

  const labelForSelectedDoc = () => {
    const found = documentTypes.find(
      (d) => d.value === formData.selectedDocument
    );
    return found?.label || formData.selectedDocument || "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!ensureAuth()) return;

    setLoading(true);
    try {
      // 1) Upload Document -> /loan-application/{id}
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
        // Save beneficiary details
        const beneficiaryPayload = {
          beneficiary_name: formData.beneficiaryName?.trim(),
          beneficiary_email: formData.beneficiaryEmail?.trim(),
          beneficiary_phone: formData.beneficiaryPhone?.trim(),
          beneficiary_relationship: formData.beneficiaryRelationship?.trim(),
        };

        await axios.post(
          API.BENEFICIARY_DETAIL(monoLoanId),
          beneficiaryPayload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/json",
              "Content-Type": "application/json",
            },
          }
        );

        setShowSuccess(true); // show success modal after submit
        return;
      }
    } catch (err) {
      const resp = err?.response?.data;
      const msg =
        resp?.message ||
        resp?.error ||
        err?.message ||
        "Request failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ---------- Helpers for progress (mobile 1/2 & 2/2) ----------
  const mobileStepIndex = isUploadDocumentPage ? 1 : 2;
  const mobileStepCount = 2; // Now only 2 steps total
  const mobileProgressPct = Math.round(
    (mobileStepIndex / mobileStepCount) * 100
  );

  return (
    <>
      {/* ======================= DESKTOP ======================= */}
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
                    Upload Documents (1{" "}
                    <span className="text-gray-400/80">/2</span>)
                  </h1>
                  <p className="text-gray-600">
                    Before you continue your application process, kindly upload
                    required documents.
                  </p>
                  <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                    <div className="w-1/2 bg-[#273e8e] h-full rounded-full" />
                  </div>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-4">
                    <div>
                      <label
                        htmlFor="selectedDocument"
                        className="block text-gray-700 mb-2"
                      >
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
                      <label className="block text-gray-700 mb-2">
                        Upload Document
                      </label>
                      <div className="border-2 bg-white py-14 outline-none border-gray-300 rounded-md p-6 text-center">
                        <input
                          type="file"
                          id="file-upload"
                          name="selectedFile"
                          className="hidden"
                          onChange={handleChange}
                          required
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex flex-col items-center justify-center cursor-pointer"
                        >
                          <img
                            src={assets.uploadArea}
                            alt="Upload document"
                            className="mb-3"
                          />
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
                    Beneficiary Details (2{" "}
                    <span className="text-gray-400/80">/2</span>)
                  </h1>
                  <p className="text-gray-600">
                    Kindly add your beneficiary details
                  </p>
                  <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
                    <div className="w-full bg-[#273e8e] h-full rounded-full" />
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
                      {loading ? "Submitting..." : "Submit Application"}
                    </button>
                  </div>
                </form>

                {/* Success modal after submit */}
                {showSuccess && (
                  <LoanPopUp
                    icon={<GiCheckMark size={22} color="white" />}
                    text="Your loan application has been submitted successfully"
                    imgBg="bg-[#008000]"
                  />
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ======================= MOBILE ======================= */}
      <div className="flex min-h-screen w-full bg-gray-50 sm:hidden">
        <div className="w-full">
          {/* White header with chevron + centered title */}
          <div className="sticky top-0 z-20 bg-white px-5 pt-5 pb-3 flex items-center justify-center relative border-b border-gray-100">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="absolute left-5 h-9 w-9 rounded-full flex items-center justify-center"
            >
              <ChevronLeft size={22} />
            </button>
            <h1 className="text-[16px] font-semibold">Loan Application</h1>
          </div>

          <main className="bg-[#F5F7FF] p-5 pb-28">
            {/* Title + progress (numbers match your mock: 1/2 & 2/2) */}
            <div className="mb-4">
              <h1 className="text-[20px] font-semibold text-gray-900">
                {isUploadDocumentPage && (
                  <>
                    Upload Documents (<span className="text-[#273e8e]">1</span>/
                    {mobileStepCount})
                  </>
                )}
                {isBeneficiaryPage && (
                  <>
                    Beneficiary Details (
                    <span className="text-[#273e8e]">2</span>/{mobileStepCount})
                  </>
                )}
              </h1>
              <p className="text-[12px] text-gray-500 mt-1">
                {isUploadDocumentPage &&
                  "Before you continue your application process, kindly upload required documents"}
                {isBeneficiaryPage && "Kindly add your beneficiary details"}
              </p>

              <div className="w-full bg-gray-300/50 mt-3 rounded-full h-3">
                <div
                  className="bg-[#273e8e] h-3 rounded-full transition-all"
                  style={{ width: `${mobileProgressPct}%` }}
                />
              </div>
            </div>

            {/* ----- Step 1: Upload (mobile) ----- */}
            {isUploadDocumentPage && (
              <form
                id="udoc-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div>
                  <label
                    htmlFor="selectedDocument"
                    className="block text-gray-700 mb-2"
                  >
                    Select Document
                  </label>
                  <select
                    id="selectedDocument"
                    name="selectedDocument"
                    value={formData.selectedDocument}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl outline-none"
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
                  <label className="block text-gray-700 mb-2">
                    Upload Document
                  </label>
                  <div className="border bg-white py-10 border-gray-300 rounded-xl p-6 text-center">
                    <input
                      type="file"
                      id="file-upload-m"
                      name="selectedFile"
                      className="hidden"
                      onChange={handleChange}
                      required
                    />
                    <label
                      htmlFor="file-upload-m"
                      className="inline-flex flex-col items-center justify-center cursor-pointer"
                    >
                      <img
                        src={assets.uploadArea}
                        alt="Upload"
                        className="mb-3"
                      />
                      <p className="text-gray-500 text-[13px]">
                        {formData.selectedFile
                          ? `Selected: ${formData.selectedFile.name}`
                          : "Select a clear copy of your document to upload"}
                      </p>
                    </label>
                  </div>
                </div>

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </form>
            )}

            {/* ----- Step 2: Beneficiary (mobile) ----- */}
            {isBeneficiaryPage && (
              <form
                id="beneficiary-form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <Input
                  id="beneficiaryName"
                  name="beneficiaryName"
                  label="Beneficiary Name"
                  placeholder="Enter beneficiary name"
                  value={formData.beneficiaryName}
                  onChange={handleChange}
                  required
                />

                {/* use a select here to match the mock; desktop remains input */}
                <div>
                  <label
                    htmlFor="beneficiaryRelationship"
                    className="block text-gray-700 mb-2"
                  >
                    Beneficiary Relationship
                  </label>
                  <select
                    id="beneficiaryRelationship"
                    name="beneficiaryRelationship"
                    value={formData.beneficiaryRelationship}
                    onChange={handleChange}
                    className="w-full p-4 bg-white border border-gray-300 rounded-xl outline-none"
                    required
                  >
                    <option value="">Select Relationship</option>
                    {relationshipOptions.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <Input
                  id="beneficiaryEmail"
                  name="beneficiaryEmail"
                  label="Beneficiary Email"
                  placeholder="Enter beneficiary email"
                  type="email"
                  value={formData.beneficiaryEmail}
                  onChange={handleChange}
                  required
                />
                <Input
                  id="beneficiaryPhone"
                  name="beneficiaryPhone"
                  label="Beneficiary Phone Number"
                  placeholder="Enter beneficiary phone number"
                  type="tel"
                  value={formData.beneficiaryPhone}
                  onChange={handleChange}
                  required
                />

                {error && <p className="text-red-600 text-sm">{error}</p>}
              </form>
            )}

            {/* Success modal for mobile */}
            {isBeneficiaryPage && showSuccess && (
              <LoanPopUp
                icon={<GiCheckMark size={22} color="white" />}
                text="Your loan application has been submitted successfully"
                link1Text="Back"
                link1="/uploadDetails"
                link2Text="Loan Dashboard"
                link2="loanDashboard"
                imgBg="bg-[#008000]"
              />
            )}
          </main>

          {/* Sticky mobile CTA (sits above your bottom nav) */}
          <div className="sm:hidden fixed left-0 right-0 bottom-24 px-5">
            {isUploadDocumentPage && (
              <button
                form="udoc-form"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#273e8e] text-white disabled:opacity-60"
              >
                {loading ? "Uploading..." : "Proceed"}
              </button>
            )}
            {isBeneficiaryPage && (
              <button
                form="beneficiary-form"
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-full bg-[#273e8e] text-white disabled:opacity-60"
              >
                {loading ? "Submitting..." : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UploadDocument;
