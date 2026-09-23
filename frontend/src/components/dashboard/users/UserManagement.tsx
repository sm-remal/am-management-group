"use client";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  UserCheck,
  UserX,
  Users,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import Pagination from "@/components/common/Pagination";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
  updateUserStatus,
} from "@/features/users/user.api";
import type {
  CreateUserPayload,
  UpdateUserPayload,
  UserListMeta,
  UserRecord,
  UserRole,
} from "@/features/users/user.types";
import { cn } from "@/lib/utils";

type UserFormState = {
  id: string | null;
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
  isActive: boolean;
};

const initialFormState: UserFormState = {
  id: null,
  name: "",
  email: "",
  phone: "",
  password: "",
  role: "USER",
  isActive: true,
};

const passwordRule = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

const formatDate = (value: string | null) => {
  if (!value) return "Never";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const selectClassName =
  "h-9 rounded-lg border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const UserManagement = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [meta, setMeta] = useState<UserListMeta | null>(null);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState<UserRole | "ALL">("ALL");
  const [status, setStatus] = useState<"true" | "false" | "ALL">("ALL");
  const [page, setPage] = useState(1);
  const [formState, setFormState] = useState<UserFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getUsers({
        page,
        limit: 10,
        search,
        role,
        isActive: status,
      });

      setUsers(result.data?.users ?? []);
      setMeta(result.data?.meta ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users");
    } finally {
      setIsLoading(false);
    }
  }, [page, role, search, status]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadUsers();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadUsers]);

  const totals = useMemo(() => {
    return users.reduce(
      (acc, user) => {
        if (user.role === "ADMIN") acc.admin += 1;
        if (user.isActive) acc.active += 1;
        return acc;
      },
      { admin: 0, active: 0 },
    );
  }, [users]);

  const resetForm = () => {
    setFormState(initialFormState);
    setError(null);
    setSuccess(null);
  };

  const openCreateForm = () => {
    setFormState(initialFormState);
    setError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setFormState(initialFormState);
    setError(null);
  };

  const handleEdit = (user: UserRecord) => {
    setFormState({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone ?? "",
      password: "",
      role: user.role,
      isActive: user.isActive,
    });
    setError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.name.trim()) return "Name is required";
    if (!formState.email.trim()) return "Email is required";

    if (!isEditing && !passwordRule.test(formState.password)) {
      return "Password must be 8+ characters with uppercase, lowercase, number and special character";
    }

    return null;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      if (isEditing && formState.id) {
        const payload: UpdateUserPayload = {
          name: formState.name.trim(),
          email: formState.email.trim().toLowerCase(),
          phone: formState.phone.trim() || null,
          role: formState.role,
          isActive: formState.isActive,
        };

        await updateUser(formState.id, payload);
        setSuccess("User updated successfully");
      } else {
        const payload: CreateUserPayload = {
          name: formState.name.trim(),
          email: formState.email.trim().toLowerCase(),
          password: formState.password,
          phone: formState.phone.trim() || undefined,
          role: formState.role,
          isActive: formState.isActive,
        };

        await createUser(payload);
        setSuccess("User created successfully");
      }

      setFormState(initialFormState);
      setIsFormOpen(false);
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save user");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (user: UserRecord) => {
    setActionUserId(user.id);
    setError(null);
    setSuccess(null);

    try {
      await updateUserStatus(user.id, !user.isActive);
      setSuccess(
        user.isActive
          ? "User deactivated successfully"
          : "User activated successfully",
      );
      await loadUsers();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to update user status",
      );
    } finally {
      setActionUserId(null);
    }
  };

  const handleDelete = async (user: UserRecord) => {
    const confirmed = window.confirm(
      `Delete ${user.name}? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionUserId(user.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteUser(user.id);
      setSuccess("User deleted successfully");
      await loadUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete user");
    } finally {
      setActionUserId(null);
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#fb731f]">
            User Management
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Dashboard users
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage admin and user accounts, access role, status and basic
            contact information.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadUsers}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Create User
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total users</p>
            <Users className="size-5 text-[#234279]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {meta?.total ?? users.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Active on page</p>
            <UserCheck className="size-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.active}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Admins on page</p>
            <ShieldCheck className="size-5 text-[#fb731f]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {totals.admin}
          </p>
        </div>
      </section>

      <section>
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-3 border-b border-slate-200 p-4 lg:grid-cols-[minmax(0,1fr)_10rem_10rem]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder="Search name, email or phone"
                className="h-10 pl-9"
              />
            </div>

            <select
              value={role}
              onChange={(event) => {
                setRole(event.target.value as UserRole | "ALL");
                setPage(1);
              }}
              className={selectClassName}
              aria-label="Filter by role"
            >
              <option value="ALL">All roles</option>
              <option value="ADMIN">Admin</option>
              <option value="USER">User</option>
            </select>

            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as "true" | "false" | "ALL");
                setPage(1);
              }}
              className={selectClassName}
              aria-label="Filter by status"
            >
              <option value="ALL">All status</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {error && (
            <div className="m-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="m-4 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">
              <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Last login</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      <Loader2 className="mx-auto mb-3 size-6 animate-spin text-[#234279]" />
                      Loading users...
                    </td>
                  </tr>
                ) : users.length ? (
                  users.map((user) => (
                    <tr key={user.id} className="align-middle">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-700">
                            {user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-950">
                              {user.name}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                            {user.phone && (
                              <p className="truncate text-xs text-slate-400">
                                {user.phone}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            user.role === "ADMIN"
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={cn(
                            "rounded-full px-2 py-1 text-xs font-semibold",
                            user.isActive
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-rose-50 text-rose-700",
                          )}
                        >
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-slate-500">
                        {formatDate(user.lastLoginAt)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Edit3 className="size-3.5" />
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={actionUserId === user.id}
                            onClick={() => void handleStatusToggle(user)}
                          >
                            {user.isActive ? (
                              <UserX className="size-3.5" />
                            ) : (
                              <UserCheck className="size-3.5" />
                            )}
                            {user.isActive ? "Disable" : "Enable"}
                          </Button>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            disabled={actionUserId === user.id}
                            onClick={() => void handleDelete(user)}
                          >
                            <Trash2 className="size-3.5" />
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-12 text-center text-slate-500"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            page={meta?.page ?? page}
            totalPages={totalPages}
            total={meta?.total}
            onPageChange={(nextPage) => {
              if (!isLoading) setPage(nextPage);
            }}
          />
        </div>
      </section>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="user-form-title"
          onMouseDown={closeForm}
        >
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="user-form-title"
                  className="text-base font-bold text-slate-950"
                >
                  {isEditing ? "Edit user" : "Create user"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? "Update account access details."
                    : "Add a new dashboard account."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                aria-label="Close user form"
              >
                <X className="size-4" />
              </Button>
            </div>

            {error && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="user-name"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Name
                </label>
                <Input
                  id="user-name"
                  value={formState.name}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Full name"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="user-email"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Email
                </label>
                <Input
                  id="user-email"
                  type="email"
                  value={formState.email}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      email: event.target.value,
                    }))
                  }
                  placeholder="name@example.com"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="user-phone"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Phone
                </label>
                <Input
                  id="user-phone"
                  value={formState.phone}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      phone: event.target.value,
                    }))
                  }
                  placeholder="+60 12-345 6789"
                  className="h-10"
                />
              </div>

              {!isEditing && (
                <div>
                  <label
                    htmlFor="user-password"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Password
                  </label>
                  <Input
                    id="user-password"
                    type="password"
                    value={formState.password}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        password: event.target.value,
                      }))
                    }
                    placeholder="Strong password"
                    className="h-10"
                  />
                  <p className="mt-1 text-[11px] leading-4 text-slate-400">
                    Use 8+ characters with uppercase, lowercase, number and
                    special character.
                  </p>
                </div>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="user-role"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Role
                  </label>
                  <select
                    id="user-role"
                    value={formState.role}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        role: event.target.value as UserRole,
                      }))
                    }
                    className={cn(selectClassName, "w-full")}
                  >
                    <option value="USER">User</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="user-status"
                    className="mb-1.5 block text-xs font-bold text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="user-status"
                    value={formState.isActive ? "true" : "false"}
                    onChange={(event) =>
                      setFormState((current) => ({
                        ...current,
                        isActive: event.target.value === "true",
                      }))
                    }
                    className={cn(selectClassName, "w-full")}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create User"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  disabled={isSubmitting}
                >
                  Clear
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
