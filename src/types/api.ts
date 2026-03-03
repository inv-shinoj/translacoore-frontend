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
  created_by_name: string | null;
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
  employees: MemberUser[];
  employeesLoading: boolean;
}

export type MemberRole = 2 | 3; // 2 = Lead, 3 = Employee

export interface MemberUser {
  id: string;
  full_name: string;
  email: string;
  role: number;
  role_display: string;
}

export interface ProjectMember {
  id: number;
  full_name: string;
  email: string;
  role: MemberRole;
  role_display: string;
  assigned_at: string;
}

export interface AddMemberPayload {
  projectId: string;
  user_id: string;
  role: MemberRole;
}

export type FormTypeKey = 1 | 2 | 3 | 4;
export type SchemaStatus = "Active" | "Inactive";
export type SchemaFieldType = "text" | "textarea" | "select" | "date";

export interface SchemaField {
  key: string;
  type: SchemaFieldType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface FormType {
  id: string;
  key: FormTypeKey;
  name: string;
  description: string;
  is_active: boolean;
}

export interface FormSchema {
  id: string;
  name: string;
  form_type: FormTypeKey;
  version: number;
  status: SchemaStatus;
  schema_json: { fields: SchemaField[] };
  created_at: string;
}

export interface UploadSchemaPayload {
  name: string;
  form_type: FormTypeKey;
  schema_file: File;
}

export interface FormState {
  types: FormType[];
  schemas: FormSchema[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}
