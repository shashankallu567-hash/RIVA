
import { ReturnPolicy } from '@/types';

export const MOCK_POLICIES: ReturnPolicy[] = [
  {
    id: 'pol-dairy',
    category: 'Dairy',
    windowDays: 1, // 24 hours
    conditions: [
      'Spoiled or curdled upon opening within 24 hours of purchase.',
      'Must provide photo/video proof or bring packet to customer desk.',
      'Must have original digital/paper invoice or registered mobile number.',
      'Temperature abuse by customer after purchase voids return.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 200, // INR
    nonReturnableItems: ['Opened ice cream', 'Unrefrigerated milk past 24 hours'],
    notes: 'RIVA AI auto-approves instant replacement if reported within 24 hours and value <= ₹200.'
  },
  {
    id: 'pol-bev',
    category: 'Beverages',
    windowDays: 7,
    conditions: [
      'Unopened and intact factory seal for bottled/canned drinks.',
      'Powdered/tea canisters eligible if manufacturing seal was defective on opening.',
      'Within expiration date.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 500,
    nonReturnableItems: ['Single serve consumed beverages', 'Loose brewed coffee'],
    notes: 'Direct exchange allowed without staff if original seal is intact.'
  },
  {
    id: 'pol-tea',
    category: 'Tea & Coffee',
    windowDays: 7,
    conditions: [
      'Unopened pack or canister with intact security seal.',
      'Damaged jar or moisture ingress detected upon first opening within 7 days.',
      'Original store receipt required.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 500,
    nonReturnableItems: ['Opened tea bags with missing counts', 'Decanted coffee powder'],
    notes: 'Auto-approves exchange for equivalent brand or flavor.'
  },
  {
    id: 'pol-snk',
    category: 'Snacks',
    windowDays: 3,
    conditions: [
      'Unopened original packaging.',
      'If opened, eligible only if stale, soggy, or foreign object discovered within 3 days.',
      'At least 80% packet content must remain for physical verification.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 250,
    nonReturnableItems: ['Completely consumed packets', 'Damaged due to moisture after opening'],
    notes: 'AI verifies reason. Auto-approval generates store credit or instant exchange voucher.'
  },
  {
    id: 'pol-bis',
    category: 'Biscuits & Cookies',
    windowDays: 3,
    conditions: [
      'Unbroken pack seal.',
      'If crushed, broken inside or stale on opening, eligible within 3 days.',
      'Retain batch barcode on wrapper.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 200,
    nonReturnableItems: ['Consumed biscuit packs', 'Unsealed packs stored in humid conditions'],
    notes: 'Instant replacement or store credit authorized for damaged biscuits.'
  },
  {
    id: 'pol-inst',
    category: 'Instant Food',
    windowDays: 7,
    conditions: [
      'Unopened packs with valid expiry date.',
      'Damaged tastemaker or moisture contamination eligible within 7 days.',
      'Proof of purchase required.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 300,
    nonReturnableItems: ['Partially cooked or consumed noodles/mixes'],
    notes: 'Instant swap allowed at self-checkout or customer kiosk.'
  },
  {
    id: 'pol-pc',
    category: 'Personal Care',
    windowDays: 5,
    conditions: [
      'Unbroken tamper seal on shampoos, creams, hygiene products.',
      'Damaged bottle pump or leaking container at time of purchase.',
      'Allergy claim requires ticket escalation to store pharmacist/manager.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 400,
    nonReturnableItems: ['Opened toothbrushes', 'Used soaps', 'Sanitary products'],
    notes: 'Intact seal required. Damaged dispenser nozzle qualifies for instant replacement.'
  },
  {
    id: 'pol-oral',
    category: 'Oral Care',
    windowDays: 5,
    conditions: [
      'Intact outer carton and nozzle foil seal on toothpastes.',
      'Unopened blister pack for toothbrushes.',
      'Manufacturing defect in electric or specialty brushes.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 300,
    nonReturnableItems: ['Opened toothbrushes', 'Used toothpaste tubes'],
    notes: 'Unopened items eligible for immediate exchange.'
  },
  {
    id: 'pol-ldy',
    category: 'Laundry',
    windowDays: 7,
    conditions: [
      'Unopened liquid detergent bottle or sealed powder polybag.',
      'Leaking container or defective cap upon delivery or purchase.',
      'Receipt or order SMS required.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 500,
    nonReturnableItems: ['Used detergent bars', 'Partially consumed liquid detergents'],
    notes: 'Autonomous replacement voucher issued for bottle leaks.'
  },
  {
    id: 'pol-hc',
    category: 'Home Cleaning',
    windowDays: 7,
    conditions: [
      'Unopened disinfectant bottles or intact spray trigger nozzles.',
      'Punctured can or non-functional aerosol nozzle eligible for immediate replacement.',
      'Keep safety cap in place.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 400,
    nonReturnableItems: ['Empty or half-used chemical cleaners', 'Used scrub pads'],
    notes: 'Defective nozzle triggers qualify for instant staff-less swap.'
  },
  {
    id: 'pol-hh',
    category: 'Household',
    windowDays: 7,
    conditions: [
      'Unopened bottles/pouches of floor cleaners and repellent refills.',
      'Defective machine or heating element in mosquito repellent kits.',
      'Receipt or order SMS verification required.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 500,
    nonReturnableItems: ['Used cleaning mops/cloths', 'Partially used repellent mats'],
    notes: 'Eligible for return or swap with equivalent SKU.'
  },
  {
    id: 'pol-gro',
    category: 'Grocery & Staples',
    windowDays: 7,
    conditions: [
      'Unopened bags of atta, rice, dal, and salt.',
      'If opened: weevils, insects, or bad odor detected within 7 days allows full refund.',
      'Price tag and batch number barcode must be legible.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 600,
    nonReturnableItems: ['Loose weight items without store barcode', 'Spices with broken seal after 7 days'],
    notes: 'RIVA decision engine auto-issues replacement voucher for items with pest/quality defects.'
  },
  {
    id: 'pol-oil',
    category: 'Oils & Fats',
    windowDays: 7,
    conditions: [
      'Intact bottle/tin/pouch seal with no leakage.',
      'Rancid odor detected upon first opening within 7 days eligible for refund.',
      'Store invoice mandatory.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 800,
    nonReturnableItems: ['Opened oil cans past 7 days', 'Transferred oil containers'],
    notes: 'Auto-approves replacement for verified leaks or rancidity.'
  },
  {
    id: 'pol-spc',
    category: 'Spices & Condiments',
    windowDays: 7,
    conditions: [
      'Unopened spice boxes, ketchup bottles, and pickle jars with intact vacuum seal.',
      'Lumpy spice powder or broken jar safety button eligible upon opening.',
      'Receipt required.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 300,
    nonReturnableItems: ['Opened spice packets stored beyond 7 days'],
    notes: 'Instant replacement approved for defective seals.'
  },
  {
    id: 'pol-baby',
    category: 'Baby Care',
    windowDays: 7,
    conditions: [
      'Unopened diaper packs with intact outer plastic seal.',
      'Sealed baby food and infant formula tins with intact aluminum foil.',
      'Damaged safety seal on baby lotions and washes.'
    ],
    requiresReceipt: true,
    exchangeAllowed: true,
    autoApprovalLimit: 700,
    nonReturnableItems: ['Opened infant formula / cereals', 'Opened diaper packs with missing pieces'],
    notes: 'Unopened diaper sizing exchanges auto-approved instantly.'
  }
];
