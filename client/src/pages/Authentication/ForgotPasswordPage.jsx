import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../common/firebase";

function ForgotPasswordPage() {

    const [email, setEmail] = useState("");
    const handleResetPassword = async(e)=>{
        e.preventDefault();
        if(!email){
            alert("Provide email");
            return;
        }
        const response = await resetPassword(email);
        alert("If the email is registered, a reset link has been sent.");
    }

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex flex-col items-center justify-center px-4 py-20">
      <div className="w-full max-w-md bg-[#1A1A1A] rounded-2xl shadow-2xl border border-[#2E2E2E] p-8">
        <h2 className="text-3xl font-bold text-white text-center mb-6">Forgot Password</h2>
        <p className="text-[#BBBBBB] mb-8 text-center">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        <form className="space-y-6" onSubmit={handleResetPassword}>
          <div>
            <label className="block text-[#BBBBBB] mb-2" htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-3 rounded-lg bg-[#111111] border border-[#2E2E2E] text-white focus:outline-none focus:border-[#E50914]"
              value={email}
              placeholder="Enter your email"
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#E50914] hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg transition-all"
          >
            Send Reset Link
          </button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/signin" className="text-[#E50914] hover:underline text-sm">Back to Sign In</Link>
        </div>
      </div>
    </div>
  )
}
export default ForgotPasswordPage