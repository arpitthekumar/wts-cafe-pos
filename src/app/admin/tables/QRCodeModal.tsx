"use client"

import { useState, useEffect } from "react"
import { Table } from "@/lib/types"
import { Button } from "@/components/ui"
import QRCode from "qrcode"
import { slugify } from "@/lib/utils/slug"

interface QRCodeModalProps {
  table: Table
  onClose: () => void
}

export function QRCodeModal({ table, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [cafeName, setCafeName] = useState<string>("")
  const [qrUrl, setQrUrl] = useState<string>("")

  useEffect(() => {
    fetchCafeAndGenerateQR()
  }, [table])

  async function fetchCafeAndGenerateQR() {
    try {
      // Fetch cafe information to get the actual cafe name
      const cafeResponse = await fetch(`/api/cafes/${table.cafeId}`)
      if (!cafeResponse.ok) {
        throw new Error("Failed to fetch cafe information")
      }
      const cafe = await cafeResponse.json()
      const cafeSlug = slugify(cafe.name)
      setCafeName(cafe.name)
      
      // Generate QR code URL with actual cafe name
      const url = `${window.location.origin}/menu/${cafeSlug}/${table.id}`
      setQrUrl(url)
      
      const dataUrl = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
      })
      setQrDataUrl(dataUrl)
    } catch (error) {
      console.error("Error generating QR code:", error)
    } finally {
      setLoading(false)
    }
  }

  function handlePrint() {
    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>QR Code - Table ${table.number}</title>
            <style>
              body {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 40px;
                font-family: Arial, sans-serif;
              }
              h1 { margin-bottom: 20px; }
              img { margin: 20px 0; }
              p { margin-top: 20px; font-size: 14px; color: #666; }
            </style>
          </head>
          <body>
            <h1>Table ${table.number} - ${cafeName}</h1>
            <img src="${qrDataUrl}" alt="QR Code" />
            <p>Scan to view menu and place order</p>
            <p>${qrUrl}</p>
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md rounded-lg border bg-background p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">QR Code - Table {table.number}</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ✕
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <p>Generating QR code...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="mb-4 rounded-lg border bg-white p-4">
              <img src={qrDataUrl} alt="QR Code" className="mx-auto" />
            </div>
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Scan this QR code to view menu and place orders
            </p>
            <p className="mb-4 break-all text-center text-xs text-muted-foreground">
              {qrUrl}
            </p>
            <div className="flex gap-2">
              <Button onClick={handlePrint} className="flex-1">
                Print QR Code
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement("a")
                  link.download = `table-${table.number}-qr.png`
                  link.href = qrDataUrl
                  link.click()
                }}
                className="flex-1"
              >
                Download
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
