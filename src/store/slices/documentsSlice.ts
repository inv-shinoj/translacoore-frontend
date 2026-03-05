import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/api";
import { DocumentFile, DocumentsState } from "@/types/api";

// ── Thunks ───────────────────────────────────────────────────────────────────

export const fetchDocuments = createAsyncThunk<DocumentFile[], string>(
  "documents/fetchAll",
  async (projectId, { rejectWithValue }) => {
    try {
      const res = await api.get<DocumentFile[]>(
        `/api/project/${projectId}/documents/`
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to fetch documents"
      );
    }
  }
);

export const uploadDocument = createAsyncThunk<
  DocumentFile,
  { projectId: string; file: File }
>(
  "documents/upload",
  async ({ projectId, file }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post<DocumentFile>(
        `/api/project/${projectId}/documents/`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          timeout: 300_000, // 5 min — synchronous translation can be slow
        }
      );
      return res.data;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail ??
          err.response?.data?.file?.[0] ??
          "Failed to upload document"
      );
    }
  }
);

export const deleteDocument = createAsyncThunk<
  string,
  { projectId: string; docId: string }
>(
  "documents/delete",
  async ({ projectId, docId }, { rejectWithValue }) => {
    try {
      await api.delete(`/api/project/${projectId}/documents/${docId}/`);
      return docId;
    } catch (err: any) {
      return rejectWithValue(
        err.response?.data?.detail ?? "Failed to delete document"
      );
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState: DocumentsState = {
  documents: [],
  loading: false,
  uploading: false,
  error: null,
};

const documentsSlice = createSlice({
  name: "documents",
  initialState,
  reducers: {
    clearDocumentsError(state) {
      state.error = null;
    },
    clearDocuments(state) {
      state.documents = [];
    },
  },
  extraReducers: (builder) => {
    // fetchDocuments
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.loading = false;
        state.documents = action.payload;
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // uploadDocument
    builder
      .addCase(uploadDocument.pending, (state) => {
        state.uploading = true;
        state.error = null;
      })
      .addCase(uploadDocument.fulfilled, (state, action) => {
        state.uploading = false;
        state.documents.unshift(action.payload);
      })
      .addCase(uploadDocument.rejected, (state, action) => {
        state.uploading = false;
        state.error = action.payload as string;
      });

    // deleteDocument
    builder
      .addCase(deleteDocument.pending, (state) => {
        state.error = null;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDocument.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearDocumentsError, clearDocuments } = documentsSlice.actions;
export default documentsSlice.reducer;
