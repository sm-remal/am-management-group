"use client";

import {
  AlertCircle,
  CheckCircle2,
  Edit3,
  Globe2,
  Loader2,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Pagination from "@/components/common/Pagination";
import {
  createSetting,
  deleteSetting,
  getSettings,
  updateSetting,
  upsertSettings,
} from "@/features/settings/setting.api";
import type {
  SettingListMeta,
  SettingRecord,
} from "@/features/settings/setting.types";
import { invalidatePublicSettings } from "@/features/settings/usePublicSettings";
import { cn } from "@/lib/utils";

type SettingFormState = {
  id: string | null;
  key: string;
  value: string;
};

type QuickSettingField = {
  key: string;
  label: string;
  placeholder: string;
  multiline?: boolean;
};

const initialFormState: SettingFormState = {
  id: null,
  key: "",
  value: "",
};

const quickSettingGroups: Array<{
  title: string;
  icon: LucideIcon;
  fields: QuickSettingField[];
}> = [
  {
    title: "Company Info",
    icon: Globe2,
    fields: [
      {
        key: "site.name",
        label: "Site Name",
        placeholder: "AM Management Group",
      },
      {
        key: "site.tagline",
        label: "Tagline",
        placeholder: "One Group. Multiple Businesses.",
      },
      {
        key: "site.description",
        label: "Description",
        placeholder: "Short company overview",
        multiline: true,
      },
      {
        key: "site.business_hours",
        label: "Business Hours",
        placeholder: "Monday - Friday: 8:30 AM - 5:30 PM",
        multiline: true,
      },
      {
        key: "site.website_logo",
        label: "Website Logo URL",
        placeholder: "https://example.com/logo.png",
      },
    ],
  },
  {
    title: "Contact Info",
    icon: Phone,
    fields: [
      { key: "contact.phone", label: "Phone", placeholder: "+60 12-345 6789" },
      {
        key: "contact.whatsapp",
        label: "WhatsApp Number",
        placeholder: "60123456789",
      },
      { key: "contact.email", label: "Email (primary)", placeholder: "info@example.com" },
      { key: "contact.email_alt", label: "Email (secondary)", placeholder: "office@example.com" },
      {
        key: "contact.address",
        label: "Address",
        placeholder: "Company address",
        multiline: true,
      },
    ],
  },
  {
    title: "Social & SEO",
    icon: Share2,
    fields: [
      {
        key: "social.facebook",
        label: "Facebook",
        placeholder: "https://facebook.com/...",
      },
      {
        key: "social.linkedin",
        label: "LinkedIn",
        placeholder: "https://linkedin.com/...",
      },
      {
        key: "social.instagram",
        label: "Instagram",
        placeholder: "https://instagram.com/...",
      },
      {
        key: "social.twitter",
        label: "Twitter / X",
        placeholder: "https://x.com/...",
      },
      {
        key: "seo.title",
        label: "SEO Title",
        placeholder: "Homepage SEO title",
      },
      {
        key: "seo.description",
        label: "SEO Description",
        placeholder: "Homepage SEO description",
        multiline: true,
      },
    ],
  },
];

const quickSettingKeys = quickSettingGroups.flatMap((group) =>
  group.fields.map((field) => field.key),
);

const settingKeyRule = /^[A-Za-z0-9_.:-]+$/;

const formatDate = (value: string) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const SettingsManagement = () => {
  const [settings, setSettings] = useState<SettingRecord[]>([]);
  const [meta, setMeta] = useState<SettingListMeta | null>(null);
  const [quickValues, setQuickValues] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [formState, setFormState] =
    useState<SettingFormState>(initialFormState);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingQuick, setIsSavingQuick] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionSettingId, setActionSettingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isEditing = Boolean(formState.id);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const [listResult, quickResult] = await Promise.all([
        getSettings({ page, limit: 10, search }),
        getSettings({ page: 1, limit: 200 }),
      ]);

      setSettings(listResult.data?.settings ?? []);
      setMeta(listResult.data?.meta ?? null);

      const nextQuickValues: Record<string, string> = {};
      quickSettingKeys.forEach((key) => {
        nextQuickValues[key] =
          quickResult.data?.settings.find((setting) => setting.key === key)
            ?.value ?? "";
      });
      setQuickValues(nextQuickValues);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load settings");
    } finally {
      setIsLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSettings();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSettings]);

  const settingMap = useMemo(() => {
    return settings.reduce<Record<string, string>>((result, setting) => {
      result[setting.key] = setting.value;
      return result;
    }, {});
  }, [settings]);

  const customSettingsCount = useMemo(() => {
    return settings.filter((setting) => !quickSettingKeys.includes(setting.key))
      .length;
  }, [settings]);

  const resetForm = () => {
    setFormState(initialFormState);
    setFormError(null);
  };

  const openCreateForm = () => {
    setFormState(initialFormState);
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    resetForm();
  };

  const handleEdit = (setting: SettingRecord) => {
    setFormState({
      id: setting.id,
      key: setting.key,
      value: setting.value,
    });
    setFormError(null);
    setSuccess(null);
    setIsFormOpen(true);
  };

  const validateForm = () => {
    if (!formState.key.trim()) return "Setting key is required";
    if (!settingKeyRule.test(formState.key.trim())) {
      return "Setting key can only contain letters, numbers, underscore, dot, colon and hyphen";
    }

    return null;
  };

  const handleQuickChange = (key: string, value: string) => {
    setQuickValues((current) => ({ ...current, [key]: value }));
  };

  const handleSaveQuickSettings = async () => {
    setIsSavingQuick(true);
    setError(null);
    setSuccess(null);

    try {
      await upsertSettings({
        settings: quickSettingKeys.map((key) => ({
          key,
          value: quickValues[key] ?? "",
        })),
      });
      invalidatePublicSettings();
      setSuccess("Settings saved successfully");
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings");
    } finally {
      setIsSavingQuick(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateForm();

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    setError(null);
    setSuccess(null);

    try {
      if (isEditing && formState.id) {
        await updateSetting(formState.id, {
          key: formState.key.trim(),
          value: formState.value,
        });
        invalidatePublicSettings();
        setSuccess("Setting updated successfully");
      } else {
        await createSetting({
          key: formState.key.trim(),
          value: formState.value,
        });
        invalidatePublicSettings();
        setSuccess("Setting created successfully");
      }

      closeForm();
      await loadSettings();
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Unable to save setting",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (setting: SettingRecord) => {
    const confirmed = window.confirm(
      `Delete setting "${setting.key}"? This action cannot be undone.`,
    );
    if (!confirmed) return;

    setActionSettingId(setting.id);
    setError(null);
    setSuccess(null);

    try {
      await deleteSetting(setting.id);
      invalidatePublicSettings();
      setSuccess("Setting deleted successfully");
      await loadSettings();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete setting");
    } finally {
      setActionSettingId(null);
    }
  };

  const totalPages = meta?.totalPage || 1;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#fb731f]">
            Website Settings
          </p>
          <h1 className="mt-1 text-2xl font-bold tracking-normal text-slate-950 md:text-3xl">
            Dashboard settings
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Manage global website configuration, contact details, SEO text and
            custom key-value settings.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={loadSettings}
            disabled={isLoading}
          >
            <RefreshCw className={cn("size-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Add Setting
          </Button>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Total settings</p>
            <Settings className="size-5 text-[#234279]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {meta?.total ?? settings.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Quick fields</p>
            <Globe2 className="size-5 text-emerald-600" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {quickSettingKeys.length}
          </p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500">Custom on page</p>
            <Share2 className="size-5 text-[#fb731f]" />
          </div>
          <p className="mt-3 text-3xl font-bold text-slate-950">
            {customSettingsCount}
          </p>
        </div>
      </section>

      {(error || success) && (
        <section
          className={cn(
            "flex items-start gap-2 rounded-lg border p-3 text-sm",
            error
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-emerald-200 bg-emerald-50 text-emerald-700",
          )}
        >
          {error ? (
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
          )}
          <p>{error || success}</p>
        </section>
      )}

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Quick website settings
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Common settings used across public website pages.
            </p>
          </div>
          <Button
            type="button"
            onClick={() => void handleSaveQuickSettings()}
            disabled={isSavingQuick || isLoading}
          >
            {isSavingQuick ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            Save Settings
          </Button>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-3">
          {quickSettingGroups.map((group) => {
            const Icon = group.icon;

            return (
              <div
                key={group.title}
                className="rounded-lg border border-slate-200 p-4"
              >
                <div className="mb-4 flex items-center gap-2">
                  <Icon className="size-4 text-[#234279]" />
                  <h3 className="text-sm font-bold text-slate-950">
                    {group.title}
                  </h3>
                </div>

                <div className="space-y-4">
                  {group.fields.map((field) => (
                    <div key={field.key}>
                      <label
                        htmlFor={field.key}
                        className="mb-1.5 block text-xs font-bold text-slate-700"
                      >
                        {field.label}
                      </label>
                      {field.multiline ? (
                        <textarea
                          id={field.key}
                          value={quickValues[field.key] ?? ""}
                          onChange={(event) =>
                            handleQuickChange(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          rows={4}
                          className="min-h-24 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                        />
                      ) : (
                        <Input
                          id={field.key}
                          value={quickValues[field.key] ?? ""}
                          onChange={(event) =>
                            handleQuickChange(field.key, event.target.value)
                          }
                          placeholder={field.placeholder}
                          className="h-10"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="grid gap-3 border-b border-slate-200 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <Input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search setting key or value"
              className="h-10 pl-9"
            />
          </div>
          <Button type="button" onClick={openCreateForm}>
            <Plus className="size-4" />
            Add Setting
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Key</th>
                <th className="px-4 py-3 font-semibold">Value</th>
                <th className="px-4 py-3 font-semibold">Updated</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    <Loader2 className="mx-auto mb-3 size-6 animate-spin text-[#234279]" />
                    Loading settings...
                  </td>
                </tr>
              ) : settings.length ? (
                settings.map((setting) => (
                  <tr key={setting.id} className="align-middle">
                    <td className="px-4 py-4">
                      <code className="rounded bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-700">
                        {setting.key}
                      </code>
                    </td>
                    <td className="max-w-lg px-4 py-4">
                      <p className="line-clamp-2 text-slate-600">
                        {setting.value || (
                          <span className="text-slate-400">Empty value</span>
                        )}
                      </p>
                      {settingMap[setting.key] !== undefined && (
                        <p className="mt-1 text-xs text-slate-400">
                          {setting.value.length} characters
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-slate-500">
                      {formatDate(setting.updatedAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(setting)}
                        >
                          <Edit3 className="size-3.5" />
                          Edit
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          disabled={actionSettingId === setting.id}
                          onClick={() => void handleDelete(setting)}
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
                    colSpan={4}
                    className="px-4 py-12 text-center text-slate-500"
                  >
                    No settings found
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
      </section>

      {isFormOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="setting-form-title"
          onMouseDown={closeForm}
        >
          <form
            onSubmit={(event) => void handleSubmit(event)}
            className="w-full max-w-lg rounded-lg border border-slate-200 bg-white p-5 shadow-xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2
                  id="setting-form-title"
                  className="text-base font-bold text-slate-950"
                >
                  {isEditing ? "Edit setting" : "Add setting"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {isEditing
                    ? "Update a custom website setting."
                    : "Create a custom key-value setting."}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={closeForm}
                aria-label="Close setting form"
              >
                <X className="size-4" />
              </Button>
            </div>

            {formError && (
              <div className="mb-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                <AlertCircle className="mt-0.5 size-4 shrink-0" />
                <p>{formError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="setting-key"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Key
                </label>
                <Input
                  id="setting-key"
                  value={formState.key}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      key: event.target.value,
                    }))
                  }
                  placeholder="site.custom_key"
                  className="h-10"
                />
                <p className="mt-1 text-[11px] leading-4 text-slate-400">
                  Use letters, numbers, underscore, dot, colon or hyphen.
                </p>
              </div>

              <div>
                <label
                  htmlFor="setting-value"
                  className="mb-1.5 block text-xs font-bold text-slate-700"
                >
                  Value
                </label>
                <textarea
                  id="setting-value"
                  value={formState.value}
                  onChange={(event) =>
                    setFormState((current) => ({
                      ...current,
                      value: event.target.value,
                    }))
                  }
                  placeholder="Setting value"
                  rows={6}
                  className="min-h-32 w-full resize-y rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="size-4 animate-spin" />}
                  {isEditing ? "Save Changes" : "Create Setting"}
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

export default SettingsManagement;
