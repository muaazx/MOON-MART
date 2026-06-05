'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';
import { FiMapPin, FiCreditCard, FiDollarSign, FiShoppingBag, FiCheckCircle, FiTruck, FiArrowLeft, FiAlertTriangle } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useCountryStore } from '@/store/countryStore';
import { formatPrice, countryConfig } from '@/lib/currency';

export default function CheckoutPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { items, getSubtotal, clearCart } = useCartStore();

  const { country } = useCountryStore();
  const activeCountry = country === 'ALL'
    ? (items[0]?.product.country || 'US')
    : country;
  const config = countryConfig[activeCountry];

  const subtotal = getSubtotal();
  const shippingFee = subtotal > config.shippingThreshold ? 0 : config.shippingFee;
  const total = subtotal + shippingFee;

  // Form states
  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: activeCountry === 'UK' ? 'London' : 'New York',
    state: activeCountry === 'UK' ? 'London' : 'NY',
    zipCode: activeCountry === 'UK' ? 'SW1A 1AA' : '10001',
    country: activeCountry === 'UK' ? 'United Kingdom' : 'United States',
  });

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'paypal' | 'bank_uk_gbp' | 'bank_us_usd' | 'zelle' | 'wise_uk'>('paypal');
  const [paymentProofImage, setPaymentProofImage] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  
  // Card states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvc: '',
  });

  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error('Image size must be less than 2MB');
        return;
      }
      setFileName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPaymentProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  const [orderPlaced, setOrderPlaced] = useState<any | null>(null);

  // Redirect if not logged in
  useEffect(() => {
    if (status === 'unauthenticated') {
      toast.error('Please login to checkout');
      router.push('/login?callbackUrl=/checkout');
    }
  }, [status, router]);

  // Pre-fill user details if logged in
  useEffect(() => {
    const user = session?.user;
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        fullName: user.name || '',
        country: activeCountry === 'UK' ? 'United Kingdom' : 'United States',
        city: activeCountry === 'UK' ? 'London' : 'New York',
        state: activeCountry === 'UK' ? 'London' : 'NY',
        zipCode: activeCountry === 'UK' ? 'SW1A 1AA' : '10001',
      }));

      // If they are the test customer, pre-fill John Doe's address
      if (user.email === 'customer@moonmart.pk') {
        setShippingAddress({
          fullName: 'John Doe',
          phone: '03217654321',
          address: activeCountry === 'UK' ? '10 Downing Street' : '123 Broadway St',
          city: activeCountry === 'UK' ? 'London' : 'New York',
          state: activeCountry === 'UK' ? 'London' : 'NY',
          zipCode: activeCountry === 'UK' ? 'SW1A 1AA' : '10001',
          country: activeCountry === 'UK' ? 'United Kingdom' : 'United States',
        });
      } else if (user.email === 'admin@moonmart.com') {
        setShippingAddress({
          fullName: 'Admin Moon Mart',
          phone: '03001234567',
          address: activeCountry === 'UK' ? '221B Baker Street' : '5th Ave & E 34th St',
          city: activeCountry === 'UK' ? 'London' : 'New York',
          state: activeCountry === 'UK' ? 'London' : 'NY',
          zipCode: activeCountry === 'UK' ? 'NW1 6XE' : '10118',
          country: activeCountry === 'UK' ? 'United Kingdom' : 'United States',
        });
      }
    } else {
      setShippingAddress((prev) => ({
        ...prev,
        country: activeCountry === 'UK' ? 'United Kingdom' : 'United States',
        city: activeCountry === 'UK' ? 'London' : 'New York',
        state: activeCountry === 'UK' ? 'London' : 'NY',
        zipCode: activeCountry === 'UK' ? 'SW1A 1AA' : '10001',
      }));
    }
  }, [session, activeCountry]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-secondary text-sm">Securing checkout session...</p>
        </div>
      </div>
    );
  }

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-bg-primary py-16">
        <div className="text-center">
          <div className="w-20 h-20 bg-primary-light rounded-full flex items-center justify-center mx-auto mb-5">
            <FiShoppingBag size={36} className="text-primary" />
          </div>
          <h1 className="text-xl font-bold text-text-primary mb-2">Checkout Empty</h1>
          <p className="text-text-secondary mb-6 text-sm">Add items to your cart before proceeding to checkout.</p>
          <Link href="/" className="bg-primary text-white px-6 py-2.5 rounded-lg text-xs font-bold shadow hover:bg-primary-hover">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.zipCode) {
      toast.error('Please fill in all shipping fields');
      return;
    }

    if (paymentMethod !== 'stripe' && !paymentProofImage) {
      toast.error('Please upload your payment proof screenshot/snip to confirm order');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        user: session?.user,
        items,
        shippingAddress,
        paymentMethod,
        notes: '',
        paymentProofImage: paymentMethod !== 'stripe' ? paymentProofImage : undefined,
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        setOrderPlaced(data.order);
        clearCart();
        toast.success('Order placed successfully! 🎉');
      } else {
        toast.error(data.error || 'Failed to place order');
      }
    } catch (err) {
      toast.error('Connection error placing order');
    } finally {
      setLoading(false);
    }
  };

  // ─── Order Confirmation View ───
  if (orderPlaced) {
    return (
      <div className="bg-bg-primary min-h-screen py-12">
        <div className="container-main max-w-lg">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center space-y-6 border border-border-light animate-scale-in">
            <div className="w-16 h-16 bg-success/10 text-success rounded-full flex items-center justify-center mx-auto">
              <FiCheckCircle size={36} />
            </div>
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-text-primary">Thank you for your order!</h1>
              <p className="text-sm text-text-secondary">
                Your order has been placed and is currently being processed.
              </p>
            </div>

            {/* Tracking Card */}
            <div className="bg-bg-primary rounded-xl p-4 text-left border border-border-light text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Order ID:</span>
                <span className="font-bold text-text-primary">{orderPlaced._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Tracking Number:</span>
                <span className="font-bold text-primary">{orderPlaced.trackingNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Total Amount:</span>
                <span className="font-bold text-text-primary">
                  {formatPrice(orderPlaced.total, orderPlaced.country || activeCountry)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Payment Method:</span>
                <span className="font-semibold uppercase text-text-primary">{orderPlaced.paymentMethod}</span>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <Link
                href="/account/orders"
                className="block w-full bg-secondary hover:bg-secondary-light text-white font-bold py-3 rounded-xl shadow transition-colors text-sm"
              >
                Track My Order
              </Link>
              <Link
                href="/"
                className="block w-full bg-bg-primary hover:bg-border font-semibold text-text-primary py-3 rounded-xl transition-colors text-sm"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-bg-primary min-h-screen py-6">
      <div className="container-main">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-text-muted mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-primary transition-colors">Cart</Link>
          <span>/</span>
          <span className="text-text-primary font-medium">Checkout</span>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Address and Payments */}
          <div className="lg:col-span-2 space-y-4">
            {/* Shipping Details */}
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
                <FiMapPin className="text-primary" /> Shipping Address
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-text-secondary mb-1.5">Full Name</label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={shippingAddress.fullName}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                    placeholder="Enter full name"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-text-secondary mb-1.5">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 03217654321"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="address" className="block text-xs font-semibold text-text-secondary mb-1.5">Street Address</label>
                  <input
                    id="address"
                    type="text"
                    required
                    value={shippingAddress.address}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                    placeholder="House number, Street, Sector..."
                  />
                </div>
                <div>
                  <label htmlFor="city" className="block text-xs font-semibold text-text-secondary mb-1.5">City</label>
                  <input
                    id="city"
                    type="text"
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="state" className="block text-xs font-semibold text-text-secondary mb-1.5">Province / State</label>
                  <input
                    id="state"
                    type="text"
                    required
                    value={shippingAddress.state}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label htmlFor="zipCode" className="block text-xs font-semibold text-text-secondary mb-1.5">Zip / Postal Code</label>
                  <input
                    id="zipCode"
                    type="text"
                    required
                    value={shippingAddress.zipCode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, zipCode: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg outline-none focus:border-primary transition-colors"
                    placeholder="e.g. 54000"
                  />
                </div>
                <div>
                  <label htmlFor="country" className="block text-xs font-semibold text-text-secondary mb-1.5">Country</label>
                  <input
                    id="country"
                    type="text"
                    required
                    disabled
                    value={shippingAddress.country}
                    className="w-full px-3 py-2 text-sm border border-border bg-bg-primary rounded-lg text-text-secondary"
                  />
                </div>
              </div>
            </div>

            {/* Payment Selector */}
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-text-primary flex items-center gap-2 border-b border-border pb-3">
                <FiCreditCard className="text-primary" /> Payment Method
              </h2>

              <div className="space-y-4">
                {/* Simulated Payment Methods */}
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Automated Checkouts</p>
                  <button
                    type="button"
                    onClick={() => {
                      setPaymentMethod('stripe');
                      setPaymentProofImage('');
                      setFileName('');
                    }}
                    className={`w-full p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                      paymentMethod === 'stripe'
                        ? 'border-primary bg-primary-light/50 ring-2 ring-primary/20'
                        : 'border-border hover:bg-bg-primary'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                      paymentMethod === 'stripe' ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                    }`}>
                      <FiCreditCard size={20} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-primary">Credit / Debit Card (Stripe)</p>
                      <p className="text-xs text-text-secondary">Simulated automated checkout</p>
                    </div>
                  </button>
                </div>

                {/* Manual Payment Methods */}
                <div>
                  <p className="text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-2">Manual Bank & App Transfers</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('paypal');
                        setPaymentProofImage('');
                        setFileName('');
                      }}
                      className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        paymentMethod === 'paypal'
                          ? 'border-primary bg-primary-light/50 ring-2 ring-primary/20'
                          : 'border-border hover:bg-bg-primary'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'paypal' ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                      }`}>
                        <FiDollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">PayPal</p>
                        <p className="text-xs text-text-secondary">Pay to kamrankallu786@gmail.com</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('bank_uk_gbp');
                        setPaymentProofImage('');
                        setFileName('');
                      }}
                      className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        paymentMethod === 'bank_uk_gbp'
                          ? 'border-primary bg-primary-light/50 ring-2 ring-primary/20'
                          : 'border-border hover:bg-bg-primary'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'bank_uk_gbp' ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                      }`}>
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Citibank UK (GBP)</p>
                        <p className="text-xs text-text-secondary">Tehmina Naz - Account: 56427227</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('bank_us_usd');
                        setPaymentProofImage('');
                        setFileName('');
                      }}
                      className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        paymentMethod === 'bank_us_usd'
                          ? 'border-primary bg-primary-light/50 ring-2 ring-primary/20'
                          : 'border-border hover:bg-bg-primary'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'bank_us_usd' ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                      }`}>
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Citibank US (USD)</p>
                        <p className="text-xs text-text-secondary">Tehmina Naz - Account: 70580330002372601</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('zelle');
                        setPaymentProofImage('');
                        setFileName('');
                      }}
                      className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        paymentMethod === 'zelle'
                          ? 'border-primary bg-primary-light/50 ring-2 ring-primary/20'
                          : 'border-border hover:bg-bg-primary'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'zelle' ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                      }`}>
                        <FiDollarSign size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Zelle (USA)</p>
                        <p className="text-xs text-text-secondary">ELD2025.Pay@gmail.com</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setPaymentMethod('wise_uk');
                        setPaymentProofImage('');
                        setFileName('');
                      }}
                      className={`p-4 rounded-xl border flex items-center gap-3 text-left transition-all ${
                        paymentMethod === 'wise_uk'
                          ? 'border-primary bg-primary-light/50 ring-2 ring-primary/20'
                          : 'border-border hover:bg-bg-primary'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        paymentMethod === 'wise_uk' ? 'bg-primary text-white' : 'bg-bg-primary text-text-secondary'
                      }`}>
                        <FiCreditCard size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">Wise UK (GBP)</p>
                        <p className="text-xs text-text-secondary">Muhammad Rizwan - Account: 50557875</p>
                      </div>
                    </button>
                  </div>
                </div>
              </div>

              {/* Stripe simulated credit card form */}
              {paymentMethod === 'stripe' && (
                <div className="border border-border rounded-xl p-4 bg-bg-primary space-y-3 animate-fade-in">
                  <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-1">Card Credentials</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-3">
                      <label htmlFor="cardNumber" className="block text-[10px] font-bold text-text-secondary mb-1">Card Number</label>
                      <input
                        id="cardNumber"
                        type="text"
                        placeholder="4242 4242 4242 4242"
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({ ...cardDetails, cardNumber: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-border bg-white rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-2">
                      <label htmlFor="expiry" className="block text-[10px] font-bold text-text-secondary mb-1">Expiry Date</label>
                      <input
                        id="expiry"
                        type="text"
                        placeholder="MM / YY"
                        value={cardDetails.expiry}
                        onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-border bg-white rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                    <div className="col-span-1">
                      <label htmlFor="cvc" className="block text-[10px] font-bold text-text-secondary mb-1">CVC</label>
                      <input
                        id="cvc"
                        type="text"
                        placeholder="123"
                        value={cardDetails.cvc}
                        onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-border bg-white rounded-lg outline-none focus:border-primary"
                      />
                    </div>
                  </div>
                  <p className="text-[10px] text-text-secondary flex items-start gap-1">
                    <FiAlertTriangle className="shrink-0 text-amber-500 mt-0.5" />
                    Secure sandbox simulator. Enter any dummy details to proceed.
                  </p>
                </div>
              )}

              {/* Manual payment details display & proof upload */}
              {paymentMethod !== 'stripe' && (
                <div className="space-y-4 border border-border rounded-xl p-4 bg-bg-primary/50 animate-fade-in">
                  <div className="border-b border-border pb-3">
                    <h3 className="text-xs font-bold text-text-primary uppercase tracking-wider mb-2">Transfer Instructions</h3>
                    {paymentMethod === 'paypal' && (
                      <div className="space-y-1.5 text-xs text-text-secondary">
                        <p><span className="font-semibold text-text-primary">PayPal Email:</span> kamrankallu786@gmail.com</p>
                        <p className="text-[10px] italic">Please send the exact amount and save your transaction receipt.</p>
                      </div>
                    )}
                    {paymentMethod === 'bank_uk_gbp' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                        <p><span className="font-semibold text-text-primary">Beneficiary Name:</span> Tehmina Naz</p>
                        <p><span className="font-semibold text-text-primary">Bank Name:</span> Citibank</p>
                        <p className="sm:col-span-2"><span className="font-semibold text-text-primary">Bank Address:</span> Canada Square, Canary Wharf London, E14 5LB United Kingdom</p>
                        <p><span className="font-semibold text-text-primary">Account Number:</span> 56427227</p>
                        <p><span className="font-semibold text-text-primary">Sort Code:</span> 185008</p>
                        <p className="sm:col-span-2"><span className="font-semibold text-text-primary">IBAN:</span> GB82CITI18500856427227</p>
                        <p><span className="font-semibold text-text-primary">BIC:</span> CITIGB2L</p>
                      </div>
                    )}
                    {paymentMethod === 'bank_us_usd' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                        <p><span className="font-semibold text-text-primary">Beneficiary Name:</span> Tehmina Naz</p>
                        <p><span className="font-semibold text-text-primary">Bank Name:</span> Citibank</p>
                        <p className="sm:col-span-2"><span className="font-semibold text-text-primary">Bank Address:</span> 111 Wall Street New York, NY 10043 USA</p>
                        <p><span className="font-semibold text-text-primary">Account Number:</span> 70580330002372601</p>
                        <p><span className="font-semibold text-text-primary">Routing (ABA):</span> 031100209</p>
                        <p><span className="font-semibold text-text-primary">SWIFT Code:</span> CITIUS33</p>
                        <p><span className="font-semibold text-text-primary">Account Type:</span> CHECKING</p>
                      </div>
                    )}
                    {paymentMethod === 'zelle' && (
                      <div className="space-y-1.5 text-xs text-text-secondary">
                        <p><span className="font-semibold text-text-primary">Zelle Email:</span> ELD2025.Pay@gmail.com</p>
                        <p><span className="font-semibold text-text-primary">Recipient Name:</span> Elite Link Distributors LLC</p>
                        <p className="text-[10px] italic">Supported for USA Zelle transfers.</p>
                      </div>
                    )}
                    {paymentMethod === 'wise_uk' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-text-secondary">
                        <p><span className="font-semibold text-text-primary">Beneficiary Name:</span> Muhammad Rizwan</p>
                        <p><span className="font-semibold text-text-primary">Bank Name:</span> Wise Bank UK</p>
                        <p><span className="font-semibold text-text-primary">Account Number:</span> 50557875</p>
                        <p><span className="font-semibold text-text-primary">Sort Code:</span> 230801</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-text-primary mb-2 flex items-center gap-1.5">
                      Upload Payment Proof (Snip / Screenshot) <span className="text-error">*</span>
                    </h4>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-xl p-4 bg-white hover:border-primary transition-all">
                      {paymentProofImage ? (
                        <div className="w-full space-y-3 flex flex-col items-center">
                          <div className="relative w-full max-w-[200px] h-32 border border-border rounded-lg overflow-hidden shadow bg-bg-primary">
                            <img
                              src={paymentProofImage}
                              alt="Payment Proof Snip"
                              className="object-contain w-full h-full"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setPaymentProofImage('');
                                setFileName('');
                              }}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full shadow transition-all active:scale-95 animate-scale-in"
                              title="Remove image"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                          <span className="text-xs text-text-muted max-w-[250px] truncate">{fileName}</span>
                        </div>
                      ) : (
                        <label className="cursor-pointer text-center py-2 px-4 w-full flex flex-col items-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary mb-2 animate-bounce">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15m0-3-3-3m0 0-3 3m3-3V15" />
                          </svg>
                          <span className="text-xs font-bold text-text-primary">Click to Upload Image</span>
                          <span className="text-[10px] text-text-muted mt-1">PNG, JPG or JPEG up to 2MB</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right: Checkout Order Summary Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl p-5 shadow-sm space-y-4 sticky top-32">
              <h2 className="text-lg font-bold text-text-primary border-b border-border pb-3">Order Summary</h2>

              {/* Items Summary list */}
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {items.map((item) => {
                  const price = item.product.discountPrice || item.product.price;
                  return (
                    <div key={item.product._id} className="flex gap-3 text-xs text-text-secondary border-b border-border-light pb-2 last:border-0 last:pb-0">
                      <div className="w-10 h-10 relative bg-bg-primary rounded overflow-hidden shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-text-primary truncate">{item.product.name}</p>
                        <p className="text-[10px]">Qty: {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-text-primary text-right whitespace-nowrap">
                        {formatPrice(price * item.quantity, item.product.country)}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Delivery Guidelines */}
              <div className="bg-primary-light/40 border border-primary-light p-3 rounded-xl flex gap-2 text-xs text-text-secondary">
                <FiTruck className="text-primary shrink-0 mt-0.5" size={16} />
                <div>
                  <p className="font-bold text-primary">Standard Home Delivery</p>
                  <p className="text-[10px] mt-0.5">Will arrive in 2-3 business days.</p>
                </div>
              </div>

              {/* Pricing Totals */}
              <div className="border-t border-border pt-4 space-y-2.5 text-sm">
                <div className="flex justify-between text-text-secondary">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-medium">{formatPrice(subtotal, activeCountry)}</span>
                </div>
                <div className="flex justify-between text-text-secondary">
                  <span>Delivery Charges</span>
                  <span className={`font-medium ${shippingFee === 0 ? 'text-success' : ''}`}>
                    {shippingFee === 0 ? 'FREE' : formatPrice(shippingFee, activeCountry)}
                  </span>
                </div>
                <div className="flex justify-between text-base font-bold border-t border-border pt-3">
                  <span>Total Payable</span>
                  <span className="text-primary">{formatPrice(total, activeCountry)}</span>
                </div>
              </div>

              {/* Submit Buttons */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-xl transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 text-sm disabled:bg-text-muted disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Order...' : 'Place Order'}
              </button>

              <Link
                href="/cart"
                className="w-full flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-primary transition-colors text-center font-semibold"
              >
                <FiArrowLeft /> Back to Shopping Cart
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
