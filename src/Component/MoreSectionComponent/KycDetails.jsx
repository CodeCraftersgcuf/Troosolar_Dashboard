import React, { useState } from "react";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

import API from "../../config/api.config";
import axios from "axios";

// Sample assets import (you should replace this with your actual import path)
import { assets } from "../../assets/data";

const documentTypes = [
  { value: "", label: "Select a document" },
  { value: "passport", label: "Passport" },
  { value: "national_id", label: "National ID" },
  { value: "driver_license", label: "Driver License" },
  { value: "other", label: "Other" },
];

const KycDetails = () => {
  const [formData, setFormData] = useState({
    selectedDocument: "",
    selectedFile: null,
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "selectedFile") {
      setFormData((prev) => ({
        ...prev,
        selectedFile: files[0],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.selectedDocument || !formData.selectedFile) {
      setErrorMessage("Please select a document and upload a file.");
      setShowErrorModal(true);
      return;
    }

    // Validate file type and size
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(formData.selectedFile.type)) {
      setErrorMessage("Please upload a valid file (JPG, JPEG, PNG, or PDF).");
      setShowErrorModal(true);
      return;
    }

    if (formData.selectedFile.size > maxSize) {
      setErrorMessage("File size must be less than 5MB.");
      setShowErrorModal(true);
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setErrorMessage("Please log in to upload documents.");
        setShowErrorModal(true);
        return;
      }

      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.selectedDocument);
      formDataToSend.append('file', formData.selectedFile);

      const response = await axios.post(API.Kyc_Upload, formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success') {
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          selectedDocument: "",
          selectedFile: null,
        });
      } else {
        setErrorMessage(response.data.message || "Upload failed. Please try again.");
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error("KYC Upload Error:", error);
      setErrorMessage(
        error?.response?.data?.message || 
        error?.message || 
        "Upload failed. Please try again."
      );
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-[#ffffff] h-full rounded-2xl border border-gray-400  w-full p-5">
      <h1 className="text-center text-lg">KYC Details </h1>
      <div className=" py-4">
        <header className="mb-6">
          {/* <h1 className="text-2xl  text-gray-800 mb-2">
            Upload Documents (1 <span className="text-gray-400/80">/3</span>)
          </h1> */}
          <p className="text-gray-600 text-sm">
            Before you continue your application process, kindly upload required
            documents.
          </p>
          {/* <div className="w-full bg-gray-400/40 my-7 rounded-full h-3">
            <div className="w-1/3 bg-[#273e8e] h-full rounded-full"></div>
          </div> */}
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label
                htmlFor="selectedDocument"
                className="block text-gray-700 mb-5"
              >
                Select Document
              </label>
              <select
                id="selectedDocument"
                name="selectedDocument"
                value={formData.selectedDocument}
                onChange={handleChange}
                className="w-full p-4 bg-white border border-gray-300 rounded-md outline-none text-gray-400"
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
              <label className="block text-gray-500 mb-5">
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
                  <p className="text-gray-500 text-sm">
                    {formData.selectedFile
                      ? `Selected: ${formData.selectedFile.name}`
                      : "Select a clear copy of your document to upload"}
                  </p>
                </label>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-3 bg-[#273e8e] text-white text-sm font-medium rounded-full hover:bg-[#1e3275] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading...
              </>
            ) : (
              "Proceed"
            )}
          </button>
        </form>
      </div>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Successful!
            </h3>
            <p className="text-gray-600 mb-6">
              Your KYC document has been uploaded successfully. We will review it and get back to you soon.
            </p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full py-3 px-4 bg-[#273e8e] text-white font-medium rounded-lg hover:bg-[#1e3275] transition-colors"
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 bg-opacity-50">
          <div className="bg-white rounded-2xl p-6 max-w-md mx-4 text-center">
            <div className="flex justify-center mb-4">
              <XCircle className="w-16 h-16 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Upload Failed
            </h3>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="w-full py-3 px-4 bg-[#273e8e] text-white font-medium rounded-lg hover:bg-[#1e3275] transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default KycDetails;
