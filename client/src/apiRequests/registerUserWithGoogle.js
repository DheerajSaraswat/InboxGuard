import api from "../utils/api";

export const registerUserWithGoogle = async (user) => {
  try {
    const res = await api.post("/users/register-google", {
      uid: user.uid,
      email: user.email,
      photoURL: user.photoURL,
    });
    return res;
  } catch (error) {
    console.log("Error while registering user: ", error);
    throw error;
  }
};
