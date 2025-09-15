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
  },
});

export const { sliceLogin, sliceLogout } = authSlice.actions;
export default authSlice.reducer;
