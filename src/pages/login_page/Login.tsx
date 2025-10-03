import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { LoginComponent } from "../../components/login/LoginComponent";
import ProcurementLogo from "../../assets/procurement_logo/procurement-logo.png";

interface LoginProps {
  setUserLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
}

export const Login: React.FC<LoginProps> = ({ setUserLoggedIn }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const isTokenExist = Cookies.get("token");
    if (isTokenExist) {
      // navigate("/");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <div className="flex w-full mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Right Side - Feature Showcase */}
         <div className="hidden lg:flex lg:w-3/5 bg-gradient-to-br from-[#1365AA] via-[#1E79B5] to-[#2A8CCB] p-8 flex-col justify-center relative overflow-hidden m-5 border-r-4 border-slate-200 rounded-2xl">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full blur-2xl"></div>
            <div className="absolute bottom-40 right-20 w-48 h-48 bg-white rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white rounded-full blur-3xl opacity-5"></div>
          </div>

          <div className="relative z-10 text-white space-y-8">
            {/* Main Heading */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-4 leading-tight">
                Streamline Your
                <br />
                <span className="text-blue-200">Procurement Process</span>
              </h2>
              <p className="text-blue-100 text-md max-w-lg mx-auto">
                Manage tenders, track suppliers, and optimize your procurement workflow with our comprehensive platform.
              </p>
            </div>

            {/* Feature Cards */}
            <div className="grid grid-cols-1 gap-4 mb-8">
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-200 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Real-time Analytics</h3>
                    <p className="text-blue-100 text-sm">Track procurement metrics and performance</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-200 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Supplier Management</h3>
                    <p className="text-blue-100 text-sm">Centralized vendor database and evaluation</p>
                  </div>
                </div>
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-xl p-6 border border-white border-opacity-20 hover:bg-opacity-20 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-200 bg-opacity-30 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">Automated Workflows</h3>
                    <p className="text-blue-100 text-sm">Streamline approval processes and notifications</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Call to Action */}
            <div className="text-center">
              <p className="text-blue-100 text-sm">
                Join thousands of organizations optimizing their procurement process
              </p>
            </div>
          </div>
        </div>
         {/* Left Side - Login Form */}
        <div className="w-full lg:w-3/5 flex flex-col bg-white">
          {/* Logo */}
          <div className="flex items-center" style={{ padding: "30px" }}>
            <img
              className="h-8 w-auto mr-3"
              src={ProcurementLogo}
              alt="TenderFlow Logo"
            />
            <span className="text-xl font-bold text-gray-900">Procure</span>
          </div>
          <div className="p-8 lg:px-16 lg:py-10">
            <div className="w-full max-w-md mx-auto">
              {/* Welcome Back Header */}
              <div className="mb-8 text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-wide hover:scale-105 transition-transform duration-300 ease-in-out">
                  Welcome Back
                </h1>
                <p className="text-gray-600 text-base hover:text-[#191970] transition-colors duration-300">
                  Enter your email and password to access your account.
                </p>
              </div>

              {/* Login Form */}
              <LoginComponent setUserLoggedIn={setUserLoggedIn} />

              {/* Footer */}
              <div className="mt-auto pt-8">
                <p className="text-xs text-gray-400 text-center">
                  Copyright © 2025. TenderFlow Enterprises LTD.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
