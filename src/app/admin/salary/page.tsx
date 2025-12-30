"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Employee } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import Link from "next/link"

interface EmployeeSalary extends Employee {
  ordersHandled?: number
  workingDays?: number
}

export default function SalaryPage() {
  const { data: session } = useSession()
  const cafeId = (session?.user as any)?.cafeId || "cafe-1"
  const [employees, setEmployees] = useState<EmployeeSalary[]>([])
  const [loading, setLoading] = useState(true)
  const [editingEmployee, setEditingEmployee] = useState<EmployeeSalary | null>(null)

  useEffect(() => {
    fetchData()
  }, [cafeId])

  async function fetchData() {
    try {
      const [employeesRes, ordersRes] = await Promise.all([
        fetch(`/api/employees?cafeId=${cafeId}`),
        fetch(`/api/orders?cafeId=${cafeId}`),
      ])

      if (employeesRes.ok) {
        const employeesData = await employeesRes.json()
        
        // Get orders handled by each employee (for now, we'll use a simple calculation)
        if (ordersRes.ok) {
          const orders = await ordersRes.json()
          const completedOrders = orders.filter((o: any) => o.status === "completed")
          
          // Calculate orders per employee (simple distribution for demo)
          const ordersPerEmployee = Math.floor(completedOrders.length / employeesData.length) || 0
          
          const employeesWithStats = employeesData.map((emp: Employee) => ({
            ...emp,
            ordersHandled: ordersPerEmployee,
            workingDays: 22, // Default working days
          }))
          
          setEmployees(employeesWithStats)
        } else {
          setEmployees(employeesData.map((emp: Employee) => ({
            ...emp,
            ordersHandled: 0,
            workingDays: 22,
          })))
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  async function updateSalary(employeeId: string, salary: number, workingDays: number) {
    try {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ salary, workingDays }),
      })

      if (response.ok) {
        fetchData()
        setEditingEmployee(null)
      }
    } catch (error) {
      console.error("Error updating salary:", error)
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
          title="Employee Salary Management"
          subtitle="Track and manage employee salaries"
          role="admin"
        />

        <div className="mb-6">
          <Link href="/admin">
            <Button variant="outline">← Back</Button>
          </Link>
        </div>

        <div className="space-y-4">
          {employees.map((employee) => (
            <div key={employee.id} className="rounded-lg border bg-card p-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{employee.name}</h3>
                  <p className="text-sm text-muted-foreground">{employee.email}</p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setEditingEmployee(employee)}
                >
                  Update Salary
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Salary</p>
                  <p className="text-xl font-bold">
                    ${employee.salary?.toFixed(2) || "0.00"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Orders Handled</p>
                  <p className="text-xl font-bold">{employee.ordersHandled || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Working Days</p>
                  <p className="text-xl font-bold">{employee.workingDays || 0}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-xl font-bold">
                    ${employee.salary && employee.workingDays
                      ? (employee.salary / employee.workingDays).toFixed(2)
                      : "0.00"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {editingEmployee && (
          <SalaryForm
            employee={editingEmployee}
            onSave={updateSalary}
            onClose={() => setEditingEmployee(null)}
          />
        )}
      </div>
    </div>
  )
}

function SalaryForm({
  employee,
  onSave,
  onClose,
}: {
  employee: EmployeeSalary
  onSave: (employeeId: string, salary: number, workingDays: number) => void
  onClose: () => void
}) {
  const [formData, setFormData] = useState({
    salary: employee.salary || 0,
    workingDays: employee.workingDays || 22,
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Update Salary - {employee.name}</h2>

        <div className="space-y-4">
          <div>
            <Label htmlFor="salary">Monthly Salary ($)</Label>
            <Input
              id="salary"
              type="number"
              step="0.01"
              value={formData.salary}
              onChange={(e) => setFormData({ ...formData, salary: parseFloat(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="workingDays">Working Days (per month)</Label>
            <Input
              id="workingDays"
              type="number"
              value={formData.workingDays}
              onChange={(e) => setFormData({ ...formData, workingDays: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div className="rounded-lg border bg-muted p-3">
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-xl font-bold">
              ${formData.workingDays > 0
                ? (formData.salary / formData.workingDays).toFixed(2)
                : "0.00"}
            </p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => onSave(employee.id, formData.salary, formData.workingDays)} className="flex-1">
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



