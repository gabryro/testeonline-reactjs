import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  uid: string | null;
  name: string | null;
  isAdmin: boolean;
  siteKey: string | null;
  isLoggedIn: boolean;
}

const initialState: AuthState = {
  token: null,
  uid: null,
  name: null,
  isAdmin: false,
  siteKey: null,
  isLoggedIn: false,
};

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{ token: string; uid: string; name: string; isAdmin: boolean; siteKey?: string }>,
    ) => {
      state.token = action.payload.token;
      state.uid = action.payload.uid;
      state.name = action.payload.name;
      state.isAdmin = action.payload.isAdmin;
      state.siteKey = action.payload.siteKey ?? null;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.token = null;
      state.uid = null;
      state.name = null;
      state.isAdmin = false;
      state.siteKey = null;
      state.isLoggedIn = false;
    },
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
  },
});

export const { setAuth, logout, setName } = authSlice.actions;
export default authSlice.reducer;
