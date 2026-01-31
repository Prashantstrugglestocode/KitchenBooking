"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

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
    return { message: "Missing required fields" };
  }

  const start = new Date(startTime);
  const end = new Date(endTime);

  // Simple validation: check for overlap
  const existing = await prisma.booking.findFirst({
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
    return { message: "Time slot already booked!" };
  }

  try {
    await prisma.booking.create({
      data: {
        user,
        startTime: start,
        endTime: end,
      },
    });
    revalidatePath("/book");
    return { message: "Booking success!", success: true };
  } catch (error) {
    console.error("Failed to create booking:", error);
    return { message: "Failed to create booking" };
  }
}
