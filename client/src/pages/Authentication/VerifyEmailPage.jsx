import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

const VerifyEmailPage = ({ isDark }) => {
  const navigate = useNavigate();
  return (
    <div className={`min-h-screen flex flex-col items-center justify-center px-4 transition-colors duration-300 ${isDark ? 'bg-[#0A0A0A]' : 'bg-white'}`}>
      <div className={`rounded-2xl shadow-2xl p-10 max-w-md w-full border flex flex-col items-center ${isDark ? 'bg-[#1A1A1A] border-[#2E2E2E]' : 'bg-white border-[#bbb]'}`}>
        <MailCheck className="w-16 h-16 text-[#E50914] mb-6" />
        <h2 className={`text-3xl font-bold mb-4 text-center ${isDark ? 'text-white' : 'text-[#111]'}`}>Verify Your Email</h2>
        <p className={`text-lg mb-8 text-center ${isDark ? 'text-[#BBBBBB]' : 'text-[#444]'}`}>
          We've sent a verification link to your email address.<br />
          Please check your spam folder and click the link to activate your account.
        </p>
        <button
          className="bg-[#E50914] cursor-pointer hover:bg-red-700 text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all w-full"
          onClick={() => navigate("/signin")}
        >
          Go to Sign In
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
