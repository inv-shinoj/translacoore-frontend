"use client";

import { useState } from "react";
import { useAppDispatch } from "@/store/hooks";
import { createUser } from "@/store/slices/usersSlice";
import { toast } from "sonner";
import Modal, { ModalBody, ModalFooter } from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import FormField from "@/components/ui/FormField";
import Input from "@/components/ui/Input";
import Alert from "@/components/ui/Alert";

const ROLE_OPTIONS = [
  { label: "Employee", value: 4 },
  { label: "Team Lead", value: 3 },
  { label: "Manager", value: 2 },
  { label: "Admin", value: 1 },
];

interface Props {
  onClose: () => void;
}

export default function CreateUserModal({ onClose }: Props) {
  const dispatch = useAppDispatch();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: 4,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!form.full_name.trim() || !form.email.trim() || !form.password.trim()) {
      setError("All fields are required.");
      return;
    }

    setLoading(true);
    const result = await dispatch(createUser(form));
    setLoading(false);

    if (createUser.fulfilled.match(result)) {
      toast.success(`User "${form.full_name}" created successfully.`);
      onClose();
    } else {
      setError((result.payload as string) ?? "Failed to create user.");
    }
  };

  return (
    <Modal
      title="Create User"
      subtitle="Add a new user to the system"
      onClose={onClose}
    >
      <ModalBody>
        {error && <Alert variant="error">{error}</Alert>}

        <FormField label="Full Name" required>
          <Input
            placeholder="John Doe"
            value={form.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
          />
        </FormField>

        <FormField label="Email" required>
          <Input
            type="email"
            placeholder="john@example.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
          />
        </FormField>

        <FormField label="Password" required>
          <Input
            type="password"
            placeholder="Min. 8 characters"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
          />
        </FormField>

        <FormField label="Role" required>
          <select
            value={form.role}
            onChange={(e) => handleChange("role", Number(e.target.value))}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </FormField>
      </ModalBody>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? "Creating…" : "Create User"}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
