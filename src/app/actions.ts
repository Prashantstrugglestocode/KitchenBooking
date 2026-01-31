"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { randomUUID } from "crypto";

export async function getBookings(start: Date, end: Date) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        startTime: {
          gte: start,
        },
        endTime: {
          lte: end,
        },
      },
      select: {
        id: true,
        startTime: true,
        endTime: true,
        user: true,
      },
    });
    return bookings;
  } catch (error) {
    console.error("Failed to fetch bookings:", error);
    return [];
  }
}


export async function createBooking(prevState: any, formData: FormData) {
  const user = formData.get("user") as string;
  const startTime = formData.get("startTime") as string; // ISO string
  const endTime = formData.get("endTime") as string;     // ISO string

  if (!user || !startTime || !endTime) {
    return { message: "Missing required fields", success: false };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);
  
  // Generate a secure delete token
  const deleteToken = randomUUID();

  try {
    const booking = await prisma.$transaction(async (tx) => {
      // Check for overlap within the transaction
      const existing = await tx.booking.findFirst({
        where: {
          OR: [
            {
              startTime: { lt: end },
              endTime: { gt: start },
            },
          ],
        },
      });

      if (existing) {
        throw new Error("Time slot already booked!");
      }

      return await tx.booking.create({
        data: {
          user,
          startTime: start,
          endTime: end,
          deleteToken,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    revalidatePath("/book");
    revalidatePath("/");
    // Return the deleteToken to the client (stored in localStorage)
    return { 
      message: "Booking success!", 
      success: true, 
      bookingId: booking.id,
      deleteToken: booking.deleteToken 
    };
  } catch (error: any) {
    console.error("Failed to create booking:", error);
    if (error.message === "Time slot already booked!") {
        return { message: "Time slot already booked!", success: false };
    }
    // Handle serialization failure (code 40001 in pg)
    if (error.code === 'P2034') { // Prisma transaction failed
         return { message: "Booking conflict, please try again.", success: false };
    }
    return { message: "Failed to create booking", success: false };
  }
}

export async function deleteBooking(bookingId: string, deleteToken: string) {
  try {
    // First verify the token matches
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      select: { deleteToken: true },
    });

    if (!booking) {
      return { success: false, message: "Booking not found" };
    }

    if (booking.deleteToken !== deleteToken) {
      return { success: false, message: "Unauthorized - you can only delete your own bookings" };
    }

    // Token matches, proceed with deletion
    await prisma.booking.delete({
      where: { id: bookingId },
    });
    
    revalidatePath("/book");
    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete booking:", error);
    return { success: false, message: "Failed to delete" };
  }
}
