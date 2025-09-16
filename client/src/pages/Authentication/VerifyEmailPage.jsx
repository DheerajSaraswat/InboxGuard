import { useNavigate } from "react-router-dom";
import { MailCheck } from "lucide-react";

const VerifyEmailPage = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4">
      <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl p-10 max-w-md w-full border border-[#2E2E2E] flex flex-col items-center">
        <MailCheck className="w-16 h-16 text-[#E50914] mb-6" />
        <h2 className="text-3xl font-bold text-white mb-4 text-center">Verify Your Email</h2>
        <p className="text-lg text-[#BBBBBB] mb-8 text-center">
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
