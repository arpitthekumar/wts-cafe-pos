# Table Session & Order Management Features

## Overview
This document describes the new table session management and enhanced order flow features implemented in the WTS Cafe POS system.

## Features Implemented

### 1. Table Session System
- **Purpose**: Tracks active customers at each table
- **Database**: New `table_sessions` table stores customer information
- **Behavior**: 
  - Automatically created when a customer places their first order
  - Tracks customer name, email, table, and session duration
  - Automatically ended when customer leaves or staff changes table status

### 2. Customer Profile View
- **Location**: Customer menu page header
- **Features**:
  - Displays customer name: "Welcome, [Name]!"
  - Shows total number of orders for the session
  - Lists all orders with status and total
  - "Leave Table" button always visible

### 3. Leave Table Functionality
- **Customer Action**: Click "Leave Table" button
- **Options**:
  - If order is completed/served: Option to leave review first
  - Otherwise: Direct leave option
- **What Happens**:
  - Ends table session
  - Marks table as "cleaning"
  - Clears customer session data

### 4. Staff Dashboard Enhancements
- **Customer Name Display**: 
  - Shows customer name on each table card
  - Visible to all staff members
  - Helps staff address customers properly
- **Table Status Colors**:
  - **Gray**: Ready to Use (empty)
  - **Orange**: Occupied (has active order)
  - **Purple**: Served (order has been served)
  - **Yellow**: Cleaning
  - **Blue**: Reserved

### 5. Order Status Flow
**New Status Flow**: `pending` → `preparing` → `ready` → `served` → `completed`

- **pending**: Order just placed
- **preparing**: Kitchen is preparing
- **ready**: Order ready for pickup
- **served**: Order has been served to customer
- **completed**: Order finished
- **cancelled**: Order cancelled

### 6. Feedback Notification System
- **Triggers**: When order status changes to `ready` or `served`
- **Features**:
  - Popup notification appears at bottom of screen
  - Auto-dismisses after 30 seconds
  - Options:
    - "Everything's Good" / "Leave Feedback" button
    - "Dismiss" button
  - Can submit review directly from notification

### 7. Auto-Leave on Status Change
- **Behavior**: When staff manually changes table status to anything other than "occupied" or "served"
- **Action**: Automatically ends the customer's table session
- **Use Case**: If customer leaves without clicking "Leave Table", staff can mark table as "cleaning" or "empty" and the session automatically ends

### 8. Table Status Management
- **Staff Can Change Status To**:
  - From "Occupied": → "Served", "Cleaning", "Empty"
  - From "Served": → "Cleaning", "Empty", "Occupied"
  - From "Cleaning": → "Empty", "Occupied"
  - From "Reserved": → "Empty", "Occupied"
  - From "Empty": → "Occupied", "Reserved", "Cleaning"

## API Endpoints

### Table Sessions
- `GET /api/table-sessions?tableId={id}` - Get active session for table
- `GET /api/table-sessions?cafeId={id}` - Get all active sessions for cafe
- `GET /api/table-sessions?customerEmail={email}&cafeId={id}` - Get customer sessions
- `POST /api/table-sessions` - Create new session
- `DELETE /api/table-sessions?tableId={id}` - End session for table

### Tables
- `PUT /api/tables/{id}` - Update table (auto-ends session if status changes)

### Orders
- `PATCH /api/orders/{id}` - Update order status (now supports "served")

## Database Schema

### New Table: `table_sessions`
```sql
CREATE TABLE table_sessions (
  id TEXT PRIMARY KEY,
  cafeId TEXT NOT NULL,
  tableId TEXT NOT NULL,
  tableNumber INTEGER NOT NULL,
  customerName TEXT NOT NULL,
  customerEmail TEXT NOT NULL,
  startedAt TEXT NOT NULL,
  endedAt TEXT,
  isActive INTEGER DEFAULT 1
)
```

## Best Practices & Suggestions

### For Staff:
1. **Always check customer name** on table before approaching
2. **Update order status** to "served" after delivering food
3. **Change table status** to "cleaning" when customer leaves (even if they didn't click "Leave Table")
4. **Use "Served" status** to indicate food has been delivered but customer is still eating

### For Customers:
1. **Click "Leave Table"** when finished to help staff know table is available
2. **Leave feedback** when prompted - helps improve service
3. **Check order status** in your profile to see all your orders

### Workflow Recommendations:
1. **Order Flow**: 
   - Customer places order → Status: "pending"
   - Kitchen starts → Status: "preparing"
   - Food ready → Status: "ready" (triggers feedback notification)
   - Staff serves → Status: "served" (table shows "Served" status)
   - Customer finishes → Status: "completed"
   - Customer leaves → Table status: "cleaning"

2. **Table Management**:
   - Use "Served" status to distinguish between "actively eating" vs "just ordered"
   - Mark as "cleaning" immediately after customer leaves
   - Mark as "empty" when table is ready for next customer

## Migration Notes
- Database migration automatically runs on server start
- Existing tables will work without issues
- New `table_sessions` table is created automatically
- No data migration needed - sessions start fresh

