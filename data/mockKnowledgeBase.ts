import { ProductCategory } from '@/types';

export interface StoreSection {
  aisle: string;
  category: ProductCategory;
  floor: string;
  shelfBays: string[];
  keyBrands: string[];
  description: string;
}

export interface StoreOperatingRule {
  topic: string;
  summary: string;
  details: string;
  keywords: string[];
}

export interface ProductRestriction {
  category: ProductCategory;
  restrictionRule: string;
  requiresStaffInspection: boolean;
  exceptionAllowedReason: string;
}

export const STORE_LAYOUT_KNOWLEDGE: StoreSection[] = [
  {
    aisle: 'Aisle 1',
    category: 'Dairy',
    floor: 'Ground Floor',
    shelfBays: ['Shelf A1 (Chiller)', 'Shelf A2 (Cheese/Butter)', 'Shelf A3 (Paneer/Curd)'],
    keyBrands: ['Amul', 'Nandini', 'Mother Dairy', 'Epigamia'],
    description: 'Chilled dairy, milk packets, curd, butter, cheese, and fresh paneer section.',
  },
  {
    aisle: 'Aisle 2',
    category: 'Grocery & Staples',
    floor: 'Ground Floor',
    shelfBays: ['Shelf B1 (Atta/Flour)', 'Shelf B2 (Rice & Grains)', 'Shelf B3 (Pulses/Dal)', 'Shelf B4 (Edible Oils)'],
    keyBrands: ['Aashirvaad', 'Fortune', 'Tata Sampann', 'India Gate', 'Pillsbury'],
    description: 'Flours, whole grains, basmati rice, lentils, organic pulses, sugar, and cooking oils.',
  },
  {
    aisle: 'Aisle 3',
    category: 'Beverages',
    floor: 'Ground Floor',
    shelfBays: ['Shelf C1 (Tea)', 'Shelf C2 (Coffee)', 'Shelf D1 (Juices & Cold Drinks)'],
    keyBrands: ['Tata Tea', 'Red Label', 'Nescafé', 'Bru', 'Réal', 'Tropicana'],
    description: 'Tea powders, premium leaf blends, instant coffee jars, packaged juices, and health drinks.',
  },
  {
    aisle: 'Aisle 4',
    category: 'Snacks',
    floor: 'Ground Floor',
    shelfBays: ['Shelf D2 (Biscuits)', 'Shelf D3 (Instant Noodles)', 'Shelf D4 (Chips & Namkeen)'],
    keyBrands: ['Parle-G', 'Britannia', 'Sunfeast', 'Maggi', 'Lay\'s', 'Haldiram\'s'],
    description: 'Biscuits, cookies, 2-minute instant noodles, potato chips, roasted namkeen, and confectioneries.',
  },
  {
    aisle: 'Aisle 5',
    category: 'Personal Care',
    floor: 'First Floor',
    shelfBays: ['Shelf E1 (Haircare & Shampoos)', 'Shelf E2 (Oral Care & Soaps)', 'Shelf E3 (Skincare & Lotions)'],
    keyBrands: ['Dove', 'Tresemmé', 'Colgate', 'Dettol', 'Nivea', 'Pears'],
    description: 'Shampoos, conditioners, toothpastes, bathing bars, body washes, and moisturizing lotions.',
  },
  {
    aisle: 'Aisle 6',
    category: 'Household',
    floor: 'First Floor',
    shelfBays: ['Shelf F1 (Detergents & Laundry)', 'Shelf F2 (Dishwash & Cleaning)', 'Shelf F3 (Disinfectants)'],
    keyBrands: ['Surf Excel', 'Ariel', 'Vim', 'Lizol', 'Harpic', 'Comfort'],
    description: 'Laundry detergents, fabric conditioners, dishwashing liquids, surface cleaners, and paper products.',
  },
];

export const STORE_OPERATING_RULES: StoreOperatingRule[] = [
  {
    topic: 'Store Timings',
    summary: 'Open every day from 7:00 AM to 10:30 PM (Mon - Sun).',
    details: 'RIVA Supermart is open 7 days a week, including national and public holidays. Customer returns counter operates from 8:00 AM to 10:00 PM.',
    keywords: ['timing', 'timings', 'hours', 'open', 'close', 'schedule', 'when does store open', 'closing time'],
  },
  {
    topic: 'Payment Methods',
    summary: 'Accepts UPI (GPay, PhonePe, Paytm), All Major Credit/Debit Cards, Sodexo Meal Pass & Cash.',
    details: 'Fast checkout lanes support contactless Tap-to-Pay, Sodexo/Zeta meal cards for food items, and QR codes at all 8 billing counters.',
    keywords: ['payment', 'pay', 'upi', 'gpay', 'phonepe', 'paytm', 'card', 'credit card', 'debit card', 'cash', 'sodexo', 'zeta'],
  },
  {
    topic: 'Customer Service & Billing Desks',
    summary: 'Billing counters 1-8 and Customer Desk located near Entrance Gate 1 (Ground Floor).',
    details: 'Customer desk assists with manual return appraisals, billing disputes, and trolley assistance. Express billing counter (under 5 items) is at Counter 8.',
    keywords: ['counter', 'billing', 'desk', 'gate', 'entrance', 'customer service', 'helpdesk', 'where to pay'],
  },
  {
    topic: 'Home Delivery & Online Orders',
    summary: 'Free 2-hour home delivery for in-store purchases above ₹999 within a 5 km radius.',
    details: 'Drop heavy bags at the Dispatch Counter near Gate 2 for scheduled evening doorstep delivery.',
    keywords: ['delivery', 'home delivery', 'shipping', 'order online', 'dispatch'],
  },
  {
    topic: 'Trolleys & Wheelchair Accessibility',
    summary: 'Trolleys, hand baskets, and wheelchair access ramp available at Gate 1 and Gate 2.',
    details: 'Elevators connect Ground Floor to First Floor for accessibility with shopping carts.',
    keywords: ['trolley', 'basket', 'wheelchair', 'accessible', 'elevator', 'lift'],
  }
];

export const PRODUCT_RESTRICTIONS: ProductRestriction[] = [
  {
    category: 'Personal Care',
    restrictionRule: 'Opened hygiene products (shampoo, soap, cream, toothbrush) cannot be auto-approved for refund unless verified as defective or leaking at purchase time.',
    requiresStaffInspection: true,
    exceptionAllowedReason: 'Manufacturing defect, broken pump dispenser, or container leakage reported within 5 days.',
  },
  {
    category: 'Dairy',
    restrictionRule: 'Perishable cold-chain items must be returned within 24 hours. Spoiled/curdled milk qualifies for instant replacement.',
    requiresStaffInspection: false,
    exceptionAllowedReason: 'Curdled/sour upon opening within 24 hours of purchase.',
  },
  {
    category: 'Snacks',
    restrictionRule: 'Opened snack packets require at least 80% content retained for physical stale/foreign matter inspection.',
    requiresStaffInspection: true,
    exceptionAllowedReason: 'Stale, soggy, or foreign contaminant discovered on initial opening.',
  },
  {
    category: 'Beverages',
    restrictionRule: 'Bottles and cans must have unbroken original cap seals. Defective tea canisters qualify for exchange.',
    requiresStaffInspection: false,
    exceptionAllowedReason: 'Broken inner vacuum seal or defective packaging.',
  },
  {
    category: 'Grocery & Staples',
    restrictionRule: 'Atta, rice, and pulses with pest infestation or weevils qualify for immediate replacement within 7 days.',
    requiresStaffInspection: false,
    exceptionAllowedReason: 'Insect infestation, foul moisture odor, or torn packaging at purchase.',
  },
  {
    category: 'Household',
    restrictionRule: 'Detergents and cleaning liquids must have at least 90% liquid remaining if nozzle is reported damaged.',
    requiresStaffInspection: false,
    exceptionAllowedReason: 'Defective spray nozzle or punctured container upon delivery.',
  },
];
