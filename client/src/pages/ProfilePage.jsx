import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  User,
  Save,
  Camera,
  X,
  UserPen,
  Home,
  Copy,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  updateUserProfile,
  uploadProfileImage,
} from "../apiRequests/profileApi";
import { updateUserProfile as updateUserProfileRedux } from "../redux/slices/authSlice";

export default function ProfilePage({ isDark }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Current state of the form data
  const [profileData, setProfileData] = useState({
    fullname: "",
    username: "",
    platformMail: "",
    displayImage: "",
    bio: "",
  });

  // State to hold the original data for cancellation
  const [originalProfileData, setOriginalProfileData] = useState({});

  const [loading, setLoading] = useState(false);
  const [edit, setEdit] = useState(false);
  const [saving, setSaving] = useState(false);

  // Initial load effect
  useEffect(() => {
    if (!user) {
      navigate("/signin");
      return;
    }
    const initialData = {
      fullname: user.fullname || "",
      username: user.username || "",
      platformMail: user.platformMail || "",
      displayImage: user.displayImage || "",
      bio: user.bio || "",
    };

    setProfileData(initialData);
    setOriginalProfileData(initialData);
  }, [user, navigate]);

  const getChangedData = () => {
    const changes = {};
    for (const key in profileData) {
      // Skip platformMail and displayImage
      if (
        key !== "platformMail" && key !== "displayImage" &&
        profileData[key] !== originalProfileData[key]
      ) {
        changes[key] = profileData[key];
      }
    }
    return changes;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditState = (cancel = false) => {
    if (cancel) {
      // Restore the profileData from the original backup
      setProfileData(originalProfileData);
      setEdit(false);
    } else {
      // Back up the current data
      setOriginalProfileData(profileData);
      setEdit(true);
    }
  };

  const handleProfileUpdate = async () => {
    const changedData = getChangedData();

    if (Object.keys(changedData).length === 0) {
      toast.error("No changes detected to save.");
      setEdit(false);
      return;
    }

    setSaving(true);
    try {
      const response = await updateUserProfile(changedData);

      if (response.success) {
        toast.success("Profile updated successfully!");
        
        dispatch(updateUserProfileRedux(response.data));
        
        setEdit(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleMailCopy = async () => {
    try {
      await navigator.clipboard.writeText(profileData.platformMail);
      toast.success("Platform mail copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy mail. Please try manually.");
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select a valid image file.");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB.");
      return;
    }

    try {
      setSaving(true);
      
      const response = await uploadProfileImage(file);
      
      if (response.success) {
        // Update local state with new image URL
        setProfileData((prev) => ({
          ...prev,
          displayImage: response.data.displayImage,
        }));
        
        // Update Redux store
        dispatch(updateUserProfileRedux({
          displayImage: response.data.displayImage
        }));
        
        toast.success("Profile image updated successfully! 🎉");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "bg-[#111] text-white" : "bg-gray-200 text-gray-800"
        }`}
      >
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-500 mb-4"></div>
          <p className="text-lg font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen p-10 ${
        isDark ? "bg-[#111] text-white" : "bg-gray-200 text-gray-800"
      }`}
    >
      {/* Header */}
      <div className="flex justify-between ml-30 mr-30 mb-12">
        <div className="flex items-center">
          <Home
            onClick={() => navigate("/user/u0")}
            className="mr-5 cursor-pointer h-5"
          />
          <h1 className="text-4xl font-bold">Your Profile</h1>
        </div>

        {/* Action Buttons */}
        {edit ? (
          <div className="flex gap-x-5">
            <div
              onClick={() => handleEditState(true)}
              className="flex rounded-2xl items-center p-2 gap-x-2 cursor-pointer bg-red-700 text-white active:scale-95 transition"
            >
              <X />
              Cancel
            </div>
            {/* SAVE BUTTON */}
            <div
              onClick={handleProfileUpdate}
              className={`flex rounded-2xl items-center p-2 gap-x-2 cursor-pointer bg-green-600 text-white active:scale-95 transition ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <Save className="text-gray-100" />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </div>
          </div>
        ) : (
          /* EDIT BUTTON */
          <div
            onClick={() => handleEditState(false)}
            className="flex border-2 rounded-2xl items-center p-2 gap-x-2 cursor-pointer bg-white text-gray-700 active:scale-95 transition hover:bg-gray-100"
          >
            <UserPen />
            Edit Profile
          </div>
        )}
      </div>

      {/*Profile Image & Mail*/}
      <div
        className={`p-8 ${
          isDark ? "bg-[#222]" : "bg-white"
        } ml-30 mr-30 rounded-2xl flex flex-col gap-y-2 items-center justify-center mb-8 shadow-md`}
      >
        <div className="relative">
          <img
            src={profileData.displayImage}
            alt="Display Image"
            className="h-36 w-36 rounded-full border-4 border-gray-400 object-cover"
          />
          {/*Camera icon overlay to upload image */}
          {edit && (
            <label
              htmlFor="image-upload"
              className="absolute bottom-0 right-0 p-2 bg-black rounded-full text-white cursor-pointer hover:bg-gray-700 transition"
            >
              <Camera className="h-5 w-5" />
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>
        <div className="flex gap-2 items-center">
          <span className="font-medium">{profileData.platformMail}</span>
          <Copy
            onClick={handleMailCopy}
            className="h-4 hover:scale-105 cursor-pointer"
          />
        </div>
      </div>

      {/*Personal Info*/}
      <div
        className={`p-8 ${
          isDark ? "bg-[#222] text-white" : "bg-white text-gray-800"
        } ml-30 mr-30 rounded-2xl shadow-md flex flex-col gap-y-7`}
      >
        <div className="flex gap-1 items-center">
          <User />{" "}
          <span className="text-xl font-semibold">Personal Information</span>
        </div>
        <div className="flex justify-between pr-5 pl-5">
          <div className="flex flex-col w-[45%] gap-y-2">
            <label htmlFor="fullname" className="font-medium">
              Full Name
            </label>
            <input
              type="text"
              name="fullname"
              className={`border rounded-md h-10 p-2 bg-white ${
                edit
                  ? "text-gray-800"
                  : "text-gray-500"
              }`}
              disabled={!edit}
              value={profileData.fullname}
              onChange={handleInputChange}
            />
          </div>
          <div className="flex flex-col w-[45%] gap-y-2">
            <label htmlFor="username" className="font-medium">
              Username
            </label>
            <input
              type="text"
              name="username"
              className={`border rounded-md h-10 p-2 bg-white ${
                edit
                  ? "text-gray-800"
                  : "text-gray-500"
              }`}
              disabled={!edit}
              value={profileData.username}
              onChange={handleInputChange}
            />
          </div>
        </div>
        <div className="pr-5 pl-5">
          <label htmlFor="bio" className="font-medium">
            Bio
          </label>
          <textarea
            name="bio"
            className={`border rounded-md mt-2 w-full min-h-24 p-2 bg-white ${
              edit
                ? "text-gray-800"
                : "text-gray-500"
            }`}
            disabled={!edit}
            value={profileData.bio}
            onChange={handleInputChange}
          ></textarea>
        </div>
      </div>
    </div>
  );
}
