import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import signinImage from "../../assets/signup.jpg";
import { register } from "../../common/firebase";
import { useNavigate } from "react-router-dom";
import toast,{ Toaster } from "react-hot-toast";
import { registerUser } from "../../apiRequests/registerUser";

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

const SignupPage = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !firstName || !lastName || !password || !confirmPassword) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("Password and Confirm Password must match.");
      return;
    }

    try {
      const user = await register(email, password);
      const res = await registerUser(user);
      // console.log(res);
      toast.success("Signed up successfully!");
      navigate("/signin");
    } catch (error) {
      toast.error("Failed to sign up. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-2 py-10">
      <Toaster />
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border border-[#2E2E2E] bg-[#1A1A1A]">
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
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Sign Up
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#BBBBBB] mb-2" htmlFor="email">
                Work Email
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E50914]"
                value={email}
                placeholder="name@work.com"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="flex gap-4">
              <div className="w-1/2">
                <label
                  className="block text-[#BBBBBB] mb-2"
                  htmlFor="firstName"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E50914]"
                  value={firstName}
                  placeholder="First Name"
                  onChange={(e) => setFirstName(e.target.value)}
                  autoComplete="given-name"
                />
              </div>
              <div className="w-1/2">
                <label className="block text-[#BBBBBB] mb-2" htmlFor="lastName">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E50914]"
                  value={lastName}
                  placeholder="Last Name"
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                />
              </div>
            </div>
            <div className="relative">
              <label className="block text-[#BBBBBB] mb-2" htmlFor="password">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E50914] pr-12"
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute top-10 right-4 p-1 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            <div className="relative">
              <label
                className="block text-[#BBBBBB] mb-2"
                htmlFor="confirmPassword"
              >
                Confirm Password
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E50914] pr-12"
                value={confirmPassword}
                placeholder="Confirm Password"
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                className="absolute top-10 right-4 p-1 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                aria-label={
                  showConfirmPassword ? "Hide password" : "Show password"
                }
              >
                <EyeIcon visible={showConfirmPassword} />
              </button>
            </div>
            <button
              type="submit"
              className="w-full bg-[#E50914] hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg transition-all"
            >
              Continue with Email
            </button>
          </form>
          <div className="mt-6 text-center text-[#BBBBBB] text-xs">
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
            <span className="text-[#BBBBBB]">Already have an account?</span>{" "}
            <a href="/signin" className="text-[#E50914] ml-1 hover:underline">
              Sign In
            </a>
          </div>
        </div>
        {/* Right column: Image area */}
        <div className="hidden md:flex items-center justify-center w-1/2 bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#111111] relative">
          {!imageLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#181818]">
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E50914]" />
            </div>
          )}
          <img
            src={signinImage}
            alt="Signup Visual"
            className={`object-cover object-center h-full rounded-r-xl shadow-lg transition-opacity duration-500 ${
              imageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setImageLoaded(true)}
          />
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
