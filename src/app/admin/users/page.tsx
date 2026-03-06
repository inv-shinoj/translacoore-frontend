"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUsers, updateUser, deleteUser, setUserActive } from "@/store/slices/usersSlice";
import { User, UserRole } from "@/types/user";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import Table from "@/components/ui/Table";
import Alert from "@/components/ui/Alert";
import LoadingState from "@/components/ui/LoadingState";
import EmptyState from "@/components/ui/EmptyState";
import CreateUserModal from "@/components/users/CreateUserModal";

const ROLE_OPTIONS: { label: UserRole; value: number }[] = [
  { label: "Admin", value: 1 },
  { label: "Manager", value: 2 },
  { label: "Team Lead", value: 3 },
  { label: "Employee", value: 4 },
];

const roleBadgeVariant: Record<UserRole, "error" | "warning" | "info" | "default"> = {
  Admin: "error",
  Manager: "warning",
  "Team Lead": "info",
  Employee: "default",
};

export default function UsersPage() {
  const dispatch = useAppDispatch();
  const { list: users, loading, error } = useAppSelector((s) => s.users);
  const currentUser = useAppSelector((s) => s.auth.user);

  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleRoleChange = async (user: User, newRoleValue: number) => {
    const result = await dispatch(updateUser({ id: user.id, role: newRoleValue }));
    if (updateUser.fulfilled.match(result)) {
      toast.success(`Role updated for ${user.full_name ?? user.email}`);
    } else {
      toast.error((result.payload as string) ?? "Failed to update role");
    }
  };

  const handleDeactivate = async (user: User) => {
    if (!confirm(`Deactivate ${user.full_name ?? user.email}? They will lose access immediately.`)) return;
    const result = await dispatch(setUserActive({ id: user.id, is_active: false }));
    if (setUserActive.fulfilled.match(result)) {
      toast.success(`${user.full_name ?? user.email} has been deactivated.`);
    } else {
      toast.error((result.payload as string) ?? "Failed to deactivate user");
    }
  };

  const handleActivate = async (user: User) => {
    const result = await dispatch(setUserActive({ id: user.id, is_active: true }));
    if (setUserActive.fulfilled.match(result)) {
      toast.success(`${user.full_name ?? user.email} has been activated.`);
    } else {
      toast.error((result.payload as string) ?? "Failed to activate user");
    }
  };

  const isAdmin = currentUser?.role === "Admin";

  const columns = [
    {
      key: "name",
      header: "User",
      render: (user: User) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.full_name ?? user.email} size="sm" />
          <span className="font-medium text-gray-900">{user.full_name ?? "—"}</span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (user: User) => <span className="text-gray-500">{user.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (user: User) =>
        isAdmin ? (
          <select
            value={ROLE_OPTIONS.find((r) => r.label === user.role)?.value ?? 4}
            onChange={(e) => handleRoleChange(user, Number(e.target.value))}
            disabled={!user.is_active}
            className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        ) : (
          <Badge variant={roleBadgeVariant[user.role] ?? "default"}>
            {user.role}
          </Badge>
        ),
    },
    {
      key: "status",
      header: "Status",
      render: (user: User) => (
        <Badge variant={user.is_active ? "success" : "default"}>
          {user.is_active ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    ...(isAdmin
      ? [
          {
            key: "actions",
            header: "",
            render: (user: User) =>
              user.is_active ? (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDeactivate(user)}
                  >
                    Deactivate
                  </Button>
                </div>
              ) : (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => handleActivate(user)}
                  >
                    Activate
                  </Button>
                </div>
              ),
          },
        ]
      : []),
  ];

  return (
    <>
      <PageHeader
        title="Users"
        description="Manage team members and their roles."
        actions={
          isAdmin ? (
            <Button onClick={() => setShowCreate(true)}>+ Add User</Button>
          ) : undefined
        }
      />

      {loading && <LoadingState message="Loading users…" />}

      {!loading && error && <Alert variant="error">{error}</Alert>}

      {!loading && !error && users.length === 0 && (
        <EmptyState
          title="No users found"
          description="Add team members to get started."
        />
      )}

      {!loading && users.length > 0 && (
        <Card padding="none">
          <Table columns={columns} data={users} keyExtractor={(u) => u.id} />
        </Card>
      )}

      {showCreate && <CreateUserModal onClose={() => setShowCreate(false)} />}
    </>
  );
}
