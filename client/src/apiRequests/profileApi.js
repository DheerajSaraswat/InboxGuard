import api from "../utils/api";

const API_BASE_URL = "/users";

// Update user profile
export const updateUserProfile = async (profileData) => {
  try {
    const response = await api.put(
      `${API_BASE_URL}/profile`,
      profileData
    );
    return response.data;
  } catch (error) {
    console.error("Error updating user profile:", error);
    throw error;
  }
};

// Upload profile image
export const uploadProfileImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const response = await api.post(
      `${API_BASE_URL}/profile/upload-image`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    console.error("Error uploading profile image:", error);
    throw error;
  }
};

// Save FCM token
export const saveFcmToken = async (fcmToken) => {
  try {
    const response = await api.post(
      `${API_BASE_URL}/fcm-token`,
      { token: fcmToken }
    );
    return response.data;
  } catch (error) {
    console.error("Error saving FCM token:", error);
    throw error;
  }
};

