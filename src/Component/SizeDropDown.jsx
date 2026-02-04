import React, { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, X } from "lucide-react";

// Size options from 1.2kW to 10kW
const SIZE_OPTIONS = [];
for (let i = 1.2; i <= 10; i += 0.5) {
  SIZE_OPTIONS.push({
    label: `${i}kW`,
    value: i,
  });
}

const SizeDropDown = ({ onFilter }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const desktopTriggerRef = useRef(null);
  const mobileTriggerRef = useRef(null);

  const toggleDropdown = useCallback(() => setIsOpen((prev) => !prev), []);

  const handleSelect = useCallback(
    (size) => {
      setSelectedSize(size);
      setIsOpen(false);
      onFilter?.(size);
    },
    [onFilter]
  );

  const handleClear = useCallback(() => {
    setSelectedSize(null);
    onFilter?.(null);
  }, [onFilter]);

  // Close dropdown on outside click (either trigger)
  useEffect(() => {
    const handleClickOutside = (e) => {
      const inDesktop = desktopTriggerRef.current?.contains(e.target);
      const inMobile = mobileTriggerRef.current?.contains(e.target);
      if (!inDesktop && !inMobile) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown when the scrollable main content scrolls (dropdown scrolls with page; closing avoids stale state)
  useEffect(() => {
    if (!isOpen) return;
    const scrollParent = desktopTriggerRef.current?.closest(".overflow-y-auto");
    if (!scrollParent) return;
    const handleScroll = () => setIsOpen(false);
    scrollParent.addEventListener("scroll", handleScroll, { passive: true });
    return () => scrollParent.removeEventListener("scroll", handleScroll);
  }, [isOpen]);

  const selectedLabel = selectedSize ? `${selectedSize}kW` : "Size";

  return (
    <>
      {/* Desktop View */}
      <div
        ref={desktopTriggerRef}
        className="relative sm:block hidden w-full max-w-[200px] cursor-pointer"
      >
        <div
          className="px-4 py-4 bg-white border border-black/50 rounded-2xl shadow-sm hover:border-black/70 transition-colors"
          onClick={toggleDropdown}
        >
          <div className="flex items-center justify-between w-full font-medium">
            <span
              className={`text-sm lg:text-lg ${
                selectedSize === null ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {selectedLabel}
            </span>
            <ChevronDown
              size={26}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && (
          <div
            className="absolute left-0 top-full z-[200] mt-1 w-[400px] bg-white border border-gray-200 rounded-md shadow-lg max-h-[400px] overflow-y-auto"
            role="dialog"
            aria-label="Size filter"
          >
            <div className="relative px-4 py-2 border-b border-gray-200">
              <p className="text-center text-gray-900 py-1 font-medium">Size</p>
              <X
                size={20}
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                aria-label="Close dropdown"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto">
              <button
                type="button"
                onClick={handleClear}
                className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                  selectedSize === null
                    ? "bg-blue-50 font-semibold text-gray-800"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                role="option"
                aria-selected={selectedSize === null}
              >
                <span>All Sizes</span>
                <span className="h-4 w-4 p-0 rounded-full flex items-center justify-center border border-[#273e8e]">
                  {selectedSize === null && (
                    <span
                      className="h-3 w-3 rounded-full bg-[#273e8e]"
                      aria-hidden="true"
                    />
                  )}
                </span>
              </button>

              {SIZE_OPTIONS.map((option) => {
                const isSelected = selectedSize === option.value;
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => handleSelect(option.value)}
                    className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                      isSelected
                        ? "bg-blue-50 font-semibold text-gray-800"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <span>{option.label}</span>
                    <span className="h-4 w-4 p-0 rounded-full flex items-center justify-center border border-[#273e8e]">
                      {isSelected && (
                        <span
                          className="h-3 w-3 rounded-full bg-[#273e8e]"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-2 gap-3 py-4 px-4 border-t">
              <button
                type="button"
                onClick={handleClear}
                className="border text-sm border-[#273e8e] py-3.5 rounded-full text-[#273e8e] hover:bg-[#273e8e]/10 transition duration-150"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="text-sm rounded-full py-3.5 bg-[#273e8e] text-white hover:bg-[#1f2f6e] transition duration-150"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mobile View */}
      <div
        ref={mobileTriggerRef}
        className="relative sm:hidden block w-full max-w-[150px] cursor-pointer"
      >
        <div
          className="sm:px-5 px-2 sm:py-5 py-3 bg-white border border-black/50 rounded-tr-2xl border-l-0 rounded-br-2xl sm:rounded-2xl shadow-sm hover:border-black/70 transition-colors"
          onClick={toggleDropdown}
        >
          <div className="flex items-center justify-between w-full font-medium">
            <span
              className={`text-lg ${
                selectedSize === null ? "text-gray-500" : "text-gray-900"
              }`}
            >
              {selectedLabel}
            </span>
            <ChevronDown
              size={26}
              className={`transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </div>

        {isOpen && (
          <>
            {/* Optional Backdrop */}
            <div
              className="fixed inset-0 bg-black/30 z-40"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Centered Dropdown */}
            <div className="fixed z-50 top-[70%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[400px] bg-white border border-gray-200 rounded-md shadow-lg max-h-[400px] overflow-y-auto">
              <div className="relative px-4 py-2 border-b border-gray-200">
                <p className="text-center text-gray-900 py-1 font-medium">Size</p>
                <X
                  size={20}
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
                  aria-label="Close dropdown"
                />
              </div>

              <div className="max-h-[300px] overflow-y-auto">
                <button
                  type="button"
                  onClick={handleClear}
                  className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                    selectedSize === null
                      ? "bg-blue-50 font-semibold text-gray-800"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  role="option"
                  aria-selected={selectedSize === null}
                >
                  <span>All Sizes</span>
                  <span className="h-4 w-4 p-0 rounded-full flex items-center justify-center border border-[#273e8e]">
                    {selectedSize === null && (
                      <span
                        className="h-3 w-3 rounded-full bg-[#273e8e]"
                        aria-hidden="true"
                      />
                    )}
                  </span>
                </button>

                {SIZE_OPTIONS.map((option) => {
                  const isSelected = selectedSize === option.value;
                  return (
                    <button
                      type="button"
                      key={option.value}
                      onClick={() => handleSelect(option.value)}
                      className={`flex items-center justify-between w-full px-8 py-4 text-sm transition-colors ${
                        isSelected
                          ? "bg-blue-50 font-semibold text-gray-800"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <span>{option.label}</span>
                      <span className="h-4 w-4 p-0 rounded-full flex items-center justify-center border border-[#273e8e]">
                        {isSelected && (
                          <span
                            className="h-3 w-3 rounded-full bg-[#273e8e]"
                            aria-hidden="true"
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-3 py-4 px-4 border-t">
                <button
                  type="button"
                  onClick={handleClear}
                  className="border text-sm border-[#273e8e] py-3.5 rounded-full text-[#273e8e] hover:bg-[#273e8e]/10 transition duration-150"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="text-sm rounded-full py-3.5 bg-[#273e8e] text-white hover:bg-[#1f2f6e] transition duration-150"
                >
                  Save
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default SizeDropDown;

