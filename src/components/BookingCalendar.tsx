"use client";

import { useEffect, useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views, SlotInfo, View } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay } from "date-fns";
import { enUS } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { cn } from "@/lib/utils";
import { getBookings } from "@/app/actions";
import { BookingModal } from "./BookingModal";
import { BookingInfoModal } from "./BookingInfoModal";
import { AlertModal } from "./AlertModal";

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
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<BookingEvent | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");

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
    // Check if slot is in the past
    if (slotInfo.start < new Date()) {
      setAlertMessage("You cannot book a time slot in the past. Please select a future time.");
      setAlertOpen(true);
      return;
    }
    
    setSelectedSlot({ start: slotInfo.start, end: slotInfo.end });
    setModalOpen(true);
  };

  const handleSelectEvent = (event: BookingEvent) => {
    setSelectedEvent(event);
    setInfoModalOpen(true);
  };

  const handleBookingSuccess = () => {
    fetchBookings(); // Refresh events
  };

  return (
    <div className={cn("flex flex-col h-[600px] md:h-[700px] rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50", className)}>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between flex-shrink-0">
        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => {
              if (view === Views.MONTH) {
                setDate(new Date(date.getFullYear(), date.getMonth() - 1, 1));
              } else if (view === Views.WEEK) {
                setDate(addDays(date, -7));
              } else {
                setDate(addDays(date, -1));
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            aria-label="Previous"
          >
            ←
          </button>
          <h2 className="text-xl font-bold text-slate-800 tracking-tight text-center sm:min-w-[200px]">
            {view === Views.MONTH 
              ? format(date, "MMMM yyyy")
              : format(date, "EEEE, MMM d, yyyy")
            }
          </h2>
          <button 
            onClick={() => {
              if (view === Views.MONTH) {
                setDate(new Date(date.getFullYear(), date.getMonth() + 1, 1));
              } else if (view === Views.WEEK) {
                setDate(addDays(date, 7));
              } else {
                setDate(addDays(date, 1));
              }
            }}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            aria-label="Next"
          >
            →
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 rounded-lg bg-slate-100 p-1">
            <button 
                onClick={() => setView(Views.MONTH)} 
                className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", view === Views.MONTH ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900")}
            >
                Month
            </button>
            <button 
                onClick={() => setView(Views.WEEK)} 
                className={cn("px-4 py-1.5 text-sm font-medium rounded-md transition-all", view === Views.WEEK ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900")}
            >
                Week
            </button>
            <button 
                onClick={() => setView(Views.DAY)} 
                className={cn("px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-all", view === Views.DAY ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-900")}
            >
                Day
            </button>
        </div>

        {/* Today Button */}
        <button 
          onClick={() => setDate(new Date())} 
          className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-lg shadow-sm transition-all"
        >
          Today
        </button>
      </div>
      
      {/* Custom Styles for Calendar */}
      <style jsx global>{`
        .rbc-calendar { font-family: inherit; }
        .rbc-header { padding: 8px 4px; font-weight: 600; color: #64748b; border-bottom: 1px solid #e2e8f0; font-size: 0.875rem; }
        .rbc-today { background-color: #f8fafc; }
        .rbc-event { background-color: var(--primary) !important; border-radius: 6px; border: none; box-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .rbc-event-content { font-size: 0.75rem; line-height: 1.1; white-space: normal; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; }
        .rbc-time-view .rbc-row { min-height: 20px; }
        .rbc-time-header-content { border-left: 1px solid #e2e8f0; }
        .rbc-time-content { border-top: 1px solid #e2e8f0; }
        .rbc-timeslot-group { border-bottom: 1px solid #f1f5f9; }
        .rbc-day-slot .rbc-events-container { margin-right: 0px; }
        .rbc-current-time-indicator { background-color: #ef4444; }
        .rbc-time-gutter .rbc-timeslot-group { padding: 0 4px; font-size: 0.75rem; }
        
        @media (max-width: 640px) {
          .rbc-toolbar { flex-direction: column; gap: 10px; }
          .rbc-header { font-size: 0.75rem; padding: 4px 2px; }
          .rbc-time-gutter { font-size: 0.7rem; width: 40px !important; min-width: 40px !important; }
          .rbc-event-content { font-size: 0.7rem; }
          .rbc-time-header-cell { min-height: auto !important; }
        }
      `}</style>

      <div className="flex-1 overflow-x-auto w-full relative">
        <div className="min-w-[600px] h-full"> 
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }} 
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            selectable
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            min={new Date(0, 0, 0, 6, 0, 0)} // 6 AM
            max={new Date(0, 0, 0, 22, 0, 0)} // 10 PM - Kitchen closes
            step={30} // 30 min slots
            timeslots={1}
            toolbar={false} // Custom toolbar
            longPressThreshold={10} // Enable immediate click on touch devices
          />
        </div>
      </div>

      {selectedSlot && (
        <BookingModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          startTime={selectedSlot.start}
          endTime={selectedSlot.end}
          onSuccess={handleBookingSuccess}
        />
      )}

      {selectedEvent && (
        <BookingInfoModal
          isOpen={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          event={selectedEvent}
          onDeleteSuccess={handleBookingSuccess}
        />
      )}

      <AlertModal 
        isOpen={alertOpen} 
        onClose={() => setAlertOpen(false)} 
        title="Cannot Book" 
        message={alertMessage} 
      />
    </div>
  );
}
