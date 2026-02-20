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
    try {
      const res = await api.post<AuthResponse>(
        "/accounts/login/",
        payload
      );
      return res.data;
    } catch (err: any) {
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
    try {
      const res = await api.post<AuthResponse>(
        "/accounts/login/google/",
        { id_token: idToken }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail || "Google login failed"
      );
    }
  }
);


export const restoreSession = createAsyncThunk(
  "auth/restoreSession",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.post("/accounts/token/refresh/");
      return res.data; // { access }
    } catch {
      return rejectWithValue("Session expired");
    }
  }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async(_,{rejectWithValue}) =>{
        try{
            await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/accounts/logout/`,
                {},
                { withCredentials: true }
            );
        }catch{
            // best-effort: clear local state regardless
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
      });
  },
});

export const { clearAuth } = authSlice.actions;

export default authSlice.reducer;
