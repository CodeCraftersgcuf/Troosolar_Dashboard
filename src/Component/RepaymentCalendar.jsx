import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, DollarSign, CheckCircle, AlertCircle, Clock } from 'lucide-react';

const RepaymentCalendar = ({ installments = [], onInstallmentClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Get first and last day of current month
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  const startingDayOfWeek = firstDayOfMonth.getDay();

  // Group installments by date
  const installmentsByDate = useMemo(() => {
    const map = new Map();
    installments.forEach(installment => {
      if (installment.due_date) {
        const date = new Date(installment.due_date);
        const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
        if (!map.has(dateKey)) {
          map.set(dateKey, []);
        }
        map.get(dateKey).push(installment);
      }
    });
    return map;
  }, [installments]);

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get installments for a specific date
  const getInstallmentsForDate = (day) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return installmentsByDate.get(dateKey) || [];
  };

  // Check if date has installments
  const hasInstallments = (day) => {
    return getInstallmentsForDate(day).length > 0;
  };

  // Get status for date (paid, pending, overdue)
  const getDateStatus = (day) => {
    const dateInstallments = getInstallmentsForDate(day);
    if (dateInstallments.length === 0) return null;

    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    const allPaid = dateInstallments.every(inst => inst.status === 'paid');
    const hasOverdue = date < today && !allPaid;
    const hasPending = dateInstallments.some(inst => inst.status !== 'paid');

    if (allPaid) return 'paid';
    if (hasOverdue) return 'overdue';
    if (hasPending) return 'pending';
    return null;
  };

  // Get total amount for date
  const getTotalAmountForDate = (day) => {
    const dateInstallments = getInstallmentsForDate(day);
    return dateInstallments.reduce((sum, inst) => {
      if (inst.status !== 'paid') {
        return sum + parseFloat(inst.amount || 0);
      }
      return sum;
    }, 0);
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return '₦0';
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Check if date is today
  const isToday = (day) => {
    const today = new Date();
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  // Month and year display
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const monthYear = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <CalendarIcon className="text-[#273e8e]" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">Repayment Calendar</h3>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm text-[#273e8e] hover:bg-blue-50 rounded-lg transition-colors"
          >
            Today
          </button>
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <span className="px-4 py-1.5 text-sm font-semibold text-gray-800 min-w-[150px] text-center">
            {monthYear}
          </span>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Day Headers */}
        {dayNames.map((day) => (
          <div
            key={day}
            className="text-center text-xs font-semibold text-gray-500 py-2"
          >
            {day}
          </div>
        ))}

        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }).map((_, index) => (
          <div key={`empty-${index}`} className="h-24" />
        ))}

        {/* Calendar Days */}
        {Array.from({ length: daysInMonth }).map((_, index) => {
          const day = index + 1;
          const dateInstallments = getInstallmentsForDate(day);
          const status = getDateStatus(day);
          const totalAmount = getTotalAmountForDate(day);
          const hasInst = hasInstallments(day);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day}
              className={`min-h-24 border rounded-lg p-2 transition-all ${
                isTodayDate
                  ? 'border-[#273e8e] border-2 bg-blue-50'
                  : hasInst
                  ? status === 'overdue'
                    ? 'border-red-300 bg-red-50 hover:bg-red-100 cursor-pointer'
                    : status === 'paid'
                    ? 'border-green-300 bg-green-50'
                    : 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100 cursor-pointer'
                  : 'border-gray-200 hover:bg-gray-50'
              }`}
              onClick={() => {
                if (hasInst && onInstallmentClick && dateInstallments.length > 0) {
                  // If multiple installments, show the first unpaid one, or first one if all paid
                  const unpaidInst = dateInstallments.find(inst => inst.status !== 'paid');
                  onInstallmentClick(unpaidInst || dateInstallments[0]);
                }
              }}
            >
              {/* Day Number */}
              <div className={`text-sm font-semibold mb-1 ${
                isTodayDate ? 'text-[#273e8e]' : 'text-gray-700'
              }`}>
                {day}
              </div>

              {/* Installment Info */}
              {hasInst && (
                <div className="space-y-1">
                  {dateInstallments.map((installment, idx) => {
                    const isPaid = installment.status === 'paid';
                    const isOverdue = new Date(installment.due_date) < new Date() && !isPaid;
                    
                    return (
                      <div
                        key={installment.id || idx}
                        className={`text-xs p-1 rounded ${
                          isPaid
                            ? 'bg-green-100 text-green-700'
                            : isOverdue
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                        title={`Installment #${installment.installment_number || idx + 1}: ${formatCurrency(installment.amount)} - ${installment.status}`}
                      >
                        <div className="flex items-center gap-1">
                          {isPaid ? (
                            <CheckCircle size={10} className="text-green-600" />
                          ) : isOverdue ? (
                            <AlertCircle size={10} className="text-red-600" />
                          ) : (
                            <Clock size={10} className="text-yellow-600" />
                          )}
                          <span className="font-semibold truncate">
                            {formatCurrency(installment.amount)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Show total if multiple installments */}
                  {dateInstallments.length > 1 && totalAmount > 0 && (
                    <div className="text-xs font-bold text-gray-700 pt-1 border-t border-gray-300">
                      Total: {formatCurrency(totalAmount)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-[#273e8e] bg-blue-50"></div>
            <span className="text-xs text-gray-600">Today</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-green-300 bg-green-50"></div>
            <span className="text-xs text-gray-600">Paid</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-yellow-300 bg-yellow-50"></div>
            <span className="text-xs text-gray-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-red-300 bg-red-50"></div>
            <span className="text-xs text-gray-600">Overdue</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} className="text-gray-400" />
            <span className="text-xs text-gray-600">Click date to pay</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepaymentCalendar;

