/**
 * RIVA Analytics Engine
 * Pure deterministic functions — all metrics derived from real store data.
 * No hardcoded numbers. Used by Admin Analytics, Admin Dashboard, and Staff Dashboard.
 */

import { InventoryItem, ReturnRequest, SupportTicket, Order, Product, InventoryActivityLog } from '@/types';

// ==========================================
// TYPES
// ==========================================

export interface CategoryMetric {
  category: string;
  totalSKUs: number;
  inStock: number;
  lowStock: number;
  outOfStock: number;
  stockoutRisk: 'HIGH' | 'MEDIUM' | 'LOW';
  totalUnits: number;
}

export interface ReorderItem {
  productId: string;
  productName: string;
  brand: string;
  category: string;
  currentQty: number;
  minThreshold: number;
  reorderLevel: number;
  aisle: string;
  shelf: string;
  urgency: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  daysUntilStockout?: number;
  suggestedOrderQty: number;
}

export interface AnomalyFlag {
  type: 'RAPID_DEPLETION' | 'ZERO_MOVEMENT' | 'RETURN_SPIKE' | 'TICKET_SURGE' | 'EXPIRY_RISK';
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  affectedProductId?: string;
  affectedCategory?: string;
  detectedAt: string;
}

export interface StoreHealthScore {
  score: number; // 0-100
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  label: string;
  color: string;
  breakdown: {
    inventoryHealth: number; // 0-100
    returnResolution: number; // 0-100
    ticketLoad: number; // 0-100
    stockAvailability: number; // 0-100
  };
  trend: 'UP' | 'STABLE' | 'DOWN';
}

export interface ReturnAnalytics {
  totalReturns: number;
  autoApproved: number;
  manualReview: number;
  rejected: number;
  completed: number;
  totalValue: number;
  autoApprovalRate: number; // 0-100 %
  escalationRate: number;
  rejectionRate: number;
  avgResolutionValueINR: number;
}

export interface SalesIntelligence {
  totalOrders: number;
  totalRevenue: number;
  avgBasketSize: number;
  avgBasketValue: number;
  topCategories: { category: string; orders: number; revenue: number }[];
  paymentMethodBreakdown: { method: string; count: number; pct: number }[];
  deliveryBreakdown: { type: string; count: number; pct: number }[];
}

export interface InventoryIntelligence {
  totalSKUs: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  stockoutRiskPct: number;
  categoryBreakdown: CategoryMetric[];
  reorderQueue: ReorderItem[];
  totalInventoryValue: number;
  healthScore: number; // 0-100
}

// ==========================================
// STORE HEALTH SCORE
// ==========================================

export function computeStoreHealthScore(
  inventory: InventoryItem[],
  returns: ReturnRequest[],
  tickets: SupportTicket[],
  orders: Order[]
): StoreHealthScore {
  const total = inventory.length || 1;

  // Inventory health: penalize low stock and out of stock
  const outOfStock = inventory.filter(i => i.quantity === 0).length;
  const lowStock = inventory.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length;
  const inventoryHealth = Math.max(0, 100 - (outOfStock / total) * 60 - (lowStock / total) * 30);

  // Return resolution: higher auto-approval = better
  const totalReturns = returns.length || 1;
  const autoApproved = returns.filter(r => r.status === 'AUTO_APPROVED' || r.status === 'APPROVED').length;
  const returnResolution = Math.min(100, (autoApproved / totalReturns) * 100);

  // Ticket load: fewer open/in-progress tickets = better
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const ticketLoad = Math.max(0, 100 - (openTickets * 8));

  // Stock availability rate
  const available = inventory.filter(i => i.quantity > i.minThreshold).length;
  const stockAvailability = (available / total) * 100;

  const score = Math.round(
    inventoryHealth * 0.35 +
    returnResolution * 0.25 +
    ticketLoad * 0.2 +
    stockAvailability * 0.2
  );

  const grade: StoreHealthScore['grade'] =
    score >= 85 ? 'A' :
    score >= 70 ? 'B' :
    score >= 55 ? 'C' :
    score >= 40 ? 'D' : 'F';

  const label =
    score >= 85 ? 'Excellent' :
    score >= 70 ? 'Good' :
    score >= 55 ? 'Fair' :
    score >= 40 ? 'Needs Attention' : 'Critical';

  const color =
    score >= 85 ? '#687B4F' :
    score >= 70 ? '#4F9D6F' :
    score >= 55 ? '#E8B94F' :
    score >= 40 ? '#C87552' : '#C0392B';

  // Determine trend: if out-of-stock > 10% → DOWN, if < 5% → UP, else STABLE
  const outPct = (outOfStock / total) * 100;
  const trend: StoreHealthScore['trend'] = outPct > 10 ? 'DOWN' : outPct < 5 ? 'UP' : 'STABLE';

  return {
    score: Math.max(0, Math.min(100, score)),
    grade,
    label,
    color,
    breakdown: {
      inventoryHealth: Math.round(inventoryHealth),
      returnResolution: Math.round(returnResolution),
      ticketLoad: Math.round(Math.max(0, ticketLoad)),
      stockAvailability: Math.round(stockAvailability),
    },
    trend,
  };
}

// ==========================================
// RETURN ANALYTICS
// ==========================================

export function computeReturnAnalytics(returns: ReturnRequest[]): ReturnAnalytics {
  const total = returns.length;
  const autoApproved = returns.filter(r => r.status === 'AUTO_APPROVED').length;
  const manualReview = returns.filter(r => r.status === 'MANUAL_REVIEW').length;
  const rejected = returns.filter(r => r.status === 'REJECTED').length;
  const completed = returns.filter(r => r.status === 'COMPLETED').length;
  const totalValue = returns.reduce((sum, r) => sum + (r.amount || r.price || 0), 0);

  return {
    totalReturns: total,
    autoApproved,
    manualReview,
    rejected,
    completed,
    totalValue,
    autoApprovalRate: total > 0 ? Math.round((autoApproved / total) * 100) : 0,
    escalationRate: total > 0 ? Math.round((manualReview / total) * 100) : 0,
    rejectionRate: total > 0 ? Math.round((rejected / total) * 100) : 0,
    avgResolutionValueINR: total > 0 ? Math.round(totalValue / total) : 0,
  };
}

// ==========================================
// INVENTORY INTELLIGENCE
// ==========================================

export function computeInventoryIntelligence(
  inventory: InventoryItem[],
  products: Product[],
  activityLogs: InventoryActivityLog[]
): InventoryIntelligence {
  const inStockCount = inventory.filter(i => i.quantity > i.minThreshold).length;
  const lowStockCount = inventory.filter(i => i.quantity > 0 && i.quantity <= i.minThreshold).length;
  const outOfStockCount = inventory.filter(i => i.quantity === 0).length;
  const stockoutRiskPct = inventory.length > 0
    ? Math.round(((lowStockCount + outOfStockCount) / inventory.length) * 100)
    : 0;

  // Category breakdown
  const categoryMap = new Map<string, CategoryMetric>();
  for (const item of inventory) {
    const cat = item.category as string;
    if (!categoryMap.has(cat)) {
      categoryMap.set(cat, {
        category: cat,
        totalSKUs: 0,
        inStock: 0,
        lowStock: 0,
        outOfStock: 0,
        stockoutRisk: 'LOW',
        totalUnits: 0,
      });
    }
    const m = categoryMap.get(cat)!;
    m.totalSKUs += 1;
    m.totalUnits += item.quantity;
    if (item.quantity === 0) m.outOfStock += 1;
    else if (item.quantity <= item.minThreshold) m.lowStock += 1;
    else m.inStock += 1;
  }
  const categoryBreakdown: CategoryMetric[] = Array.from(categoryMap.values()).map(m => {
    const riskScore = (m.outOfStock * 2 + m.lowStock) / m.totalSKUs;
    const stockoutRisk: CategoryMetric['stockoutRisk'] =
      riskScore > 0.5 ? 'HIGH' : riskScore > 0.2 ? 'MEDIUM' : 'LOW';
    return { ...m, stockoutRisk };
  }).sort((a, b) => b.outOfStock - a.outOfStock || b.lowStock - a.lowStock);

  // Compute daily velocity from activity logs (last 7 days of Sale entries)
  const sevenDaysAgo = Date.now() - 7 * 24 * 3600 * 1000;
  const recentSales = activityLogs.filter(
    l => l.reason === 'Sale' && new Date(l.timestamp).getTime() > sevenDaysAgo
  );
  const velocityMap = new Map<string, number>();
  for (const log of recentSales) {
    const sold = Math.max(0, log.previousQuantity - log.newQuantity);
    velocityMap.set(log.productId, (velocityMap.get(log.productId) || 0) + sold);
  }

  // Reorder queue
  const reorderQueue: ReorderItem[] = inventory
    .filter(i => i.quantity <= i.reorderLevel)
    .map(i => {
      const prod = products.find(p => p.id === i.productId);
      const weeklySales = velocityMap.get(i.productId) || 0;
      const dailyVelocity = weeklySales / 7;
      const daysUntilStockout = dailyVelocity > 0
        ? Math.round(i.quantity / dailyVelocity)
        : undefined;

      const urgency: ReorderItem['urgency'] =
        i.quantity === 0 ? 'CRITICAL' :
        i.quantity <= Math.floor(i.minThreshold / 2) ? 'HIGH' : 'MEDIUM';

      const suggestedOrderQty = Math.max(
        i.reorderLevel * 3 - i.quantity,
        i.reorderLevel * 2
      );

      return {
        productId: i.productId,
        productName: prod?.name || i.name,
        brand: i.brand,
        category: i.category as string,
        currentQty: i.quantity,
        minThreshold: i.minThreshold,
        reorderLevel: i.reorderLevel,
        aisle: i.aisle,
        shelf: i.shelf,
        urgency,
        daysUntilStockout,
        suggestedOrderQty,
      };
    })
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2 };
      return order[a.urgency] - order[b.urgency];
    });

  const totalInventoryValue = inventory.reduce((sum, i) => sum + i.quantity * i.price, 0);
  const healthScore = inventory.length > 0
    ? Math.round((inStockCount / inventory.length) * 100)
    : 100;

  return {
    totalSKUs: inventory.length,
    inStockCount,
    lowStockCount,
    outOfStockCount,
    stockoutRiskPct,
    categoryBreakdown,
    reorderQueue,
    totalInventoryValue,
    healthScore,
  };
}

// ==========================================
// SALES INTELLIGENCE
// ==========================================

export function computeSalesIntelligence(orders: Order[]): SalesIntelligence {
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const totalItems = orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0);
  const avgBasketSize = totalOrders > 0 ? Math.round(totalItems / totalOrders) : 0;
  const avgBasketValue = totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

  // Category breakdown
  const catMap = new Map<string, { orders: number; revenue: number }>();
  for (const order of orders) {
    for (const item of order.items) {
      const cat = item.category as string;
      const prev = catMap.get(cat) || { orders: 0, revenue: 0 };
      catMap.set(cat, {
        orders: prev.orders + item.quantity,
        revenue: prev.revenue + item.price * item.quantity,
      });
    }
  }
  const topCategories = Array.from(catMap.entries())
    .map(([category, v]) => ({ category, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Payment method breakdown
  const pmMap = new Map<string, number>();
  for (const o of orders) {
    const method = o.paymentMethod.replace('MOCK_', '');
    pmMap.set(method, (pmMap.get(method) || 0) + 1);
  }
  const paymentMethodBreakdown = Array.from(pmMap.entries()).map(([method, count]) => ({
    method,
    count,
    pct: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
  }));

  // Delivery breakdown
  const dlvMap = new Map<string, number>();
  for (const o of orders) {
    dlvMap.set(o.deliveryType, (dlvMap.get(o.deliveryType) || 0) + 1);
  }
  const deliveryBreakdown = Array.from(dlvMap.entries()).map(([type, count]) => ({
    type: type === 'HOME_DELIVERY' ? 'Home Delivery' : 'Store Pickup',
    count,
    pct: totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0,
  }));

  return {
    totalOrders,
    totalRevenue,
    avgBasketSize,
    avgBasketValue,
    topCategories,
    paymentMethodBreakdown,
    deliveryBreakdown,
  };
}

// ==========================================
// ANOMALY DETECTION
// ==========================================

export function detectAnomalies(
  inventory: InventoryItem[],
  activityLogs: InventoryActivityLog[],
  returns: ReturnRequest[],
  tickets: SupportTicket[]
): AnomalyFlag[] {
  const anomalies: AnomalyFlag[] = [];
  const now = new Date().toISOString();

  // 1. Rapid depletion: qty dropped > 50% in recent logs
  const recentLogs = activityLogs.filter(l => {
    const age = Date.now() - new Date(l.timestamp).getTime();
    return age < 24 * 3600 * 1000 && l.reason === 'Sale';
  });
  const depletionMap = new Map<string, number>();
  for (const log of recentLogs) {
    if (log.previousQuantity > 0) {
      const pct = (log.previousQuantity - log.newQuantity) / log.previousQuantity;
      depletionMap.set(log.productId, Math.max(depletionMap.get(log.productId) || 0, pct));
    }
  }
  Array.from(depletionMap.entries()).forEach(([productId, pct]) => {
    if (pct > 0.4) {
      const log = recentLogs.find(l => l.productId === productId);
      anomalies.push({
        type: 'RAPID_DEPLETION',
        severity: pct > 0.7 ? 'HIGH' : 'MEDIUM',
        title: 'Rapid Stock Depletion',
        description: `${log?.productName || productId} lost ${Math.round(pct * 100)}% of stock in last 24h`,
        affectedProductId: productId,
        detectedAt: now,
      });
    }
  });

  // 2. Zero movement: items with zero activity in activityLogs (potential dead stock)
  const activeProducts = new Set(activityLogs.map(l => l.productId));
  const zeroMovement = inventory.filter(i => !activeProducts.has(i.productId) && i.quantity > 0);
  if (zeroMovement.length > 5) {
    anomalies.push({
      type: 'ZERO_MOVEMENT',
      severity: 'LOW',
      title: 'Dead Stock Detected',
      description: `${zeroMovement.length} SKUs have had zero movement recently. Review for markdown or promotion.`,
      detectedAt: now,
    });
  }

  // 3. Return spike: if recent returns in last 48h > 20% of all returns
  const recentReturns = returns.filter(r => {
    const age = Date.now() - new Date(r.createdAt).getTime();
    return age < 48 * 3600 * 1000;
  });
  if (returns.length > 0 && recentReturns.length / returns.length > 0.3) {
    anomalies.push({
      type: 'RETURN_SPIKE',
      severity: 'MEDIUM',
      title: 'Return Volume Spike',
      description: `${recentReturns.length} returns filed in last 48h — ${Math.round((recentReturns.length / returns.length) * 100)}% of all-time returns.`,
      detectedAt: now,
    });
  }

  // 4. Ticket surge: if open/in-progress > 40% of all tickets
  const openTickets = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  if (tickets.length > 0 && openTickets / tickets.length > 0.4) {
    anomalies.push({
      type: 'TICKET_SURGE',
      severity: 'HIGH',
      title: 'Open Ticket Surge',
      description: `${openTickets} of ${tickets.length} tickets are unresolved. Staff capacity may be insufficient.`,
      detectedAt: now,
    });
  }

  // 5. Critical out-of-stock in key categories
  const criticalCategories = ['Dairy', 'Grocery & Staples', 'Beverages'];
  for (const cat of criticalCategories) {
    const catItems = inventory.filter(i => i.category === cat);
    const outOfStock = catItems.filter(i => i.quantity === 0).length;
    if (catItems.length > 0 && outOfStock / catItems.length > 0.25) {
      anomalies.push({
        type: 'EXPIRY_RISK',
        severity: 'HIGH',
        title: `Critical Gaps in ${cat}`,
        description: `${outOfStock} of ${catItems.length} ${cat} SKUs are out-of-stock. Customer satisfaction at risk.`,
        affectedCategory: cat,
        detectedAt: now,
      });
    }
  }

  return anomalies;
}

// ==========================================
// AI INSIGHT GENERATION (data-driven)
// ==========================================

export interface AIInsight {
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  icon: string;
  title: string;
  body: string;
  action?: string;
  actionHref?: string;
}

export function generateAIInsights(
  health: StoreHealthScore,
  inventory: InventoryIntelligence,
  returns: ReturnAnalytics,
  anomalies: AnomalyFlag[]
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Reorder urgency
  const critical = inventory.reorderQueue.filter(r => r.urgency === 'CRITICAL');
  if (critical.length > 0) {
    insights.push({
      priority: 'HIGH',
      icon: '🚨',
      title: `${critical.length} SKU${critical.length > 1 ? 's' : ''} Completely Out of Stock`,
      body: `${critical.slice(0, 3).map(r => r.productName).join(', ')}${critical.length > 3 ? ` +${critical.length - 3} more` : ''} need immediate restocking.`,
      action: 'View Reorder Queue',
      actionHref: '/staff/inventory',
    });
  }

  // Return automation performance
  if (returns.autoApprovalRate > 70) {
    insights.push({
      priority: 'LOW',
      icon: '✅',
      title: `RIVA Auto-Resolving ${returns.autoApprovalRate}% of Returns`,
      body: `${returns.autoApproved} of ${returns.totalReturns} return requests resolved without staff intervention, saving significant floor time.`,
    });
  } else if (returns.totalReturns > 0) {
    insights.push({
      priority: 'MEDIUM',
      icon: '⚠️',
      title: 'Return Auto-Resolution Below Target',
      body: `Only ${returns.autoApprovalRate}% auto-approved. ${returns.manualReview} cases await manual staff review.`,
      action: 'Review Policy Thresholds',
      actionHref: '/admin/policies',
    });
  }

  // Inventory health
  if (inventory.stockoutRiskPct > 20) {
    insights.push({
      priority: 'HIGH',
      icon: '📦',
      title: `${inventory.stockoutRiskPct}% of SKUs at Stockout Risk`,
      body: `${inventory.lowStockCount} products at low stock and ${inventory.outOfStockCount} completely depleted. Immediate procurement action required.`,
      action: 'Smart Reorder Queue',
      actionHref: '/staff/inventory',
    });
  }

  // Anomaly-driven insights
  for (const anomaly of anomalies.filter(a => a.severity === 'HIGH').slice(0, 2)) {
    insights.push({
      priority: 'HIGH',
      icon: '⚡',
      title: anomaly.title,
      body: anomaly.description,
      action: anomaly.type === 'RAPID_DEPLETION' ? 'Check Inventory' : undefined,
      actionHref: anomaly.type === 'RAPID_DEPLETION' ? '/staff/inventory' : undefined,
    });
  }

  // Store health praise
  if (health.score >= 85) {
    insights.push({
      priority: 'LOW',
      icon: '🏆',
      title: `Store Health Score: ${health.score}/100 (${health.grade})`,
      body: 'Excellent operational performance across inventory, returns, and ticket resolution.',
    });
  }

  return insights.slice(0, 5);
}
