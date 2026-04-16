// Simple localStorage-based store for the MVP

export interface Product {
  id: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  minStock: number;
  unit: string;
  barcode: string;
  createdAt: string;
}

export interface FixedCost {
  id: string;
  name: string;
  value: number;
  recurrence: 'mensal' | 'anual';
}

export interface VariableCost {
  id: string;
  name: string;
  percentage: number;
  description: string;
}

export interface Competitor {
  id: string;
  name: string;
  type: 'online' | 'fisica';
  city: string;
  neighborhood: string;
}

export interface CompetitorPrice {
  id: string;
  productId: string;
  competitorId: string;
  price: number;
  collectedAt: string;
  source: string;
  notes: string;
}

export interface Sale {
  id: string;
  items: SaleItem[];
  total: number;
  operator: string;
  customerId?: string;
  customerName?: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'entrada' | 'saida' | 'ajuste';
  quantity: number;
  reason: string;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  legalName: string;
  document: string;
  phone: string;
  email: string;
  address: string;
  contactPerson: string;
  notes: string;
  productIds: string[];
  createdAt: string;
}

export interface SupplierPurchase {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseNumber: string;
  purchaseDate: string;
  totalValue: number;
  paidValue: number;
  dueDate: string;
  paymentMethod: string;
  status: 'pendente' | 'pago_parcial' | 'pago' | 'atrasado';
  notes: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  type: 'entrada' | 'saida';
  entityName: string;
  entityType: 'fornecedor' | 'cliente';
  issueDate: string;
  totalValue: number;
  accessKey: string;
  status: 'pendente' | 'processada' | 'cancelada';
  notes: string;
  items: InvoiceItem[];
  createdAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// NEW ENTITIES

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  document: string;
  birthDate: string;
  address: string;
  notes: string;
  createdAt: string;
}

export interface Receivable {
  id: string;
  customerId: string;
  customerName: string;
  saleId?: string;
  totalValue: number;
  receivedValue: number;
  dueDate: string;
  paymentMethod: string;
  status: 'pendente' | 'pago_parcial' | 'recebida' | 'vencida';
  notes: string;
  createdAt: string;
}

export interface CashFlowEntry {
  id: string;
  type: 'entrada' | 'saida';
  category: string;
  description: string;
  value: number;
  date: string;
  origin: 'manual' | 'venda' | 'fornecedor' | 'despesa';
  notes: string;
  createdAt: string;
}

export interface Goal {
  id: string;
  type: 'faturamento' | 'lucro' | 'vendas';
  month: number;
  year: number;
  targetValue: number;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entity: string;
  entityId: string;
  summary: string;
  createdAt: string;
}

function generateId() {
  return Math.random().toString(36).substring(2, 10);
}

function getCollection<T>(key: string): T[] {
  return JSON.parse(localStorage.getItem(key) || '[]');
}
function saveCollection<T>(key: string, data: T[]) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Audit helper
export function logAudit(action: string, entity: string, entityId: string, summary: string) {
  const logs = getAuditLogs();
  logs.push({ id: generateId(), user: 'Administrador', action, entity, entityId, summary, createdAt: new Date().toISOString() });
  saveCollection('gc_audit_logs', logs);
}

// Products
export function getProducts(): Product[] { return getCollection<Product>('gc_products'); }
export function saveProducts(products: Product[]) { saveCollection('gc_products', products); }
export function addProduct(p: Omit<Product, 'id' | 'createdAt'>): Product {
  const products = getProducts();
  const product: Product = { ...p, barcode: p.barcode || '', id: generateId(), createdAt: new Date().toISOString() };
  products.push(product);
  saveProducts(products);
  logAudit('criação', 'produto', product.id, `Produto "${product.name}" cadastrado`);
  return product;
}
export function updateProduct(id: string, data: Partial<Product>) {
  const old = getProducts().find(p => p.id === id);
  const products = getProducts().map(p => p.id === id ? { ...p, ...data } : p);
  saveProducts(products);
  if (old && data.salePrice && data.salePrice !== old.salePrice) {
    logAudit('edição_preço', 'produto', id, `Preço de "${old.name}" alterado de R$${old.salePrice.toFixed(2)} para R$${data.salePrice.toFixed(2)}`);
  }
}
export function deleteProduct(id: string) {
  const p = getProducts().find(pr => pr.id === id);
  saveProducts(getProducts().filter(pr => pr.id !== id));
  if (p) logAudit('exclusão', 'produto', id, `Produto "${p.name}" removido`);
}
export function findProductByBarcode(barcode: string): Product | undefined {
  return getProducts().find(p => p.barcode === barcode);
}

// Fixed Costs
export function getFixedCosts(): FixedCost[] { return getCollection<FixedCost>('gc_fixed_costs'); }
export function saveFixedCosts(costs: FixedCost[]) { saveCollection('gc_fixed_costs', costs); }
export function addFixedCost(c: Omit<FixedCost, 'id'>): FixedCost {
  const costs = getFixedCosts();
  const cost: FixedCost = { ...c, id: generateId() };
  costs.push(cost);
  saveFixedCosts(costs);
  return cost;
}
export function deleteFixedCost(id: string) { saveFixedCosts(getFixedCosts().filter(c => c.id !== id)); }

// Variable Costs
export function getVariableCosts(): VariableCost[] { return getCollection<VariableCost>('gc_variable_costs'); }
export function saveVariableCosts(costs: VariableCost[]) { saveCollection('gc_variable_costs', costs); }
export function addVariableCost(c: Omit<VariableCost, 'id'>): VariableCost {
  const costs = getVariableCosts();
  const cost: VariableCost = { ...c, id: generateId() };
  costs.push(cost);
  saveVariableCosts(costs);
  return cost;
}
export function deleteVariableCost(id: string) { saveVariableCosts(getVariableCosts().filter(c => c.id !== id)); }

// Competitors
export function getCompetitors(): Competitor[] { return getCollection<Competitor>('gc_competitors'); }
export function saveCompetitors(data: Competitor[]) { saveCollection('gc_competitors', data); }
export function addCompetitor(c: Omit<Competitor, 'id'>): Competitor {
  const list = getCompetitors();
  const item: Competitor = { ...c, id: generateId() };
  list.push(item);
  saveCompetitors(list);
  return item;
}
export function deleteCompetitor(id: string) { saveCompetitors(getCompetitors().filter(c => c.id !== id)); }

// Competitor Prices
export function getCompetitorPrices(): CompetitorPrice[] { return getCollection<CompetitorPrice>('gc_competitor_prices'); }
export function saveCompetitorPrices(data: CompetitorPrice[]) { saveCollection('gc_competitor_prices', data); }
export function addCompetitorPrice(c: Omit<CompetitorPrice, 'id'>): CompetitorPrice {
  const list = getCompetitorPrices();
  const item: CompetitorPrice = { ...c, id: generateId() };
  list.push(item);
  saveCompetitorPrices(list);
  return item;
}
export function deleteCompetitorPrice(id: string) { saveCompetitorPrices(getCompetitorPrices().filter(c => c.id !== id)); }

// Sales
export function getSales(): Sale[] { return getCollection<Sale>('gc_sales'); }
export function saveSales(data: Sale[]) { saveCollection('gc_sales', data); }
export function addSale(items: SaleItem[], operator: string, customerId?: string, customerName?: string): Sale {
  const sale: Sale = { id: generateId(), items, total: items.reduce((s, i) => s + i.subtotal, 0), operator, customerId, customerName, createdAt: new Date().toISOString() };
  const sales = getSales();
  sales.push(sale);
  saveSales(sales);
  // Decrease stock
  const products = getProducts();
  items.forEach(item => {
    const idx = products.findIndex(p => p.id === item.productId);
    if (idx >= 0) products[idx].stock = Math.max(0, products[idx].stock - item.quantity);
  });
  saveProducts(products);
  // Stock movements
  const movements = getStockMovements();
  items.forEach(item => {
    movements.push({ id: generateId(), productId: item.productId, productName: item.productName, type: 'saida', quantity: item.quantity, reason: `Venda #${sale.id.substring(0,6)}`, createdAt: sale.createdAt });
  });
  saveStockMovements(movements);
  // Cash flow entry
  addCashFlowEntry({ type: 'entrada', category: 'Vendas', description: `Venda #${sale.id.substring(0,6)}${customerName ? ` - ${customerName}` : ''}`, value: sale.total, date: sale.createdAt.split('T')[0], origin: 'venda', notes: '' });
  logAudit('venda', 'venda', sale.id, `Venda de ${fmt(sale.total)} realizada com ${items.length} item(ns)`);
  return sale;
}

// Stock Movements
export function getStockMovements(): StockMovement[] { return getCollection<StockMovement>('gc_stock_movements'); }
export function saveStockMovements(data: StockMovement[]) { saveCollection('gc_stock_movements', data); }
export function addStockMovement(m: Omit<StockMovement, 'id' | 'createdAt'>): StockMovement {
  const list = getStockMovements();
  const item: StockMovement = { ...m, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveStockMovements(list);
  const products = getProducts();
  const idx = products.findIndex(p => p.id === m.productId);
  if (idx >= 0) {
    if (m.type === 'entrada') products[idx].stock += m.quantity;
    else if (m.type === 'saida') products[idx].stock = Math.max(0, products[idx].stock - m.quantity);
    else products[idx].stock = m.quantity;
  }
  saveProducts(products);
  logAudit('ajuste_estoque', 'produto', m.productId, `${m.type} de ${m.quantity}un de "${m.productName}"`);
  return item;
}

// Suppliers
export function getSuppliers(): Supplier[] { return getCollection<Supplier>('gc_suppliers'); }
export function saveSuppliers(data: Supplier[]) { saveCollection('gc_suppliers', data); }
export function addSupplier(s: Omit<Supplier, 'id' | 'createdAt'>): Supplier {
  const list = getSuppliers();
  const item: Supplier = { ...s, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveSuppliers(list);
  logAudit('criação', 'fornecedor', item.id, `Fornecedor "${item.name}" cadastrado`);
  return item;
}
export function updateSupplier(id: string, data: Partial<Supplier>) {
  saveSuppliers(getSuppliers().map(s => s.id === id ? { ...s, ...data } : s));
}
export function deleteSupplier(id: string) { saveSuppliers(getSuppliers().filter(s => s.id !== id)); }

// Supplier Purchases (Accounts Payable)
export function getPurchases(): SupplierPurchase[] { return getCollection<SupplierPurchase>('gc_purchases'); }
export function savePurchases(data: SupplierPurchase[]) { saveCollection('gc_purchases', data); }
export function addPurchase(p: Omit<SupplierPurchase, 'id' | 'createdAt'>): SupplierPurchase {
  const list = getPurchases();
  const item: SupplierPurchase = { ...p, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  savePurchases(list);
  // Cash flow for paid amount
  if (p.paidValue > 0) {
    addCashFlowEntry({ type: 'saida', category: 'Fornecedores', description: `Pagamento ${p.supplierName}`, value: p.paidValue, date: p.purchaseDate || new Date().toISOString().split('T')[0], origin: 'fornecedor', notes: '' });
  }
  logAudit('compra', 'fornecedor', item.id, `Compra de ${fmt(p.totalValue)} com ${p.supplierName}`);
  return item;
}
export function updatePurchase(id: string, data: Partial<SupplierPurchase>) {
  const old = getPurchases().find(p => p.id === id);
  savePurchases(getPurchases().map(p => p.id === id ? { ...p, ...data } : p));
  if (old && data.status === 'pago' && old.status !== 'pago') {
    const remaining = old.totalValue - old.paidValue;
    if (remaining > 0) {
      addCashFlowEntry({ type: 'saida', category: 'Fornecedores', description: `Pagamento ${old.supplierName}`, value: remaining, date: new Date().toISOString().split('T')[0], origin: 'fornecedor', notes: '' });
    }
  }
}
export function deletePurchase(id: string) { savePurchases(getPurchases().filter(p => p.id !== id)); }

// Invoices
export function getInvoices(): Invoice[] { return getCollection<Invoice>('gc_invoices'); }
export function saveInvoices(data: Invoice[]) { saveCollection('gc_invoices', data); }
export function addInvoice(inv: Omit<Invoice, 'id' | 'createdAt'>): Invoice {
  const list = getInvoices();
  const item: Invoice = { ...inv, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveInvoices(list);
  const products = getProducts();
  const movements = getStockMovements();
  inv.items.forEach(i => {
    const idx = products.findIndex(p => p.id === i.productId);
    if (idx >= 0) {
      if (inv.type === 'entrada') products[idx].stock += i.quantity;
      else products[idx].stock = Math.max(0, products[idx].stock - i.quantity);
    }
    movements.push({ id: generateId(), productId: i.productId, productName: i.productName, type: inv.type, quantity: i.quantity, reason: `NF #${inv.number}`, createdAt: item.createdAt });
  });
  saveProducts(products);
  saveStockMovements(movements);
  return item;
}

// Customers
export function getCustomers(): Customer[] { return getCollection<Customer>('gc_customers'); }
export function saveCustomers(data: Customer[]) { saveCollection('gc_customers', data); }
export function addCustomer(c: Omit<Customer, 'id' | 'createdAt'>): Customer {
  const list = getCustomers();
  const item: Customer = { ...c, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveCustomers(list);
  return item;
}
export function updateCustomer(id: string, data: Partial<Customer>) {
  saveCustomers(getCustomers().map(c => c.id === id ? { ...c, ...data } : c));
}
export function deleteCustomer(id: string) { saveCustomers(getCustomers().filter(c => c.id !== id)); }

// Receivables
export function getReceivables(): Receivable[] { return getCollection<Receivable>('gc_receivables'); }
export function saveReceivables(data: Receivable[]) { saveCollection('gc_receivables', data); }
export function addReceivable(r: Omit<Receivable, 'id' | 'createdAt'>): Receivable {
  const list = getReceivables();
  const item: Receivable = { ...r, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveReceivables(list);
  logAudit('conta_a_receber', 'financeiro', item.id, `Conta a receber de ${fmt(r.totalValue)} de ${r.customerName}`);
  return item;
}
export function updateReceivable(id: string, data: Partial<Receivable>) {
  const old = getReceivables().find(r => r.id === id);
  saveReceivables(getReceivables().map(r => r.id === id ? { ...r, ...data } : r));
  if (old && data.status === 'recebida' && old.status !== 'recebida') {
    const remaining = old.totalValue - old.receivedValue;
    if (remaining > 0) {
      addCashFlowEntry({ type: 'entrada', category: 'Recebimentos', description: `Recebimento de ${old.customerName}`, value: remaining, date: new Date().toISOString().split('T')[0], origin: 'venda', notes: '' });
    }
  }
}
export function deleteReceivable(id: string) { saveReceivables(getReceivables().filter(r => r.id !== id)); }

// Cash Flow
export function getCashFlow(): CashFlowEntry[] { return getCollection<CashFlowEntry>('gc_cashflow'); }
export function saveCashFlow(data: CashFlowEntry[]) { saveCollection('gc_cashflow', data); }
export function addCashFlowEntry(c: Omit<CashFlowEntry, 'id' | 'createdAt'>): CashFlowEntry {
  const list = getCashFlow();
  const item: CashFlowEntry = { ...c, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveCashFlow(list);
  return item;
}
export function deleteCashFlowEntry(id: string) { saveCashFlow(getCashFlow().filter(c => c.id !== id)); }

// Goals
export function getGoals(): Goal[] { return getCollection<Goal>('gc_goals'); }
export function saveGoals(data: Goal[]) { saveCollection('gc_goals', data); }
export function addGoal(g: Omit<Goal, 'id' | 'createdAt'>): Goal {
  const list = getGoals();
  const item: Goal = { ...g, id: generateId(), createdAt: new Date().toISOString() };
  list.push(item);
  saveGoals(list);
  return item;
}
export function deleteGoal(id: string) { saveGoals(getGoals().filter(g => g.id !== id)); }

// Audit Logs
export function getAuditLogs(): AuditLog[] { return getCollection<AuditLog>('gc_audit_logs'); }

// Calculations
export function calcTotalFixedCostMonthly(): number {
  return getFixedCosts().reduce((sum, c) => sum + (c.recurrence === 'anual' ? c.value / 12 : c.value), 0);
}
export function calcTotalVariableCostPercentage(): number {
  return getVariableCosts().reduce((sum, c) => sum + c.percentage, 0);
}
export function calcIdealPrice(costPrice: number, desiredMarginPercent: number): number {
  const variablePercent = calcTotalVariableCostPercentage();
  const totalPercent = variablePercent + desiredMarginPercent;
  if (totalPercent >= 100) return costPrice * 3;
  return costPrice / (1 - totalPercent / 100);
}
export function calcMargin(product: Product): number {
  if (product.salePrice === 0) return 0;
  const variablePercent = calcTotalVariableCostPercentage();
  const variableCost = product.salePrice * (variablePercent / 100);
  const grossProfit = product.salePrice - product.costPrice - variableCost;
  return (grossProfit / product.salePrice) * 100;
}
export function calcGrossProfit(product: Product): number {
  const variablePercent = calcTotalVariableCostPercentage();
  const variableCost = product.salePrice * (variablePercent / 100);
  return product.salePrice - product.costPrice - variableCost;
}

// Market analysis
export function getMarketAnalysis(productId: string) {
  const prices = getCompetitorPrices().filter(p => p.productId === productId);
  if (prices.length === 0) return null;
  const values = prices.map(p => p.price);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((s, v) => s + v, 0) / values.length;
  const product = getProducts().find(p => p.id === productId);
  const myPrice = product?.salePrice || 0;
  const diffAvg = myPrice - avg;
  const diffMin = myPrice - min;
  let position: 'abaixo' | 'dentro' | 'acima' = 'dentro';
  if (myPrice < avg * 0.9) position = 'abaixo';
  else if (myPrice > avg * 1.1) position = 'acima';
  return { min, max, avg, myPrice, diffAvg, diffMin, position, count: prices.length };
}

// Product performance helpers
export function getProductPerformance() {
  const products = getProducts();
  const sales = getSales();
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  return products.map(p => {
    const margin = calcMargin(p);
    const grossProfit = calcGrossProfit(p);
    let totalQtySold = 0;
    let totalRevenue = 0;
    let lastSaleDate: string | null = null;

    sales.forEach(s => {
      s.items.forEach(item => {
        if (item.productId === p.id) {
          totalQtySold += item.quantity;
          totalRevenue += item.subtotal;
          if (!lastSaleDate || s.createdAt > lastSaleDate) lastSaleDate = s.createdAt;
        }
      });
    });

    const totalProfit = totalQtySold * grossProfit;
    const daysSinceLastSale = lastSaleDate ? Math.floor((now.getTime() - new Date(lastSaleDate).getTime()) / (1000 * 60 * 60 * 24)) : 999;
    const capitalInStock = p.stock * p.costPrice;

    // Sales in last 30 days
    let recentSales = 0;
    sales.filter(s => new Date(s.createdAt) >= thirtyDaysAgo).forEach(s => {
      s.items.forEach(item => { if (item.productId === p.id) recentSales += item.quantity; });
    });

    const dailyRate = recentSales / 30;
    const daysOfStock = dailyRate > 0 ? Math.round(p.stock / dailyRate) : 999;
    const suggestedReorder = dailyRate > 0 ? Math.max(0, Math.ceil(dailyRate * 30) - p.stock + p.minStock) : 0;

    let turnover: 'alto' | 'medio' | 'baixo' = 'baixo';
    if (dailyRate >= 1) turnover = 'alto';
    else if (dailyRate >= 0.3) turnover = 'medio';

    return { ...p, margin, grossProfit, totalQtySold, totalRevenue, totalProfit, lastSaleDate, daysSinceLastSale, capitalInStock, recentSales, dailyRate, daysOfStock, suggestedReorder, turnover };
  });
}

// ABC curve
export function getABCCurve(by: 'revenue' | 'profit' = 'revenue') {
  const perf = getProductPerformance();
  const sorted = [...perf].sort((a, b) => by === 'revenue' ? b.totalRevenue - a.totalRevenue : b.totalProfit - a.totalProfit);
  const total = sorted.reduce((s, p) => s + (by === 'revenue' ? p.totalRevenue : p.totalProfit), 0);

  let cumulative = 0;
  return sorted.map(p => {
    const value = by === 'revenue' ? p.totalRevenue : p.totalProfit;
    cumulative += value;
    const percentage = total > 0 ? (cumulative / total) * 100 : 0;
    const share = total > 0 ? (value / total) * 100 : 0;
    let curve: 'A' | 'B' | 'C' = 'C';
    if (percentage <= 80) curve = 'A';
    else if (percentage <= 95) curve = 'B';
    return { ...p, value, share, cumulativePercentage: percentage, curve };
  });
}

// Cash flow helpers
export function getCashFlowSummary() {
  const entries = getCashFlow();
  const today = new Date().toISOString().split('T')[0];
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay());
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

  const todayEntries = entries.filter(e => e.date === today);
  const weekEntries = entries.filter(e => e.date >= weekStart.toISOString().split('T')[0]);
  const monthEntries = entries.filter(e => e.date >= monthStart);

  const sum = (arr: CashFlowEntry[], type: 'entrada' | 'saida') => arr.filter(e => e.type === type).reduce((s, e) => s + e.value, 0);
  const totalIn = sum(entries, 'entrada');
  const totalOut = sum(entries, 'saida');

  return {
    balanceTotal: totalIn - totalOut,
    balanceToday: sum(todayEntries, 'entrada') - sum(todayEntries, 'saida'),
    balanceWeek: sum(weekEntries, 'entrada') - sum(weekEntries, 'saida'),
    balanceMonth: sum(monthEntries, 'entrada') - sum(monthEntries, 'saida'),
    totalIn: sum(monthEntries, 'entrada'),
    totalOut: sum(monthEntries, 'saida'),
  };
}

// Helper
export function fmt(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Demo data
export function seedDemoData() {
  if (getProducts().length > 0) return;

  const products: Omit<Product, 'id' | 'createdAt'>[] = [
    { name: 'Camiseta Básica', category: 'Vestuário', costPrice: 18, salePrice: 49.90, stock: 150, minStock: 20, unit: 'un', barcode: '7891234560011' },
    { name: 'Calça Jeans', category: 'Vestuário', costPrice: 45, salePrice: 129.90, stock: 80, minStock: 15, unit: 'un', barcode: '7891234560028' },
    { name: 'Tênis Esportivo', category: 'Calçados', costPrice: 85, salePrice: 199.90, stock: 5, minStock: 10, unit: 'par', barcode: '7891234560035' },
    { name: 'Mochila Escolar', category: 'Acessórios', costPrice: 32, salePrice: 89.90, stock: 45, minStock: 10, unit: 'un', barcode: '7891234560042' },
    { name: 'Boné Snapback', category: 'Acessórios', costPrice: 12, salePrice: 39.90, stock: 3, minStock: 15, unit: 'un', barcode: '7891234560059' },
    { name: 'Meias Kit 3 Pares', category: 'Vestuário', costPrice: 8, salePrice: 29.90, stock: 200, minStock: 30, unit: 'kit', barcode: '7891234560066' },
  ];
  products.forEach(addProduct);

  const fixedCosts: Omit<FixedCost, 'id'>[] = [
    { name: 'Aluguel', value: 2500, recurrence: 'mensal' },
    { name: 'Internet', value: 150, recurrence: 'mensal' },
    { name: 'Contador', value: 800, recurrence: 'mensal' },
    { name: 'Software/Sistema', value: 200, recurrence: 'mensal' },
  ];
  fixedCosts.forEach(addFixedCost);

  const variableCosts: Omit<VariableCost, 'id'>[] = [
    { name: 'Imposto (Simples)', percentage: 6, description: 'Simples Nacional' },
    { name: 'Taxa Cartão', percentage: 3.5, description: 'Máquina de cartão' },
    { name: 'Comissão Vendedor', percentage: 5, description: 'Comissão sobre venda' },
  ];
  variableCosts.forEach(addVariableCost);
}
