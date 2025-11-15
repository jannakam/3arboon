# Fikra Escrow

A simple escrow-style mobile app built with Next.js and shadcn/ui for managing secure payments between vendors and clients.

## Features

### Vendor Dashboard
- Simple login portal (accepts any credentials)
- Create specialized payment links for clients
- Manage orders with status tracking
- Start production and mark orders complete
- Upload completion proof photos
- View notifications
- Manage profile

### Client Interface
- Receive payment links from vendors
- Make advance payments
- Review and agree to terms & conditions
- View real-time order status updates
- Make final payments upon completion
- View completion proof photos

## Getting Started

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Tech Stack

- **Next.js 14** - React framework with App Router
- **shadcn/ui** - UI component library
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **localStorage** - Data persistence
- **Lucide React** - Icons

## How It Works

### Vendor Flow
1. Login with any credentials
2. Create a payment link by filling out the form (client details, amount, advance percentage, terms)
3. Share the generated link with the client
4. When client pays and agrees to terms, payment is reserved
5. Start production to release the reserved payment
6. Mark order complete with proof photos
7. Client receives final payment link automatically

### Client Flow
1. Click on payment link from vendor
2. Make advance payment
3. Review terms and conditions
4. Agree to terms to reserve payment
5. Wait for production to complete
6. View completion proof photos
7. Make final payment

### Order Statuses
- **Pending Payment** - Awaiting client's advance payment
- **Payment Reserved** - Client paid and agreed to terms
- **In Production** - Vendor started working on order
- **Final Payment Pending** - Order complete, awaiting final payment
- **Paid** - Order fully complete and paid

## Data Storage

All data is stored in browser localStorage:
- Orders
- Notifications
- Vendor profile
- Authentication state

Note: This is a prototype. For production use, integrate with a real database and authentication system.


