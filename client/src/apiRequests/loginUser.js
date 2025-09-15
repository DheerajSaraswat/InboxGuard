import api from "../utils/api";

export const loginUser = async (email, password) => {
  try {
    const res = api.post("/users/login", {
      email,
      password,
    });
    return res;
  } catch (error) {
    console.log("Error while logging: ", error);
    throw error;
  }
};
