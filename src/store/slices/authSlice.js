import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  userId: localStorage.getItem('userId') || null,
  userName: localStorage.getItem('userName') || null,
  roleName: localStorage.getItem('roleName') || null,
  token: localStorage.getItem('authToken') || null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.userId = action.payload.userId;
      state.userName = action.payload.userName;
      state.roleName = action.payload.roleName;
      state.token = action.payload.token;
    },
    clearAuth: (state) => {
      state.userId = null;
      state.userName = null;
      state.roleName = null;
      state.token = null;
    },
  },
});

export const { setAuth, clearAuth } = authSlice.actions;
export default authSlice.reducer;
