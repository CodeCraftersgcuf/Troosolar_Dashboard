import React from "react";
import { ChevronLeft } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const TermsPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const section = (params.get("section") || "terms").toLowerCase(); // terms | privacy

  const basePdfPath =
    "/docs/Consumer%20Terms%20of%20Service%2C%20and%20Privacy%20Policy.pdf";
  const initialPage = section === "privacy" ? 9 : 1; // privacy starts later in the same PDF
  const pdfUrl = `${basePdfPath}#page=${initialPage}&view=FitH`;

  const title =
    section === "privacy" ? "Privacy Policy" : "Finance Terms and Conditions";

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link
          to="/"
          className="text-[#273e8e] font-medium flex items-center gap-1 hover:underline"
        >
          <ChevronLeft size={20} /> Back
        </Link>
        <span className="font-bold text-[#273e8e]">Troosolar</span>
      </div>

      <div className="w-full max-w-6xl mx-auto flex-1 bg-white rounded-2xl shadow-md p-4 md:p-6 my-4 md:my-6 flex flex-col gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold text-[#273e8e]">
            {title}
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Showing: Consumer Terms of Service, and Privacy Policy (full
            document).
          </p>
        </div>

        <div className="border rounded-xl overflow-hidden flex-1 min-h-[70vh]">
          <iframe
            title="Consumer Terms and Privacy Policy"
            src={pdfUrl}
            className="w-full h-full min-h-[70vh]"
          />
        </div>

        <a
          href={basePdfPath}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#273e8e] underline text-sm"
        >
          Open the PDF in a new tab
        </a>
      </div>
    </div>
  );
};

export default React.memo(TermsPage);
