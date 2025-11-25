import { addEntity, addTransaction, setFinancialConfig } from "./firestore/business";
import { Timestamp } from "firebase/firestore";

// Generate random date within last 30 days
const randomDate = (daysAgo: number = 0): Date => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(Math.floor(Math.random() * 24));
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

export const seedPadelBusiness = async (businessId: string): Promise<void> => {
  // Create 4 padel courts
  const courts = ["Court 1", "Court 2", "Court 3", "Court 4"];
  for (const courtName of courts) {
    await addEntity(businessId, {
      name: courtName,
      type: "court",
      metadata: {
        capacity: 4,
        hourlyRate: 150000,
      },
    });
  }

  // Create sample bookings (transactions) for last 30 days
  for (let i = 0; i < 60; i++) {
    const date = randomDate(Math.floor(Math.random() * 30));
    const court = courts[Math.floor(Math.random() * courts.length)];
    const hours = Math.random() > 0.5 ? 1 : 2; // 1 or 2 hour bookings
    const revenue = 150000 * hours;

    await addTransaction(businessId, {
      kind: "revenue",
      amount: revenue,
      date: Timestamp.fromDate(date),
      description: `Booking: ${court} (${hours}h)`,
      metadata: {
        entityId: court,
        hours,
        court,
      },
    });
  }

  // Set financial config
  await setFinancialConfig(businessId, {
    hourlyRate: 150000,
    currency: "IDR",
    initialCapex: 50000000, // 50M IDR initial investment
    targetPaybackMonths: 24, // 2 years target
  });
};

export const seedFnbBusiness = async (businessId: string): Promise<void> => {
  // Create menu items (entities)
  const menuItems = [
    { name: "Nasi Goreng", price: 35000, cost: 12000 },
    { name: "Mie Ayam", price: 30000, cost: 10000 },
    { name: "Gado-gado", price: 25000, cost: 8000 },
    { name: "Es Teh Manis", price: 8000, cost: 2000 },
    { name: "Es Jeruk", price: 10000, cost: 3000 },
    { name: "Kopi Hitam", price: 12000, cost: 3000 },
  ];

  for (const item of menuItems) {
    await addEntity(businessId, {
      name: item.name,
      type: "menu_item",
      metadata: {
        price: item.price,
        cost: item.cost,
        margin: item.price - item.cost,
      },
    });
  }

  // Create sample sales (transactions) for last 30 days
  for (let i = 0; i < 200; i++) {
    const date = randomDate(Math.floor(Math.random() * 30));
    const item = menuItems[Math.floor(Math.random() * menuItems.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const revenue = item.price * quantity;
    const cost = item.cost * quantity;

    await addTransaction(businessId, {
      kind: "revenue",
      amount: revenue,
      date: Timestamp.fromDate(date),
      description: `${item.name} x${quantity}`,
      metadata: {
        menuItem: item.name,
        quantity,
        cost,
        margin: revenue - cost,
      },
    });
  }

  // Set financial config
  await setFinancialConfig(businessId, {
    currency: "IDR",
    defaultTaxRate: 0.1, // 10%
    initialCapex: 30000000, // 30M IDR initial investment
    targetPaybackMonths: 18, // 1.5 years target
  });
};
