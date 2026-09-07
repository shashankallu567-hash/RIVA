import { Order } from '@/types';

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-7821',
    customerId: 'cust-1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        productId: 'prod-dairy-001',
        productName: 'Amul Butter - Pasteurized',
        brand: 'Amul',
        category: 'Dairy',
        price: 275,
        mrp: 290,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=300',
        unit: '500 g'
      },
      {
        productId: 'prod-bev-001',
        productName: 'Tata Tea Gold',
        brand: 'Tata Tea',
        category: 'Tea & Coffee',
        price: 320,
        mrp: 350,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=300',
        unit: '500 g'
      },
      {
        productId: 'prod-groc-001',
        productName: 'Aashirvaad Shudh Chakki Atta',
        brand: 'Aashirvaad',
        category: 'Grocery & Staples',
        price: 245,
        mrp: 260,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300',
        unit: '5 kg'
      }
    ],
    subtotal: 840,
    discount: 60,
    deliveryFee: 0,
    total: 840,
    status: 'DELIVERED',
    paymentMethod: 'MOCK_UPI',
    paymentStatus: 'PAID',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: {
      street: '42, Indiranagar 100ft Road',
      city: 'Bengaluru',
      pincode: '560038'
    },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: 'Delivered on ' + new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString()
  },
  {
    id: 'ORD-8492',
    customerId: 'cust-1',
    customerName: 'Rahul Sharma',
    customerEmail: 'rahul.sharma@example.com',
    customerPhone: '+91 98765 43210',
    items: [
      {
        productId: 'prod-oil-001',
        productName: 'Fortune Sunlite Refined Sunflower Oil',
        brand: 'Fortune',
        category: 'Oils & Fats',
        price: 155,
        mrp: 175,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300',
        unit: '1 L'
      },
      {
        productId: 'prod-inst-001',
        productName: 'Maggi 2-Minute Masala Noodles',
        brand: 'Maggi',
        category: 'Instant Food',
        price: 56,
        mrp: 60,
        quantity: 2,
        image: 'https://images.unsplash.com/photo-1612927601601-6638404737ce?w=300',
        unit: 'Pack of 4 (280 g)'
      }
    ],
    subtotal: 422,
    discount: 48,
    deliveryFee: 0,
    total: 422,
    status: 'READY_FOR_PICKUP',
    paymentMethod: 'MOCK_CARD',
    paymentStatus: 'PAID',
    deliveryType: 'STORE_PICKUP',
    pickupStore: 'RIVA Supermarket - Koramangala Store #101',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: 'Ready for Pickup at Koramangala Store'
  },
  {
    id: 'ORD-9104',
    customerId: 'cust-2',
    customerName: 'Priya Patel',
    customerEmail: 'priya.patel@example.com',
    customerPhone: '+91 98111 22334',
    items: [
      {
        productId: 'prod-laund-001',
        productName: 'Surf Excel Easy Wash Detergent Powder',
        brand: 'Surf Excel',
        category: 'Laundry',
        price: 140,
        mrp: 155,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1585833062804-4a026829770b?w=300',
        unit: '1 kg'
      },
      {
        productId: 'prod-pc-002',
        productName: 'Dettol Original Liquid Handwash Refill',
        brand: 'Dettol',
        category: 'Personal Care',
        price: 99,
        mrp: 110,
        quantity: 1,
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=300',
        unit: '750 ml'
      }
    ],
    subtotal: 239,
    discount: 26,
    deliveryFee: 29,
    total: 268,
    status: 'CONFIRMED',
    paymentMethod: 'MOCK_UPI',
    paymentStatus: 'PAID',
    deliveryType: 'HOME_DELIVERY',
    deliveryAddress: {
      street: '15th Cross, HSR Layout Sector 3',
      city: 'Bengaluru',
      pincode: '560102'
    },
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    estimatedDelivery: 'Expected by Tomorrow, 10:00 AM'
  }
];
