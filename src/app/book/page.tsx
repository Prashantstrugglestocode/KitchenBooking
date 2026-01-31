import { BookingCalendar } from "@/components/BookingCalendar";

export default function BookPage() {
  return (
    <div className="container mx-auto py-10 px-4 sm:px-8">
      <div className="mb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-[#000000] sm:text-5xl mb-2">Book Common Kitchen</h1>
        <p className="text-lg text-muted-foreground mt-2">
          Now you can book the W27 and keep a track so your reservations do not collide
        </p>
      </div>
      
      <BookingCalendar />
    </div>
  );
}
