import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Shield, Save, KeyRound, ListMinus, ListPlus } from "lucide-react";
import { getAuth, updatePassword } from "firebase/auth";
import toast from "react-hot-toast";
import { getSecuritySettings, updateSecuritySettings } from "../apiRequests/profileApi";

export default function SettingsPage({ isDark }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [blacklistInput, setBlacklistInput] = useState("");
  const [whitelistInput, setWhitelistInput] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    let mounted = true;
    (async () => {
      try {
        const res = await getSecuritySettings();
        if (mounted && res?.success) {
          const bl = Array.isArray(res.data?.blacklist)
            ? res.data.blacklist.map((i) => i.value).filter(Boolean)
            : [];
          const wl = Array.isArray(res.data?.whitelist)
            ? res.data.whitelist.map((i) => i.value).filter(Boolean)
            : [];
          setBlacklistInput(bl.join(", "));
          setWhitelistInput(wl.join(", "));
        }
      } catch (e) {
        toast.error("Failed to load settings");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user, navigate]);

  const parseList = (text) => {
    return text
      .split(/[\n,;]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        blacklist: parseList(blacklistInput),
        whitelist: parseList(whitelistInput),
      };
      const res = await updateSecuritySettings(payload);
      if (res?.success) {
        toast.success("Settings saved");
      }
    } catch (e) {
      const msg = e?.response?.data?.message || "Failed to save settings";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? "bg-[#111] text-white" : "bg-gray-100 text-gray-900"}`}>
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-full border-4 border-t-transparent border-red-500 animate-spin" />
          <span className="text-sm font-medium">Loading settings…</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${
        isDark ? "bg-[#0B0B0B] text-white" : "bg-white text-gray-900"
      } min-h-screen`}
    >
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Shield
              onClick={() => navigate("/user/u0")}
              className="w-6 h-6 text-red-600 cursor-pointer"
            />
            <h1 className="text-2xl font-semibold">Security Settings</h1>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${
              isDark
                ? "bg-red-600 hover:bg-red-500"
                : "bg-red-600 hover:bg-red-700"
            } text-white transition disabled:opacity-60`}
          >
            <Save className="w-4 h-4" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </div>
        {/* Blocklist */}
        <div className={`${isDark ? "bg-[#141414] border-[#222]" : "bg-gray-50 border-gray-200"} rounded-xl border p-6 mb-6`}>
          <h2 className="text-lg font-medium mb-2 flex items-center gap-2"><ListMinus className="w-5 h-5"/> Blocklist</h2>
          <p className={`text-sm mb-2 ${isDark?"text-gray-400":"text-gray-600"}`}>Enter emails or domains (comma or newline separated).</p>
          <textarea rows={4} value={blacklistInput} onChange={(e)=>setBlacklistInput(e.target.value)} className={`w-full rounded-lg px-3 py-2 border ${isDark?"bg-[#0B0B0B] border-[#222]":"bg-white border-gray-300"}`} placeholder="spam@example.com, *.phish.com" />
        </div>

        {/* Whitelist */}
        <div className={`${isDark ? "bg-[#141414] border-[#222]" : "bg-gray-50 border-gray-200"} rounded-xl border p-6 mb-6`}>
          <h2 className="text-lg font-medium mb-2 flex items-center gap-2"><ListPlus className="w-5 h-5"/> Whitelist</h2>
          <p className={`text-sm mb-2 ${isDark?"text-gray-400":"text-gray-600"}`}>Allowed senders override phishing filters.</p>
          <textarea rows={4} value={whitelistInput} onChange={(e)=>setWhitelistInput(e.target.value)} className={`w-full rounded-lg px-3 py-2 border ${isDark?"bg-[#0B0B0B] border-[#222]":"bg-white border-gray-300"}`} placeholder="partner@example.com, *.trusted.org" />
        </div>

        {/* Change Password */}
        <div className={`${isDark ? "bg-[#141414] border-[#222]" : "bg-gray-50 border-gray-200"} rounded-xl border p-6`}>
          <h2 className="text-lg font-medium mb-4 flex items-center gap-2"><KeyRound className="w-5 h-5"/> Change Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} placeholder="New password" className={`rounded-lg px-3 py-2 border ${isDark?"bg-[#0B0B0B] border-[#222]":"bg-white border-gray-300"}`} />
            <input type="password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} placeholder="Confirm new password" className={`rounded-lg px-3 py-2 border ${isDark?"bg-[#0B0B0B] border-[#222]":"bg-white border-gray-300"}`} />
          </div>
          <button
            onClick={async()=>{
              if (!newPassword || newPassword !== confirmPassword) { toast.error("Passwords do not match"); return; }
              try { await updatePassword(getAuth().currentUser, newPassword); toast.success("Password updated"); setNewPassword(""); setConfirmPassword(""); } catch(e){ const msg = String(e?.message||""); toast.error(msg.includes('recent')? 'Please log in again and retry' : 'Failed to update password'); }
            }}
            className={`mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg ${isDark?"bg-red-600 hover:bg-red-500":"bg-red-600 hover:bg-red-700"} text-white transition`}
          >
            <Save className="w-4 h-4"/> Update Password
          </button>
        </div>
      </div>
    </div>
  );
}















