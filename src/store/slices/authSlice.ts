import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
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
  refreshToken: null,
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
  async (_, { getState, rejectWithValue }) => {
    console.log("[Auth] Restoring session");
    try {
      const state = getState() as { auth: { refreshToken: string | null } };
      const refresh = state.auth.refreshToken;
      if (!refresh) return rejectWithValue("No refresh token");
      const res = await api.post("/accounts/token/refresh/", { refresh });
      console.log("[Auth] Session restored successfully");
      return res.data; // { access, refresh }
    } catch {
      console.warn("[Auth] Session restore failed — session expired");
      return rejectWithValue("Session expired");
    }
  }
);

export const logout = createAsyncThunk<void, void>(
    "auth/logout",
    async(_, { getState, rejectWithValue }) =>{
        console.log("[Auth] Logging out");
        try{
            const state = getState() as { auth: { refreshToken: string | null } };
            const refresh = state.auth.refreshToken;
            await api.post("/accounts/logout/", { refresh });
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
      state.refreshToken = null;
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
        state.refreshToken = action.payload.refresh ?? null;
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
        state.refreshToken = null;
        state.error = null;
        setAccessToken(null);
      })
      .addCase(logout.rejected, state => {
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
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
        state.refreshToken = action.payload.refresh ?? null;
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
        if (action.payload.refresh) {
          state.refreshToken = action.payload.refresh;
        }
        setAccessToken(action.payload.access);
      })
      .addCase(restoreSession.rejected, state => {
        state.loading = false;
        state.user = null;
        state.accessToken = null;
        state.refreshToken = null;
        setAccessToken(null);
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;
