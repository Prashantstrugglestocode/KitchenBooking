"use client";

import { useState, useEffect } from "react";
import { createBooking } from "@/app/actions";
import { X } from "lucide-react";
import { format, addHours } from "date-fns";
import { cn } from "@/lib/utils";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  startTime: Date;
  endTime: Date;
  onSuccess: () => void;
}

export function BookingModal({ isOpen, onClose, startTime, endTime: initialEndTime, onSuccess }: BookingModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [duration, setDuration] = useState(1); // Default 1 hour
  const [customDuration, setCustomDuration] = useState(""); // For manual input
  const [lateNightWarning, setLateNightWarning] = useState(false);

  // Calculate actual end time based on duration
  const endTime = addHours(startTime, duration);
  
  // Check for 10 PM cutoff (22:00)
  useEffect(() => {
    const endHour = endTime.getHours();
    if (endHour >= 22 || (endHour === 0 && endTime.getMinutes() > 0)) {
      setLateNightWarning(true);
    } else {
      setLateNightWarning(false);
    }
  }, [endTime]);

  // Reset state when opening/closing
  if (!isOpen && success) {
      setTimeout(() => setSuccess(false), 300); 
  }
  
  if (!isOpen) return null;

  async function handleSubmit(formData: FormData) {
    // Block if booking ends after 10 PM
    const bookingEndHour = endTime.getHours();
    if (bookingEndHour >= 22 || (bookingEndHour === 0 && endTime.getMinutes() > 0)) {
      setError("Bookings cannot extend past 10 PM. Please contact W27 management for special arrangements.");
      return;
    }

    setLoading(true);
    setError("");
    
    formData.append("startTime", startTime.toISOString());
    formData.append("endTime", endTime.toISOString());

    // Get or create device token for rate limiting
    let deviceToken = localStorage.getItem("kitchen_device_token");
    if (!deviceToken) {
      deviceToken = crypto.randomUUID();
      localStorage.setItem("kitchen_device_token", deviceToken);
    }
    formData.append("deviceToken", deviceToken);

    const result = await createBooking(null, formData);
    setLoading(false);

    if (result.success) {
      // Store booking id and delete token in local storage for secure deletion
      const bookingId = (result as any).bookingId;
      const deleteToken = (result as any).deleteToken;
      
      if (bookingId && deleteToken && typeof window !== "undefined") {
        const myBookings = JSON.parse(localStorage.getItem("myBookings") || "{}");
        myBookings[bookingId] = deleteToken;
        localStorage.setItem("myBookings", JSON.stringify(myBookings));
      }
      setSuccess(true);
      onSuccess();
    } else {
      setError(result.message || "Something went wrong");
    }
  }

  const handleGoogleCalendar = () => {
    const text = "Kitchen Booking";
    const details = "Community Kitchen reservation";
    const start = format(startTime, "yyyyMMdd'T'HHmmss");
    const end = format(endTime, "yyyyMMdd'T'HHmmss");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(text)}&details=${encodeURIComponent(details)}&dates=${start}/${end}`;
    window.open(url, "_blank");
  };

  const handleAppleCalendar = () => {
    const icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${format(startTime, "yyyyMMdd'T'HHmmss")}`,
      `DTEND:${format(endTime, "yyyyMMdd'T'HHmmss")}`,
      "SUMMARY:Kitchen Booking",
      "DESCRIPTION:Community Kitchen reservation",
      "END:VEVENT",
      "END:VCALENDAR"
    ].join("\n");

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'kitchen-booking.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {success ? (
          <div className="text-center py-6">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 mb-4">
              <span className="text-3xl">🎉</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Booking Confirmed!</h2>
            <p className="text-slate-600 mb-8">
              You are booked for <span className="font-semibold text-slate-800">{format(startTime, "MMM d")}</span> from <span className="font-semibold text-slate-800">{format(startTime, "p")}</span> to <span className="font-semibold text-slate-800">{format(endTime, "p")}</span>.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={handleGoogleCalendar}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
              >
                <span>📅</span> Add to Google Calendar
              </button>
              <button
                onClick={handleAppleCalendar}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white p-3 font-medium text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300 relative overflow-hidden"
              >
                 <span>🍏</span> Add to Apple Calendar
              </button>
            </div>

            <button
              onClick={onClose}
              className="mt-8 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Confirm Booking</h2>
              <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 flex items-center gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white border border-slate-200 shadow-sm text-lg">
                🕒
              </div>
              <div className="text-sm">
                 <p className="font-semibold text-slate-900">{format(startTime, "EEEE, MMMM do")}</p>
                 <p className="text-slate-500">{format(startTime, "p")} - {format(endTime, "p")}</p>
              </div>
            </div>

            {/* Duration Selector */}
            <div className="mb-6 space-y-3">
              <label className="text-sm font-semibold text-slate-700">
                Duration
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => { setDuration(0.5); setCustomDuration(""); }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                    duration === 0.5 && !customDuration
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  30 min
                </button>
                <button
                  type="button"
                  onClick={() => { setDuration(1); setCustomDuration(""); }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                    duration === 1 && !customDuration
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  1 hour
                </button>
                <button
                  type="button"
                  onClick={() => { setDuration(1.5); setCustomDuration(""); }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                    duration === 1.5 && !customDuration
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  1.5 hours
                </button>
                <button
                  type="button"
                  onClick={() => { setDuration(2); setCustomDuration(""); }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                    duration === 2 && !customDuration
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  2 hours
                </button>
                <button
                  type="button"
                  onClick={() => { setDuration(3); setCustomDuration(""); }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                    duration === 3 && !customDuration
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  3 hours
                </button>
                <button
                  type="button"
                  onClick={() => { setDuration(4); setCustomDuration(""); }}
                  className={cn(
                    "px-3 py-2 text-sm font-medium rounded-lg border transition-all",
                    duration === 4 && !customDuration
                      ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                      : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                  )}
                >
                  4 hours
                </button>
              </div>
              
              {/* Manual Input */}
              <div className="flex items-center gap-2 pt-2">
                <span className="text-sm text-slate-500">Or enter custom:</span>
                <input
                  type="number"
                  min="0.5"
                  max="8"
                  step="0.5"
                  value={customDuration}
                  onChange={(e) => {
                    setCustomDuration(e.target.value);
                    const val = parseFloat(e.target.value);
                    if (!isNaN(val) && val > 0) {
                      setDuration(val);
                    }
                  }}
                  placeholder="hrs"
                  className="w-20 h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600"
                />
                <span className="text-sm text-slate-500">hours</span>
              </div>
            </div>

            {/* Late Night Warning */}
            {lateNightWarning && (
              <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚠️</span>
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Kitchen closes at 10 PM</p>
                    <p className="text-sm text-amber-700 mt-1">
                      Bookings cannot extend past 10 PM. For special arrangements, please contact <span className="font-semibold">W27 management</span>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="user" className="text-sm font-semibold text-slate-700">
                  Your Name
                </label>
                <input
                  id="user"
                  name="user"
                  required
                  placeholder="Enter your name"
                  className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm focus:border-indigo-600"
                />
                <p className="text-xs text-slate-500">
                  Visible to other residents.
                </p>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 focus-visible:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || lateNightWarning}
                  className="inline-flex h-11 items-center justify-center rounded-xl bg-indigo-600 px-8 text-sm font-medium text-white shadow-lg shadow-indigo-600/25 transition-all hover:bg-indigo-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600 focus-visible:ring-offset-2 disabled:bg-slate-300 disabled:text-slate-500 disabled:opacity-100 disabled:shadow-none disabled:pointer-events-none"
                >
                  {loading ? "Booking..." : "Confirm Booking"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
