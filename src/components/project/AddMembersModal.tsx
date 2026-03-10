"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchEmployees,
  addProjectMember,
  removeProjectMember,
  updateProjectMemberRole,
} from "@/store/slices/projectSlice";
import { ProjectMember, MemberRole } from "@/types/api";
import { toast } from "sonner";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Alert from "@/components/ui/Alert";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";
import Select from "@/components/ui/Select";
import LoadingState from "@/components/ui/LoadingState";
import Spinner from "@/components/ui/Spinner";

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
  const { employees, employeesLoading, employeesError, submitting } = useAppSelector((s) => s.project);

  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [membersLoading, setMembersLoading] = useState(true);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedRole, setSelectedRole] = useState<MemberRole>(3);
  const [removingMemberId, setRemovingMemberId] = useState<number | null>(null);
  const [updatingMemberId, setUpdatingMemberId] = useState<number | null>(null);

  const loadMembers = async () => {
    setMembersLoading(true);
    setMembersError(null);

    try {
      const res = await api.get<ProjectMember[]>(`/api/project/${projectId}/members/`);
      setMembers(res.data);
    } catch (err: any) {
      setMembersError(err?.response?.data?.detail ?? "Failed to load current project members.");
    } finally {
      setMembersLoading(false);
    }
  };

  useEffect(() => {
    if (employees.length === 0) {
      dispatch(fetchEmployees());
    }
    loadMembers();
  }, [dispatch, employees.length, projectId]);

  // Exclude users already in the project (match by email)
  const existingEmails = new Set(members.map((m) => m.email));
  const available = employees.filter((e) => !existingEmails.has(e.email));

  const handleAdd = async () => {
    if (!selectedUserId) return;

    const selectedUser = employees.find((employee) => employee.id === selectedUserId);
    const tempId = -Date.now();

    const optimisticMember: ProjectMember = {
      id: tempId,
      full_name: selectedUser?.full_name ?? "New Member",
      email: selectedUser?.email ?? "",
      role: selectedRole,
      role_display: selectedRole === 2 ? "Lead" : "Employee",
      assigned_at: new Date().toISOString(),
    };

    setMembers((prev) => [...prev, optimisticMember]);
    setSelectedUserId("");

    const result = await dispatch(
      addProjectMember({ projectId, user_id: selectedUserId, role: selectedRole })
    );

    if (addProjectMember.fulfilled.match(result)) {
      setMembers((prev) => prev.map((member) => (member.id === tempId ? result.payload : member)));
    } else {
      setMembers((prev) => prev.filter((member) => member.id !== tempId));
      const err = result.payload as any;
      toast.error(typeof err === "string" ? err : err?.detail || "Failed to add member.");
    }
  };

  const handleRemove = async (memberId: number) => {
    const removedMember = members.find((member) => member.id === memberId);
    if (!removedMember) return;

    setRemovingMemberId(memberId);
    setMembers((prev) => prev.filter((member) => member.id !== memberId));

    const result = await dispatch(removeProjectMember({ projectId, memberId }));

    if (!removeProjectMember.fulfilled.match(result)) {
      setMembers((prev) => {
        if (prev.some((member) => member.id === removedMember.id)) return prev;
        return [...prev, removedMember];
      });
      const err = result.payload as any;
      toast.error(typeof err === "string" ? err : err?.detail || "Failed to remove member.");
    }

    setRemovingMemberId(null);
  };

  const handleRoleChange = async (memberId: number, nextRole: MemberRole) => {
    const existingMember = members.find((member) => member.id === memberId);
    if (!existingMember || existingMember.role === nextRole) return;

    setUpdatingMemberId(memberId);

    setMembers((prev) =>
      prev.map((member) =>
        member.id === memberId
          ? {
              ...member,
              role: nextRole,
              role_display: nextRole === 2 ? "Lead" : "Employee",
            }
          : member
      )
    );

    const result = await dispatch(
      updateProjectMemberRole({ projectId, memberId, role: nextRole })
    );

    if (updateProjectMemberRole.fulfilled.match(result)) {
      setMembers((prev) =>
        prev.map((member) => (member.id === memberId ? result.payload : member))
      );
    } else {
      setMembers((prev) =>
        prev.map((member) => (member.id === memberId ? existingMember : member))
      );
      const err = result.payload as any;
      toast.error(typeof err === "string" ? err : err?.detail || "Failed to update member role.");
    }

    setUpdatingMemberId(null);
  };

  return (
    <Modal title="Manage Members" subtitle={projectName} onClose={onClose}>
      <div className="flex flex-col flex-1 overflow-hidden">
        <ModalBody>

            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Add Member
              </p>
              <div className="flex flex-col gap-2">
                {employeesError && <Alert variant="error">{employeesError}</Alert>}
                {/* User selector — full width */}
                <Select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
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
                </Select>

                <div className="flex gap-2">
                  <Select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(Number(e.target.value) as MemberRole)}
                    className="flex-1"
                  >
                    {ROLE_OPTIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleAdd}
                    disabled={!selectedUserId || submitting}
                    type="button"
                    className="shrink-0"
                  >
                    {submitting ? (
                      <span className="flex items-center gap-1.5">
                        <Spinner size="xs" className="border-white/50 border-t-white" />
                        Adding…
                      </span>
                    ) : "Add Member"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Current members */}
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Current Members ({members.length})
              </p>
              {membersLoading ? (
                <LoadingState message="Loading members…" size="sm" />
              ) : membersError ? (
                <div className="space-y-2">
                  <Alert variant="error">{membersError}</Alert>
                  <Button type="button" variant="secondary" size="sm" onClick={loadMembers}>
                    Retry
                  </Button>
                </div>
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
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1.5">
                          <Select
                            value={m.role}
                            onChange={(e) =>
                              handleRoleChange(m.id, Number(e.target.value) as MemberRole)
                            }
                            disabled={submitting || removingMemberId === m.id || updatingMemberId === m.id}
                            className="min-w-[120px]"
                          >
                            {ROLE_OPTIONS.map((r) => (
                              <option key={r.value} value={r.value}>
                                {r.label}
                              </option>
                            ))}
                          </Select>
                          {updatingMemberId === m.id && (
                            <Spinner size="xs" />
                          )}
                        </div>
                        <Badge variant="default">{m.role_display}</Badge>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemove(m.id)}
                          disabled={submitting || removingMemberId === m.id || updatingMemberId === m.id}
                        >
                          {removingMemberId === m.id ? "Removing…" : "Remove"}
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
        </ModalBody>

        <ModalFooter>
          <Button variant="secondary" onClick={onClose} type="button">
            Done
          </Button>
        </ModalFooter>
      </div>
    </Modal>
  );
}
