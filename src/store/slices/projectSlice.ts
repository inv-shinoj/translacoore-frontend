import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { Project, ProjectState, CreateProjectPayload } from "@/types/api";

export const fetchProjects = createAsyncThunk<Project[]>(
  "project/fetchProjects",
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

export const createProject = createAsyncThunk<Project, CreateProjectPayload>(
  "project/createProject",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post<Project>("/api/project/", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data || "Failed to create project"
      );
    }
  }
);

export const deleteProject = createAsyncThunk<string, string>(
  "project/deleteProject",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/project/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to delete project"
      );
    }
  }
);

const initialState: ProjectState = {
  projects: [],
  loading: false,
  submitting: false,
  error: null,
};

const projectSlice = createSlice({
  name: "project",
  initialState,
  reducers: {
    clearProjectError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchProjects
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

    // createProject
    builder
      .addCase(createProject.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.submitting = false;
        state.projects.unshift(action.payload);
      })
      .addCase(createProject.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // deleteProject
    builder
      .addCase(deleteProject.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.submitting = false;
        state.projects = state.projects.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
