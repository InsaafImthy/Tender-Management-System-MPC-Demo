import React, { useState } from "react";
import { userLoginAsync } from "../../services/userService";
import { useNavigate } from "react-router-dom";
import { notification } from "antd";
import { Loader2Icon } from "lucide-react";
import type { ILogin } from "../../types/Types";
import Cookies from "js-cookie";
import { parseJwt } from "../../utils/common";

// Define props type
interface LoginComponentProps {
  setUserLoggedIn:React.Dispatch<React.SetStateAction<boolean>>;
}

export const LoginComponent: React.FC<LoginComponentProps> = ({setUserLoggedIn}) => {
  const navigate = useNavigate();
  const [loginData, setLoginData] = useState<ILogin>({
    username: "",
    password: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof ILogin, value: string) => {
    setLoginData((prevData) => ({ ...prevData, [field]: value }));
  };

  async function userLogin(): Promise<void> {
    setIsLoading(true);
    try {
      const token = await userLoginAsync({
        username: loginData.username,
        password: loginData.password,
      });

      // Save token to localStorage
      // localStorage.setItem("auth_token", token);

      Cookies.set("token", token as string);
      const decoded_data = parseJwt(token as string);
      Cookies.set("userId", decoded_data["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"]);
      Cookies.set("role", decoded_data["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      Cookies.set("name", decoded_data["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"]);
      Cookies.set("tenantId", decoded_data["tenantId"]);
      Cookies.set("companyId", decoded_data["companyId"]);
      Cookies.set("branchId", decoded_data["branchId"]);
      Cookies.set("departmentId", decoded_data["departmentId"]);
      Cookies.set("exp", decoded_data["exp"]);

      notification.success({
        message: "Login successful",
        description: "You have been logged in successfully.",
      });     

      // Redirect to dashboard or home
      setUserLoggedIn(true);
      navigate("/");
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : "Login failed. Please try again.";
      notification.error({
        message: "Login error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        userLogin();
      }}
      className="space-y-6"
    >
      {/* Username Field */}
      <div className="space-y-2">
        <label htmlFor="login-username" className="block text-sm font-semibold text-gray-700 mb-2">
          Username or Email
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <input
            id="login-username"
            type="text"
            value={loginData.username}
            onChange={(e) => handleChange("username", e.target.value.trim())}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter your username or email"
            required
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <label htmlFor="login-password" className="block text-sm font-semibold text-gray-700 mb-2">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <input
            id="login-password"
            type="password"
            value={loginData.password}
            onChange={(e) => handleChange("password", e.target.value.trim())}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
            placeholder="Enter your password"
            required
          />
        </div>
      </div>

      {/* Remember Me & Forgot Password */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="remember-me" className="ml-2 text-sm text-gray-600">
            Remember me
          </label>
        </div>
        <button
          type="button"
          onClick={() => navigate('/forgot-password')}
          className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          Forgot password?
        </button>
      </div>

      {/* Login Button */}
      <button
        id="login-btn"
        type="submit"
        disabled={isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:transform-none disabled:shadow-lg"
      >
        {isLoading ? (
          <>
            <Loader2Icon className="animate-spin w-5 h-5 mr-2" />
            Signing in...
          </>
        ) : (
          <>
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In to Procure
          </>
        )}
      </button>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Secure Login:</span> Your connection is encrypted and secure.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};
