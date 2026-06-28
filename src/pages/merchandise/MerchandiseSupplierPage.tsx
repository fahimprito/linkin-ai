import { Download, Eye, Pencil, Plus, Trash2 } from "lucide-react"
import { useMemo, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"

import { DataTable } from "@/components/shared/data-table"
import { EmptyState } from "@/components/shared/empty-state"
import { PageHeader } from "@/components/shared/page-header"
import {
  RecordFormModal,
  type ModalFormField,
} from "@/components/shared/record-form-modal"
import { SearchFilterBar } from "@/components/shared/search-filter-bar"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  buildSupplier,
  getStoredSuppliers,
  saveStoredSuppliers,
} from "@/lib/suppliers"
import type {
  MerchandiseSupplier,
  SupplierStatus,
  SupplierType,
} from "@/types/modules"

type SupplierFormValues = {
  supplierName: string
  supplierCode: string
  supplierType: SupplierType
  contactPerson: string
  phone: string
  email: string
  address: string
  leadTimeDays: string
  notes: string
  status: SupplierStatus
}

const supplierTypes: SupplierType[] = ["Yarn", "Accessories", "Both"]
const supplierStatuses: SupplierStatus[] = ["Active", "Inactive"]

const supplierFields: ModalFormField[] = [
  { name: "supplierName", label: "Supplier Name", placeholder: "Delta Yarn" },
  { name: "supplierCode", label: "Supplier Code", placeholder: "SUP-Y-001" },
  {
    name: "supplierType",
    label: "Supplier Type",
    type: "select",
    options: supplierTypes,
  },
  { name: "contactPerson", label: "Contact Person", placeholder: "Rahim Uddin" },
  { name: "phone", label: "Phone", placeholder: "+8801711000001" },
  { name: "email", label: "Email", placeholder: "supplier@example.com" },
  { name: "address", label: "Address", placeholder: "Gazipur, Dhaka" },
  {
    name: "leadTimeDays",
    label: "Lead Time (Days)",
    type: "number",
    placeholder: "7",
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    options: supplierStatuses,
  },
  {
    name: "notes",
    label: "Notes",
    type: "textarea",
    placeholder: "Preferred sourcing partner.",
  },
]

const viewSupplierFields: ModalFormField[] = [
  { name: "supplierCode", label: "Supplier Code", readOnly: true },
  { name: "supplierName", label: "Supplier Name", readOnly: true },
  { name: "supplierType", label: "Supplier Type", readOnly: true },
  { name: "contactPerson", label: "Contact Person", readOnly: true },
  { name: "phone", label: "Phone", readOnly: true },
  { name: "email", label: "Email", readOnly: true },
  { name: "address", label: "Address", readOnly: true },
  { name: "leadTimeDays", label: "Lead Time (Days)", readOnly: true },
  { name: "status", label: "Status", readOnly: true },
  { name: "notes", label: "Notes", type: "textarea", readOnly: true },
]

function downloadSuppliersCsv(suppliers: MerchandiseSupplier[]) {
  const headers = [
    "Supplier Code",
    "Supplier Name",
    "Contact Person",
    "Phone",
    "Email",
    "Address",
    "Supplier Type",
    "Lead Time",
    "Status",
    "Notes",
  ]
  const rows = suppliers.map((supplier) => [
    supplier.supplierCode,
    supplier.supplierName,
    supplier.contactPerson,
    supplier.phone,
    supplier.email ?? "",
    supplier.address ?? "",
    supplier.supplierType,
    String(supplier.leadTimeDays ?? ""),
    supplier.status,
    supplier.notes ?? "",
  ])
  const csv = [headers, ...rows]
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(",")
    )
    .join("\n")

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "merchandise-suppliers.csv"
  link.click()
  window.URL.revokeObjectURL(url)
}

export function MerchandiseSupplierPage() {
  const [suppliers, setSuppliers] = useState<MerchandiseSupplier[]>(() =>
    getStoredSuppliers()
  )
  const [searchValue, setSearchValue] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Suppliers")
  const [page, setPage] = useState(1)
  const [editingSupplier, setEditingSupplier] = useState<MerchandiseSupplier | null>(
    null
  )
  const [viewingSupplier, setViewingSupplier] = useState<MerchandiseSupplier | null>(
    null
  )
  const [isCreateOpen, setIsCreateOpen] = useState(false)

  const {
    register: registerForm,
    handleSubmit: handleFormSubmit,
    reset: resetForm,
  } = useForm<SupplierFormValues>({
    defaultValues: {
      supplierName: "",
      supplierCode: "",
      supplierType: "Yarn",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      leadTimeDays: "",
      notes: "",
      status: "Active",
    },
  })

  const {
    register: registerView,
    handleSubmit: handleViewSubmit,
    reset: resetView,
  } = useForm<SupplierFormValues>({
    defaultValues: {
      supplierName: "",
      supplierCode: "",
      supplierType: "Yarn",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      leadTimeDays: "",
      notes: "",
      status: "Active",
    },
  })

  const filteredSuppliers = useMemo(() => {
    const query = searchValue.trim().toLowerCase()

    return suppliers.filter((supplier) => {
      const matchesFilter =
        activeFilter === "All Suppliers" ||
        supplier.supplierType === activeFilter ||
        supplier.status === activeFilter

      if (!matchesFilter) {
        return false
      }

      if (!query) {
        return true
      }

      return [
        supplier.supplierCode,
        supplier.supplierName,
        supplier.contactPerson,
        supplier.phone,
        supplier.email,
        supplier.address,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
  }, [activeFilter, searchValue, suppliers])

  const pageSize = 10
  const totalPages = Math.max(1, Math.ceil(filteredSuppliers.length / pageSize))
  const pagedSuppliers = filteredSuppliers.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const openCreate = () => {
    setEditingSupplier(null)
    setIsCreateOpen(true)
    resetForm({
      supplierName: "",
      supplierCode: "",
      supplierType: "Yarn",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      leadTimeDays: "",
      notes: "",
      status: "Active",
    })
  }

  const openEdit = (supplier: MerchandiseSupplier) => {
    setEditingSupplier(supplier)
    setIsCreateOpen(true)
    resetForm({
      supplierName: supplier.supplierName,
      supplierCode: supplier.supplierCode,
      supplierType: supplier.supplierType,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      leadTimeDays: String(supplier.leadTimeDays ?? ""),
      notes: supplier.notes ?? "",
      status: supplier.status,
    })
  }

  const openView = (supplier: MerchandiseSupplier) => {
    setViewingSupplier(supplier)
    resetView({
      supplierName: supplier.supplierName,
      supplierCode: supplier.supplierCode,
      supplierType: supplier.supplierType,
      contactPerson: supplier.contactPerson,
      phone: supplier.phone,
      email: supplier.email ?? "",
      address: supplier.address ?? "",
      leadTimeDays: String(supplier.leadTimeDays ?? ""),
      notes: supplier.notes ?? "",
      status: supplier.status,
    })
  }

  const handleSaveSupplier = (values: SupplierFormValues) => {
    if (!values.supplierName.trim()) {
      toast.error("Supplier Name is required.")
      return
    }

    if (!values.phone.trim()) {
      toast.error("Phone is required.")
      return
    }

    if (!values.supplierType) {
      toast.error("Supplier Type is required.")
      return
    }

    const normalizedCode = values.supplierCode.trim().toLowerCase()
    const hasDuplicateCode = suppliers.some(
      (supplier) =>
        supplier.id !== editingSupplier?.id &&
        supplier.supplierCode.trim().toLowerCase() === normalizedCode
    )

    if (!normalizedCode) {
      toast.error("Supplier Code is required.")
      return
    }

    if (hasDuplicateCode) {
      toast.error("Supplier Code must be unique.")
      return
    }

    const payload = {
      supplierCode: values.supplierCode.trim(),
      supplierName: values.supplierName.trim(),
      supplierType: values.supplierType,
      contactPerson: values.contactPerson.trim(),
      phone: values.phone.trim(),
      email: values.email.trim() || undefined,
      address: values.address.trim() || undefined,
      leadTimeDays: values.leadTimeDays ? Number(values.leadTimeDays) : undefined,
      notes: values.notes.trim() || undefined,
      status: values.status,
    }

    const nextSuppliers = editingSupplier
      ? suppliers.map((supplier) =>
          supplier.id === editingSupplier.id
            ? { ...supplier, ...payload }
            : supplier
        )
      : [buildSupplier(payload), ...suppliers]

    setSuppliers(nextSuppliers)
    saveStoredSuppliers(nextSuppliers)
    setIsCreateOpen(false)
    setEditingSupplier(null)
    toast.success(
      editingSupplier ? "Supplier updated successfully." : "Supplier created successfully."
    )
  }

  const handleDeleteSupplier = (supplier: MerchandiseSupplier) => {
    const nextSuppliers = suppliers.filter((item) => item.id !== supplier.id)
    setSuppliers(nextSuppliers)
    saveStoredSuppliers(nextSuppliers)
    toast.success(`Supplier ${supplier.supplierName} deleted.`)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Supplier"
        actions={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-2xl"
              onClick={() => downloadSuppliersCsv(filteredSuppliers)}
            >
              <Download className="mr-1.5 size-4" />
              Export
            </Button>
            <Button type="button" className="rounded-2xl" onClick={openCreate}>
              <Plus className="mr-1.5 size-4" />
              Add Supplier
            </Button>
          </div>
        }
      />

      <SearchFilterBar
        compact
        filters={[
          "All Suppliers",
          "Yarn",
          "Accessories",
          "Both",
          "Active",
          "Inactive",
        ]}
        activeFilter={activeFilter}
        onFilterChange={(filter) => {
          setActiveFilter(filter)
          setPage(1)
        }}
        searchPlaceholder="Search code, supplier, contact, phone"
        searchValue={searchValue}
        onSearchChange={(value) => {
          setSearchValue(value)
          setPage(1)
        }}
      />

      {pagedSuppliers.length === 0 ? (
        <EmptyState
          title="No suppliers found"
          description="Create a supplier to use it in Merchandise sourcing orders."
        />
      ) : (
        <>
          <DataTable
            compact
            columns={[
              { key: "supplierCode", header: "Supplier Code", className: "min-w-[6rem]" },
              { key: "supplierName", header: "Supplier Name", className: "min-w-[8rem]" },
              { key: "contactPerson", header: "Contact Person", className: "min-w-[7rem]" },
              { key: "phone", header: "Phone", className: "min-w-[7rem]" },
              {
                key: "email",
                header: "Email",
                className: "min-w-[8rem]",
                render: (row) => row.email ?? "—",
              },
              {
                key: "address",
                header: "Address",
                className: "min-w-[8rem]",
                render: (row) => row.address ?? "—",
              },
              { key: "supplierType", header: "Supplier Type", className: "min-w-[6rem]" },
              {
                key: "leadTimeDays",
                header: "Lead Time",
                className: "min-w-[5rem]",
                render: (row) =>
                  row.leadTimeDays !== undefined ? `${row.leadTimeDays} days` : "—",
              },
              {
                key: "status",
                header: "Status",
                className: "min-w-[5rem]",
                render: (row) => <StatusBadge value={row.status} />,
              },
              {
                key: "action",
                header: "Action",
                className: "min-w-[9rem]",
                render: (row) => (
                  <div className="flex items-center gap-1.5">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg px-2 text-[11px]"
                      onClick={() => openView(row)}
                    >
                      <Eye className="mr-1 size-3.5" />
                      View
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg px-2 text-[11px]"
                      onClick={() => openEdit(row)}
                    >
                      <Pencil className="mr-1 size-3.5" />
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-7 rounded-lg border-rose-200 bg-rose-50 px-2 text-[11px] text-rose-700 hover:bg-rose-100 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200 dark:hover:bg-rose-500/15"
                      onClick={() => handleDeleteSupplier(row)}
                    >
                      <Trash2 className="mr-1 size-3.5" />
                      Delete
                    </Button>
                  </div>
                ),
              },
            ]}
            data={pagedSuppliers}
          />

          <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3 text-sm shadow-sm">
            <p className="text-muted-foreground">
              Showing {pagedSuppliers.length} of {filteredSuppliers.length} suppliers
            </p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs text-muted-foreground">
                Page {page} / {totalPages}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      )}

      <RecordFormModal
        open={isCreateOpen}
        title={editingSupplier ? "Edit Supplier" : "Add Supplier"}
        description="Maintain supplier information for merchandise sourcing."
        fields={supplierFields}
        register={registerForm}
        onClose={() => {
          setIsCreateOpen(false)
          setEditingSupplier(null)
          resetForm()
        }}
        onReset={() => {
          if (!editingSupplier) {
            openCreate()
            return
          }

          openEdit(editingSupplier)
        }}
        onSubmit={handleFormSubmit(handleSaveSupplier)}
        submitLabel={editingSupplier ? "Save Changes" : "Create Supplier"}
        maxWidthClassName="max-w-4xl"
      />

      <RecordFormModal
        open={Boolean(viewingSupplier)}
        title="Supplier Details"
        description="View supplier information."
        fields={viewSupplierFields}
        register={registerView}
        onClose={() => {
          setViewingSupplier(null)
          resetView()
        }}
        onReset={() => {
          if (viewingSupplier) {
            openView(viewingSupplier)
          }
        }}
        onSubmit={handleViewSubmit(() => {
          setViewingSupplier(null)
        })}
        submitLabel="Close"
        maxWidthClassName="max-w-4xl"
      />
    </div>
  )
}
