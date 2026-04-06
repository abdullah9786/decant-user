"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { orderApi, influencerApi } from '@/lib/api';
import { cartItemsToGaItems, gaEvent } from '@/lib/gtag';
import { CheckCircle2, CreditCard, MapPin, ShoppingBag, Loader2, Tag } from 'lucide-react';

export default function CheckoutPage() {
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation, 4: Confirming
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    first_name: '',
    last_name: '',
    email: '',
    building_name: '',
    floor_no: '',
    street: '',
    city: '',
    zip: '',
    phone: '',
  });

  const { items, totalPrice, clearCart } = useCartStore();
  const subtotal = totalPrice();
  const shippingFee = subtotal > 999 ? 0 : 90;

  const [couponCode, setCouponCode] = useState('');
  const [couponApplied, setCouponApplied] = useState<{ discount_percent: number; influencer_id: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const discountAmount = couponApplied ? Math.round(subtotal * couponApplied.discount_percent / 100) : 0;
  const grandTotal = subtotal + shippingFee - discountAmount;

  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    try {
      const res = await influencerApi.validateCoupon(couponCode.trim());
      const data = res.data;
      if (data.valid) {
        setCouponApplied({ discount_percent: data.discount_percent, influencer_id: data.influencer_id });
      } else {
        setCouponError(data.message || 'Invalid coupon');
        setCouponApplied(null);
      }
    } catch {
      setCouponError('Failed to validate coupon');
      setCouponApplied(null);
    } finally {
      setCouponLoading(false);
    }
  };

  const handleNext = async () => {
     if (step === 1) {
       setStep(2);
     } else if (step === 2) {
       await handleSubmitOrder();
     }
  };

  const handleSubmitOrder = async () => {
    setLoading(true);
    try {
      const customerEmail = isAuthenticated ? (user?.email || '') : shippingAddress.email;

      let influencerId: string | null = null;
      let referralCode: string | null = null;
      try {
        const refRaw = localStorage.getItem("decume-ref");
        if (refRaw) {
          const ref = JSON.parse(refRaw);
          const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;
          if (ref.influencer_id && Date.now() - ref.timestamp < SEVEN_DAYS) {
            const userId = isAuthenticated ? (user?.id || (user as any)?._id) : null;
            const isSelfReferral = userId && ref.influencer_id === userId;
            if (!isSelfReferral) {
              influencerId = ref.influencer_id;
              referralCode = ref.username || null;
            }
          }
        }
      } catch {
        // ignore parse errors
      }

      const orderData: any = {
        user_id: isAuthenticated ? (user?.id || (user as any)._id) : "guest",
        customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        customer_email: customerEmail,
        customer_phone: shippingAddress.phone,
        items: items.map((item: any) => ({
          product_id: item.id || (item as any)._id,
          name: item.name,
          size_ml: item.size_ml,
          price: item.price,
          quantity: item.quantity,
          is_pack: !!item.is_pack,
        })),
        total_amount: grandTotal,
        shipping_address: `${shippingAddress.first_name} ${shippingAddress.last_name}, ${shippingAddress.floor_no ? shippingAddress.floor_no + ', ' : ''}${shippingAddress.building_name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zip}`,
        status: 'pending',
        ...(influencerId && { influencer_id: influencerId }),
        ...(referralCode && { referral_code: referralCode }),
        ...(couponApplied && !influencerId && { influencer_id: couponApplied.influencer_id }),
        ...(couponApplied && { coupon_code: couponCode.trim().toUpperCase() }),
        ...(discountAmount > 0 && { discount_amount: discountAmount }),
      };

      // 1. Validate stock + initiate Razorpay Payment (no DB order yet)
      const stockCheckItems = orderData.items.map((it: any) => ({
        product_id: it.product_id,
        size_ml: it.size_ml,
        quantity: it.quantity,
        is_pack: !!it.is_pack,
      }));
      const rzpResponse = await orderApi.initiatePaymentOnly(grandTotal, stockCheckItems, orderData);
      const rzpData = rzpResponse.data;

      const gaItems = cartItemsToGaItems(items);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "DECUME",
        description: `Premium Fragrance Checkout`,
        order_id: rzpData.id,
        handler: async function (paymentResponse: any) {
             setStep(4);
             setLoading(true);
             try {
                const verifyResponse = await orderApi.verifyAndCreate({
                    razorpay_order_id: paymentResponse.razorpay_order_id,
                    razorpay_payment_id: paymentResponse.razorpay_payment_id,
                    razorpay_signature: paymentResponse.razorpay_signature
                }, orderData);
                
                const finalOrderId = verifyResponse.data?.id || verifyResponse.data?._id;
                setOrderId(finalOrderId);
                setStep(3);
                gaEvent('purchase', {
                  transaction_id: String(finalOrderId ?? ''),
                  value: grandTotal,
                  currency: 'INR',
                  items: gaItems,
                });
                setTimeout(() => clearCart(), 100);
                try { localStorage.removeItem("decume-ref"); } catch {}
             } catch (err: any) {
                 console.error("Payment and order finalization failed", err);
                 const detail = err?.response?.data?.detail;
                 alert(
                   typeof detail === "string"
                     ? detail
                     : "Payment verification failed. Please contact support if your amount was deducted."
                 );
                 setStep(2);
             } finally {
                 setLoading(false);
             }
        },
        prefill: {
          name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
          email: customerEmail,
          contact: shippingAddress.phone
        },
        theme: {
          color: "#022c22"
        },
        modal: {
            ondismiss: function() {
                setLoading(false);
            }
        }
      };

      gaEvent('begin_checkout', {
        currency: 'INR',
        value: grandTotal,
        items: gaItems,
      });

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error("Error creating order", err);
      const detail = err?.response?.data?.detail;
      alert(
        typeof detail === "string"
          ? detail
          : "Failed to initiate payment. Please try again."
      );
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Address', icon: MapPin },
    { title: 'Payment', icon: CreditCard },
    { title: 'Success', icon: CheckCircle2 }
  ];

  if (items.length === 0 && step !== 3 && step !== 4) {
      return (
          <div className="py-40 text-center">
              <ShoppingBag size={48} className="mx-auto text-gray-200 mb-6" />
              <h2 className="text-2xl font-serif text-emerald-950 mb-4">Your cart is empty</h2>
              <Link href="/products" className="text-xs font-bold uppercase tracking-widest text-emerald-600 border-b border-emerald-600">
                  Shop our collection
              </Link>
          </div>
      );
  }

  return (
    <div className="py-20 bg-white">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-around mb-20 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 -translate-y-1/2 z-0"></div>
          {steps.map((s, i) => (
             <div key={s.title} className="relative z-10 flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${
                  step > i ? 'bg-emerald-600 text-white border-emerald-600' : (step === i + 1 ? 'bg-emerald-950 text-white shadow-lg border-emerald-950' : 'bg-white border border-gray-200 text-gray-300')
                } border-2`}>
                   <s.icon size={20} />
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-widest ${step === i + 1 ? 'text-emerald-950' : 'text-gray-400'}`}>{s.title}</span>
             </div>
          ))}
        </div>

      <div className="bg-white border border-gray-100 shadow-2xl p-10 md:p-16">
          {step === 1 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h2 className="text-3xl font-serif text-emerald-950 mb-10">Shipping Details</h2>
              {!isAuthenticated && (
                <input 
                  placeholder="Email Address *" 
                  type="email"
                  required
                  value={shippingAddress.email}
                  onChange={(e) => setShippingAddress({...shippingAddress, email: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
                />
              )}
              <div className="grid grid-cols-2 gap-6">
                <input 
                    placeholder="First Name *" 
                    required
                    value={shippingAddress.first_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, first_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
                />
                <input 
                    placeholder="Last Name" 
                    value={shippingAddress.last_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, last_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600" 
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <input 
                    placeholder="Building Name / House No *" 
                    required
                    value={shippingAddress.building_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, building_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
                />
                <input 
                    placeholder="Floor / Apartment No *" 
                    required
                    value={shippingAddress.floor_no}
                    onChange={(e) => setShippingAddress({...shippingAddress, floor_no: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
                />
              </div>
              <input 
                placeholder="Street Address / Landmark *" 
                required
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
              />
              <div className="grid grid-cols-2 gap-6">
                <input 
                    placeholder="City *" 
                    required
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
                />
                <input 
                    placeholder="PIN Code *" 
                    required
                    value={shippingAddress.zip}
                    onChange={(e) => setShippingAddress({...shippingAddress, zip: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
                />
              </div>
              <input 
                placeholder="Mobile Number *" 
                required
                value={shippingAddress.phone}
                onChange={(e) => setShippingAddress({...shippingAddress, phone: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600 border-l-4 border-l-red-400" 
              />
              
              {/* Coupon Code */}
              <div className="pt-4 border-t border-gray-100">
                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2 block">
                  <Tag size={12} className="inline mr-1 -mt-0.5" />
                  Coupon Code
                </label>
                <div className="flex gap-3">
                  <input
                    placeholder="Enter code"
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value); setCouponError(''); }}
                    disabled={!!couponApplied}
                    className="flex-1 bg-gray-50 border border-gray-100 p-3 text-sm focus:outline-none focus:border-emerald-600 uppercase tracking-widest"
                  />
                  {couponApplied ? (
                    <button
                      onClick={() => { setCouponApplied(null); setCouponCode(''); }}
                      className="px-5 py-3 text-xs font-bold uppercase tracking-widest border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={handleApplyCoupon}
                      disabled={couponLoading || !couponCode.trim()}
                      className="px-5 py-3 text-xs font-bold uppercase tracking-widest bg-emerald-950 text-white hover:bg-black transition-all disabled:opacity-50"
                    >
                      {couponLoading ? <Loader2 className="animate-spin" size={14} /> : 'Apply'}
                    </button>
                  )}
                </div>
                {couponError && (
                  <p className="text-xs text-red-500 mt-1">{couponError}</p>
                )}
                {couponApplied && (
                  <p className="text-xs text-emerald-600 font-bold mt-1">
                    {couponApplied.discount_percent}% discount applied! You save ₹{discountAmount}
                  </p>
                )}
              </div>

              <button 
                onClick={handleNext}
                disabled={
                  !shippingAddress.first_name || 
                  !shippingAddress.building_name || 
                  !shippingAddress.floor_no || 
                  !shippingAddress.street || 
                  !shippingAddress.city || 
                  !shippingAddress.zip || 
                  !shippingAddress.phone ||
                  (!isAuthenticated && !shippingAddress.email)
                }
                className="w-full bg-emerald-950 text-white py-5 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl mt-10 disabled:opacity-50"
              >
                Proceed to Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 text-center">
              <h2 className="text-3xl font-serif text-emerald-950 mb-4">Secure Payment</h2>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-10">Amount to pay: <span className="text-emerald-600 font-bold">₹{grandTotal}</span></p>
              
              <div className="space-y-4">
                <div className="p-6 border border-emerald-600 bg-emerald-50/50 flex items-center justify-between cursor-pointer">
                  <div className="flex items-center space-x-4">
                    <div className="w-4 h-4 rounded-full border-4 border-emerald-600"></div>
                    <span className="text-sm font-bold text-emerald-950 uppercase tracking-widest">Card / UPI / Netbanking</span>
                  </div>
                  <CreditCard className="text-emerald-600" />
                </div>
                <div className="p-6 border border-gray-100 flex items-center space-x-4 cursor-not-allowed text-gray-300">
                  <div className="w-4 h-4 rounded-full border border-gray-200"></div>
                  <span className="text-sm font-bold uppercase tracking-widest">Cash on Delivery (Unavailable)</span>
                </div>
              </div>

              <button 
                onClick={handleNext}
                disabled={loading}
                className="w-full bg-emerald-950 text-white py-5 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all shadow-xl mt-10 flex items-center justify-center space-x-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : 'Place Order'}
              </button>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-20 animate-in fade-in duration-500">
              <Loader2 size={56} className="animate-spin text-emerald-700 mx-auto mb-8" />
              <h2 className="text-3xl font-serif text-emerald-950 mb-3">Confirming your order…</h2>
              <p className="text-sm text-gray-400 uppercase tracking-widest">
                Payment received. Please do not close this page.
              </p>
            </div>
          )}

          {step === 3 && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-700">
               <CheckCircle2 size={100} className="text-green-500 mx-auto mb-8" />
               <h2 className="text-4xl font-serif text-emerald-950 mb-4">Order Confirmed!</h2>
               <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mb-12">Thank you for choosing DECUME. Your order #{orderId} is being prepared.</p>
               <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
                    <Link href={`/track-order?orderId=${encodeURIComponent(orderId || '')}`} className="w-full sm:w-auto bg-emerald-950 text-white px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-black transition-all">
                        Track Order
                    </Link>
                    <Link href="/" className="w-full sm:w-auto border border-gray-200 text-gray-600 px-10 py-4 text-xs font-bold uppercase tracking-widest hover:bg-emerald-950 hover:text-white transition-all">
                        Return Home
                    </Link>
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
