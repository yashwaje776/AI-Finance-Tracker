import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,       
  users: [],       
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },

    clearUser: (state) => {
      state.user = null;
    },

    setUsers: (state, action) => {
      state.users = action.payload;
    },

    addUser: (state, action) => {
      state.users = [...state.users, action.payload];
    },

    removeUser: (state, action) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  setUser,
  clearUser,
  setUsers,
  addUser,
  removeUser,
  setLoading,
  setError,
} = userSlice.actions;

export default userSlice.reducer;
