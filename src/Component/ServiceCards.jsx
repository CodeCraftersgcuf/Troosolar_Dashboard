import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, ShoppingBag, Sun } from 'lucide-react';

const ServiceCards = ({ hasActiveLoan = false }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
            {/* Buy Now Card */}
            <Link to="/buy-now" className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden">
                <div className="bg-blue-50 p-4 rounded-full mb-4 group-hover:bg-[#273e8e] transition-colors duration-300">
                    <CreditCard size={32} className="text-[#273e8e] group-hover:text-white transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-800">Buy Now</h2>
                <p className="text-gray-500 text-sm mb-4 flex-grow">
                    Purchase your solar system outright. Best prices & ownership.
                </p>
                <div className="flex items-center text-[#273e8e] font-semibold text-sm group-hover:underline">
                    Get Started <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* BNPL Card */}
            <Link to={hasActiveLoan ? "/bnpl-loans" : "/bnpl"} className="group relative bg-gradient-to-br from-[#273e8e] to-[#1a2b6b] text-white rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden ring-1 ring-blue-900/10">
                <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                    POPULAR
                </div>
                <div className="bg-white/10 p-4 rounded-full mb-4 group-hover:bg-white/20 transition-colors duration-300">
                    <Sun size={32} className="text-yellow-400" />
                </div>
                <h2 className="text-xl font-bold mb-2">Buy Now, Pay Later</h2>
                <p className="text-blue-100 text-sm mb-4 flex-grow">
                    {hasActiveLoan 
                        ? "Manage your loan repayments and view payment schedule."
                        : "Flexible payment plans. Start with a small deposit."
                    }
                </p>
                <div className="flex items-center text-yellow-400 font-semibold text-sm group-hover:text-white transition-colors">
                    {hasActiveLoan ? "Repay Loan" : "Apply Now"} <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>

            {/* Shop Solar Card */}
            <Link to="/shop" className="group relative bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col items-center text-center overflow-hidden">
                <div className="bg-purple-50 p-4 rounded-full mb-4 group-hover:bg-purple-600 transition-colors duration-300">
                    <ShoppingBag size={32} className="text-purple-600 group-hover:text-white transition-colors duration-300" />
                </div>
                <h2 className="text-xl font-bold mb-2 text-gray-800">Solar Shop</h2>
                <p className="text-gray-500 text-sm mb-4 flex-grow">
                    Browse premium inverters, batteries, and panels.
                </p>
                <div className="flex items-center text-purple-600 font-semibold text-sm group-hover:underline">
                    Visit Shop <ArrowRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </div>
    );
};

export default ServiceCards;
