'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiPackage, FiShoppingBag, FiTruck, FiCheck, FiX, FiCalendar, FiArrowRight, FiInfo } from 'react-icons/fi';

interface OrderItem {
  product: string;
  productName: string;
  productImage: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  createdAt: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  trackingNumber: string;
  items: OrderItem[];
}

export default function UserOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/account/orders');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!session?.user) return;
      try {
        const userId = (session.user as any).id || '';
        const res = await fetch(`/api/orders?userId=${userId}`);
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchOrders();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-10">
        <div className="container-main max-w-4xl space-y-4">
          <div className="h-8 skeleton w-1/4" />
          <div className="h-32 skeleton w-full" />
          <div className="h-32 skeleton w-full" />
        </div>
      </div>
    );
  }

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'pending': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'confirmed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'processing': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'shipped': return 'bg-info/10 text-info border-info/20';
      case 'delivered': return 'bg-success/10 text-success border-success/20';
      case 'cancelled': return 'bg-error/10 text-error border-error/20';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const steps = ['pending', 'confirmed', 'shipped', 'delivered'];
  const getStepIndex = (st: string) => {
    if (st === 'cancelled') return -1;
    if (st === 'processing') return 1; // mapping processing to step 1 (between confirmed and shipped)
    return steps.indexOf(st);
  };

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">My Orders</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-text-primary mb-6 flex items-center gap-2">
          <FiPackage className="text-primary" /> My Orders ({orders.length})
        </h1>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm space-y-4">
            <div className="w-16 h-16 bg-primary-light rounded-full flex items-center justify-center mx-auto text-primary">
              <FiShoppingBag size={30} />
            </div>
            <h2 className="text-lg font-bold text-text-primary">No Orders Yet</h2>
            <p className="text-text-secondary text-sm max-w-sm mx-auto">
              You haven&apos;t placed any orders yet. Visit the home screen and choose from our featured categories!
            </p>
            <Link
              href="/"
              className="inline-block bg-primary hover:bg-primary-hover text-white text-xs font-bold px-6 py-2.5 rounded-lg transition-all"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const currentStep = getStepIndex(order.orderStatus);
              const isCancelled = order.orderStatus === 'cancelled';
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-sm border border-border-light overflow-hidden p-5 space-y-5"
                >
                  {/* Order Header Summary */}
                  <div className="flex flex-col sm:flex-row justify-between border-b border-border-light pb-4 gap-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                      <div className="flex items-center gap-1">
                        <FiCalendar className="text-primary" />
                        <span>{formattedDate}</span>
                      </div>
                      <span className="font-semibold text-text-primary">
                        ID: <span className="font-mono">{order._id}</span>
                      </span>
                      <span className="font-semibold text-primary">
                        Tracking: <span className="font-mono">{order.trackingNumber}</span>
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <span className="text-sm font-bold text-text-primary">
                        Rs. {order.total.toLocaleString()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStatusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div key={i} className="flex gap-4 items-center">
                        <div className="w-14 h-14 relative rounded bg-bg-primary overflow-hidden shrink-0 border border-border-light">
                          <img
                            src={item.productImage}
                            alt={item.productName}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-text-primary truncate">{item.productName}</p>
                          <p className="text-xs text-text-secondary">
                            Rs. {item.price.toLocaleString()} x {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tracking Timeline (Step Progress Bar) */}
                  {!isCancelled ? (
                    <div className="border-t border-border-light pt-5">
                      <p className="text-xs font-bold text-text-secondary mb-4 flex items-center gap-1">
                        <FiInfo size={14} className="text-info" /> Shipment Status Timeline
                      </p>
                      
                      <div className="relative flex justify-between items-center max-w-xl mx-auto px-4">
                        {/* Connection Line */}
                        <div className="absolute left-8 right-8 top-1/2 -translate-y-1/2 h-1 bg-bg-primary z-0 rounded">
                          <div
                            className="bg-primary h-full transition-all duration-500 rounded"
                            style={{
                              width: `${currentStep === 0 ? '0' : currentStep === 1 ? '33' : currentStep === 2 ? '66' : '100'}%`,
                            }}
                          />
                        </div>

                        {/* Steps */}
                        {steps.map((step, idx) => {
                          const isDone = idx <= currentStep;
                          const isActive = idx === currentStep;

                          return (
                            <div key={step} className="flex flex-col items-center z-10 relative">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-colors duration-300 ${
                                isDone
                                  ? 'bg-primary border-primary text-white'
                                  : 'bg-white border-border text-text-muted'
                              } ${isActive ? 'ring-4 ring-primary-light' : ''}`}>
                                {isDone ? <FiCheck size={14} /> : idx + 1}
                              </div>
                              <span className={`text-[10px] font-bold uppercase tracking-wider mt-2 transition-colors ${
                                isDone ? 'text-primary' : 'text-text-muted'
                              }`}>
                                {step}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <div className="border-t border-border-light pt-4 flex items-center gap-2 text-error text-xs font-semibold bg-red-50 p-3 rounded-lg">
                      <FiX size={16} />
                      <span>This order has been cancelled. If payment was processed, refund will settle in 5-7 bank days.</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
