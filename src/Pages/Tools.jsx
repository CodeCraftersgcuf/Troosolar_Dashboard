import React, { useState } from "react";
import SideBar from "../Component/SideBar";
import TopNavbar from "../Component/TopNavbar";
import { assets } from "../assets/data";
import InvertedLoadCalculator from "../Component/InverterLoadCalculator";
import SolarPanelCalculator from "../Component/SolarPanelCalculator";
import SolarSavingCalculator from "../Component/SolarSavingCalculator";
import LoanCalculator from "../Component/LoanCalculator";
import SmallBoxes from "../Component/SmallBoxes";
import { ChevronLeft } from "lucide-react";
const toolsData = [
  {
    id: "inverter",
    label: "Inverter Load Calculator",
    icon: assets.solarInverted,
    component: <InvertedLoadCalculator />,
  },
  {
    id: "solarPanel",
    label: "Solar Panel Calculator",
    icon: assets.solar1,
    component: <SolarPanelCalculator />,
  },
  {
    id: "solarSaving",
    label: "Solar Saving Calculator",
    icon: assets.solarInverted,
    component: <SolarSavingCalculator />,
  },
  {
    id: "loan",
    label: "Loan Calculator",
    icon: assets.solarInverted,
    component: <LoanCalculator />,
  },
];

const Navbar = ({ activeTool, setActiveTool }) => {
  return (
    <div className="bg-[#273e8e] border-l-2 text-white h-[100px] w-full grid grid-cols-4 items-end pb-1 text-sm px-10">
      {toolsData.map((tool) => (
        <div
          key={tool.id}
          onClick={() => setActiveTool(tool.id)}
          className="cursor-pointer  flex flex-col justify-center items-center gap-2"
        >
          <div className="flex justify-center items-center gap-2">
            <img src={tool.icon} alt={tool.label} />
            <p className="text-end mt-1 text-[15px]">{tool.label}</p>
          </div>
          <div
            className={`w-[100px] h-2 rounded-full ${
              activeTool === tool.id ? "bg-white" : ""
            }`}
          />
        </div>
      ))}
    </div>
  );
};

const Tools = () => {
  const [activeTool, setActiveTool] = useState("inverter"); // Default tool
  const [mobileView, setMobileView] = useState("tabs"); // 'tabs' or 'tool'
  const selectedTool = toolsData.find((tool) => tool.id === activeTool);

  const handleMobileToolSelect = (toolId) => {
    setActiveTool(toolId);
    setMobileView("tool");
  };

  const handleBackToTabs = () => {
    setMobileView("tabs");
  };

  return (
    <>
      {/* Desktop View  */}
      <div className="relative hidden sm:flex min-h-screen overflow-hidden">
        {/* Sidebar */}
        <SideBar />

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          <TopNavbar />
          <div className="flex flex-col  flex-1">
            <Navbar activeTool={activeTool} setActiveTool={setActiveTool} />
            {selectedTool?.component}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div
        className={`flex sm:hidden min-h-screen w-full bg-[#F5F7FF] ${
          mobileView === "tabs" ? "pb-20" : ""
        }`}
      >
        {mobileView === "tabs" ? (
          <div className="w-full">
            {/* Header */}
            <div className="h-[100px] text-white p-4 px-5 flex items-center justify-between">
              <div className="flex items-center">
                <ChevronLeft
                  className="text-black cursor-pointer"
                  onClick={() => window.history.back()}
                />
              </div>
              <div className="flex-grow flex justify-center">
                <h2 className="text-sm text-black">Tools</h2>
              </div>
            </div>

            {/* Tools Cards */}
            <div className="p-4 space-y-4">
              {toolsData.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => handleMobileToolSelect(tool.id)}
                  className="bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="h-[60px] w-[60px] rounded-full flex justify-center items-center"
                      style={{
                        backgroundColor:
                          tool.id === "inverter"
                            ? "#ff000020"
                            : tool.id === "solarPanel"
                            ? "#0000ff20"
                            : tool.id === "solarSaving"
                            ? "#00800020"
                            : "#ffa50020",
                      }}
                    >
                      <img
                        src={tool.icon}
                        className="h-[24px] w-[24px]"
                        alt={tool.label}
                        style={{
                          filter:
                            tool.id === "inverter"
                              ? "brightness(0) saturate(100%) invert(13%) sepia(94%) saturate(7151%) hue-rotate(360deg) brightness(91%) contrast(118%)"
                              : tool.id === "solarPanel"
                              ? "brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(224deg) brightness(89%) contrast(97%)"
                              : tool.id === "solarSaving"
                              ? "brightness(0) saturate(100%) invert(25%) sepia(100%) saturate(7500%) hue-rotate(120deg) brightness(101%) contrast(102%)"
                              : "brightness(0) saturate(100%) invert(50%) sepia(100%) saturate(7500%) hue-rotate(30deg) brightness(101%) contrast(102%)",
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="text-sm font-semibold mb-1"
                        style={{
                          color:
                            tool.id === "inverter"
                              ? "#ff0000"
                              : tool.id === "solarPanel"
                              ? "#0000ff"
                              : tool.id === "solarSaving"
                              ? "#008000"
                              : "#ffa500",
                        }}
                      >
                        {tool.label}
                      </h3>
                      <p className="text-[10px] text-gray-600">
                        {tool.id === "inverter" &&
                          "An inverter load calculator helps estimate the total power needed to run selected appliances. It guides you in choosing the right inverter and battery size for efficient backup."}
                        {tool.id === "solarPanel" &&
                          "A solar panel calculator estimates the number and size of solar panels needed based on your energy usage. It helps you design an efficient solar system for your homes, businesses, or off-grid setups."}
                        {tool.id === "solarSaving" &&
                          "A solar savings calculator estimates how much money you can save by switching to solar energy. It helps you understand long-term cost benefits based on an electricity bill, location, and system size."}
                        {tool.id === "loan" &&
                          "A loan calculator is a tool that helps you estimate your monthly payments, total interest, and repayment schedule based on the loan amount, interest rate, and term."}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile Bottom Navigation - Only show on tabs view */}
            <SideBar />
          </div>
        ) : (
          <div className="w-full">
            {/* Back Button */}
            <div className="h-[60px] text-white p-4 px-5 flex items-center justify-between">
              <button
                onClick={handleBackToTabs}
                className="text-black hover:text-gray-200 text-xl"
              >
                ←
              </button>
              <h2 className="text-md text-black flex-grow text-center">
                {selectedTool?.label}
              </h2>
            </div>

            {/* Tool Content */}
            <div className="p-4">{selectedTool?.component}</div>
          </div>
        )}
      </div>
    </>
  );
};

export default Tools;
