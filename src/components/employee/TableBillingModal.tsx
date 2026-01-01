"use client"

import { useState, useEffect } from "react"
import { Order, PaymentMethod, Currency, Table } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"

interface TableBillingModalProps {
  table: Table
  cafeId: string
  cafeName: string
  onClose: () => void
  onBillingComplete: () => void
}

export function TableBillingModal({ table, cafeId, cafeName, onClose, onBillingComplete }: TableBillingModalProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrders, setSelectedOrders] = useState<Set<string>>(new Set())
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash")
  const [processing, setProcessing] = useState(false)
  const [loading, setLoading] = useState(true)
  const currency = useCafeCurrency(cafeId)

  useEffect(() => {
    fetchOrders()
  }, [table.id, cafeId])

  async function fetchOrders() {
    try {
      // First get the active table session to get customer email
      const sessionRes = await fetch(`/api/table-sessions?tableId=${table.id}`)
      let customerEmail: string | null = null
      if (sessionRes.ok) {
        const session = await sessionRes.ok ? await sessionRes.json() : null
        if (session && session.isActive) {
          customerEmail = session.customerEmail
        }
      }

      const response = await fetch(`/api/orders?cafeId=${cafeId}&tableId=${table.id}&status=pending,preparing,ready,served`)
      if (response.ok) {
        let ordersData = await response.json()
        
        // Filter to only show orders for the current customer if session exists
        if (customerEmail) {
          ordersData = ordersData.filter((o: Order) => 
            o.customerEmail?.toLowerCase() === customerEmail?.toLowerCase()
          )
        }
        
        setOrders(ordersData)
        // Select all orders by default
        setSelectedOrders(new Set(ordersData.map((o: Order) => o.id)))
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  function toggleOrder(orderId: string) {
    const newSet = new Set(selectedOrders)
    if (newSet.has(orderId)) {
      newSet.delete(orderId)
    } else {
      newSet.add(orderId)
    }
    setSelectedOrders(newSet)
  }

  const selectedOrdersList = orders.filter(o => selectedOrders.has(o.id))
  const totalAmount = selectedOrdersList.reduce((sum, o) => sum + o.total, 0)

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "card", label: "Card", icon: "💳" },
    { value: "upi", label: "UPI", icon: "📱" },
    { value: "online", label: "Online", icon: "🌐" },
    { value: "other", label: "Other", icon: "💰" },
  ]

  async function handleBilling() {
    if (selectedOrdersList.length === 0) {
      alert("Please select at least one order to bill")
      return
    }

    setProcessing(true)
    try {
      const billNumber = `BILL-${Date.now()}`
      const now = new Date().toISOString()

      // Process all selected orders - mark as paid and generate bill
      for (const order of selectedOrdersList) {
        await fetch(`/api/orders/${order.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "completed",
            paymentMethod: selectedMethod,
            paidAt: now,
            billNumber: `${billNumber}-${order.id.slice(-4)}`,
          }),
        })
      }
      
      // Now customer can download the bill from their side

      // Generate combined bill (staff downloads it)
      await generateAndDownloadBill(selectedOrdersList, selectedMethod, billNumber, currency, cafeName, table.number)

      // DO NOT mark table as cleaning or end session here
      // That should only happen when customer clicks "Leave Table"
      
      // Store bill info for customer to download later
      // The order status is already set to "completed" above

      onBillingComplete()
      onClose()
    } catch (error) {
      console.error("Error processing billing:", error)
      alert("Failed to process billing. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  async function generateAndDownloadBill(
    orders: Order[],
    paymentMethod: PaymentMethod,
    billNumber: string,
    currency: Currency,
    cafeName: string,
    tableNumber: number
  ) {
    const allItems = orders.flatMap(o => o.items.map(item => ({ ...item, orderId: o.id })))
    const billHTML = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Bill - ${billNumber}</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #000;
      padding-bottom: 20px;
      margin-bottom: 20px;
    }
    .bill-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th, td {
      padding: 10px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: #f2f2f2;
    }
    .total {
      text-align: right;
      font-size: 18px;
      font-weight: bold;
      margin-top: 20px;
    }
    .footer {
      margin-top: 40px;
      text-align: center;
      font-size: 12px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${cafeName}</h1>
    <p>Bill Number: ${billNumber}</p>
    <p>Date: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="bill-info">
    <div>
      <p><strong>Table:</strong> ${tableNumber}</p>
      ${orders[0]?.customerName ? `<p><strong>Customer:</strong> ${orders[0].customerName}</p>` : ""}
    </div>
  </div>
  
  <table>
    <thead>
      <tr>
        <th>Item</th>
        <th>Qty</th>
        <th>Price</th>
        <th>Total</th>
      </tr>
    </thead>
    <tbody>
      ${allItems.map(item => `
        <tr>
          <td>${item.menuItemName}${item.notes ? ` (${item.notes})` : ""}</td>
          <td>${item.quantity}</td>
          <td>${formatCurrency(item.price, currency)}</td>
          <td>${formatCurrency(item.price * item.quantity, currency)}</td>
        </tr>
      `).join("")}
    </tbody>
  </table>
  
  <div class="total">
    <p>Total: ${formatCurrency(totalAmount, currency)}</p>
    <p>Payment Method: ${paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod}</p>
    <p>Paid At: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="footer">
    <p>Thank you for visiting!</p>
    <p>Generated on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>
    `

    const blob = new Blob([billHTML], { type: "text/html" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${billNumber}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
        <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
          <p>Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Table {table.number} - Billing</h2>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No orders found for this table</p>
            <Button variant="outline" onClick={onClose} className="mt-4">
              Close
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              <Label>Select Orders to Bill</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className={`flex items-center justify-between rounded border p-3 cursor-pointer ${
                      selectedOrders.has(order.id) ? "border-primary bg-primary/5" : ""
                    }`}
                    onClick={() => toggleOrder(order.id)}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOrders.has(order.id)}
                        onChange={() => toggleOrder(order.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div>
                        <p className="font-medium">Order #{order.id.slice(-6)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} items • {order.status} • {new Date(order.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold">{formatCurrency(order.total, currency)}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="mb-4 rounded-lg border bg-muted/50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold">{formatCurrency(totalAmount, currency)}</span>
              </div>
            </div>

            <div className="mb-4">
              <Label>Payment Method</Label>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.value}
                    variant={selectedMethod === method.value ? "default" : "outline"}
                    onClick={() => setSelectedMethod(method.value)}
                    className="flex items-center gap-2"
                  >
                    <span>{method.icon}</span>
                    <span>{method.label}</span>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
                disabled={processing}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBilling}
                className="flex-1"
                disabled={processing || selectedOrdersList.length === 0}
              >
                {processing ? "Processing..." : "Confirm Payment & Generate Bill"}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

