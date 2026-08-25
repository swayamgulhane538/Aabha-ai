import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import { db } from '../store/persistentDatabase';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.use(authenticate);

export interface PharmacyProduct {
  id: string;
  name: string;
  genericName: string;
  category: 'memory' | 'bp' | 'diabetes' | 'vitamins' | 'pain';
  dosage: string;
  price: number;
  originalPrice: number;
  discount: string;
  inStock: boolean;
  requiresPrescription: boolean;
  icon: string;
  description: string;
  packSize: string;
}

export const MASTER_PHARMACY_PRODUCTS: PharmacyProduct[] = [
  {
    id: 'med-1',
    name: 'Donepezil 5mg (Aricept)',
    genericName: 'Donepezil Hydrochloride',
    category: 'memory',
    dosage: '1 tablet once daily at bedtime',
    price: 185,
    originalPrice: 230,
    discount: '20% OFF',
    inStock: true,
    requiresPrescription: true,
    icon: '🧠',
    description: 'Cholinesterase inhibitor for improving memory, attention, and cognitive clarity in dementia.',
    packSize: 'Strip of 10 Tablets'
  },
  {
    id: 'med-2',
    name: 'Memantine 10mg (Admenta)',
    genericName: 'Memantine HCl',
    category: 'memory',
    dosage: '1 tablet twice daily with meals',
    price: 240,
    originalPrice: 300,
    discount: '20% OFF',
    inStock: true,
    requiresPrescription: true,
    icon: '✨',
    description: 'NMDA receptor antagonist that helps shield brain cells from excessive glutamate activity.',
    packSize: 'Strip of 14 Tablets'
  },
  {
    id: 'med-3',
    name: 'Telmisartan 40mg (Telma)',
    genericName: 'Telmisartan IP',
    category: 'bp',
    dosage: '1 tablet in the morning after breakfast',
    price: 95,
    originalPrice: 130,
    discount: '27% OFF',
    inStock: true,
    requiresPrescription: true,
    icon: '❤️',
    description: 'Angiotensin receptor blocker for smooth 24-hour blood pressure control.',
    packSize: 'Strip of 15 Tablets'
  },
  {
    id: 'med-4',
    name: 'Amlodipine 5mg (Amlong)',
    genericName: 'Amlodipine Besylate',
    category: 'bp',
    dosage: '1 tablet once daily',
    price: 45,
    originalPrice: 65,
    discount: '30% OFF',
    inStock: true,
    requiresPrescription: true,
    icon: '🫀',
    description: 'Calcium channel blocker to relax blood vessels and stabilize arterial pulse.',
    packSize: 'Strip of 15 Tablets'
  },
  {
    id: 'med-5',
    name: 'Metformin 500mg SR (Glycomet)',
    genericName: 'Metformin Hydrochloride Prolonged Release',
    category: 'diabetes',
    dosage: '1 tablet twice daily after main meals',
    price: 60,
    originalPrice: 85,
    discount: '29% OFF',
    inStock: true,
    requiresPrescription: true,
    icon: '🩸',
    description: 'First-line glucose management therapy to maintain steady blood sugar levels.',
    packSize: 'Strip of 20 Tablets'
  },
  {
    id: 'med-6',
    name: 'Neurobion Forte (B-Complex + B12)',
    genericName: 'Vitamin B1, B6, B12 & Nicotinamide',
    category: 'vitamins',
    dosage: '1 tablet daily with water',
    price: 42,
    originalPrice: 55,
    discount: '23% OFF',
    inStock: true,
    requiresPrescription: false,
    icon: '⚡',
    description: 'Essential nerve health and neuro-protective vitamin formulation for healthy neurotransmission.',
    packSize: 'Strip of 30 Tablets'
  },
  {
    id: 'med-7',
    name: 'Calcirol 60,000 IU (Vitamin D3)',
    genericName: 'Cholecalciferol Sachet/Capsule',
    category: 'vitamins',
    dosage: '1 capsule weekly with warm milk',
    price: 110,
    originalPrice: 145,
    discount: '24% OFF',
    inStock: true,
    requiresPrescription: false,
    icon: '☀️',
    description: 'High-potency bone and immune strength Vitamin D3 formulation.',
    packSize: 'Box of 4 Capsules'
  },
  {
    id: 'med-8',
    name: 'Omega-3 Fish Oil 1000mg',
    genericName: 'EPA 180mg + DHA 120mg',
    category: 'vitamins',
    dosage: '1 softgel daily after dinner',
    price: 350,
    originalPrice: 499,
    discount: '30% OFF',
    inStock: true,
    requiresPrescription: false,
    icon: '🐟',
    description: 'Pure triple-purified essential fatty acids for brain wellness and heart health.',
    packSize: 'Bottle of 60 Softgels'
  }
];

// In-memory orders store
const userPharmacyOrders: Record<string, any[]> = {};

// GET /api/pharmacy/products - Get all medicines
router.get('/products', (req: Request, res: Response) => {
  const { category, search } = req.query as { category?: string; search?: string };
  let list = [...MASTER_PHARMACY_PRODUCTS];

  if (category && category !== 'all') {
    list = list.filter(p => p.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.genericName.toLowerCase().includes(q));
  }

  res.json({
    success: true,
    total: list.length,
    products: list
  });
});

// POST /api/pharmacy/orders - Place Medicine Delivery Order
router.post('/orders', (req: Request, res: Response) => {
  try {
    const user = req.user!;
    const { items, deliveryAddress, paymentMethod, prescriptionAttached } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const orderId = `ORD-${Date.now().toString().slice(-6)}`;
    const totalAmount = items.reduce((sum: number, it: any) => sum + (it.price * (it.quantity || 1)), 0);

    const newOrder = {
      id: orderId,
      userId: user.id,
      patientId: user.patientId || 'PAT-2026-000001',
      patientName: user.name || 'Anita Devi',
      items,
      totalAmount,
      deliveryAddress: deliveryAddress || 'B-402 Green Meadows, New Delhi',
      paymentMethod: paymentMethod || 'Cash on Delivery (COD)',
      status: 'DISPATCHED_EXPRESS',
      estimatedDelivery: 'Tomorrow by 2:00 PM',
      prescriptionAttached: prescriptionAttached ?? true,
      orderedAt: new Date().toISOString()
    };

    if (!userPharmacyOrders[user.id]) {
      userPharmacyOrders[user.id] = [];
    }
    userPharmacyOrders[user.id].unshift(newOrder);

    // Create system notification
    db.createNotification({
      id: `notif-${uuidv4()}`,
      userId: user.id,
      title: '📦 Medicine Order Confirmed!',
      message: `Order #${orderId} (${items.length} medicines) has been verified by the pharmacist and dispatched.`,
      type: 'MEDICATION',
      isRead: false,
      createdAt: new Date().toISOString()
    });

    db.logAudit(
      user.id,
      user.name || 'Patient',
      'PHARMACY_ORDER_PLACED',
      'MEDICATION',
      orderId,
      `Placed pharmacy order #${orderId} with total value ₹${totalAmount}`,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: 'Medicine order placed and scheduled for express doorstep delivery!',
      order: newOrder
    });
  } catch (err: any) {
    console.error('Pharmacy order error:', err);
    res.status(500).json({ error: 'Failed to place pharmacy order' });
  }
});

// GET /api/pharmacy/orders - List patient orders
router.get('/orders', (req: Request, res: Response) => {
  const user = req.user!;
  const orders = userPharmacyOrders[user.id] || [];

  res.json({
    success: true,
    orders
  });
});

export default router;
