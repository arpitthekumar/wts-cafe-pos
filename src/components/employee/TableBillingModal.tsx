"use client"

import { useState, useEffect } from "react"
import { Order, PaymentMethod, Currency, Table } from "@/lib/types"
import { Button, Label } from "@/components/ui"
import { useCafeCurrency } from "@/hooks/useCafeCurrency"
import { formatCurrency } from "@/lib/utils/currency"
import { ShieldCheck, Receipt, Coins, X } from "lucide-react"

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
      const sessionRes = await fetch(`/api/table-sessions?tableId=${table.id}`)
      let customerEmail: string | null = null
      if (sessionRes.ok) {
        const session = await sessionRes.json()
        if (session && session.isActive) {
          customerEmail = session.customerEmail
        }
      }

      const response = await fetch(`/api/orders?cafeId=${cafeId}&tableId=${table.id}&status=pending,preparing,ready,served`)
      if (response.ok) {
        let ordersData = await response.json()
        
        if (customerEmail) {
          ordersData = ordersData.filter((o: Order) => 
            o.customerEmail?.toLowerCase() === customerEmail?.toLowerCase()
          )
        }
        
        setOrders(ordersData)
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
  const gstAmount = totalAmount * 0.18
  const grandTotal = totalAmount + gstAmount

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
      
      await generateAndDownloadBill(selectedOrdersList, selectedMethod, billNumber, currency, cafeName, table.number)
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
      font-family: 'Helvetica Neue', Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 30px;
      color: #333;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #333;
      padding-bottom: 20px;
      margin-bottom: 25px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      color: #fc8019;
    }
    .header p {
      margin: 5px 0;
      color: #666;
      font-size: 14px;
    }
    .bill-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 25px;
      font-size: 14px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 25px;
    }
    th, td {
      padding: 12px 10px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      background-color: #f9f9f9;
      font-weight: bold;
    }
    .total {
      text-align: right;
      border-top: 2px solid #333;
      padding-top: 15px;
      margin-top: 20px;
      font-size: 14px;
    }
    .total p {
      margin: 6px 0;
    }
    .grand-total {
      font-size: 20px;
      font-weight: 800;
      color: #fc8019;
    }
    .footer {
      margin-top: 50px;
      text-align: center;
      font-size: 12px;
      color: #999;
      border-top: 1px dashed #ddd;
      padding-top: 20px;
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
      <p><strong>Table:</strong> #${tableNumber}</p>
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
    <p>Subtotal: ${formatCurrency(totalAmount, currency)}</p>
    <p>GST (18%): ${formatCurrency(totalAmount * 0.18, currency)}</p>
    <p class="grand-total">Grand Total: ${formatCurrency(totalAmount * 1.18, currency)}</p>
    <p style="margin-top: 15px; color: #666; font-size: 12px;">Payment Method: ${paymentMethods.find(m => m.value === paymentMethod)?.label || paymentMethod}</p>
    <p style="color: #666; font-size: 12px;">Paid At: ${new Date().toLocaleString()}</p>
  </div>
  
  <div class="footer">
    <p>Thank you for dining with us!</p>
    <p>Powered by WTS Café POS</p>
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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
        <div className="w-full max-w-md rounded-[20px] border bg-background p-6 shadow-2xl flex flex-col items-center justify-center min-h-[160px]">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <p className="mt-3 text-sm font-bold text-muted-foreground">Loading orders...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[20px] border border-border bg-card p-6 shadow-2xl flex flex-col justify-between">
        {/* Header Title */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-headline text-base font-extrabold text-foreground">
                Table {table.number} - Process Bill
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground font-semibold">No active orders found for this table.</p>
            <button
              onClick={onClose}
              className="mt-4 px-6 h-10 rounded-chip border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-foreground font-bold text-xs transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            {/* Orders checklist */}
            <div className="mb-5">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Orders to Bill</Label>
              <div className="mt-2.5 space-y-2.5 max-h-60 overflow-y-auto pr-1">
                {orders.map((order) => {
                  const isSelected = selectedOrders.has(order.id)
                  return (
                    <div
                      key={order.id}
                      onClick={() => toggleOrder(order.id)}
                      className={`flex items-center justify-between rounded-xl border p-3.5 cursor-pointer transition-all duration-200 ${
                        isSelected 
                          ? "border-orange-500 bg-orange-500/5 dark:bg-orange-500/10" 
                          : "border-border/60 hover:bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleOrder(order.id)}
                          onClick={(e) => e.stopPropagation()}
                          className="h-4 w-4 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                        />
                        <div>
                          <p className="font-headline font-bold text-sm text-foreground">Order #{order.id.slice(-6).toUpperCase()}</p>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5">
                            {order.items.length} items • {order.status} • {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                      <p className="font-headline font-extrabold text-sm text-foreground">{formatCurrency(order.total * 1.18, currency)}</p>
                    </div>
                  )}
                )}
              </div>
            </div>

            {/* Bill Details Breakdown (Consistent with Zomato Invoice) */}
            <div className="mb-5 space-y-2.5 rounded-2xl border border-border p-4 bg-muted/20 dark:bg-zinc-900/10">
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Subtotal (Selected Items)</span>
                <span>{formatCurrency(totalAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>GST (18%)</span>
                <span>{formatCurrency(gstAmount, currency)}</span>
              </div>
              <div className="flex justify-between text-xs font-semibold text-muted-foreground">
                <span>Restaurant Service Fee</span>
                <span className="text-green-600 dark:text-green-400 font-bold uppercase text-[10px]">FREE</span>
              </div>
              <div className="flex justify-between items-center border-t border-border/80 pt-2.5 mt-2 font-headline">
                <span className="font-extrabold text-foreground text-sm">Grand Total</span>
                <span className="text-lg font-extrabold text-orange-500 dark:text-orange-400">{formatCurrency(grandTotal, currency)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6">
              <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Select Payment Method</Label>
              <div className="mt-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2">
                {paymentMethods.map((method) => {
                  const isActive = selectedMethod === method.value
                  return (
                    <button
                      key={method.value}
                      onClick={() => setSelectedMethod(method.value)}
                      className={`h-9 text-xs font-bold rounded-chip flex items-center justify-center gap-1.5 transition-all duration-200 border cursor-pointer ${
                        isActive
                          ? "bg-orange-500 border-orange-500 text-white shadow-sm"
                          : "border-border hover:bg-muted/40 text-foreground"
                      }`}
                    >
                      <span>{method.icon}</span>
                      <span>{method.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions Buttons */}
            <div className="flex gap-3">
              <button
                disabled={processing}
                onClick={onClose}
                className="flex-1 h-10.5 rounded-chip border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-foreground font-bold text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={processing || selectedOrdersList.length === 0}
                onClick={handleBilling}
                className="flex-1 h-10.5 rounded-chip bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed text-white font-bold text-xs transition-all hover:scale-102 active:scale-98 cursor-pointer flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/15"
              >
                {processing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Coins className="w-4 h-4" />
                    <span>Confirm Payment & Print</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
