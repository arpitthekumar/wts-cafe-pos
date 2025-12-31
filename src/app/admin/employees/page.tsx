"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Employee } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"

export default function EmployeesPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [employees, setEmployees] = useState<Employee[]>([])
  const [showAddEmployee, setShowAddEmployee] = useState(false)
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEmployees()
  }, [cafeId])

  async function fetchEmployees() {
    try {
      const response = await fetch(`/api/employees?cafeId=${cafeId}`)
      if (response.ok) {
        const data = await response.json()
        setEmployees(data)
      }
    } catch (error) {
      console.error("Error fetching employees:", error)
    } finally {
      setLoading(false)
    }
  }

  async function saveEmployee(employee: Partial<Employee>) {
    try {
      const url = editingEmployee
        ? `/api/employees/${editingEmployee.id}`
        : `/api/employees`
      const method = editingEmployee ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...employee, cafeId, role: "employee" }),
      })

      if (response.ok) {
        fetchEmployees()
        setShowAddEmployee(false)
        setEditingEmployee(null)
      }
    } catch (error) {
      console.error("Error saving employee:", error)
    }
  }

  async function deleteEmployee(id: string) {
    if (!confirm("Are you sure you want to delete this employee?")) return

    try {
      const response = await fetch(`/api/employees/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchEmployees()
      }
    } catch (error) {
      console.error("Error deleting employee:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto max-w-7xl">
        <DashboardHeader
          title="Employee Management"
          subtitle="Manage staff, roles, and salaries"
          role="admin"
        />

        <div className="mb-6 flex justify-end">
          <Button onClick={() => setShowAddEmployee(true)}>Add Employee</Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {employees.map((employee) => (
            <div key={employee.id} className="rounded-lg border bg-card p-4">
              <div className="mb-2">
                <h3 className="text-lg font-semibold">{employee.name}</h3>
                <p className="text-sm text-muted-foreground">{employee.email}</p>
                {employee.salary && (
                  <p className="text-sm text-muted-foreground">
                    Salary: ${employee.salary.toFixed(2)}
                  </p>
                )}
              </div>
              <div className="mb-2">
                <span className={`text-xs ${employee.isActive ? "text-green-600" : "text-red-600"}`}>
                  {employee.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setEditingEmployee(employee)}
                >
                  Edit
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deleteEmployee(employee.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>

        {(showAddEmployee || editingEmployee) && (
          <EmployeeForm
            employee={editingEmployee}
            onSave={saveEmployee}
            onClose={() => {
              setShowAddEmployee(false)
              setEditingEmployee(null)
            }}
          />
        )}
      </div>
    </div>
  )
}

function EmployeeForm({
  employee,
  onSave,
  onClose,
}: {
  employee: Employee | null
  onSave: (employee: Partial<Employee>) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    name: employee?.name || "",
    email: employee?.email || "",
    salary: employee?.salary || 0,
    isActive: employee?.isActive ?? true,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">
          {employee ? "Edit Employee" : "Add Employee"}
        </h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="salary">Salary</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <Label htmlFor="isActive">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(formData)} className="flex-1">
              Save
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}




