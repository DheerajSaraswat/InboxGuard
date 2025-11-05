import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import signinImage from "../../assets/signup.jpg";
import { register } from "../../common/firebase";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../../apiRequests/registerUser";
import Loader from "../../common/Loader";

const EyeIcon = ({ visible, size = 24, color = "#b2b0b0ff" }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="feather feather-eye"
  >
    {visible ? (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    ) : (
      <>
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </>
    )}
  </svg>
);

const SignupPage = ({ isDark }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [errors, setErrors] = useState({ email: "", password: "", confirm: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = { email: "", password: "", confirm: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Email validation
    if (!emailRegex.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    
    // Password validation - industry standards
    if (!password || password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters long.";
    } else if (password.length > 128) {
      nextErrors.password = "Password must be less than 128 characters.";
    }
    
    // Confirm password validation
    if (!confirmPassword) {
      nextErrors.confirm = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirm = "Passwords do not match.";
    }
    
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password || nextErrors.confirm) return;

    try {
      setLoading(true);
      const user = await register(email, password);
      const displayName = firstName + " " + lastName
      await registerUser(user, displayName);      
      navigate("/verify-email");
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-2 py-10 transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <Loader/>
        </div>
      )}
      <div className={`w-full max-w-5xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'border-[#2E2E2E] bg-[#1A1A1A]' : 'border-[#bbb] bg-white'}`}>
        {/* Left column: Signup form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center p-8">
          <Link
            to="/"
            className="mb-4 flex items-center text-[#E50914] hover:underline w-fit"
            aria-label="Go back to homepage"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Home</span>
          </Link>
          <h2 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-[#111]'}`}>
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block mb-2 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`} htmlFor="email">
                Work Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[#E50914] ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-white' : 'bg-white border-[#bbb] text-[#111]'}`}
                value={email}
                placeholder="name@work.com"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label
                  className={`block mb-2 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[#E50914] ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-white' : 'bg-white border-[#bbb] text-[#111]'}`}
                  value={firstName}
                  placeholder="First Name"
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="w-1/2">
                <label className={`block mb-2 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`} htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[#E50914] ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-white' : 'bg-white border-[#bbb] text-[#111]'}`}
                  value={lastName}
                  placeholder="Last Name"
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="relative">
              <label className={`block mb-2 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`} htmlFor="password">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  className={`w-full px-4 py-3 rounded-lg border pr-12 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-white' : 'bg-white border-[#bbb] text-[#111]'}`}
                  value={password}
                  placeholder="Create a strong password"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-describedby={errors.password ? "password-error" : "password-requirements"}
                  aria-invalid={errors.password ? "true" : "false"}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 focus:outline-none focus:ring-2 focus:ring-[#E50914] rounded"
                  tabIndex={0}
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.password}
                </p>
              )}
              {!errors.password && password && (
                <div id="password-requirements" className="text-xs mt-1 space-y-1">
                  <p className={`${isDark ? 'text-[#888]' : 'text-gray-600'}`}>
                    Password must be at least 8 characters long
                  </p>
                </div>
              )}
            </div>
            <div className="relative">
              <label
                className={`block mb-2 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  className={`w-full px-4 py-3 rounded-lg border pr-12 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-white' : 'bg-white border-[#bbb] text-[#111]'}`}
                  value={confirmPassword}
                  placeholder="Re-enter your password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  aria-describedby={errors.confirm ? "confirm-error" : undefined}
                  aria-invalid={errors.confirm ? "true" : "false"}
                  required
                />
                <button
                  type="button"
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 p-1 focus:outline-none focus:ring-2 focus:ring-[#E50914] rounded"
                  tabIndex={0}
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                  aria-pressed={showConfirmPassword}
                >
                  <EyeIcon visible={showConfirmPassword} />
                </button>
              </div>
              {errors.confirm && (
                <p id="confirm-error" className="text-red-500 text-sm mt-1" role="alert">
                  {errors.confirm}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-[#E50914] hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg transition-all cursor-pointer"
            >
              Continue with Email
            </button>
          </form>
          <div className={`mt-6 text-center text-xs ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}>
            By signing up, you agree to our{" "}
            <a href="#" className="text-[#E50914] hover:underline">
              Terms of Use
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#E50914] hover:underline">
              Privacy Policy
            </a>
            .
          </div>
          <div className="mt-2 text-center">
            <span className={isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}>Already have an account?</span>{" "}
            <a href="/signin" className="text-[#E50914] ml-1 hover:underline">
              Sign In
            </a>
          </div>
        </div>
        {/* Right column: Image area */}
        <div className={`hidden md:flex items-center justify-center w-1/2 relative ${isDark ? 'bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#111111]' : 'bg-gradient-to-br from-[#f3f4f6] via-[#fff] to-[#e5e7eb]'}`}>
          <img
            src={signinImage}
            alt="Signup Visual"
            className={`object-cover object-center h-full rounded-r-xl shadow-lg transition-opacity duration-500 `}
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
