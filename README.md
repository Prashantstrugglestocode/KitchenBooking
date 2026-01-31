# 🍳 W27 Kitchen Booking

A modern, community-focused kitchen booking system built for shared living spaces. Residents can easily reserve the communal kitchen, view existing bookings, and manage their reservations.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7-2D3748?style=flat-square&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)

## ✨ Features

### 📅 Interactive Calendar

- **Week/Day/Month views** - Switch between different calendar perspectives
- **Month navigation** - Easily browse future months to plan ahead
- **Real-time availability** - See all bookings at a glance
- **Mobile responsive** - Automatically switches to day view on mobile devices

### ⏰ Smart Booking System

- **Duration picker** - Choose from preset durations (30 min to 4 hours) or enter custom time
- **10 PM cutoff** - Kitchen closes at 10 PM with a friendly warning
- **Conflict prevention** - Serializable transactions prevent double bookings
- **Past booking protection** - Cannot book time slots in the past

### 🗑️ Booking Management

- **View booking details** - Click any event to see who booked it
- **Delete your bookings** - Only you can delete bookings you created (localStorage-based ownership)
- **Calendar integration** - Add bookings to Google Calendar or Apple Calendar

### 🎨 Beautiful UI

- **Light mode design** - Clean, modern interface
- **Smooth animations** - Polished micro-interactions
- **Accessible** - Keyboard navigable with proper ARIA labels

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (or use a hosted solution like Supabase, Neon, etc.)
- npm or yarn

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/Prashantstrugglestocode/KitchenBooking.git
   cd KitchenBooking
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Create a `.env` file in the root directory:

   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```

4. **Set up the database**

   ```bash
   npx prisma migrate dev
   ```

5. **Run the development server**

   ```bash
   npm run dev
   ```

6. **Open your browser**

   Navigate to [http://localhost:3000](http://localhost:3000)

## 🛠️ Tech Stack

| Technology             | Purpose                              |
| ---------------------- | ------------------------------------ |
| **Next.js 16**         | React framework with App Router      |
| **TypeScript**         | Type-safe JavaScript                 |
| **Prisma 7**           | Database ORM with PostgreSQL adapter |
| **PostgreSQL**         | Relational database                  |
| **Tailwind CSS**       | Utility-first styling                |
| **react-big-calendar** | Calendar component                   |
| **date-fns**           | Date manipulation                    |
| **Lucide React**       | Icons                                |

## 📁 Project Structure

```
src/
├── app/
│   ├── page.tsx          # Landing page
│   ├── book/
│   │   └── page.tsx      # Booking page
│   ├── actions.ts        # Server actions (CRUD operations)
│   └── layout.tsx        # Root layout
├── components/
│   ├── BookingCalendar.tsx   # Main calendar component
│   ├── BookingModal.tsx      # Create booking modal
│   └── BookingInfoModal.tsx  # View/delete booking modal
└── lib/
    ├── prisma.ts         # Prisma client setup
    └── utils.ts          # Utility functions
```

## 🔧 Environment Variables

| Variable       | Description                  |
| -------------- | ---------------------------- |
| `DATABASE_URL` | PostgreSQL connection string |

## 📝 Usage

1. **Book the Kitchen**
   - Click on any empty time slot in the calendar
   - Select your desired duration
   - Enter your name
   - Click "Confirm Booking"

2. **View Bookings**
   - All bookings are visible on the calendar
   - Click any booking to see details

3. **Delete Your Booking**
   - Click on a booking you created
   - Click the "Delete" button (only visible for your own bookings)

4. **Navigate Calendar**
   - Use ← → arrows to change months
   - Click "Today" to return to current date
   - Switch between Month/Week/Day views

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

Built with ❤️ for the W27 community
