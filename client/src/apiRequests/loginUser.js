import api from "../utils/api";

export const loginUser = async (email, password, accessToken) => {
  try {
    const res = api.post("/users/login");
    return res;
  } catch (error) {
    console.log("Error while logging: ", error);
    throw error;
  }
};
