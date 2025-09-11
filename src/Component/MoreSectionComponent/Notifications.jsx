import React from "react";
import { ChevronLeft } from "lucide-react";

const Notifications = ({ onBack }) => {
  // Sample notification data
  const notifications = [
    {
      id: 1,
      message: "Get the best services on Troosolar, buy new solar products and build your required solar products.",
      timestamp: "01/01/20 - 04:22 AM",
      isUnread: true
    },
    {
      id: 2,
      message: "Get the best services on Troosolar, buy new solar products and build your required solar products.",
      timestamp: "01/01/20 - 04:22 AM",
      isUnread: true
    },
    {
      id: 3,
      message: "Get the best services on Troosolar, buy new solar products and build your required solar products.",
      timestamp: "01/01/25 - 04:52 AM",
      isUnread: true
    }
  ];

  return (
    <>
      {/* Desktop View */}
      <div className="hidden sm:block min-h-screen p-4 bg-gray-50">
        <div className="max-w-2xl mx-auto">
          <div className="relative flex items-center justify-center mb-6">
            <ChevronLeft className="absolute left-0 cursor-pointer" onClick={onBack} />
            <h2 className="text-lg font-semibold text-gray-800">Notifications</h2>
          </div>

          <div className="space-y-4">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white rounded-lg p-4 shadow-sm border">
                <div className="flex items-start gap-3">
                  {notification.isUnread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile View */}
      <div className="sm:hidden flex min-h-screen bg-gray-50 flex-col">
      

        {/* Main Content */}
        <div className="flex-1 px-4 py-4">
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-white rounded-lg p-4">
                <div className="flex items-start gap-3">
                  {notification.isUnread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  )}
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.timestamp}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default Notifications;

