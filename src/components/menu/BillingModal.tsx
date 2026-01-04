"use client"

import { useState, useEffect } from "react"
import { Order, PaymentMethod, Currency } from "@/lib/types"
import { Button, Input, Label } from "@/components/ui"
import { formatCurrency } from "@/lib/utils/currency"

interface BillingModalProps {
  order: Order
  currency: Currency
  cafeName: string
  onClose: () => void
  onPaymentComplete: (paymentMethod: PaymentMethod) => void
}

export function BillingModal({ order, currency, cafeName, onClose, onPaymentComplete }: BillingModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("cash")
  const [canDownload, setCanDownload] = useState(false)
  
  // Check if order is already paid (staff confirmed payment)
  useEffect(() => {
    if (order.paidAt && order.billNumber) {
      setCanDownload(true)
    }
  }, [order])

  const paymentMethods: { value: PaymentMethod; label: string; icon: string }[] = [
    { value: "cash", label: "Cash", icon: "💵" },
    { value: "card", label: "Card", icon: "💳" },
    { value: "upi", label: "UPI", icon: "📱" },
    { value: "online", label: "Online", icon: "🌐" },
    { value: "other", label: "Other", icon: "💰" },
  ]

  async function handleSelectPaymentMethod() {
    // Just save the payment method preference - staff will confirm payment
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentMethod: selectedMethod,
        }),
      })

      if (response.ok) {
        alert("Payment method selected. Staff will confirm payment shortly.")
        onClose()
      }
    } catch (error) {
      console.error("Error saving payment method:", error)
      alert("Failed to save payment method. Please try again.")
    }
  }

  async function handleDownloadBill() {
    if (!order.billNumber || !order.paidAt) {
      alert("Bill is not ready yet. Please wait for staff to confirm payment.")
      return
    }

    // Generate bill with saved data
    await generateAndDownloadBill(
      order, 
      order.paymentMethod || "cash", 
      order.billNumber, 
      currency, 
      cafeName
    )
  }

  async function generateAndDownloadBill(
    order: Order,
    paymentMethod: PaymentMethod,
    billNumber: string,
    currency: Currency,
    cafeName: string
  ) {
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
    <p>Date: ${new Date(order.createdAt).toLocaleString()}</p>
  </div>
  
  <div class="bill-info">
    <div>
      <p><strong>Table:</strong> ${order.tableNumber}</p>
      ${order.customerName ? `<p><strong>Customer:</strong> ${order.customerName}</p>` : ""}
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
      ${order.items.map(item => `
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
    <p>Total: ${formatCurrency(order.total, currency)}</p>
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

    // Create blob and download
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <h2 className="mb-4 text-xl font-bold">Payment & Billing</h2>
        
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">Order Total:</p>
          <p className="text-2xl font-bold">{formatCurrency(order.total, currency)}</p>
        </div>

        <div className="mb-4">
          <Label>Select Payment Method</Label>
          <div className="mt-2 grid grid-cols-2 gap-2">
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

        {canDownload ? (
          <div className="space-y-2">
            <div className="rounded-lg border bg-green-50 p-3 dark:bg-green-950">
              <p className="text-sm font-medium text-green-800 dark:text-green-200">
                ✓ Payment confirmed by staff
              </p>
              <p className="text-xs text-green-600 dark:text-green-300 mt-1">
                You can now download your bill
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Close
              </Button>
              <Button
                onClick={handleDownloadBill}
                className="flex-1"
              >
                📥 Download Bill
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="rounded-lg border bg-yellow-50 p-3 dark:bg-yellow-950">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                ⏳ Waiting for staff confirmation
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-300 mt-1">
                Staff will confirm your payment. You'll be able to download the bill once confirmed.
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSelectPaymentMethod}
                className="flex-1"
              >
                Select Payment Method
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

