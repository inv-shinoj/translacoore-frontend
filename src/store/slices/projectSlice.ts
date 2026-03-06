import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import {
  Project,
  ProjectDetail,
  ProjectState,
  CreateProjectPayload,
  MemberUser,
  ProjectMember,
  AddMemberPayload,
} from "@/types/api";

export const fetchProjects = createAsyncThunk<Project[]>(
  "project/fetchProjects",
  async (_, { rejectWithValue }) => {
    console.log("[Project] Fetching projects");
    try {
      const res = await api.get<Project[]>("/api/project/");
      console.log(`[Project] Fetched ${res.data.length} projects`);
      return res.data;
    } catch (err: any) {
      console.error("[Project] Failed to fetch projects:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch projects"
      );
    }
  }
);

export const createProject = createAsyncThunk<Project, CreateProjectPayload>(
  "project/createProject",
  async (payload, { rejectWithValue }) => {
    console.log("[Project] Creating project:", payload.name);
    try {
      const res = await api.post<Project>("/api/project/", payload);
      console.log("[Project] Project created:", res.data.id, res.data.name);
      return res.data;
    } catch (err: any) {
      console.error("[Project] Failed to create project:", err.response?.data);
      return rejectWithValue(
        err.response?.data || "Failed to create project"
      );
    }
  }
);

export const deleteProject = createAsyncThunk<string, string>(
  "project/deleteProject",
  async (id, { rejectWithValue }) => {
    console.log("[Project] Deleting project:", id);
    try {
      await api.delete(`/api/project/${id}/`);
      console.log("[Project] Project deleted:", id);
      return id;
    } catch (err: any) {
      console.error("[Project] Failed to delete project:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to delete project"
      );
    }
  }
);

export const fetchEmployees = createAsyncThunk<MemberUser[]>(
  "project/fetchEmployees",
  async (_, { rejectWithValue }) => {
    console.log("[Project] Fetching employees");
    try {
      const res = await api.get<MemberUser[]>("/accounts/users/");
      console.log(`[Project] Fetched ${res.data.length} users`);
      return res.data;
    } catch (err: any) {
      console.error("[Project] Failed to fetch users:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch users"
      );
    }
  }
);

export const addProjectMember = createAsyncThunk<ProjectMember, AddMemberPayload>(
  "project/addProjectMember",
  async ({ projectId, user_id, role }, { rejectWithValue }) => {
    console.log("[Project] Adding member to project:", projectId);
    try {
      const res = await api.post<ProjectMember>(
        `/api/project/${projectId}/members/`,
        { user_id, role }
      );
      console.log("[Project] Member added:", res.data.full_name);
      return res.data;
    } catch (err: any) {
      console.error("[Project] Failed to add member:", err.response?.data);
      return rejectWithValue(err.response?.data || "Failed to add member");
    }
  }
);

export const fetchProjectDetail = createAsyncThunk<ProjectDetail, string>(
  "project/fetchDetail",
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get<ProjectDetail>(`/api/project/${id}/`);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch project"
      );
    }
  }
);

const initialState: ProjectState = {
  projects: [],
  loading: false,
  submitting: false,
  error: null,
  employees: [],
  employeesLoading: false,
  currentProject: null,
  currentProjectLoading: false,
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

    // fetchEmployees
    builder
      .addCase(fetchEmployees.pending, (state) => {
        state.employeesLoading = true;
      })
      .addCase(fetchEmployees.fulfilled, (state, action) => {
        state.employeesLoading = false;
        state.employees = action.payload;
      })
      .addCase(fetchEmployees.rejected, (state) => {
        state.employeesLoading = false;
      });

    // addProjectMember — no state change needed; modal manages its own member list
    builder
      .addCase(addProjectMember.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(addProjectMember.fulfilled, (state) => {
        state.submitting = false;
      })
      .addCase(addProjectMember.rejected, (state) => {
        state.submitting = false;
      });

    // fetchProjectDetail
    builder
      .addCase(fetchProjectDetail.pending, (state) => {
        state.currentProjectLoading = true;
        state.currentProject = null;
        state.error = null;
      })
      .addCase(fetchProjectDetail.fulfilled, (state, action) => {
        state.currentProjectLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectDetail.rejected, (state, action) => {
        state.currentProjectLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearProjectError } = projectSlice.actions;
export default projectSlice.reducer;
