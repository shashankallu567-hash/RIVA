import { User } from '@/types';

export const DEMO_USERS: Record<string, User> = {
  customer: {
    id: 'usr-cust-101',
    name: 'Aarav Sharma',
    email: 'aarav@customer.riva.ai',
    role: 'CUSTOMER',
    phone: '+91 98765 43210',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-blr-01',
    createdAt: '2025-01-15T10:00:00Z',
  },
  staff: {
    id: 'usr-staff-201',
    name: 'Priya Sundaram',
    email: 'priya@staff.riva.ai',
    role: 'STAFF',
    phone: '+91 98234 56789',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-blr-01',
    createdAt: '2024-11-01T09:00:00Z',
  },
  admin: {
    id: 'usr-admin-301',
    name: 'Vikramaditya Rao',
    email: 'vikram@admin.riva.ai',
    role: 'ADMIN',
    phone: '+91 99112 23344',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    storeId: 'store-blr-01',
    createdAt: '2024-06-01T08:00:00Z',
  },
};

export const MOCK_USERS_LIST: User[] = Object.values(DEMO_USERS);
