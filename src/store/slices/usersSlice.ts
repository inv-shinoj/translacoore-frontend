import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { User, UserRole } from "@/types/user";

// ── Types ────────────────────────────────────────────────────────────────────

export interface UsersState {
  list: User[];
  loading: boolean;
  error: string | null;
}

export interface CreateUserPayload {
  email: string;
  full_name: string;
  password: string;
  role: number; // 1=Admin 2=Manager 3=Lead 4=Employee
}

export interface UpdateUserPayload {
  id: string;
  full_name?: string;
  role?: number;
}

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchUsers = createAsyncThunk<User[]>(
  "users/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get<User[]>("/accounts/users/");
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to fetch users");
    }
  }
);

export const createUser = createAsyncThunk<User, CreateUserPayload>(
  "users/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post<User>("/accounts/users/", payload);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to create user");
    }
  }
);

export const updateUser = createAsyncThunk<User, UpdateUserPayload>(
  "users/update",
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.patch<User>(`/accounts/users/${id}/`, data);
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to update user");
    }
  }
);

export const deleteUser = createAsyncThunk<string, string>(
  "users/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/accounts/users/${id}/`);
      return id;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to delete user");
    }
  }
);

export const setUserActive = createAsyncThunk<User, { id: string; is_active: boolean }>(
  "users/setActive",
  async ({ id, is_active }, { rejectWithValue }) => {
    try {
      const res = await api.patch<User>(`/accounts/users/${id}/`, { is_active });
      return res.data;
    } catch (err: any) {
      return rejectWithValue(err.response?.data?.detail ?? "Failed to update user status");
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: UsersState = {
  list: [],
  loading: false,
  error: null,
};

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearUsersError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchUsers
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // createUser
    builder
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.list.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // updateUser
    builder
      .addCase(updateUser.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // deleteUser
    builder
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.list = state.list.filter((u) => u.id !== action.payload);
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // setUserActive (activate / deactivate)
    builder
      .addCase(setUserActive.fulfilled, (state, action) => {
        const idx = state.list.findIndex((u) => u.id === action.payload.id);
        if (idx !== -1) state.list[idx] = action.payload;
      })
      .addCase(setUserActive.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearUsersError } = usersSlice.actions;
export default usersSlice.reducer;
