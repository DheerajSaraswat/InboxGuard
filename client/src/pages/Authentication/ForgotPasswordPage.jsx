import { useState } from "react";
import { Link } from "react-router-dom";
import { resetPassword } from "../../common/firebase";

function ForgotPasswordPage() {

    const [email, setEmail] = useState("");
    console.log(email);
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
    <div>
        <input type="email" className="border-2" onChange={(e)=>setEmail(e.target.value)}/>
        <button onClick={handleResetPassword}>send reset link</button>
        <Link to="/signin">Back to signin</Link>
    </div>
  )
}
export default ForgotPasswordPage