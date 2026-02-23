import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import api from "@/lib/api";
import {
  AuthState,
  LoginPayload,
  AuthResponse,
} from "@/types/auth";
import { setAccessToken } from "@/lib/authToken";


const initialState: AuthState = {
  user: null,
  accessToken: null,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<AuthResponse, LoginPayload>(
  "auth/login",
  async (payload, { rejectWithValue }) => {
    console.log("[Auth] Attempting email login for:", payload.email);
    try {
      const res = await api.post<AuthResponse>(
        "/accounts/login/",
        payload
      );
      console.log("[Auth] Email login successful:", res.data.user.email);
      return res.data;
    } catch (err: any) {
      console.error("[Auth] Email login failed:", err.response?.data?.detail);
      return rejectWithValue(err.response?.data?.detail);
    }
  }
);

export const googleLogin = createAsyncThunk<
  AuthResponse,
  string
>(
  "auth/googleLogin",
  async (idToken, { rejectWithValue }) => {
    console.log("[Auth] Attempting Google login");
    try {
      const res = await api.post<AuthResponse>(
        "/accounts/login/google/",
        { id_token: idToken }
      );
      console.log("[Auth] Google login successful:", res.data.user.email);
      return res.data;
    } catch (err: any) {
      console.error("[Auth] Google login failed:", err.response?.data?.detail);
      return rejectWithValue(
        err.response?.data?.detail || "Google login failed"
      );
    }
  }
);


export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    console.log("[Auth] Restoring session");
    try {
      const res = await api.post("/accounts/token/refresh/");
      console.log("[Auth] Session restored successfully");
      return res.data; // { access }
    } catch {
      console.warn("[Auth] Session restore failed — session expired");
      return rejectWithValue("Session expired");
    }
  }
);

export const logout = createAsyncThunk<void, void>(
    "auth/logout",
    async(_,{rejectWithValue}) =>{
        console.log("[Auth] Logging out");
        try{
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/accounts/logout/`,
                {},
                { withCredentials: true }
            );
            console.log("[Auth] Logout successful");
        }catch{
            console.error("[Auth] Logout request failed");
            return rejectWithValue("Logout failed");
        }
    }
)

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearAuth(state) {
      state.user = null;
      state.accessToken = null;
      state.error = null;
      setAccessToken(null);
    },
  },
  extraReducers: builder => {
    builder
    // Email/Password Login
      .addCase(login.pending, state => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.user = action.payload.user;
        setAccessToken(action.payload.access);
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Logout
      .addCase(logout.fulfilled, state => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
        setAccessToken(null);
      })
      .addCase(logout.rejected, state => {
        state.user = null;
        state.accessToken = null;
        state.error = null;
        setAccessToken(null);
      })

      // Google Login
      .addCase(googleLogin.pending, state => {
        state.loading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        state.user = action.payload.user;
        setAccessToken(action.payload.access);
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Session Restore
      .addCase(restoreSession.pending, state => {
        state.loading = true;
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false;
        state.accessToken = action.payload.access;
        setAccessToken(action.payload.access);
      })
      .addCase(restoreSession.rejected, state => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        setAccessToken(null);
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;
