
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL
});

async function main() {
  try {
    const count = await prisma.booking.count();
    console.log(`Successfully connected. Booking count: ${count}`);
  } catch (e) {
    console.error("Connection failed:", e);
    process.exit(1);
  }
}

main();

