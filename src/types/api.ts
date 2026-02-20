export interface ApiError {
  detail?: string;
  [key: string]: any;
}

export type ProjectStatus = "Draft" | "Active" | "Completed" | "Archived";

export interface  Project {
  id: string;
  name: string;
  status: number;
  status_display: ProjectStatus;
  form_type_name: string;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardState {
  projects: Project[];
  loading: boolean;
  error: string | null;
}

export interface CreateProjectPayload {
  name: string;
  form_type: number;
  project_data: Record<string, any>;
}

export interface ProjectState {
  projects: Project[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}
