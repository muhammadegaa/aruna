import { addEntity, addTransaction, setFinancialConfig, getEntities } from "./data/businesses";
import { Timestamp } from "firebase/firestore";

// Generate random date within specified range
const randomDate = (daysAgo: number = 0, maxDaysAgo: number = 90): Date => {
  const date = new Date();
  const daysBack = Math.floor(Math.random() * (maxDaysAgo - daysAgo)) + daysAgo;
  date.setDate(date.getDate() - daysBack);
  
  // More realistic time distribution: peak hours 10-22, less activity 0-9
  const hour = Math.random() < 0.7 
    ? Math.floor(Math.random() * 13) + 10 // 70% chance: 10-22
    : Math.floor(Math.random() * 10); // 30% chance: 0-9
  date.setHours(hour);
  date.setMinutes(Math.floor(Math.random() * 60));
  return date;
};

// Generate date with weekday/weekend distribution
const randomDateWithWeekday = (daysAgo: number = 0, maxDaysAgo: number = 90): Date => {
  const date = randomDate(daysAgo, maxDaysAgo);
  // Adjust for weekends (more activity on weekends for padel)
  const dayOfWeek = date.getDay();
  if (dayOfWeek === 0 || dayOfWeek === 6) {
    // Weekend: shift to peak hours (12-20)
    date.setHours(Math.floor(Math.random() * 9) + 12);
  }
  return date;
};

export const seedPadelBusiness = async (businessId: string, orgId: string): Promise<void> => {
  // Create 4 padel courts
  const courts = ["Court 1", "Court 2", "Court 3", "Court 4"];
  const courtEntities: { id: string; name: string }[] = [];
  
  for (const courtName of courts) {
    const entityId = await addEntity(businessId, {
      name: courtName,
      type: "court",
      metadata: {
        capacity: 4,
        hourlyRate: 150000,
      },
    });
    courtEntities.push({ id: entityId, name: courtName });
  }

  // Create sample bookings (transactions) for last 90 days with realistic distribution
  const numBookings = 180; // ~2 bookings per day average
  
  for (let i = 0; i < numBookings; i++) {
    const date = randomDateWithWeekday(0, 90);
    const courtEntity = courtEntities[Math.floor(Math.random() * courtEntities.length)];
    if (!courtEntity) continue;
    
    // More 2-hour bookings during peak hours (12-20)
    const hour = date.getHours();
    const isPeakHour = hour >= 12 && hour <= 20;
    const hours = isPeakHour && Math.random() > 0.3 ? 2 : Math.random() > 0.5 ? 1 : 2;
    const revenue = 150000 * hours;

    await addTransaction(businessId, {
      kind: "revenue",
      amount: revenue,
      date: Timestamp.fromDate(date),
      description: `Booking: ${courtEntity.name} (${hours}h)`,
      metadata: {
        entityId: courtEntity.id,
        courtId: courtEntity.id,
        court: courtEntity.name,
        hours,
        hour: date.getHours(), // Store hour for occupancy calculation
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

export const seedFnbBusiness = async (businessId: string, orgId: string): Promise<void> => {
  // Create menu items (entities)
  const menuItems = [
    { name: "Nasi Goreng", price: 35000, cost: 12000 },
    { name: "Mie Ayam", price: 30000, cost: 10000 },
    { name: "Gado-gado", price: 25000, cost: 8000 },
    { name: "Es Teh Manis", price: 8000, cost: 2000 },
    { name: "Es Jeruk", price: 10000, cost: 3000 },
    { name: "Kopi Hitam", price: 12000, cost: 3000 },
  ];

  const menuItemEntities: { id: string; name: string; price: number; cost: number }[] = [];
  
  for (const item of menuItems) {
    const entityId = await addEntity(businessId, {
      name: item.name,
      type: "menu_item",
      metadata: {
        price: item.price,
        cost: item.cost,
        margin: item.price - item.cost,
      },
    });
    menuItemEntities.push({ id: entityId, name: item.name, price: item.price, cost: item.cost });
  }

  // Create sample sales (transactions) for last 90 days with realistic distribution
  const numSales = 600; // ~6-7 sales per day average
  for (let i = 0; i < numSales; i++) {
    const date = randomDate(0, 90);
    // More sales during meal times (11-14, 18-21)
    const hour = date.getHours();
    const isMealTime = (hour >= 11 && hour <= 14) || (hour >= 18 && hour <= 21);
    if (isMealTime && Math.random() > 0.3) {
      date.setHours(Math.floor(Math.random() * (isMealTime ? 4 : 2)) + (hour >= 18 ? 18 : 11));
    }
    
    const itemEntity = menuItemEntities[Math.floor(Math.random() * menuItemEntities.length)];
    const quantity = Math.floor(Math.random() * 3) + 1; // 1-3 items
    const revenue = itemEntity.price * quantity;
    const cost = itemEntity.cost * quantity;

    await addTransaction(businessId, {
      kind: "revenue",
      amount: revenue,
      date: Timestamp.fromDate(date),
      description: `${itemEntity.name} x${quantity}`,
      metadata: {
        menuItemId: itemEntity.id, // Store entity ID for aggregation
        menuItem: itemEntity.name,
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
