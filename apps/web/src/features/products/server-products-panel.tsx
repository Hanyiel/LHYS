"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  createServer,
  deleteServer,
  listServers,
  updateServer,
  type ServerProduct,
} from "@/lib/product-api";

const defaultForm = {
  serverName: "",
  ipAddress: "",
  provider: "",
  purchaseDate: "",
  expiryDate: "",
  price: "",
  ownershipStartDate: "",
  lastRenewedAt: "",
  status: "active",
  notes: "",
};

export function ServerProductsPanel() {
  const [items, setItems] = useState<ServerProduct[]>([]);
  const [form, setForm] = useState(defaultForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      setItems(await listServers());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "无法加载服务器列表");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    listServers()
      .then((nextItems) => {
        if (active) {
          setItems(nextItems);
        }
      })
      .catch((cause) => {
        if (active) {
          setError(cause instanceof Error ? cause.message : "无法加载服务器列表");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const request = {
        serverName: form.serverName.trim(),
        ipAddress: form.ipAddress.trim(),
        provider: form.provider.trim() || undefined,
        purchaseDate: form.purchaseDate || undefined,
        expiryDate: form.expiryDate || undefined,
        price: form.price ? Number(form.price) : undefined,
        ownershipStartDate: form.ownershipStartDate || undefined,
        lastRenewedAt: form.lastRenewedAt || undefined,
        status: form.status.trim() || "active",
        notes: form.notes.trim() || undefined,
      };

      if (editingId) {
        await updateServer(editingId, request);
        setMessage("服务器信息已更新");
      } else {
        await createServer(request);
        setMessage("服务器已添加");
      }

      setForm(defaultForm);
      setEditingId(null);
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  }

  function edit(item: ServerProduct) {
    setEditingId(item.id);
    setForm({
      serverName: item.serverName,
      ipAddress: item.ipAddress,
      provider: item.provider ?? "",
      purchaseDate: item.purchaseDate ?? "",
      expiryDate: item.expiryDate ?? "",
      price: item.price == null ? "" : String(item.price),
      ownershipStartDate: item.ownershipStartDate ?? "",
      lastRenewedAt: item.lastRenewedAt ?? "",
      status: item.status ?? "active",
      notes: item.notes ?? "",
    });
    setMessage("");
    setError("");
  }

  async function remove(id: number) {
    if (!window.confirm("确认删除这台服务器吗？")) {
      return;
    }
    await deleteServer(id);
    await refresh();
  }

  return (
    <ProductPanelLayout
      title={editingId ? "编辑服务器" : "添加服务器"}
      error={error}
      message={message}
      form={
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <TextField label="服务器名称" value={form.serverName} onChange={(serverName) => setForm({ ...form, serverName })} />
          <TextField label="IP 地址" value={form.ipAddress} onChange={(ipAddress) => setForm({ ...form, ipAddress })} />
          <TextField label="服务商" value={form.provider} onChange={(provider) => setForm({ ...form, provider })} />
          <div className="grid gap-4 md:grid-cols-2">
            <TextField type="date" label="购入时间" value={form.purchaseDate} onChange={(purchaseDate) => setForm({ ...form, purchaseDate })} />
            <TextField type="date" label="预计过期时间" value={form.expiryDate} onChange={(expiryDate) => setForm({ ...form, expiryDate })} />
            <TextField type="number" label="购入价格" value={form.price} onChange={(price) => setForm({ ...form, price })} />
            <TextField type="date" label="拥有时间" value={form.ownershipStartDate} onChange={(ownershipStartDate) => setForm({ ...form, ownershipStartDate })} />
            <TextField type="date" label="最后续费时间" value={form.lastRenewedAt} onChange={(lastRenewedAt) => setForm({ ...form, lastRenewedAt })} />
            <TextField label="状态" value={form.status} onChange={(status) => setForm({ ...form, status })} />
          </div>
          <TextAreaField label="备注" value={form.notes} onChange={(notes) => setForm({ ...form, notes })} />
          <div className="flex gap-3">
            <Button type="submit" className="h-10" disabled={submitting}>
              {submitting ? "保存中..." : editingId ? "保存修改" : "添加服务器"}
            </Button>
            {editingId ? (
              <Button type="button" variant="outline" onClick={() => {
                setEditingId(null);
                setForm(defaultForm);
              }}>
                取消编辑
              </Button>
            ) : null}
          </div>
        </form>
      }
      list={
        <ProductTable
          loading={loading}
          itemCount={items.length}
          emptyText="还没有服务器记录"
          headers={["名称", "IP", "服务商", "过期时间", "价格", "状态", "操作"]}
        >
          {items.map((item) => (
            <tr key={item.id}>
              <Cell strong>{item.serverName}</Cell>
              <Cell>{item.ipAddress}</Cell>
              <Cell>{item.provider ?? "-"}</Cell>
              <Cell>{item.expiryDate ?? "-"}</Cell>
              <Cell>{item.price == null ? "-" : `¥${item.price}`}</Cell>
              <Cell>{item.status}</Cell>
              <Cell>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => edit(item)}>编辑</Button>
                  <Button type="button" variant="outline" onClick={() => void remove(item.id)}>删除</Button>
                </div>
              </Cell>
            </tr>
          ))}
        </ProductTable>
      }
    />
  );
}

function ProductPanelLayout({
  title,
  error,
  message,
  form,
  list,
}: {
  title: string;
  error: string;
  message: string;
  form: ReactNode;
  list: ReactNode;
}) {
  return (
    <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">{title}</h2>
        <div className="mt-5 grid gap-4">
          {error ? <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}
          {message ? <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
          {form}
        </div>
      </section>
      <section className="rounded-md border border-zinc-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-zinc-950">服务器列表</h2>
        <div className="mt-5">{list}</div>
      </section>
    </div>
  );
}

function ProductTable({
  loading,
  itemCount,
  emptyText,
  headers,
  children,
}: {
  loading: boolean;
  itemCount: number;
  emptyText: string;
  headers: string[];
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-zinc-200">
      <table className="min-w-full divide-y divide-zinc-200 text-left text-sm">
        <thead className="bg-zinc-50 text-zinc-600">
          <tr>{headers.map((header) => <th key={header} className="px-4 py-3 font-medium">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {loading ? (
            <tr><td className="px-4 py-4 text-zinc-500" colSpan={headers.length}>正在加载...</td></tr>
          ) : itemCount > 0 ? (
            children
          ) : (
            <tr><td className="px-4 py-4 text-zinc-500" colSpan={headers.length}>{emptyText}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function Cell({ children, strong }: { children: ReactNode; strong?: boolean }) {
  return <td className={`px-4 py-4 ${strong ? "font-medium text-zinc-950" : "text-zinc-700"}`}>{children}</td>;
}

function TextField({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 rounded-md border border-zinc-300 px-3 outline-none transition focus:border-zinc-950"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2 text-sm font-medium text-zinc-700">
      {label}
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-24 rounded-md border border-zinc-300 px-3 py-2 outline-none transition focus:border-zinc-950"
      />
    </label>
  );
}
