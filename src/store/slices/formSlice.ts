import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { FormType, FormSchema, FormState, FormTypeKey, UploadSchemaPayload } from "@/types/api";


export const fetchFormTypes = createAsyncThunk<FormType[]>(
  "form/fetchFormTypes",
  async (_, { rejectWithValue }) => {
    console.log("[Form] Fetching form types");
    try {
      const res = await api.get<FormType[]>("/api/forms/types/");
      console.log(`[Form] Fetched ${res.data.length} form types`);
      return res.data;
    } catch (err: any) {
      console.error("[Form] Failed to fetch form types:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch form types"
      );
    }
  }
);

export const fetchFormSchemas = createAsyncThunk<FormSchema[]>(
  "form/fetchFormSchemas",
  async (_, { rejectWithValue }) => {
    console.log("[Form] Fetching form schemas");
    try {
      const res = await api.get<FormSchema[]>("/api/forms/schemas/");
      console.log(`[Form] Fetched ${res.data.length} schemas`);
      return res.data;
    } catch (err: any) {
      console.error("[Form] Failed to fetch schemas:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to fetch schemas"
      );
    }
  }
);

export const uploadSchema = createAsyncThunk<FormSchema, UploadSchemaPayload>(
  "form/uploadSchema",
  async (payload, { rejectWithValue }) => {
    console.log("[Form] Uploading schema:", payload.name, "type:", payload.form_type);
    try {
      const formData = new FormData();
      formData.append("name", payload.name);
      formData.append("form_type", String(payload.form_type));
      formData.append("schema_file", payload.schema_file);

      const res = await api.post<FormSchema>("/api/forms/schemas/", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("[Form] Schema uploaded:", res.data.id, res.data.name);
      return res.data;
    } catch (err: any) {
      console.error("[Form] Failed to upload schema:", err.response?.data);
      return rejectWithValue(
        err.response?.data || "Failed to upload schema"
      );
    }
  }
);

export const activateSchema = createAsyncThunk<
  { id: string; form_type: FormTypeKey },
  { id: string; form_type: FormTypeKey }
>(
  "form/activateSchema",
  async ({ id, form_type }, { rejectWithValue }) => {
    console.log("[Form] Activating schema:", id);
    try {
      await api.post(`/api/forms/schemas/${id}/activate/`);
      console.log("[Form] Schema activated:", id);
      return { id, form_type };
    } catch (err: any) {
      console.error("[Form] Failed to activate schema:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to activate schema"
      );
    }
  }
);

export const deleteSchema = createAsyncThunk<string, string>(
  "form/deleteSchema",
  async (id, { rejectWithValue }) => {
    console.log("[Form] Deleting schema:", id);
    try {
      await api.delete(`/api/forms/schemas/${id}/`);
      console.log("[Form] Schema deleted:", id);
      return id;
    } catch (err: any) {
      console.error("[Form] Failed to delete schema:", err.response?.data);
      return rejectWithValue(
        err.response?.data?.detail || "Failed to delete schema"
      );
    }
  }
);


const initialState: FormState = {
  types: [],
  schemas: [],
  loading: false,
  submitting: false,
  error: null,
};

const formSlice = createSlice({
  name: "form",
  initialState,
  reducers: {
    clearFormError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetchFormTypes
    builder
      .addCase(fetchFormTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormTypes.fulfilled, (state, action) => {
        state.loading = false;
        state.types = action.payload;
      })
      .addCase(fetchFormTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // fetchFormSchemas
    builder
      .addCase(fetchFormSchemas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFormSchemas.fulfilled, (state, action) => {
        state.loading = false;
        state.schemas = action.payload;
      })
      .addCase(fetchFormSchemas.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // uploadSchema
    builder
      .addCase(uploadSchema.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(uploadSchema.fulfilled, (state, action) => {
        state.submitting = false;
        state.schemas.unshift(action.payload);
      })
      .addCase(uploadSchema.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // activateSchema — mark old active schemas of same type as Inactive, set this one Active
    builder
      .addCase(activateSchema.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(activateSchema.fulfilled, (state, action) => {
        state.submitting = false;
        const activated = action.payload;
        state.schemas = state.schemas.map(s => {
          if (s.form_type === activated.form_type) {
            return s.id === activated.id
              ? { ...s, status: "Active" }
              : { ...s, status: "Inactive" };
          }
          return s;
        });
      })
      .addCase(activateSchema.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });

    // deleteSchema
    builder
      .addCase(deleteSchema.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(deleteSchema.fulfilled, (state, action) => {
        state.submitting = false;
        state.schemas = state.schemas.filter(s => s.id !== action.payload);
      })
      .addCase(deleteSchema.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFormError } = formSlice.actions;
export default formSlice.reducer;
