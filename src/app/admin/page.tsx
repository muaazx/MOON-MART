'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiAlertCircle, FiPackage, FiSettings, FiGrid, FiGrid as FiGridIcon, FiArrowRight } from 'react-icons/fi';
import { formatPrice } from '@/lib/currency';

export default function AdminDashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [stats, setStats] = useState({
    sales: 0,
    ordersCount: 0,
    customers: 2, // Default seeded users count
    lowStock: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Authenticate Admin
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/admin');
    } else if (session && session.user && ((session.user as any).role !== 'admin' || session.user.email !== 'admin@moonmart.com')) {
      router.push('/');
    }
  }, [status, session, router]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Fetch products for low stock alert
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        let lowStockCount = 0;
        if (prodData.success) {
          lowStockCount = prodData.data.filter((p: any) => p.stock <= 5).length;
        }

        // Fetch orders for sales figures
        const orderRes = await fetch('/api/orders');
        const orderData = await orderRes.json();
        
        let totalSales = 0;
        let ordersCount = 0;
        let ordersList = [];

        if (orderData.success) {
          ordersList = orderData.data || [];
          ordersCount = ordersList.length;
          totalSales = ordersList
            .filter((o: any) => o.orderStatus !== 'cancelled')
            .reduce((sum: number, o: any) => sum + o.total, 0);
        }

        setStats({
          sales: totalSales,
          ordersCount,
          customers: 2 + Math.max(0, ordersList.filter((o: any) => o.user.startsWith('user_17')).length),
          lowStock: lowStockCount,
        });

        setRecentOrders(ordersList.slice(0, 5));
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && (session.user as { role?: string }).role === 'admin' && session.user.email === 'admin@moonmart.com') {
      fetchDashboardData();
    }
  }, [session]);

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-bg-primary py-10">
        <div className="container-main space-y-6">
          <div className="h-8 skeleton w-1/4" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
            <div className="h-24 skeleton rounded-xl" />
          </div>
          <div className="h-64 skeleton rounded-xl" />
        </div>
      </div>
    );
  }

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'pending': return 'bg-amber-100 text-amber-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary">Seller Center Dashboard</h1>
            <p className="text-xs text-text-secondary">Overview of Moon Mart metrics, catalog, and deliveries.</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href="/admin/products"
              className="bg-primary hover:bg-primary-hover text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Manage Catalog
            </Link>
            <Link
              href="/admin/orders"
              className="bg-secondary hover:bg-secondary-light text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Revenue */}
          <div className="bg-white p-5 rounded-xl border border-border-light shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-green-50 text-success rounded-xl flex items-center justify-center shrink-0">
              <FiTrendingUp size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Total Sales</p>
              <h3 className="text-lg font-bold text-text-primary mt-0.5">${stats.sales.toFixed(2)}</h3>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-white p-5 rounded-xl border border-border-light shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-xl flex items-center justify-center shrink-0">
              <FiShoppingBag size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Total Orders</p>
              <h3 className="text-lg font-bold text-text-primary mt-0.5">{stats.ordersCount}</h3>
            </div>
          </div>

          {/* Customers */}
          <div className="bg-white p-5 rounded-xl border border-border-light shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <FiUsers size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Total Customers</p>
              <h3 className="text-lg font-bold text-text-primary mt-0.5">{stats.customers}</h3>
            </div>
          </div>

          {/* Low Stock Warnings */}
          <div className={`bg-white p-5 rounded-xl border shadow-sm flex items-center gap-4 ${
            stats.lowStock > 0 ? 'border-red-200 bg-red-50/20' : 'border-border-light'
          }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              stats.lowStock > 0 ? 'bg-red-100 text-error' : 'bg-gray-50 text-text-muted'
            }`}>
              <FiAlertCircle size={24} />
            </div>
            <div>
              <p className="text-xs font-semibold text-text-secondary">Low Stock Items</p>
              <h3 className={`text-lg font-bold mt-0.5 ${stats.lowStock > 0 ? 'text-error' : 'text-text-primary'}`}>
                {stats.lowStock}
              </h3>
            </div>
          </div>
        </div>

        {/* Main Grid: Recent Orders */}
        <div className="bg-white rounded-xl shadow-sm border border-border-light p-5">
          <div className="flex justify-between items-center border-b border-border-light pb-4 mb-4">
            <h2 className="font-bold text-text-primary text-base flex items-center gap-2">
              <FiPackage className="text-primary" /> Recent Orders
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-primary hover:underline font-semibold flex items-center gap-0.5"
            >
              See All Orders <FiArrowRight />
            </Link>
          </div>

          {recentOrders.length === 0 ? (
            <p className="text-xs text-text-muted text-center py-6">No customer orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-text-secondary">
                <thead>
                  <tr className="border-b border-border text-text-primary font-bold uppercase tracking-wider bg-bg-primary rounded-lg">
                    <th className="p-3">Order ID</th>
                    <th className="p-3">Tracking</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Method</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="border-b border-border-light hover:bg-bg-primary/50 transition-colors">
                      <td className="p-3 font-mono font-bold text-text-primary">{order._id}</td>
                      <td className="p-3 font-mono text-primary">{order.trackingNumber}</td>
                      <td className="p-3">{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td className="p-3 font-bold text-text-primary">{formatPrice(order.total, order.country || 'US')}</td>
                      <td className="p-3 uppercase">{order.paymentMethod}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full font-bold text-[9px] uppercase tracking-wider border ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
