import React, { useState } from "react";
import signinImage from '../assets/signup.jpg';
import { useNavigate } from "react-router-dom";

const GoogleIcon = () => (
   <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
  >
    <path
      fill="#4285F4"
      d="M23.49 12.27c0-.78-.07-1.53-.2-2.27H12v4.3h6.46c-.28 1.46-1.13 2.7-2.39 3.54v2.94h3.86c2.26-2.09 3.56-5.17 3.56-8.51z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.07 7.93-2.91l-3.86-2.94c-1.07.72-2.44 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.95H1.29v3.1C3.27 21.44 7.31 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.27 14.3c-.24-.72-.38-1.49-.38-2.3s.14-1.58.38-2.3V6.6H1.29A11.99 11.99 0 0 0 0 12c0 1.91.46 3.71 1.29 5.4l3.98-3.1z"
    />
    <path
      fill="#EA4335"
      d="M12 4.77c1.76 0 3.34.61 4.58 1.82l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.27 2.56 1.29 6.6l3.98 3.1C6.22 6.88 8.87 4.77 12 4.77z"
    />
  </svg>
);
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

const SigninPage = () => {
  
    const Navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    alert("Signed in!");
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-2">
      <div className="w-full max-w-5xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border border-[#2E2E2E] bg-[#1A1A1A]">

        {/* Left column: Features */}
            <div className="hidden md:flex items-center justify-center bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#111111] w-1/2 relative">
              {!imageLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#181818]">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#E50914]" />
                </div>
              )}
              <img
                src={signinImage}
                alt="Signin Page"
                className={`object-cover w-full h-full transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                onLoad={() => setImageLoaded(true)}
              />
        </div>

        {/* Right column: Sign-in form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Sign In</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[#BBBBBB] mb-2" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-[#b2b0b0ff] focus:outline-none focus:border-[#E50914]"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="relative ">
              <label className="block text-[#BBBBBB] mb-2" htmlFor="password">Password</label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-[#b2b0b0ff] focus:outline-none focus:border-[#E50914] pr-12 "
                value={password}
                placeholder="Enter your password"
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="absolute top-10 right-5 p-1 focus:outline-none"
                tabIndex={-1}
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <EyeIcon visible={showPassword} />
              </button>
            </div>
            {error && <div className="text-[#E50914] text-sm text-center">{error}</div>}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-[#BBBBBB] text-sm">
                <input type="checkbox" className="mr-2 accent-[#E50914]" /> Remember me
              </label>
              <a href="#" className="text-[#E50914] text-sm hover:underline">Forgot your password?</a>
            </div>
            <button
              type="submit"
              className="w-full bg-[#E50914] hover:bg-red-800 text-white py-3 rounded-lg font-semibold text-lg transition-all"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <span className="flex-grow border-t border-[#2E2E2E]" />
              <span className="mx-4 text-[#BBBBBB]">or</span>
              <span className="flex-grow border-t border-[#2E2E2E]" />
            </div>
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 bg-[#111111] border border-[#2E2E2E] hover:border-[#E50914] text-white py-3 rounded-lg font-semibold text-lg transition-all mb-2"
              onClick={() => alert('Google login coming soon!')}
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </div>
          <div className="mt-2 text-center">
            <span className="text-[#BBBBBB]">Don't have an account?</span>
            <button onClick={()=>Navigate('/signup')} className="text-[#E50914] ml-2 hover:underline">Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
