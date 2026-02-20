import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Project, DashboardState } from "@/types/api";

export const fetchProjects = createAsyncThunk<Project[]>(
  "dashboard/fetchProjects",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<Project[]>("/api/project/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch projects"
      );
    }
  }
);

const initialState: DashboardState = {
  projects: [],
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload;
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;