import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getEmailById } from "../apiRequests/getEmailById";
import MailDetail from "./MailDetail";
import toast from "react-hot-toast";

export default function EmailViewer({ isDark }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState(null);
  useEffect(() => {
    (async () => {
      try {
        const e = await getEmailById(id);
        setEmail(e);
      } catch (err) {
        console.error(err);
        toast.error("Failed to open email");
        navigate("/user/u0");
      }
    })();
  }, [id]);

  if (!email) return null;
  return (
    <MailDetail
      email={email}
      isDark={isDark}
      onBack={() => navigate("/user/u0")}
      onDelete={() => navigate("/user/u0")}
    />
  );
}












