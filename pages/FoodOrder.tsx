import React, { useContext, useMemo, useRef } from 'react';
import { AppContext } from '../contexts/AppContext.tsx';
import type { FoodItem, CartItem } from '../types.ts';
import { CartIcon, PlusIcon, MinusIcon, TrashIcon } from '../components/icons/Icons.tsx';
import { useNavigate } from 'react-router-dom';

const FoodItemCard: React.FC<{ item: FoodItem; onAddToCart: (item: FoodItem) => void; }> = ({ item, onAddToCart }) => {
  const hasDiscount = item.discountPrice !== undefined && item.discountPrice < item.price;
  
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div className="relative">
        <img src={item.image} alt={item.name} className="w-full h-48 object-cover" />
        {hasDiscount ? (
             <div className="absolute top-0 right-0 bg-red-600 text-white text-sm font-bold px-3 py-1 m-2 rounded-full flex items-center gap-2">
                <span>{item.discountPrice?.toLocaleString('fa-IR')}</span>
                <span className="line-through opacity-75 text-xs">{item.price.toLocaleString('fa-IR')}</span>
                 <span>تومان</span>
            </div>
        ) : (
            <div className="absolute top-0 right-0 bg-teal-600 text-white text-sm font-bold px-3 py-1 m-2 rounded-full">
                {item.price.toLocaleString('fa-IR')} تومان
            </div>
        )}
      </div>
      <div className="p-5">
        <h3 className="text-lg font-bold text-slate-800">{item.name}</h3>
        <p className="text-sm text-slate-600 mt-1 h-10">{item.description}</p>
        <div className="mt-4">
          <button
            onClick={() => onAddToCart(item)}
            className="w-full bg-teal-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:bg-teal-700 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="w-5 h-5" />
            افزودن به سبد
          </button>
        </div>
      </div>
    </div>
  );
};

const Cart: React.FC<{ onProceedToCheckout: () => void }> = ({ onProceedToCheckout }) => {
  const { user, cart, updateQuantity, removeFromCart, clearCart } = useContext(AppContext);
    
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
        const price = item.discountPrice ?? item.price;
        return total + price * item.quantity;
    }, 0);
  }, [cart]);

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full">
      <h2 className="text-2xl font-bold mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CartIcon className="w-8 h-8 text-teal-600" />
            <span className="border-b-2 border-teal-500 pb-1">سبد خرید</span>
          </div>
          {cart.length > 0 && (
            <button onClick={() => clearCart()} className="text-xs text-red-500 hover:text-red-700 hover:underline">
                پاک کردن سبد
            </button>
          )}
      </h2>
      {cart.length === 0 ? (
        <div className="text-center py-10">
            <p className="text-slate-500">سبد خرید شما خالی است.</p>
        </div>
      ) : (
        <>
          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
            {cart.map((item) => (
              <div key={item.id} className="flex items-center justify-between animate-fade-in-up">
                 <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-md"/>
                <div className="flex-1 mx-3">
                  <p className="font-semibold text-sm">{item.name}</p>
                  <p className="text-xs text-slate-500">{(item.discountPrice ?? item.price).toLocaleString('fa-IR')} تومان</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1.5 rounded-full bg-slate-100 hover:bg-teal-100 transition-colors"><PlusIcon className="w-4 h-4 text-teal-700" /></button>
                  <span className="w-6 text-center font-bold">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1.5 rounded-full bg-slate-100 hover:bg-red-100 transition-colors"><MinusIcon className="w-4 h-4 text-red-600" /></button>
                </div>
                 <button onClick={() => removeFromCart(item.id)} className="mr-2 p-1.5 rounded-full text-slate-400 hover:bg-red-100 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
          <div className="mt-6 border-t-2 border-dashed pt-4">
            <div className="flex justify-between items-center font-bold text-lg">
              <span className="text-slate-700">جمع کل:</span>
              <span className="text-teal-600">{totalPrice.toLocaleString('fa-IR')} تومان</span>
            </div>
            <button 
                onClick={onProceedToCheckout}
                className="w-full bg-green-600 text-white py-3 rounded-lg mt-4 text-lg font-semibold hover:bg-green-700 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-0.5">
              {user ? 'تکمیل سفارش و پرداخت' : 'برای تکمیل سفارش وارد شوید'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

const FloatingCartButton: React.FC<{ cartItemCount: number, totalPrice: number, onClick: () => void, isLoggedIn: boolean }> = ({ cartItemCount, totalPrice, onClick, isLoggedIn }) => {
    if (cartItemCount === 0) return null;

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-40">
            <button
                onClick={onClick}
                className="w-full flex items-center justify-between bg-teal-600 text-white p-4 rounded-xl shadow-lg hover:bg-teal-700 transition-all duration-300 transform hover:-translate-y-1 animate-fade-in-up"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <CartIcon className="w-6 h-6" />
                        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                            {cartItemCount}
                        </span>
                    </div>
                    <span className="font-bold">{isLoggedIn ? 'تکمیل سفارش و پرداخت' : 'ورود برای پرداخت'}</span>
                </div>
                <span className="font-extrabold text-lg">{totalPrice.toLocaleString('fa-IR')} تومان</span>
            </button>
        </div>
    );
};


const FoodOrder: React.FC = () => {
  const { user, tomorrowsMenu, tomorrowsDayName, cart, addToCart } = useContext(AppContext);
  const navigate = useNavigate();

  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);
  const totalPrice = useMemo(() => {
    return cart.reduce((total, item) => {
        const price = item.discountPrice ?? item.price;
        return total + price * item.quantity;
    }, 0);
  }, [cart]);
  
  const handleProceedToCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      // Redirect to login, but remember to come back to checkout
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
    }
  };

  return (
    <div className="animate-fade-in-up">
      <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold text-slate-800">منوی فردا ({tomorrowsDayName})</h1>
          <p className="text-lg text-slate-500 mt-2">غذاهای سالم و خوشمزه، برای سفارش فردا!</p>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tomorrowsMenu.map((item) => (
              <FoodItemCard key={item.id} item={item} onAddToCart={addToCart} />
            ))}
          </div>
        </div>
        <div className="lg:col-span-1">
            <div className="sticky top-28">
             <Cart onProceedToCheckout={handleProceedToCheckout} />
            </div>
        </div>
      </div>
      <FloatingCartButton 
        cartItemCount={cartItemCount}
        totalPrice={totalPrice}
        onClick={handleProceedToCheckout}
        isLoggedIn={!!user}
      />
    </div>
  );
};

export default FoodOrder;