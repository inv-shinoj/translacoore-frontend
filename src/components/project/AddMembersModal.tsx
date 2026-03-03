"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchEmployees, addProjectMember } from "@/store/slices/projectSlice";
import { ProjectMember, MemberRole } from "@/types/api";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

interface Props {
  projectId: string;
  projectName: string;
  onClose: () => void;
}

const ROLE_OPTIONS: { value: MemberRole; label: string }[] = [
  { value: 2, label: "Lead" },
  { value: 3, label: "Employee" },
];

export default function AddMembersModal({ projectId, projectName, onClose }: Props) {
  const dispatch = useAppDispatch();
  const { employees, employeesLoading, submitting } = useAppSelector((s) => s.project);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>(3);
  const [addError, setAddError] = useState<string | null>(null);

  useEffect(() => {
    if (employees.length === 0) dispatch(fetchEmployees());

    api
      .get<ProjectMember[]>(`/api/project/${projectId}/members/`)
      .then((res) => setMembers(res.data))
      .catch(() => {})
      .finally(() => setMembersLoading(false));
  }, []);

  // Exclude users already in the project (match by email)
  const existingEmails = new Set(members.map((m) => m.email));
  const available = employees.filter((e) => !existingEmails.has(e.email));

  const handleAdd = async () => {
    if (!selectedUserId) return;
    setAddError(null);

    const result = await dispatch(
      addProjectMember({ projectId, user_id: selectedUserId, role: selectedRole })
    );

    if (addProjectMember.fulfilled.match(result)) {
      setMembers((prev) => [...prev, result.payload]);
      setSelectedUserId("");
    } else {
      const err = result.payload as any;
      setAddError(
        typeof err === "string" ? err : err?.detail || "Failed to add member."
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Manage Members</h2>
            <p className="text-xs text-gray-400 mt-0.5">{projectName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-6 py-5 space-y-5 overflow-y-auto flex-1">

            {/* Add member row */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Add Member
              </p>
              <div className="flex gap-2">
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  <option value="" disabled>
                    {employeesLoading
                      ? "Loading users…"
                      : available.length === 0
                      ? "No users to add"
                      : "Select a user"}
                  </option>
                  {available.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.full_name} — {u.email}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(Number(e.target.value) as MemberRole)}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleAdd}
                  disabled={!selectedUserId || submitting}
                  type="button"
                >
                  {submitting ? "Adding…" : "Add"}
                </Button>
              </div>
              {addError && (
                <p className="mt-1 text-xs text-red-600">{addError}</p>
              )}
            </div>

            {/* Current members */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Current Members ({members.length})
              </p>
              {membersLoading ? (
                <p className="text-sm text-gray-400">Loading…</p>
              ) : members.length === 0 ? (
                <p className="text-sm text-gray-400">No members yet.</p>
              ) : (
                <ul className="space-y-2">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg bg-gray-50"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Avatar name={m.full_name} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {m.full_name}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{m.email}</p>
                        </div>
                      </div>
                      <Badge variant="default">{m.role_display}</Badge>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end px-6 py-4 border-t border-gray-100 shrink-0">
            <Button variant="secondary" onClick={onClose} type="button">
              Done
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
