import { BookingCalendar } from "@/components/BookingCalendar";

export default function BookPage() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Book the Kitchen</h1>
        <p className="text-muted-foreground">Select a time slot to reserve the community kitchen.</p>
      </div>
      
      <BookingCalendar />
    </div>
  );
}
