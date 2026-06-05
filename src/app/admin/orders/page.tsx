'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiPackage, FiSearch, FiEdit2, FiInfo, FiCheck, FiX, FiCheckCircle, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { formatPrice } from '@/lib/currency';

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Access check
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin/orders');
    } else if (session && session.user && ((session.user as { role?: string }).role !== 'admin' || session.user.email !== 'admin@moonmart.com')) {
      router.push('/');
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      if (data.success) {
        setOrders(data.data || []);
      }
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user && (session.user as { role?: string }).role === 'admin' && session.user.email === 'admin@moonmart.com') {
      fetchOrders();
    }
  }, [session]);

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'stripe': return 'Credit/Debit (Stripe)';
      case 'paypal': return 'PayPal';
      case 'bank_uk_gbp': return 'Citibank UK (GBP)';
      case 'bank_us_usd': return 'Citibank US (USD)';
      case 'zelle': return 'Zelle';
      case 'wise_uk': return 'Wise UK';
      default: return method;
    }
  };

  const handleStatusUpdateEx = async (id: string, newOrderStatus: string, newPaymentStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newOrderStatus, paymentStatus: newPaymentStatus }),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Order details updated successfully!');
        setSelectedOrder(data.data);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to update order');
      }
    } catch (err) {
      toast.error('Connection error updating order');
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      // Payment status auto updates if delivered
      const updates: any = { orderStatus: newStatus };
      if (newStatus === 'delivered') {
        updates.paymentStatus = 'paid';
      }

      const res = await fetch(`/api/orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await res.json();
      if (data.success) {
        toast.success(`Order status updated to ${newStatus}`);
        fetchOrders();
      } else {
        toast.error(data.error || 'Failed to update order status');
      }
    } catch (err) {
      toast.error('Connection error updating status');
    }
  };

  // Filter orders list by tracking number or order ID
  const filteredOrders = orders.filter(
    (o) =>
      o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.trackingNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.shippingAddress?.fullName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'pending': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'confirmed': return 'text-blue-700 bg-blue-50 border-blue-200';
      case 'processing': return 'text-purple-700 bg-purple-50 border-purple-200';
      case 'shipped': return 'text-sky-700 bg-sky-50 border-sky-200';
      case 'delivered': return 'text-green-700 bg-green-50 border-green-200';
      case 'cancelled': return 'text-red-700 bg-red-50 border-red-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Link href="/admin" className="p-2 bg-white rounded-lg border border-border hover:bg-bg-primary text-text-secondary">
            <FiArrowLeft size={16} />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Order Manager</h1>
            <p className="text-xs text-text-secondary">Track user purchases and update shipment stages</p>
          </div>
        </div>

        {/* Filter input */}
        <div className="bg-white p-4 rounded-xl border border-border-light shadow-sm flex items-center gap-3 mb-6">
          <FiSearch className="text-text-muted" size={18} />
          <input
            type="text"
            placeholder="Search by order ID, tracking number, or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 text-sm bg-transparent outline-none text-text-primary"
            aria-label="Search orders"
          />
        </div>

        {/* Orders Table list */}
        {loading ? (
          <div className="space-y-3">
            <div className="h-12 skeleton w-full" />
            <div className="h-12 skeleton w-full" />
            <div className="h-12 skeleton w-full" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center text-text-secondary">
            No orders found matching search criteria.
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-border-light overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead>
                  <tr className="bg-bg-primary text-text-primary font-bold uppercase tracking-wider border-b border-border">
                    <th className="p-3">Order ID / Tracking</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Method / Payment</th>
                    <th className="p-3">Shipment Status</th>
                    <th className="p-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr key={o._id} className="border-b border-border-light hover:bg-bg-primary/30 transition-colors">
                      {/* ID / Tracking */}
                      <td className="p-3 space-y-0.5">
                        <span className="font-mono font-bold text-text-primary block">{o._id}</span>
                        <span className="font-mono text-primary text-[10px] block">Track: {o.trackingNumber}</span>
                      </td>

                      {/* Date */}
                      <td className="p-3">
                        <span>{new Date(o.createdAt).toLocaleDateString()}</span>
                        <span className="text-[10px] text-text-muted block">
                          {new Date(o.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="p-3 space-y-0.5">
                        <span className="font-semibold text-text-primary block">{o.shippingAddress?.fullName}</span>
                        <span className="text-[10px] text-text-muted block">{o.shippingAddress?.phone}</span>
                      </td>

                      {/* Amount */}
                      <td className="p-3">
                        <span className="font-bold text-text-primary block">{formatPrice(o.total, o.country || 'US')}</span>
                        <span className="text-[10px] text-text-muted block">{o.items.length} items</span>
                      </td>

                      {/* Payment details */}
                      <td className="p-3 space-y-1">
                        <span className="uppercase text-[10px] bg-bg-primary px-2 py-0.5 rounded font-semibold text-text-primary">
                          {getPaymentMethodLabel(o.paymentMethod)}
                        </span>
                        <span className={`text-[10px] font-bold uppercase block ${
                          o.paymentStatus === 'paid' ? 'text-success' : 'text-error'
                        }`}>
                          ● {o.paymentStatus}
                        </span>
                      </td>

                      {/* Order status dropdown editor */}
                      <td className="p-3">
                        <select
                          value={o.orderStatus}
                          onChange={(e) => handleStatusChange(o._id, e.target.value)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-full outline-none border transition-all bg-white cursor-pointer uppercase tracking-wider ${getStatusColor(
                            o.orderStatus
                          )}`}
                          aria-label={`Update status for order ${o._id}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="p-3">
                        <button
                          onClick={() => {
                            setSelectedOrder(o);
                            setIsModalOpen(true);
                          }}
                          className="flex items-center gap-1 text-primary hover:text-primary-hover font-bold text-xs bg-primary-light/50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                        >
                          <FiInfo size={12} /> Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl border border-border w-full max-w-3xl overflow-hidden animate-scale-in max-h-[90vh] flex flex-col text-xs">
            {/* Modal Header */}
            <div className="bg-primary p-4 text-white flex justify-between items-center shrink-0">
              <div>
                <h2 className="text-sm font-bold flex items-center gap-1.5">
                  <FiPackage /> Order Details
                </h2>
                <p className="text-[10px] text-white/80 font-mono mt-0.5">ID: {selectedOrder._id} | Tracking: {selectedOrder.trackingNumber}</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-full transition-all text-white outline-none active:scale-95"
              >
                <FiX size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* 2 Column Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Customer and Payment */}
                <div className="space-y-4">
                  <div className="border border-border rounded-xl p-4 bg-bg-primary/40 space-y-2">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">Customer & Shipping</h3>
                    <p><span className="font-semibold text-text-secondary">Name:</span> {selectedOrder.shippingAddress?.fullName}</p>
                    <p><span className="font-semibold text-text-secondary">Phone:</span> {selectedOrder.shippingAddress?.phone}</p>
                    <p><span className="font-semibold text-text-secondary">Address:</span> {selectedOrder.shippingAddress?.address}, {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} {selectedOrder.shippingAddress?.zipCode}</p>
                    <p><span className="font-semibold text-text-secondary">Country:</span> {selectedOrder.shippingAddress?.country || selectedOrder.country}</p>
                  </div>

                  <div className="border border-border rounded-xl p-4 bg-bg-primary/40 space-y-3">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">Payment Details</h3>
                    <p><span className="font-semibold text-text-secondary">Method:</span> <span className="font-bold text-primary">{getPaymentMethodLabel(selectedOrder.paymentMethod)}</span></p>
                    
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-secondary">Payment Status:</span>
                      <select
                        value={selectedOrder.paymentStatus}
                        onChange={(e) => handleStatusUpdateEx(selectedOrder._id, selectedOrder.orderStatus, e.target.value)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none bg-white uppercase cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                        <option value="failed">Failed</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-text-secondary">Fulfillment Status:</span>
                      <select
                        value={selectedOrder.orderStatus}
                        onChange={(e) => handleStatusUpdateEx(selectedOrder._id, e.target.value, selectedOrder.paymentStatus)}
                        className="px-2.5 py-1 rounded-full text-[10px] font-bold border outline-none bg-white uppercase cursor-pointer"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Right Column: Order Items */}
                <div className="space-y-4">
                  <div className="border border-border rounded-xl p-4 bg-white space-y-3 shadow-sm">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider border-b border-border pb-1.5">Items Summary</h3>
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
                      {selectedOrder.items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-2.5 items-center pb-2 border-b border-border-light last:border-0 last:pb-0">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="w-10 h-10 object-cover rounded border border-border"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-text-primary truncate">{item.productName}</p>
                            <p className="text-[10px] text-text-muted">Qty: {item.quantity}</p>
                          </div>
                          <span className="font-bold text-text-primary text-right whitespace-nowrap">
                            {formatPrice(item.price * item.quantity, selectedOrder.country || 'US')}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-2 space-y-1.5 text-[11px] text-text-secondary font-medium">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>{formatPrice(selectedOrder.subtotal, selectedOrder.country || 'US')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Delivery</span>
                        <span>{selectedOrder.shippingFee === 0 ? 'FREE' : formatPrice(selectedOrder.shippingFee, selectedOrder.country || 'US')}</span>
                      </div>
                      <div className="flex justify-between text-xs font-bold text-text-primary border-t border-border pt-1.5">
                        <span>Total Payable</span>
                        <span className="text-primary">{formatPrice(selectedOrder.total, selectedOrder.country || 'US')}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Row: Payment Proof Snip */}
              {selectedOrder.paymentMethod !== 'stripe' && (
                <div className="border border-border rounded-xl p-4 bg-amber-50/20 space-y-3">
                  <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider border-b border-amber-200 pb-1.5 flex items-center gap-1.5">
                    <FiCheckCircle className="text-amber-600" /> Buyer Payment Proof (Snip)
                  </h3>
                  
                  {selectedOrder.paymentProofImage ? (
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="relative w-36 h-24 border border-border rounded-lg overflow-hidden shadow bg-white cursor-pointer group shrink-0"
                        onClick={() => setIsLightboxOpen(true)}
                      >
                        <img
                          src={selectedOrder.paymentProofImage}
                          alt="Payment proof snip"
                          className="object-contain w-full h-full"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white text-[10px] font-bold gap-1">
                          <FiEye size={12} /> Expand
                        </div>
                      </div>
                      <div className="space-y-1.5 text-[11px] text-text-secondary">
                        <p className="font-semibold text-text-primary">Manual transfer completed by buyer.</p>
                        <p>Please inspect the screenshot carefully to verify payment details (beneficiary name, transfer amount, account details, and date) matches the order summary total of <span className="font-bold text-text-primary">{formatPrice(selectedOrder.total, selectedOrder.country || 'US')}</span> before confirming or shipping the order.</p>
                        <button
                          type="button"
                          onClick={() => setIsLightboxOpen(true)}
                          className="text-primary hover:underline font-bold flex items-center gap-1 mt-1 outline-none"
                        >
                          <FiEye /> View Fullscreen Snip
                        </button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-xs italic text-red-600">No payment proof image uploaded for this order.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && selectedOrder?.paymentProofImage && (
        <div className="fixed inset-0 bg-black/95 z-[60] flex items-center justify-center p-4 backdrop-blur-md">
          <div className="relative max-w-4xl w-full max-h-[80vh] flex flex-col items-center">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-10 right-0 p-2 hover:bg-white/10 rounded-full transition-all text-white outline-none"
              title="Close fullscreen preview"
            >
              <FiX size={24} />
            </button>
            <img
              src={selectedOrder.paymentProofImage}
              alt="Payment Proof Fullscreen"
              className="object-contain max-h-[70vh] rounded-lg shadow-2xl bg-white/5 border border-white/10"
            />
            <p className="text-white/70 text-xs font-semibold mt-4 text-center">
              Payment Proof Snip - Order ID: {selectedOrder._id}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
