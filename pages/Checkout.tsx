import React, { useState, useContext, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { AppContext } from '../contexts/AppContext.tsx';
import { PaymentMethod, Drink, OrderDrink, DeliveryMethod } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon, MinusIcon, TruckIcon, StoreIcon, ClockIcon } from '../components/icons/Icons.tsx';

const DRINKS_MENU: Drink[] = [
    { id: 'd1', name: 'نوشابه', price: 20000 },
    { id: 'd2', name: 'آب معدنی', price: 10000 },
    { id: 'd3', name: 'نوشیدنی رژیمی', price: 25000 },
];

type CheckoutFormInputs = {
    paymentMethod: PaymentMethod;
    deliveryMethod: DeliveryMethod;
    addressId: string;
    deliveryTime: string;
    receipt?: FileList;
};

const Checkout: React.FC = () => {
    const { cart, user, createOrder, getAdminSettings } = useContext(AppContext);
    const navigate = useNavigate();
    const { register, handleSubmit, watch, formState: { errors } } = useForm<CheckoutFormInputs>({
        defaultValues: { deliveryMethod: 'ارسال با پیک' }
    });
    
    const [isDrinkModalOpen, setDrinkModalOpen] = useState(false);
    const [selectedDrinks, setSelectedDrinks] = useState<OrderDrink[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const paymentMethod = watch('paymentMethod');
    const deliveryMethod = watch('deliveryMethod');
    const adminSettings = getAdminSettings();
    const userAddresses = user?.addresses || [];

    const cartTotal = useMemo(() => cart.reduce((total, item) => total + (item.discountPrice ?? item.price) * item.quantity, 0), [cart]);
    const drinksTotal = useMemo(() => selectedDrinks.reduce((total, drink) => total + drink.price * drink.quantity, 0), [selectedDrinks]);
    const finalTotal = cartTotal + drinksTotal;
  
    const deliveryTimeSlots = useMemo(() => {
        const slots = [];
        for (let i = 9; i < 20; i++) {
            slots.push(`${i}:00 - ${i + 1}:00`);
        }
        return slots;
    }, []);

    if (cart.length === 0 && !loading) {
        navigate('/order');
        return null;
    }

    const handleUpdateDrinkQuantity = (drink: Drink, change: number) => {
        setSelectedDrinks(prevDrinks => {
            const existingDrink = prevDrinks.find(d => d.id === drink.id);
            if (existingDrink) {
                const newQuantity = existingDrink.quantity + change;
                if (newQuantity > 0) return prevDrinks.map(d => d.id === drink.id ? { ...d, quantity: newQuantity } : d);
                else return prevDrinks.filter(d => d.id !== drink.id);
            } else if (change > 0) {
                return [...prevDrinks, { ...drink, quantity: 1 }];
            }
            return prevDrinks;
        });
    };

    const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });

    const onSubmit = async (data: CheckoutFormInputs) => {
        setLoading(true);
        setError('');

        if (data.deliveryMethod === 'ارسال با پیک' && (!data.addressId || userAddresses.length === 0)) {
            setError("لطفا یک آدرس برای ارسال انتخاب کنید یا از پروفایل خود آدرس جدیدی اضافه کنید.");
            setLoading(false);
            return;
        }

        let receiptImage: string | undefined = undefined;
        if (data.paymentMethod === PaymentMethod.CardToCard && data.receipt && data.receipt.length > 0) {
            receiptImage = await fileToBase64(data.receipt[0]);
        }
        
        const deliveryAddress = data.deliveryMethod === 'تحویل حضوری'
            ? `تحویل حضوری در: ${adminSettings.contactAddress}`
            : userAddresses.find(addr => addr.id === data.addressId)?.fullAddress || 'آدرس نامشخص';

        try {
            await createOrder({
                items: cart,
                drinks: selectedDrinks,
                totalPrice: finalTotal,
                paymentMethod: data.paymentMethod,
                deliveryMethod: data.deliveryMethod,
                address: deliveryAddress,
                deliveryTime: data.deliveryTime,
                receiptImage,
            });
            navigate('/order-success');
        } catch (e: any) {
            setError(e.message || "خطا در ثبت سفارش");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-xl animate-fade-in-up">
                <h1 className="text-3xl font-extrabold text-center mb-8">تکمیل سفارش</h1>

                <div className="mb-8 p-4 border rounded-lg">
                    <h2 className="text-xl font-bold mb-4">خلاصه سفارش</h2>
                    <div className="space-y-2">
                        {cart.map(item => (
                            <div key={item.id} className="flex justify-between text-sm">
                                <span>{item.name} <span className="text-slate-500">x{item.quantity}</span></span>
                                <span>{((item.discountPrice ?? item.price) * item.quantity).toLocaleString('fa-IR')} تومان</span>
                            </div>
                        ))}
                        {selectedDrinks.map(drink => (
                            <div key={drink.id} className="flex justify-between text-sm text-blue-600">
                                <span>{drink.name} <span className="text-slate-500">x{drink.quantity}</span></span>
                                <span>{(drink.price * drink.quantity).toLocaleString('fa-IR')} تومان</span>
                            </div>
                        ))}
                    </div>
                     <button onClick={() => setDrinkModalOpen(true)} className="text-teal-600 hover:text-teal-800 text-sm font-semibold mt-3">
                        + افزودن نوشیدنی
                    </button>
                    <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
                        <span>جمع کل</span>
                        <span>{finalTotal.toLocaleString('fa-IR')} تومان</span>
                    </div>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    {/* Delivery Method */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">روش تحویل</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${deliveryMethod === 'ارسال با پیک' ? 'bg-teal-50 border-teal-500 ring-2 ring-teal-500' : 'hover:bg-slate-50'}`}>
                                <input type="radio" value="ارسال با پیک" {...register("deliveryMethod")} className="ml-3" />
                                <TruckIcon className="w-6 h-6 mr-2 text-teal-700"/>
                                <span>ارسال با پیک</span>
                            </label>
                            <label className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${deliveryMethod === 'تحویل حضوری' ? 'bg-indigo-50 border-indigo-500 ring-2 ring-indigo-500' : 'hover:bg-slate-50'}`}>
                                <input type="radio" value="تحویل حضوری" {...register("deliveryMethod")} className="ml-3" />
                                <StoreIcon className="w-6 h-6 mr-2 text-indigo-700"/>
                                <span>تحویل حضوری</span>
                            </label>
                        </div>
                    </div>

                    {/* Address Selection */}
                    {deliveryMethod === 'ارسال با پیک' && (
                        <div className="animate-fade-in-up">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">انتخاب آدرس</label>
                            {userAddresses.length > 0 ? (
                                <select {...register("addressId", { required: "انتخاب آدرس الزامی است" })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg">
                                    {userAddresses.map(addr => <option key={addr.id} value={addr.id}>{addr.alias}: {addr.fullAddress}</option>)}
                                </select>
                            ) : (
                                <div className="p-4 bg-amber-50 border-l-4 border-amber-400 text-amber-800 rounded-lg">
                                    <p>هیچ آدرسی ثبت نشده است. لطفاً برای ادامه، از <Link to="/profile" className="font-bold underline">صفحه پروفایل</Link> خود یک آدرس اضافه کنید.</p>
                                </div>
                            )}
                            {errors.addressId && <p className="text-red-500 text-xs mt-1">{errors.addressId.message as string}</p>}
                        </div>
                    )}
                    {deliveryMethod === 'تحویل حضوری' && (
                         <div className="p-4 bg-indigo-50 border-l-4 border-indigo-400 rounded-lg animate-fade-in-up">
                            <p className="font-semibold">آدرس تحویل حضوری:</p>
                            <p className="text-slate-700">{adminSettings.contactAddress}</p>
                        </div>
                    )}

                    {/* Delivery Time */}
                    <div>
                        <label htmlFor="deliveryTime" className="block text-sm font-semibold text-slate-700 mb-2">انتخاب زمان تحویل</label>
                        <select id="deliveryTime" {...register("deliveryTime", { required: "انتخاب زمان تحویل الزامی است" })} className="w-full px-4 py-2.5 border border-slate-300 rounded-lg">
                            {deliveryTimeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                        </select>
                        <p className="text-xs text-slate-500 mt-1">ساعات تحویل سفارش بین ۹ صبح تا ۸ شب می‌باشد. (احتمال نیم ساعت تاخیر یا تعجیل وجود دارد)</p>
                        {errors.deliveryTime && <p className="text-red-500 text-xs mt-1">{errors.deliveryTime.message as string}</p>}
                    </div>

                    {/* Payment Method */}
                    <div>
                        <h3 className="text-lg font-bold mb-3">روش پرداخت</h3>
                        <div className="space-y-3">
                           {(Object.values(PaymentMethod) as string[]).map(method => (
                               <label key={method} className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                                   <input type="radio" value={method} {...register("paymentMethod", { required: "انتخاب روش پرداخت الزامی است" })} className="ml-3" />
                                   <span>{method}</span>
                               </label>
                           ))}
                        </div>
                         {errors.paymentMethod && <p className="text-red-500 text-xs mt-1">{errors.paymentMethod.message as string}</p>}
                    </div>
                    
                    {paymentMethod === PaymentMethod.CardToCard && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg animate-fade-in-up">
                            <p className="font-semibold">لطفا مبلغ <span className="text-blue-600">{finalTotal.toLocaleString('fa-IR')} تومان</span> را به شماره کارت زیر واریز کرده و از رسید آن عکس بگیرید.</p>
                            <p className="my-3 text-center font-mono text-xl tracking-widest bg-white p-2 rounded-md">۶۰۳۷-۹۹۷۹-۱۱۱۱-۲۲۲۲</p>
                            <div>
                                 <label htmlFor="receipt" className="block text-sm font-semibold text-slate-700 mb-2">بارگذاری رسید</label>
                                 <input type="file" id="receipt" accept="image/*" {...register("receipt", { required: "بارگذاری رسید برای این روش الزامی است" })} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100" />
                                 {errors.receipt && <p className="text-red-500 text-xs mt-1">{errors.receipt.message as string}</p>}
                            </div>
                        </div>
                    )}
                    
                    {error && <p className="text-red-500 text-sm text-center my-4">{error}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full bg-green-600 text-white py-3 rounded-lg text-lg font-semibold hover:bg-green-700 transition-colors disabled:bg-slate-400">
                        {loading ? 'در حال ثبت...' : 'ثبت نهایی سفارش'}
                    </button>
                </form>
            </div>
            
            <Modal isOpen={isDrinkModalOpen} onClose={() => setDrinkModalOpen(false)} title="افزودن نوشیدنی">
                <div className="space-y-4">{DRINKS_MENU.map(drink => {
                        const quantity = selectedDrinks.find(d => d.id === drink.id)?.quantity || 0;
                        return (
                            <div key={drink.id} className="flex items-center justify-between">
                                <div><p className="font-semibold">{drink.name}</p><p className="text-sm text-slate-500">{drink.price.toLocaleString('fa-IR')} تومان</p></div>
                                <div className="flex items-center gap-3"><button onClick={() => handleUpdateDrinkQuantity(drink, 1)} className="p-1.5 rounded-full bg-slate-100 hover:bg-teal-100"><PlusIcon className="w-5 h-5 text-teal-700" /></button><span className="w-6 text-center font-bold">{quantity}</span><button onClick={() => handleUpdateDrinkQuantity(drink, -1)} disabled={quantity === 0} className="p-1.5 rounded-full bg-slate-100 hover:bg-red-100 disabled:opacity-50"><MinusIcon className="w-5 h-5 text-red-600" /></button></div>
                            </div>
                        );
                    })}
                    <div className="pt-4 flex justify-end"><button onClick={() => setDrinkModalOpen(false)} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-teal-700">تایید</button></div>
                </div>
            </Modal>
        </>
    );
};

export default Checkout;