import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  drafts: [],
};

const draftSlice = createSlice({
  name: 'draft',
  initialState,
  reducers: {
    addDraft: (state, action) => {
      state.drafts.push(action.payload);
    },
    removeDraft: (state, action) => {
      state.drafts = state.drafts.filter((_, idx) => idx !== action.payload);
    },
    clearDrafts: (state) => {
      state.drafts = [];
    },
  },
});

export const { addDraft, removeDraft, clearDrafts } = draftSlice.actions;
export default draftSlice.reducer;
