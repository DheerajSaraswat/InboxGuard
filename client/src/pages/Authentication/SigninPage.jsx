import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import signinImage from "../../assets/signin.jpg";
import { useNavigate } from "react-router-dom";
import { googleAuth, login } from "../../common/firebase";
import { toast } from "react-hot-toast";
import { registerUserWithGoogle } from "../../apiRequests/registerUserWithGoogle";
import { loginUser } from "../../apiRequests/loginUser";
import { useDispatch } from "react-redux";
import { sliceLogin } from "../../redux/slices/authSlice";
import Loader from "../../common/Loader";
import { initializeUserKeys } from "../../utils/crypto";

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

const SigninPage = ({ isDark }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = { email: "", password: "" };
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Email validation
    if (!email || !emailRegex.test(email)) {
      nextErrors.email = "Enter a valid email address.";
    }
    
    // Password validation
    if (!password) {
      nextErrors.password = "Password is required.";
    } else if (password.length < 8) {
      nextErrors.password = "Password must be at least 8 characters.";
    } else if (password.length > 128) {
      nextErrors.password = "Invalid password format.";
    }
    
    setErrors(nextErrors);
    if (nextErrors.email || nextErrors.password) return;

    try {
      setLoading(true);
      const {accessToken} = await login(email, password, rememberMe);
      const res = await loginUser()
      await initializeUserKeys(res.data.data.firebaseUid);
      dispatch(sliceLogin({user:res.data.data, token:accessToken}))
      toast.success("Signed in successfully!");
      navigate("/user/u0");
    } catch (err) {
      console.log(err);
      toast.error("Failed to sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const user = await googleAuth(rememberMe);
      const res = await registerUserWithGoogle(user);
      await initializeUserKeys(res.data.data.firebaseUid);
      dispatch(sliceLogin({user:res.data.data, token:user.accessToken}))
      toast.success("Signed in with Google successfully!");
      navigate("/user/u0");
    } catch (error) {
      // Error message is already handled in googleAuth function
      console.error("Google sign-in error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center px-2 transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <Loader/>
        </div>
      )}
      <div className={`w-full max-w-5xl flex flex-col md:flex-row rounded-2xl shadow-2xl overflow-hidden border ${isDark ? 'border-[#2E2E2E] bg-[#1A1A1A]' : 'border-[#bbb] bg-white'}`}>
        {/* Left column: Features */}
        <div className={`hidden md:flex items-center justify-center w-1/2 relative ${isDark ? 'bg-gradient-to-br from-[#0A0A0A] via-[#1A1A1A] to-[#111111]' : 'bg-gradient-to-br from-[#f3f4f6] via-[#fff] to-[#e5e7eb]'}`}>
          <img
            src={signinImage}
            alt="Signin Page"
            className={`object-cover w-full h-full transition-opacity duration-500 `}
          />
        </div>

        {/* Right column: Sign-in form */}
        <div className="w-full md:w-1/2 flex flex-col justify-center px-8 py-12">
          <Link
            to="/"
            className="mb-4 flex items-center text-[#E50914] hover:underline w-fit"
            aria-label="Go back to homepage"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span>Back to Home</span>
          </Link>
          <h2 className={`text-3xl font-bold mb-6 text-center ${isDark ? 'text-white' : 'text-[#111]'}`}>
            Sign In
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className={`block mb-2 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`} htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                className={`w-full px-4 py-3 rounded-lg border focus:outline-none focus:border-[#E50914] ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-[#b2b0b0ff]' : 'bg-white border-[#bbb] text-[#111]'}`}
                value={email}
                placeholder="Enter your email"
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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
                  className={`w-full px-4 py-3 rounded-lg border pr-12 focus:outline-none focus:ring-2 focus:ring-[#E50914] focus:border-[#E50914] transition-all ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-[#b2b0b0ff]' : 'bg-white border-[#bbb] text-[#111]'}`}
                  value={password}
                  placeholder="Enter your password"
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  aria-describedby={errors.password ? "password-error" : undefined}
                  aria-invalid={errors.password ? "true" : "false"}
                  required
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
            </div>
            <div className="flex items-center justify-between">
              <label className={`flex items-center ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}>
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                />
                Remember Me
              </label>
              <Link to="/reset-password" className="text-[#E50914]">
                Forgot Password?
              </Link>
            </div>
            <button
              type="submit"
              className="w-full bg-[#E50914] text-white py-3 rounded-lg hover:bg-red-700 transition cursor-pointer font-semibold text-lg"
            >
              Sign In
            </button>
          </form>
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <span className={`flex-grow border-t ${isDark ? 'border-[#2E2E2E]' : 'border-[#bbb]'}`} />
              <span className={`mx-4 ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}>or</span>
              <span className={`flex-grow border-t ${isDark ? 'border-[#2E2E2E]' : 'border-[#bbb]'}`} />
            </div>
            <button
              type="button"
              className={`w-full flex items-center justify-center gap-3 border hover:border-[#E50914] py-3 rounded-lg font-semibold text-lg transition-all mb-2 ${isDark ? 'bg-[#111111] border-[#2E2E2E] text-white' : 'bg-white border-[#bbb] text-[#111]'}`}
              onClick={handleGoogleAuth}
            >
              <GoogleIcon />
              Sign in with Google
            </button>
          </div>
          <div className="mt-2 text-center">
            <span className={isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}>Don't have an account?</span>
            <button
              onClick={() => navigate("/signup")}
              className="text-[#E50914] ml-2 hover:underline cursor-pointer"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;
