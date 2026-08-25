import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  CheckCircle2,
  Truck,
  ShieldCheck,
  FileText,
  ArrowLeft,
  X,
  CreditCard,
  MapPin,
  Clock,
  Sparkles,
  HeartPulse
} from 'lucide-react';
import { api } from '../services/api';
import { useAuthStore } from '../stores/authStore';

interface Product {
  id: string;
  name: string;
  genericName: string;
  category: string;
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

interface CartItem extends Product {
  quantity: number;
}

export const MedicineStoreView: React.FC = () => {
  const { user } = useAuthStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'store' | 'orders'>('store');

  // Checkout Form
  const [address, setAddress] = useState(user?.address || 'B-402 Green Meadows, New Delhi');
  const [paymentMethod, setPaymentMethod] = useState('Cash on Delivery (COD)');
  const [orderSubmitting, setOrderSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, [category]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res: any = await api.get(`/pharmacy/products?category=${category}&search=${encodeURIComponent(search)}`);
      if (res && res.products) {
        setProducts(res.products);
      }
    } catch (err) {
      console.warn('Error loading pharmacy products:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const res: any = await api.get('/pharmacy/orders');
      if (res && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn('Error loading orders:', err);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const addToCart = (product: Product) => {
    setCart(prev => {
      const exists = prev.find(item => item.id === product.id);
      if (exists) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev => {
      return prev
        .map(item => {
          if (item.id === productId) {
            const nextQty = item.quantity + delta;
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartSavings = cart.reduce((sum, item) => sum + (item.originalPrice - item.price) * item.quantity, 0);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setOrderSubmitting(true);
    try {
      const res: any = await api.post('/pharmacy/orders', {
        items: cart,
        deliveryAddress: address,
        paymentMethod,
        prescriptionAttached: true
      });

      if (res && res.order) {
        setOrderSuccess(res.order);
        setCart([]);
        fetchOrders();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to place order');
    } finally {
      setOrderSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 font-sans pb-24">
      {/* ─── 1. HEADER ─────────────────────────────────────────────────────── */}
      <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link to="/patient" className="text-xs font-black text-black underline flex items-center gap-1 mb-2 hover:text-gray-700">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-black flex items-center gap-2">
            <span>💊</span>
            <span>Express Medicine Store & Pharmacy</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-700 font-bold mt-1">
            Prescription refills, memory supplements & doorstep medicine delivery
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setActiveView(activeView === 'store' ? 'orders' : 'store')}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 border-2 border-black rounded-2xl text-xs font-black transition"
          >
            {activeView === 'store' ? `📦 My Orders (${orders.length})` : '🏬 Back to Store'}
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="px-5 py-2.5 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs sm:text-sm font-black flex items-center gap-2 shadow transition relative cursor-pointer active:scale-95"
          >
            <ShoppingCart className="w-4 h-4 text-white" />
            <span>Cart</span>
            {totalItemsCount > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white text-[10px] font-black rounded-full shadow-xs">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeView === 'orders' ? (
        /* ─── ORDERS ARCHIVE VIEW ─────────────────────────────────────────── */
        <div className="card-3d bg-white p-6 sm:p-8 rounded-3xl space-y-4">
          <h2 className="text-xl font-black text-black flex items-center gap-2">
            <span>📦</span>
            <span>Past Medicine Orders & Delivery Tracking</span>
          </h2>

          {orders.length === 0 ? (
            <div className="p-8 text-center bg-gray-50 rounded-2xl text-xs font-bold text-gray-600">
              You have no active or previous medicine delivery orders.
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map(ord => (
                <div key={ord.id} className="p-5 rounded-2xl border-2 border-black bg-gray-50 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <span className="text-xs font-black text-black">Order #{ord.id}</span>
                      <span className="text-[11px] text-gray-500 font-bold ml-2">
                        {new Date(ord.orderedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <span className="px-3 py-1 bg-emerald-100 border border-emerald-400 text-emerald-950 text-xs font-black rounded-full flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>{ord.status.replace('_', ' ')}</span>
                    </span>
                  </div>

                  <div className="text-xs font-bold text-gray-700">
                    <p>• <strong>Items:</strong> {ord.items.map((i: any) => `${i.name} (x${i.quantity || 1})`).join(', ')}</p>
                    <p>• <strong>Delivery To:</strong> {ord.deliveryAddress}</p>
                    <p>• <strong>Total Paid:</strong> ₹{ord.totalAmount} ({ord.paymentMethod})</p>
                    <p className="text-emerald-900 font-black mt-1">🚚 Estimated Arrival: {ord.estimatedDelivery}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ─── STORE VIEW ──────────────────────────────────────────────────── */
        <>
          {/* Search & Category Filter */}
          <div className="card-3d bg-white p-5 rounded-3xl space-y-4">
            <form onSubmit={handleSearchSubmit} className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  placeholder="Search medicines (e.g. Donepezil, Telmisartan, Vitamin D3)..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-300 text-xs sm:text-sm font-bold focus:border-black outline-none"
                />
              </div>
              <button
                type="submit"
                className="px-5 py-3 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs font-black shadow cursor-pointer active:scale-95"
              >
                Search
              </button>
            </form>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              {[
                { id: 'all', label: 'All Medicines (सभी दवाएं)' },
                { id: 'memory', label: '🧠 Memory & Dementia' },
                { id: 'bp', label: '❤️ Blood Pressure' },
                { id: 'diabetes', label: '🩸 Diabetes & Sugar' },
                { id: 'vitamins', label: '⚡ Vitamins & Supplements' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition border-2 cursor-pointer ${
                    category === cat.id
                      ? 'bg-black text-white border-black shadow-xs ring-2 ring-black/20'
                      : 'bg-white text-black border-gray-300 hover:border-black'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {products.map(product => {
              const inCart = cart.find(i => i.id === product.id);
              return (
                <div
                  key={product.id}
                  className="card-3d bg-white p-5 rounded-3xl flex flex-col justify-between group select-none"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 border-2 border-black flex items-center justify-center text-3xl shadow-xs">
                        {product.icon}
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        <span className="px-2 py-0.5 bg-emerald-100 border border-emerald-400 text-emerald-950 text-[10px] font-black uppercase rounded-full">
                          {product.discount}
                        </span>
                        {product.requiresPrescription && (
                          <span className="text-[9px] font-black uppercase text-gray-500">
                            Prescription Required
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-black text-black leading-snug group-hover:underline">
                      {product.name}
                    </h3>
                    <p className="text-[11px] font-bold text-gray-500 mt-0.5">{product.packSize}</p>
                    <p className="text-xs font-medium text-gray-700 mt-2 line-clamp-2">
                      {product.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t-2 border-gray-100 flex items-center justify-between">
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-lg font-black text-black">₹{product.price}</span>
                        <span className="text-xs font-bold text-gray-400 line-through">₹{product.originalPrice}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700">In Stock • Express 24h</span>
                    </div>

                    {inCart ? (
                      <div className="flex items-center gap-2 bg-black text-white p-1 rounded-2xl">
                        <button
                          onClick={() => updateQuantity(product.id, -1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-xl font-black text-sm cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-black px-1">{inCart.quantity}</span>
                        <button
                          onClick={() => updateQuantity(product.id, 1)}
                          className="w-7 h-7 flex items-center justify-center bg-gray-800 hover:bg-gray-700 rounded-xl font-black text-sm cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(product)}
                        className="px-4 py-2 bg-black hover:bg-gray-800 text-white rounded-2xl text-xs font-black shadow transition flex items-center gap-1 cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ─── 4. CART & CHECKOUT MODAL ──────────────────────────────────────── */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in font-sans">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border-2 border-black shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b-2 border-black pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-black" />
                <h2 className="text-xl font-black text-black">Your Medicine Cart ({totalItemsCount})</h2>
              </div>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-600 hover:text-black font-black text-lg">
                ✕
              </button>
            </div>

            {orderSuccess ? (
              <div className="p-6 bg-emerald-50 border-2 border-emerald-500 rounded-2xl text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="text-lg font-black text-emerald-950">Order Placed Successfully!</h3>
                <p className="text-xs font-bold text-gray-700">
                  Order <strong>#{orderSuccess.id}</strong> has been received by our certified pharmacy.
                </p>
                <div className="p-3 bg-white border border-emerald-300 rounded-xl text-xs font-bold text-left space-y-1">
                  <p>🚚 <strong>Estimated Delivery:</strong> Tomorrow by 2:00 PM</p>
                  <p>📍 <strong>Deliver To:</strong> {orderSuccess.deliveryAddress}</p>
                  <p>💳 <strong>Total:</strong> ₹{orderSuccess.totalAmount} (COD)</p>
                </div>
                <button
                  onClick={() => {
                    setOrderSuccess(null);
                    setIsCartOpen(false);
                  }}
                  className="w-full py-3 bg-black text-white font-black text-xs rounded-xl hover:bg-gray-800"
                >
                  Done
                </button>
              </div>
            ) : cart.length === 0 ? (
              <div className="p-8 text-center text-xs font-bold text-gray-500">
                Your cart is empty. Browse the store and add prescribed medicines.
              </div>
            ) : (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                {/* Cart Items List */}
                <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto space-y-2 pr-1">
                  {cart.map(item => (
                    <div key={item.id} className="pt-2 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-black text-black">{item.name}</div>
                        <div className="text-[10px] text-gray-500">₹{item.price} each</div>
                      </div>

                      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border rounded font-black text-xs"
                        >
                          -
                        </button>
                        <span className="font-black px-1">{item.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          className="w-6 h-6 flex items-center justify-center bg-white border rounded font-black text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bill Summary */}
                <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-200 text-xs font-bold space-y-1.5">
                  <div className="flex justify-between text-gray-600">
                    <span>Total MRP:</span>
                    <span>₹{cartTotal + cartSavings}</span>
                  </div>
                  <div className="flex justify-between text-emerald-800 font-bold">
                    <span>Senior Subsidy Savings:</span>
                    <span>-₹{cartSavings}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery Fee:</span>
                    <span className="text-emerald-700 font-black">FREE</span>
                  </div>
                  <div className="border-t border-gray-300 pt-1.5 flex justify-between text-sm font-black text-black">
                    <span>Total Amount to Pay:</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                {/* Delivery Address */}
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  />
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-xs font-black text-black uppercase mb-1">
                    Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value)}
                    className="w-full p-3 rounded-2xl border-2 border-gray-300 text-xs font-bold focus:border-black outline-none"
                  >
                    <option value="Cash on Delivery (COD)">💵 Cash on Delivery (COD)</option>
                    <option value="UPI / QR Code">📲 UPI / Google Pay / PhonePe</option>
                    <option value="Jan Aushadhi Subsidy">🏥 Jan Aushadhi Government Subsidy</option>
                  </select>
                </div>

                <div className="p-2.5 bg-teal-50 border border-teal-300 rounded-xl text-[11px] font-bold text-teal-950 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0" />
                  <span>Dr. Anita Verma's verified prescription will be automatically attached to this refill order.</span>
                </div>

                <button
                  type="submit"
                  disabled={orderSubmitting}
                  className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-2xl font-black text-xs sm:text-sm shadow cursor-pointer active:scale-95"
                >
                  {orderSubmitting ? 'Placing Order...' : `Confirm & Place Order (₹${cartTotal})`}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MedicineStoreView;
