import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Shield, Bell, Save } from "lucide-react";
import toast from "react-hot-toast";
import { getSecuritySettings, updateSecuritySettings } from "../apiRequests/profileApi";

export default function SettingsPage({ isDark }) {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    phishingDetection: {
      enabled: true,
      sensitivity: "medium",
    },
    notifications: {
      phishingAlerts: true,
      emailNotifications: true,
      desktopNotifications: false,
    },
  });

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
          setSettings((prev) => ({
            ...prev,
            phishingDetection: {
              ...prev.phishingDetection,
              ...res.data.phishingDetection,
            },
            notifications: {
              ...prev.notifications,
              ...res.data.notifications,
            },
          }));
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

  const handleToggle = (group, key) => (e) => {
    const value = e.target.checked;
    setSettings((prev) => ({
      ...prev,
      [group]: {
        ...prev[group],
        [key]: value,
      },
    }));
  };

  const handleSensitivity = (e) => {
    const value = e.target.value;
    setSettings((prev) => ({
      ...prev,
      phishingDetection: { ...prev.phishingDetection, sensitivity: value },
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        phishingDetection: {
          enabled: settings.phishingDetection.enabled,
          sensitivity: settings.phishingDetection.sensitivity,
        },
        notifications: { ...settings.notifications },
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

        <div
          className={`${
            isDark ? "bg-[#141414] border-[#222]" : "bg-gray-50 border-gray-200"
          } rounded-xl border p-6 mb-6`}
        >
          <h2 className="text-lg font-medium mb-4">Phishing Detection</h2>
          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Enable detection</p>
              <p className="text-sm opacity-80">
                Scan drafts for risky indicators before sending.
              </p>
            </div>
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.phishingDetection.enabled}
                onChange={handleToggle("phishingDetection", "enabled")}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 relative" />
            </label>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium mb-1">
              Sensitivity
            </label>
            <select
              value={settings.phishingDetection.sensitivity}
              onChange={handleSensitivity}
              className={`${
                isDark
                  ? "bg-[#0B0B0B] border-[#222]"
                  : "bg-white border-gray-300"
              } border rounded-lg px-3 py-2`}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          <p className="text-xs opacity-70 mt-3">
            Scanning algorithm is fixed by InboxGuard for consistency and
            accuracy.
          </p>
        </div>

        <div
          className={`${
            isDark ? "bg-[#141414] border-[#222]" : "bg-gray-50 border-gray-200"
          } rounded-xl border p-6`}
        >
          <div className="flex items-center gap-2 mb-4">
            <Bell className="w-5 h-5" />
            <h2 className="text-lg font-medium">Notifications</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Phishing alerts</p>
                <p className="text-sm opacity-80">
                  Get alerted when risky content is detected.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notifications.phishingAlerts}
                  onChange={handleToggle("notifications", "phishingAlerts")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 relative" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email notifications</p>
                <p className="text-sm opacity-80">
                  Receive updates about your InboxGuard account.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notifications.emailNotifications}
                  onChange={handleToggle("notifications", "emailNotifications")}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 relative" />
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Desktop notifications</p>
                <p className="text-sm opacity-80">
                  Enable OS notifications on supported devices.
                </p>
              </div>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.notifications.desktopNotifications}
                  onChange={handleToggle(
                    "notifications",
                    "desktopNotifications"
                  )}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600 relative" />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}









