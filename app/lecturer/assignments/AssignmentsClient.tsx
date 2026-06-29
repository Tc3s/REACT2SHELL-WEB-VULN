"use client";

import { useTransition, useMemo, useState, useEffect } from "react";
import type { Assignment, AssignmentStatus, AssignmentType } from "./types";
import { createAssignment, deleteAssignment } from "@/lib/actions/assignment";
import Toast from "@/components/ui/Toast";

type Priority = "Low" | "Medium" | "High";

type AssignmentFileMeta = {
  name: string;
  size: number;
  type: string;
};

type DraftForm = {
  name: string; // tên
  subject: string; // môn
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD | "" (optional)
  priority: Priority;
  file: File | null;
  fileMeta: AssignmentFileMeta | null;
};

function toIsoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
}

function cls(...xs: Array<string | false | undefined | null>) {
  return xs.filter(Boolean).join(" ");
}

export default function AssignmentsClient({ initialAssignments }: { initialAssignments: Assignment[] }) {
  const [items, setItems] = useState<Assignment[]>(initialAssignments || []);
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }

  // modal create form
  const [openCreate, setOpenCreate] = useState(false);
  const [createErr, setCreateErr] = useState<string | null>(null);

  const [form, setForm] = useState<DraftForm>(() => ({
    name: "",
    subject: "",
    startDate: toIsoDate(new Date()),
    endDate: "",
    priority: "Medium",
    file: null,
    fileMeta: null
  }));

  // Sync server updates
  useEffect(() => {
    if (initialAssignments) setItems(initialAssignments);
  }, [initialAssignments]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((a) => {
      return (
        a.title.toLowerCase().includes(q) ||
        a.module.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        a.status.toLowerCase().includes(q)
      );
    });
  }, [items, query]);

  function resetCreateForm() {
    setCreateErr(null);
    setForm({
      name: "",
      subject: "",
      startDate: toIsoDate(new Date()),
      endDate: "",
      priority: "Medium",
      file: null,
      fileMeta: null
    });
  }

  function handleOpenCreate() {
    resetCreateForm();
    setOpenCreate(true);
  }

  function handleCloseCreate() {
    setOpenCreate(false);
  }

  function validateCreate(f: DraftForm) {
    if (!f.name.trim()) return "Vui lòng nhập tên bài tập.";
    if (!f.subject.trim()) return "Vui lòng nhập môn.";
    if (!f.startDate) return "Vui lòng chọn ngày bắt đầu.";

    if (f.endDate) {
      // endDate phải > startDate
      if (f.endDate <= f.startDate) return "Ngày kết thúc phải lớn hơn ngày bắt đầu.";
    }

    return null;
  }

  function onCreateSubmit() {
    const err = validateCreate(form);
    if (err) {
      setCreateErr(err);
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: form.name.trim(),
          module: form.subject.trim(),
          type: "Homework",
          dueDate: form.endDate || form.startDate,
          dueTime: "23:59",
          submissionsDone: 0,
          submissionsTotal: 128,
          status: "Published",
          startDate: form.startDate,
          endDate: form.endDate || undefined,
          priority: form.priority,
          fileMeta: form.fileMeta,
          file: form.file
        };

        // Optimistic UI
        setItems(prev => [{
          id: "temp-id-" + Date.now(),
          ...payload
        } as Assignment, ...prev]);
        setOpenCreate(false);

        // Server Action Mutate
        await createAssignment(payload);
        showToast("Đã tạo bài tập thành công", "success");
      } catch (e: any) {
        setCreateErr("Failed to create assignment");
        showToast("Lỗi tạo bài tập", "error");
      }
    });
  }

  function onDelete(a: Assignment) {
    const ok = confirm(`Xóa bài tập "${a.title}"?`);
    if (!ok) return;

    startTransition(async () => {
      setItems((prev) => prev.filter((x) => x.id !== a.id));
      await deleteAssignment(a.id);
      showToast("Đã xóa bài tập thành công", "success");
    });
  }

  return (
    <div className="w-full">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="space-y-1">
          <nav className="flex items-center gap-2 text-on-surface-variant text-[11px] font-bold uppercase tracking-[0.1em] mb-3">
            <span className="hover:text-primary cursor-pointer">Courses</span>
            <span className="text-on-surface-variant">/</span>
            <span className="hover:text-primary cursor-pointer">PHY-402</span>
            <span className="text-on-surface-variant">/</span>
            <span className="text-primary">Assignments</span>
          </nav>

          <h1 className="text-[2.2rem] md:text-[2.75rem] font-bold tracking-[-0.03em] leading-none text-on-surface">
            Assignment Management
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          disabled={isPending}
          className="group relative h-12 md:h-14 px-8 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 animate-gradient bg-[length:200%_200%] text-white font-extrabold rounded-2xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform">add</span>
          {isPending ? "Đang xử lý..." : "Create Assignment"}
        </button>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="text-[11px] text-on-surface-variant font-medium">
          Total: <span className="font-bold text-on-surface">{items.length}</span>
        </div>

        <div className="relative group w-full md:w-80">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
            Search
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-surface-container-low border-none rounded-xl pl-16 pr-4 py-2.5 text-sm w-full focus:ring-2 focus:ring-primary/20 transition-all"
            placeholder="Search assignments..."
            type="text"
          />
        </div>
      </div>

      {/* Table */}
      <section className="bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 overflow-hidden mb-12">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low/50">
              <tr>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Title
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Type
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Due Date
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Submissions
                </th>
                <th className="px-6 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
                  Status
                </th>
                <th className="px-8 py-4 text-[10px] font-bold text-on-surface-variant uppercase tracking-widest text-right">
                  Thao tác
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-surface-container-low">
              {filtered.map((a) => {
                const pct =
                  a.submissionsTotal > 0 ? Math.round((a.submissionsDone / a.submissionsTotal) * 100) : 0;

                return (
                  <tr key={a.id} className="hover:bg-indigo-50/30 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-white group-hover:shadow-sm transition-all">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">{a.title}</p>
                          <p className="text-[11px] text-on-surface-variant">{a.module}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        {a.type}
                      </span>
                    </td>

                    <td className="px-6 py-6">
                      <p className="text-sm font-medium text-on-surface">{formatDate(a.dueDate)}</p>
                      <p className="text-[10px] text-on-surface-variant font-medium">{a.dueTime ?? ""}</p>
                    </td>

                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden min-w-[80px]">
                          <div
                            className={cls("h-full", a.status === "Draft" ? "bg-slate-300" : "bg-emerald-500")}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span
                          className={cls(
                            "text-[11px] font-bold whitespace-nowrap",
                            a.status === "Draft" ? "text-slate-400" : "text-on-surface"
                          )}
                        >
                          {a.submissionsDone} / {a.submissionsTotal}
                        </span>
                      </div>
                    </td>

                    <td className="px-6 py-6">
                      <span
                        className={cls(
                          "flex items-center gap-1.5 text-[11px] font-bold",
                          a.status === "Published" ? "text-emerald-700" : "text-on-surface-variant"
                        )}
                      >
                        <span
                          className={cls(
                            "w-1.5 h-1.5 rounded-full",
                            a.status === "Published" ? "bg-emerald-500" : "bg-on-surface-variant"
                          )}
                        />
                        {a.status}
                      </span>
                    </td>

                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => onDelete(a)}
                          className="px-3 py-2 hover:bg-white rounded-lg text-on-surface-variant hover:text-error transition-all shadow-sm text-[11px] font-bold"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {!filtered.length && (
                <tr>
                  <td className="px-8 py-10 text-sm text-on-surface-variant" colSpan={6}>
                    Không có bài tập nào khớp tìm kiếm.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Floating button */}
      <div className="fixed bottom-10 right-10">
        <button
          onClick={handleOpenCreate}
          className="bg-gradient-to-br from-indigo-700 to-indigo-500 text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Create assignment"
          title="Tạo bài tập"
        >
          <span className="text-sm font-extrabold leading-none text-center">
            Tạo
            <br />
            mới
          </span>
        </button>
      </div>

      {/* ===== Create Modal ===== */}
      {openCreate && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={handleCloseCreate} />

          <div className="relative w-[min(860px,92vw)] bg-white rounded-2xl shadow-2xl p-6 md:p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">Tạo bài tập</h2>
                <p className="text-xs text-slate-500">Nhập thông tin bài tập và đính kèm file.</p>
              </div>

              <button
                onClick={handleCloseCreate}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            {createErr && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 font-semibold">
                {createErr}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Tên */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Tên</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="VD: Lab 4 - Bài tập về dao động"
                />
              </div>

              {/* Môn */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Môn</label>
                <input
                  value={form.subject}
                  onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  placeholder="VD: Advanced Physics"
                />
              </div>

              {/* Ngày bắt đầu */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Ngày bắt đầu</label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>

              {/* Ngày kết thúc (optional) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Ngày kết thúc <span className="text-slate-400 font-semibold">(tuỳ chọn)</span>
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
                <p className="mt-2 text-[11px] text-slate-500">
                  Nếu nhập, ngày kết thúc phải lớn hơn ngày bắt đầu.
                </p>
              </div>

              {/* Priority */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">Mức độ ưu tiên</label>
                <div className="flex flex-wrap gap-3">
                  {(["Low", "Medium", "High"] as Priority[]).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setForm((prev) => ({ ...prev, priority: p }))}
                      className={cls(
                        "px-4 py-2 rounded-full text-xs font-extrabold border transition",
                        form.priority === p
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* File */}
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">File bài tập</label>

                <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-5">
                  <input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setForm((prev) => ({
                        ...prev,
                        file,
                        fileMeta: file
                          ? { name: file.name, size: file.size, type: file.type }
                          : null
                      }));
                    }}
                    className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-indigo-600 file:px-4 file:py-2 file:text-sm file:font-bold file:text-white hover:file:bg-indigo-700"
                  />

                  {form.fileMeta ? (
                    <div className="mt-3 text-sm text-slate-700">
                      <div className="font-bold">{form.fileMeta.name}</div>
                      <div className="text-[11px] text-slate-500">
                        {(form.fileMeta.size / 1024).toFixed(1)} KB • {form.fileMeta.type || "unknown"}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-3 text-[11px] text-slate-500">
                      Chọn file (PDF/DOCX/ZIP...). Metadata được lưu trên Server.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 mt-8">
              <button
                onClick={handleCloseCreate}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-sm font-bold hover:bg-slate-50"
              >
                Hủy
              </button>
              <button
                onClick={onCreateSubmit}
                className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-700 to-indigo-500 text-white text-sm font-extrabold hover:opacity-95"
              >
                Tạo bài tập
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && <Toast message={toast.message} type={toast.type} />}
    </div>
  );
}