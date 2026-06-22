import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { LoginComponent } from "../../components/login/LoginComponent";
import EnergyTransitionBg from "../../assets/login/ibvogt.png";
import procurementLogo from "../../assets/procurement_logo/Muscat-Pharmacy-logo.png";

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
    <div className="w-screen h-screen bg-bgBlue flex items-center justify-center p-0">
      <div className="flex w-full h-full bg-white overflow-hidden">
        {/* Left Side - Feature Showcase */}
        <div
          className="hidden lg:flex lg:w-2/5 relative overflow-hidden"
          style={{
            backgroundImage: `url(${EnergyTransitionBg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            margin: "16px",
            borderRadius: "14px",
          }}
        >
          {/* Dark gradient overlay */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.7) 100%)",
            }}
          />

          {/* Text content */}
          <div className="absolute bottom-0 left-0 right-0 p-12 text-white z-10">
            <h1 className="text-4xl font-bold mb-6 leading-tight whitespace-nowrap">
              Pharmacy <span className="text-violet-200">tendering</span>
            </h1>
            <p className="text-sm leading-relaxed opacity-90 text-justify">
              Manage medicine, medical supply, and distribution tenders with
              clear supplier evaluations, compliant approvals, and reliable
              delivery tracking for pharmacy procurement teams.
            </p>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-3/5 flex flex-col bg-white p-8 mt-8">
          {/* Logo */}
          <div className="p-8">
            <img src={procurementLogo} alt="IB Vogt Logo" className="w-32 h-auto" />
          </div>

          {/* Main Content */}
          <div className="flex-1 flex items-start justify-flex-start px-8 lg:px-16">
            <div className="w-full max-w-md">
              {/* Welcome Back Header */}
              <div className="mb-8 text-start">
                <h1 className="text-3xl font-bold text-slate-950 mb-3">
                  Sign in
                </h1>
                <p className="text-slate-600 text-base">
                  Please login to continue to your account.
                </p>
              </div>

              {/* Login Form */}
              <LoginComponent setUserLoggedIn={setUserLoggedIn} />
            </div>
          </div>        
        </div>
      </div>
    </div>
  );
};
