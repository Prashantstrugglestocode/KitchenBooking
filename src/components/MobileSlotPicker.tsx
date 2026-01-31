"use client";

import { format, addDays, isSameDay, setHours, setMinutes, isAfter, isBefore, startOfDay } from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
}

interface MobileSlotPickerProps {
  date: Date;
  onNavigate: (newDate: Date) => void;
  events: BookingEvent[];
  onSlotClick: (start: Date, end: Date) => void;
}

export function MobileSlotPicker({ date, onNavigate, events, onSlotClick }: MobileSlotPickerProps) {
  // Generate slots from 6 AM to 10 PM (22:00)
  const slots: Date[] = [];
  const startHour = 6;
  const endHour = 22;

  let currentSlot = setMinutes(setHours(date, startHour), 0);
  const endTime = setMinutes(setHours(date, endHour), 0);

  while (isBefore(currentSlot, endTime)) {
    slots.push(currentSlot);
    currentSlot = setMinutes(currentSlot, currentSlot.getMinutes() + 30);
  }

  // Helper to check if a slot is booked
  const getSlotStatus = (slotStart: Date) => {
    const slotEnd = setMinutes(slotStart, slotStart.getMinutes() + 30);
    
    // Check if in past
    if (isBefore(slotStart, new Date())) {
      return "past";
    }

    // Check overlap
    const isBooked = events.some(event => {
       // Simple overlap check
       return (
         (isAfter(slotStart, event.start) || slotStart.getTime() === event.start.getTime()) &&
         isBefore(slotStart, event.end)
       );
    });

    if (isBooked) return "booked";
    return "available";
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 p-4 border-b border-slate-100 bg-white z-10 sticky top-0">
        <div className="flex items-center justify-between">
            <button
              onClick={() => onNavigate(addDays(date, -1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold text-slate-900">
              {format(date, "EEE, MMM d")}
            </h2>
            <button
              onClick={() => onNavigate(addDays(date, 1))}
              className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
        </div>
        <button 
           onClick={() => onNavigate(new Date())}
           className="w-full py-2 text-sm font-medium text-white bg-slate-900 rounded-xl shadow-sm active:scale-95 transition-all"
        >
           Jump to Today
        </button>
      </div>

      {/* Slots List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {slots.map((slot, index) => {
           const status = getSlotStatus(slot);
           const isAvailable = status === "available";
           
           return (
             <button
               key={index}
               disabled={!isAvailable}
               onClick={() => isAvailable && onSlotClick(slot, setMinutes(slot, slot.getMinutes() + 30))}
               className={cn(
                 "w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left",
                 status === "available" 
                    ? "bg-white border-slate-200 shadow-sm hover:border-primary hover:shadow-md active:scale-[0.99]" 
                    : "bg-slate-50 border-slate-100 opacity-60 cursor-not-allowed"
               )}
             >
                <div className="flex items-center gap-3">
                    <Clock className={cn("h-5 w-5", status === "available" ? "text-primary" : "text-slate-400")} />
                    <span className={cn("text-base font-semibold", status === "available" ? "text-slate-900" : "text-slate-500")}>
                        {format(slot, "h:mm a")}
                    </span>
                </div>
                
                <div className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide",
                    status === "available" ? "bg-green-100 text-green-700" :
                    status === "booked" ? "bg-red-100 text-red-700" :
                    "bg-slate-200 text-slate-600"
                )}>
                    {status === "booked" ? "Booked" : status === "past" ? "Past" : "Free"}
                </div>
             </button>
           );
        })}
        
        <div className="text-center text-xs text-slate-400 py-4">
           Kitchen closes at 10 PM
        </div>
      </div>
    </div>
  );
}
