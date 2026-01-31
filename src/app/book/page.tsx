import { BookingCalendar } from "@/components/BookingCalendar";

export default function BookPage() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">Book the Kitchen</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Select a time slot to reserve instantly. No sign-up required (Secure & Private).
        </p>
      </div>
      
      <BookingCalendar />
    </div>
  );
}
