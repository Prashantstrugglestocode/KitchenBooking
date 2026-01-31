"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, SlotInfo, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { cn } from "@/lib/utils";
import { getBookings } from "@/app/actions";
import { BookingModal } from "./BookingModal";

// Setup localizer
const locales = {
  "en-US": enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface BookingCalendarProps {
  className?: string;
}

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

export function BookingCalendar({ className }: BookingCalendarProps) {
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  const [events, setEvents] = useState<BookingEvent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);

  const fetchBookings = useCallback(async () => {
    // Calculate start/end of the current view
    // For simplicity, just fetch a wide range around the current date or optimizing based on 'view'
    // Let's fetch current month + previous/next to be safe
    const start = startOfDay(addDays(date, -30));
    const end = endOfDay(addDays(date, 30));
    
    const bookings = await getBookings(start, end);
    const formattedEvents = bookings.map((b: { id: string; user: string; startTime: Date; endTime: Date }) => ({
      id: b.id,
      title: `Booked by ${b.user}`,
      start: new Date(b.startTime),
      end: new Date(b.endTime),
    }));
    setEvents(formattedEvents);
  }, [date]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // Mobile responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setView(Views.DAY);
      } else {
        setView(Views.WEEK);
      }
    };

    // Set initial view
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    // basic validation: strict future? or just open modal
    // Check if slot is in the past?
    if (slotInfo.start < new Date()) {
      alert("Cannot book in the past!");
      return;
    }
    
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setModalOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchBookings(); // Refresh events
  };

  return (
    <div className={cn("h-[600px] md:h-[700px] rounded-xl border bg-card p-4 md:p-6 shadow-sm", className)}>
      <div className="mb-4 flex items-center justify-between md:hidden">
        <h2 className="text-lg font-semibold">Calendar</h2>
        <div className="flex gap-2">
            <button 
                onClick={() => setView(Views.DAY)} 
                className={cn("px-3 py-1 text-sm rounded-md", view === Views.DAY ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
                Day
            </button>
            <button 
                onClick={() => setView(Views.WEEK)} 
                className={cn("px-3 py-1 text-sm rounded-md", view === Views.WEEK ? "bg-primary text-primary-foreground" : "bg-muted")}
            >
                Week
            </button>
        </div>
      </div>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100% - 40px)" }} // Adjust for mobile header
        view={view}
        onView={setView}
        date={date}
        onNavigate={setDate}
        selectable
        onSelectSlot={handleSelectSlot}
        min={new Date(0, 0, 0, 7, 0, 0)} // 7 AM
        max={new Date(0, 0, 0, 23, 0, 0)} // 11 PM
        step={60} // 1 hour slots by default visual
        timeslots={1}
      />

      {selectedSlot && (
        <BookingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          startTime={selectedSlot.start}
          endTime={selectedSlot.end}
          onSuccess={handleBookingSuccess}
        />
      )}
    </div>
  );
}
