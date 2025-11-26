import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CreditCard, ShoppingBag, Sun } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-[#1a2b6b] to-[#273e8e] flex items-center justify-center p-4 font-sans text-white">
      <div className="max-w-6xl w-full">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in-down">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">
            TrooSolar
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 font-light max-w-2xl mx-auto">
            Powering your future with sustainable energy solutions. Choose your path to energy independence.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Buy Now Card */}
          <Link to="/buy-now" className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-blue-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
              <CreditCard size={48} className="text-blue-300" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Buy Now</h2>
            <p className="text-blue-100 mb-8 flex-grow">
              Purchase your solar system outright. Get the best prices and immediate ownership.
            </p>
            <div className="flex items-center text-blue-300 font-semibold group-hover:text-white transition-colors">
              Get Started <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* BNPL Card */}
          <Link to="/bnpl" className="group relative bg-gradient-to-br from-[#273e8e] to-[#1a2b6b] border border-blue-400/30 rounded-3xl p-8 hover:shadow-[0_0_40px_rgba(39,62,142,0.6)] transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 z-10 flex flex-col items-center text-center overflow-hidden ring-1 ring-white/20">
            <div className="absolute top-0 right-0 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            <div className="bg-white/10 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
              <Sun size={48} className="text-yellow-400" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Buy Now, Pay Later</h2>
            <p className="text-blue-100 mb-8 flex-grow">
              Flexible payment plans tailored to your needs. Start your solar journey with a small deposit.
            </p>
            <div className="flex items-center text-yellow-400 font-semibold group-hover:text-white transition-colors">
              Apply Now <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Shop Solar Card */}
          <Link to="/shop" className="group relative bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 hover:bg-white/20 transition-all duration-500 transform hover:-translate-y-2 hover:shadow-2xl flex flex-col items-center text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-purple-500/20 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform duration-500">
              <ShoppingBag size={48} className="text-purple-300" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Shop Solar Products</h2>
            <p className="text-blue-100 mb-8 flex-grow">
              Browse our catalog of premium inverters, batteries, and solar panels.
            </p>
            <div className="flex items-center text-purple-300 font-semibold group-hover:text-white transition-colors">
              Visit Shop <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>

        {/* Footer Note */}
        <div className="text-center mt-16 text-blue-200/60 text-sm">
          © {new Date().getFullYear()} TrooSolar. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
