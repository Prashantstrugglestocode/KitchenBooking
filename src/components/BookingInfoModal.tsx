"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { X, Trash2 } from "lucide-react";
import { deleteBooking } from "@/app/actions";

interface BookingInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: {
    id: string;
    title: string;
    start: Date;
    end: Date;
  };
  onDeleteSuccess: () => void;
}

export function BookingInfoModal({ isOpen, onClose, event, onDeleteSuccess }: BookingInfoModalProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [canDelete, setCanDelete] = useState(false);
  const [deleteToken, setDeleteToken] = useState<string | null>(null);

  const [showConfirm, setShowConfirm] = useState(false);

  // Check if user owns this booking (has the delete token)
  useEffect(() => {
    if (isOpen && event?.id && typeof window !== "undefined") {
      const myBookings = JSON.parse(localStorage.getItem("myBookings") || "{}");
      const token = myBookings[event.id];
      if (token) {
        setCanDelete(true);
        setDeleteToken(token);
      } else {
        setCanDelete(false);
        setDeleteToken(null);
      }
    }
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const handleConfirmDelete = async () => {
    if (!deleteToken) return;

    setIsDeleting(true);
    const result = await deleteBooking(event.id, deleteToken);
    
    if (result.success) {
      const myBookings = JSON.parse(localStorage.getItem("myBookings") || "{}");
      delete myBookings[event.id];
      localStorage.setItem("myBookings", JSON.stringify(myBookings));
      
      onDeleteSuccess();
      onClose();
    } else {
      alert(result.message || "Failed to delete booking");
    }
    setIsDeleting(false);
    setShowConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        
        {showConfirm ? (
           <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4 text-3xl">
                ⚠️
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Cancel Booking?</h2>
              <p className="text-slate-600 mb-6">
                Are you sure you want to cancel this booking? This action cannot be undone.
              </p>
              
              <div className="flex gap-3">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
                >
                  No, Keep it
                </button>
                <button
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 disabled:opacity-50"
                >
                  {isDeleting ? "Canceling..." : "Yes, Cancel"}
                </button>
              </div>
           </div>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-800 tracking-tight">Booking Details</h2>
              <button onClick={onClose} className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <div className="mb-1 text-sm text-slate-500 font-medium uppercase tracking-wider">Date & Time</div>
                <div className="font-semibold text-slate-900">{format(event.start, "EEEE, MMM do")}</div>
                <div className="text-slate-600">
                  {format(event.start, "p")} - {format(event.end, "p")}
                </div>
              </div>
              
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                 <div className="mb-1 text-sm text-slate-500 font-medium uppercase tracking-wider">Booked By</div>
                 <div className="font-semibold text-slate-900 text-lg">
                    {event.title.replace("Booked by ", "")}
                 </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-3 text-sm font-medium text-slate-700 transition-all hover:bg-slate-50"
              >
                Close
              </button>
              
              {canDelete && (
                <button
                  onClick={() => setShowConfirm(true)}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 py-3 text-sm font-medium text-red-600 transition-all hover:bg-red-100 hover:border-red-200"
                >
                  <Trash2 className="h-4 w-4" /> Cancel Booking
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
