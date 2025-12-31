# Supabase Setup Guide

## Environment Variables

The following environment variables have been configured in `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://midglosfknldvfnfbxxh.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_uucCxxU-Nv7BLTFGQBbQ-Q_Yz73D_k8
```

## Next Steps

### 1. Create Tables in Supabase

You need to create the following tables in your Supabase dashboard:

1. **cafes**
   - id (text, primary key)
   - name (text)
   - address (text, nullable)
   - phone (text, nullable)
   - email (text, nullable)
   - isActive (boolean, default: true)
   - createdAt (timestamp)
   - updatedAt (timestamp)
   - adminId (text, nullable)

2. **tables**
   - id (text, primary key)
   - cafeId (text, foreign key -> cafes.id)
   - number (integer)
   - qrCode (text)
   - isActive (boolean, default: true)
   - capacity (integer, nullable)
   - status (text, nullable, default: 'empty')
   - createdAt (timestamp)

3. **orders**
   - id (text, primary key)
   - cafeId (text, foreign key -> cafes.id)
   - tableId (text, foreign key -> tables.id)
   - tableNumber (integer)
   - status (text, default: 'pending')
   - total (numeric)
   - customerName (text, nullable)
   - customerEmail (text, nullable)
   - notes (text, nullable)
   - createdAt (timestamp)
   - updatedAt (timestamp)

4. **order_items**
   - id (text, primary key)
   - orderId (text, foreign key -> orders.id)
   - menuItemId (text, foreign key -> menu_items.id)
   - quantity (integer)
   - price (numeric)
   - notes (text, nullable)

5. **categories**
   - id (text, primary key)
   - cafeId (text, foreign key -> cafes.id)
   - name (text)
   - icon (text, nullable)
   - order (integer)
   - isActive (boolean, default: true)
   - createdAt (timestamp)

6. **menu_items**
   - id (text, primary key)
   - cafeId (text, foreign key -> cafes.id)
   - categoryId (text, foreign key -> categories.id)
   - name (text)
   - description (text, nullable)
   - price (numeric)
   - image (text, nullable)
   - isAvailable (boolean, default: true)
   - createdAt (timestamp)
   - updatedAt (timestamp)

7. **employees**
   - id (text, primary key)
   - cafeId (text, nullable, foreign key -> cafes.id)
   - userId (text)
   - role (text)
   - salary (numeric, nullable)
   - isActive (boolean, default: true)
   - createdAt (timestamp)
   - updatedAt (timestamp)

8. **reviews**
   - id (text, primary key)
   - orderId (text, foreign key -> orders.id)
   - cafeId (text, foreign key -> cafes.id)
   - rating (integer)
   - comment (text, nullable)
   - createdAt (timestamp)

9. **help_requests**
   - id (text, primary key)
   - cafeId (text, foreign key -> cafes.id)
   - tableId (text, foreign key -> tables.id)
   - tableNumber (integer)
   - requestType (text)
   - status (text, default: 'pending')
   - notes (text, nullable)
   - createdAt (timestamp)
   - resolvedAt (timestamp, nullable)

### 2. Enable Row Level Security (RLS)

For each table, you'll need to set up Row Level Security policies based on your access requirements.

### 3. Migration Strategy

Currently, the application uses SQLite. To migrate to Supabase:

1. Export data from SQLite
2. Import into Supabase
3. Update query functions to use Supabase client instead of SQLite
4. Test thoroughly

### 4. Using Supabase Client

The Supabase client is available at `src/lib/supabase/client.ts`:

```typescript
import { supabase } from "@/lib/supabase/client"

// Example query
const { data, error } = await supabase
  .from('cafes')
  .select('*')
```

For server-side usage:
```typescript
import { createServerClient } from "@/lib/supabase/client"

const supabase = createServerClient()
```

