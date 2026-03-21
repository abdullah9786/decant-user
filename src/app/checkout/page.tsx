"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/useAuthStore';
import { orderApi } from '@/lib/api';
import { CheckCircle2, CreditCard, MapPin, ShoppingBag, Loader2 } from 'lucide-react';

export default function CheckoutPage() {
  const [step, setStep] = useState(1); // 1: Address, 2: Payment, 3: Confirmation
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
  const grandTotal = subtotal + shippingFee;
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

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
      const orderData = {
        user_id: isAuthenticated ? (user?.id || (user as any)._id) : "guest",
        customer_name: `${shippingAddress.first_name} ${shippingAddress.last_name}`,
        customer_email: customerEmail,
        items: items.map((item: any) => ({
          product_id: item.id || (item as any)._id,
          name: item.name,
          size_ml: item.size_ml,
          price: item.price,
          quantity: item.quantity
        })),
        total_amount: grandTotal,
        shipping_address: `${shippingAddress.first_name} ${shippingAddress.last_name}, ${shippingAddress.floor_no ? shippingAddress.floor_no + ', ' : ''}${shippingAddress.building_name}, ${shippingAddress.street}, ${shippingAddress.city}, ${shippingAddress.zip}`,
        status: 'pending'
      };

      // 1. Create order in our DB
      const response = await orderApi.create(orderData);
      const realId = response.data?.id || response.data?._id;
      
      // 2. Initiate Razorpay Payment
      const rzpResponse = await orderApi.initiatePayment(realId);
      const rzpData = rzpResponse.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '', // We need to ensure this is set
        amount: rzpData.amount,
        currency: rzpData.currency,
        name: "SCENTS",
        description: `Order #${realId}`,
        order_id: rzpData.id,
        handler: async function (response: any) {
             try {
                setLoading(true);
                // 3. Verify Payment
                await orderApi.verifyPayment({
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature
                });
                
                setOrderId(realId);
                setStep(3);
                setTimeout(() => clearCart(), 100);
             } catch (err) {
                 console.error("Payment verification failed", err);
                 alert("Payment verification failed. Please contact support if your amount was deducted.");
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

      const rzp = new (window as any).Razorpay(options);
      rzp.open();

    } catch (err) {
      console.error("Error creating order", err);
      alert("Failed to initiate payment. Please try again.");
      setLoading(false);
    }
  };

  const steps = [
    { title: 'Address', icon: MapPin },
    { title: 'Payment', icon: CreditCard },
    { title: 'Success', icon: CheckCircle2 }
  ];

  if (items.length === 0 && step !== 3) {
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
                    placeholder="First Name" 
                    value={shippingAddress.first_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, first_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600" 
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
                    placeholder="Building Name / House No" 
                    value={shippingAddress.building_name}
                    onChange={(e) => setShippingAddress({...shippingAddress, building_name: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600" 
                />
                <input 
                    placeholder="Floor / Apartment No (Optional)" 
                    value={shippingAddress.floor_no}
                    onChange={(e) => setShippingAddress({...shippingAddress, floor_no: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600" 
                />
              </div>
              <input 
                placeholder="Street Address / Landmark" 
                value={shippingAddress.street}
                onChange={(e) => setShippingAddress({...shippingAddress, street: e.target.value})}
                className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600" 
              />
              <div className="grid grid-cols-2 gap-6">
                <input 
                    placeholder="City" 
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({...shippingAddress, city: e.target.value})}
                    className="w-full bg-gray-50 border border-gray-100 p-4 text-sm focus:outline-none focus:border-emerald-600" 
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
              
              <button 
                onClick={handleNext}
                disabled={
                  !shippingAddress.first_name || 
                  !shippingAddress.building_name || 
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

          {step === 3 && (
            <div className="text-center py-10 animate-in zoom-in-95 duration-700">
               <CheckCircle2 size={100} className="text-green-500 mx-auto mb-8" />
               <h2 className="text-4xl font-serif text-emerald-950 mb-4">Order Confirmed!</h2>
               <p className="text-gray-500 text-sm uppercase tracking-[0.2em] mb-12">Thank you for choosing SCENTS. Your order #{orderId} is being prepared.</p>
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
