// data/cars_db.ts

export type Car = {
  id: number;
  make: string;
  model: string;
  type: "SUV" | "PickUp" | "Hatchback" | "Sedán" | "Deportivo";
  capacity: number; // número de pasajeros
  priceUSD: number;
};

export const carsDb: Car[] = [
  // 10 SUV
  { id: 1, make: "Toyota", model: "RAV4", type: "SUV", capacity: 5, priceUSD: 32000 },
  { id: 2, make: "Honda", model: "CR-V", type: "SUV", capacity: 5, priceUSD: 31000 },
  { id: 3, make: "Ford", model: "Explorer", type: "SUV", capacity: 7, priceUSD: 45000 },
  { id: 4, make: "Chevrolet", model: "Tahoe", type: "SUV", capacity: 7, priceUSD: 50000 },
  { id: 5, make: "Nissan", model: "Rogue", type: "SUV", capacity: 5, priceUSD: 33000 },
  { id: 6, make: "Hyundai", model: "Santa Fe", type: "SUV", capacity: 5, priceUSD: 35000 },
  { id: 7, make: "Kia", model: "Sorento", type: "SUV", capacity: 7, priceUSD: 36000 },
  { id: 8, make: "Mazda", model: "CX-5", type: "SUV", capacity: 5, priceUSD: 34000 },
  { id: 9, make: "Volkswagen", model: "Tiguan", type: "SUV", capacity: 5, priceUSD: 33000 },
  { id: 10, make: "Subaru", model: "Forester", type: "SUV", capacity: 5, priceUSD: 32000 },

  // 10 PickUp
  { id: 11, make: "Toyota", model: "Hilux", type: "PickUp", capacity: 5, priceUSD: 35000 },
  { id: 12, make: "Ford", model: "F-150", type: "PickUp", capacity: 5, priceUSD: 45000 },
  { id: 13, make: "Chevrolet", model: "Silverado", type: "PickUp", capacity: 5, priceUSD: 47000 },
  { id: 14, make: "Ram", model: "1500", type: "PickUp", capacity: 5, priceUSD: 46000 },
  { id: 15, make: "Nissan", model: "Navara", type: "PickUp", capacity: 5, priceUSD: 34000 },
  { id: 16, make: "GMC", model: "Sierra", type: "PickUp", capacity: 5, priceUSD: 48000 },
  { id: 17, make: "Honda", model: "Ridgeline", type: "PickUp", capacity: 5, priceUSD: 42000 },
  { id: 18, make: "Isuzu", model: "D-Max", type: "PickUp", capacity: 5, priceUSD: 36000 },
  { id: 19, make: "Mitsubishi", model: "L200", type: "PickUp", capacity: 5, priceUSD: 34000 },
  { id: 20, make: "Ford", model: "Ranger", type: "PickUp", capacity: 5, priceUSD: 37000 },

  // 10 Hatchback
  { id: 21, make: "Volkswagen", model: "Golf", type: "Hatchback", capacity: 5, priceUSD: 25000 },
  { id: 22, make: "Honda", model: "Civic Hatchback", type: "Hatchback", capacity: 5, priceUSD: 26000 },
  { id: 23, make: "Ford", model: "Focus", type: "Hatchback", capacity: 5, priceUSD: 24000 },
  { id: 24, make: "Mazda", model: "3 Hatchback", type: "Hatchback", capacity: 5, priceUSD: 27000 },
  { id: 25, make: "Hyundai", model: "i30", type: "Hatchback", capacity: 5, priceUSD: 23000 },
  { id: 26, make: "Toyota", model: "Yaris", type: "Hatchback", capacity: 5, priceUSD: 22000 },
  { id: 27, make: "Kia", model: "Rio", type: "Hatchback", capacity: 5, priceUSD: 21000 },
  { id: 28, make: "Nissan", model: "Versa Note", type: "Hatchback", capacity: 5, priceUSD: 20000 },
  { id: 29, make: "Chevrolet", model: "Sonic", type: "Hatchback", capacity: 5, priceUSD: 20500 },
  { id: 30, make: "Volkswagen", model: "Polo", type: "Hatchback", capacity: 5, priceUSD: 21500 },

  // 10 Sedán
  { id: 31, make: "Toyota", model: "Corolla", type: "Sedán", capacity: 5, priceUSD: 25000 },
  { id: 32, make: "Honda", model: "Accord", type: "Sedán", capacity: 5, priceUSD: 28000 },
  { id: 33, make: "Hyundai", model: "Elantra", type: "Sedán", capacity: 5, priceUSD: 24000 },
  { id: 34, make: "Nissan", model: "Sentra", type: "Sedán", capacity: 5, priceUSD: 23000 },
  { id: 35, make: "Mazda", model: "6", type: "Sedán", capacity: 5, priceUSD: 27000 },
  { id: 36, make: "Kia", model: "Forte", type: "Sedán", capacity: 5, priceUSD: 22000 },
  { id: 37, make: "Volkswagen", model: "Jetta", type: "Sedán", capacity: 5, priceUSD: 24500 },
  { id: 38, make: "Chevrolet", model: "Malibu", type: "Sedán", capacity: 5, priceUSD: 23500 },
  { id: 39, make: "Ford", model: "Fusion", type: "Sedán", capacity: 5, priceUSD: 25500 },
  { id: 40, make: "Honda", model: "Insight", type: "Sedán", capacity: 5, priceUSD: 26000 },

  // 10 Deportivo
  { id: 41, make: "Porsche", model: "911", type: "Deportivo", capacity: 2, priceUSD: 120000 },
  { id: 42, make: "Ferrari", model: "488", type: "Deportivo", capacity: 2, priceUSD: 250000 },
  { id: 43, make: "Lamborghini", model: "Huracán", type: "Deportivo", capacity: 2, priceUSD: 300000 },
  { id: 44, make: "Chevrolet", model: "Corvette", type: "Deportivo", capacity: 2, priceUSD: 70000 },
  { id: 45, make: "Audi", model: "R8", type: "Deportivo", capacity: 2, priceUSD: 170000 },
  { id: 46, make: "McLaren", model: "720S", type: "Deportivo", capacity: 2, priceUSD: 300000 },
  { id: 47, make: "Nissan", model: "GT-R", type: "Deportivo", capacity: 2, priceUSD: 120000 },
  { id: 48, make: "Jaguar", model: "F-Type", type: "Deportivo", capacity: 2, priceUSD: 110000 },
  { id: 49, make: "BMW", model: "M4", type: "Deportivo", capacity: 2, priceUSD: 95000 },
  { id: 50, make: "Toyota", model: "Supra", type: "Deportivo", capacity: 2, priceUSD: 50000 },
];
