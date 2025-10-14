import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    sliceLogin: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    },
    sliceLogout: (state) => {
      state.user = null;
      state.token = null;
    },
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
  },
});

export const { sliceLogin, sliceLogout, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
