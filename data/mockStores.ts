import { Store } from '@/types';

export const MOCK_STORES: Store[] = [
  {
    id: 'store-blr-01',
    name: 'RIVA Supermart - Indiranagar',
    code: 'BLR-IND-01',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '100ft Road, HAL 2nd Stage, Indiranagar, Bengaluru - 560038',
    contactNumber: '+91 80 4123 4567',
    isOpen: true,
    totalAisles: 6,
  },
  {
    id: 'store-blr-02',
    name: 'RIVA Express - Koramangala',
    code: 'BLR-KOR-02',
    city: 'Bengaluru',
    state: 'Karnataka',
    address: '5th Block, 80 Feet Road, Koramangala, Bengaluru - 560095',
    contactNumber: '+91 80 4987 6543',
    isOpen: true,
    totalAisles: 4,
  },
];
