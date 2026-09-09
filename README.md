# The Kiambu BnB

A premium, ultra-modern booking and property management platform built for **The Kiambu BnB**. 

Designed with a focus on immersive aesthetics, high-end user experience, and robust admin controls, this application allows guests to explore the property, make reservations, and allows administrators to effortlessly manage bookings and inquiries in real-time.

## ✨ Features

### Storefront (Guest Experience)
- **Immersive Design**: A stunning, high-contrast, dark-mode aesthetic utilizing glassmorphism, micro-animations, and parallax scrolling to create a premium feel.
- **Dynamic Reservation System**: Guests can easily select dates, verify availability, and secure their booking. 
- **Real-Time Currency Conversion**: Displays pricing in both USD and local KES equivalent dynamically.
- **Interactive UI**: Powered by GSAP and Framer Motion for buttery-smooth page transitions, reveals, and interactive elements.
- **Responsive Navigation**: A sleek, full-screen overlay sidebar for easy navigation on any device.

### Admin Dashboard (Property Management)
- **Secure Access**: A custom, passcode-protected lock screen restricting access to the dashboard.
- **Live Ledger**: Real-time management of Bookings, Guests, and Inquiries via Convex.
- **Property Controls**: Administrators can toggle whether the property is accepting new bookings and instantly update the base price per night.
- **Automated Calculations**: Calculates total stay costs dynamically based on the current base price and length of stay.

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React 19)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/) & [GSAP](https://gsap.com/)
- **Backend & Database**: [Convex](https://www.convex.dev/) (Serverless, Real-time Database)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Date Picking**: React Datepicker
- **Language**: TypeScript

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Clone the repository
```bash
git clone https://github.com/aineahmarabi/KiambuBnB.git
cd KiambuBnB
```

### 2. Install dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env.local` file in the root directory and add the following variables:
```env
# Your Convex Deployment URL (Provided when you run `npx convex dev`)
NEXT_PUBLIC_CONVEX_URL=your_convex_url

# The master PIN used to access the Admin Dashboard
ADMIN_PASSCODE=14328 
```

### 4. Run the Development Server & Database
Start the Convex backend and the Next.js frontend simultaneously:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the storefront, or [http://localhost:3000/admin](http://localhost:3000/admin) to access the dashboard.

## 📦 Deployment (Vercel)

This project is optimized for deployment on [Vercel](https://vercel.com/). 
When deploying, ensure you add the following Environment Variables in your Vercel project settings:
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `ADMIN_PASSCODE`

## 🧹 Database Management

If you need to completely wipe the database of all bookings, guests, and inquiries for a fresh start, you can run the built-in Convex wipe script:
```bash
npx convex run wipe:all
```

---
*Built with precision for The Kiambu BnB.*
