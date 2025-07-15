import React, { useState, useContext, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from '../contexts/AppContext.tsx';
import { User, FoodItem, Order, AdminSettings, EnhancedImage, DayKey, DailyMenus, DeliveryMethod } from '../types.ts';
import Modal from '../components/Modal.tsx';
import { PlusIcon, EditIcon, TrashIcon, UserIcon, PlateIcon, SettingsIcon, CartIcon, CameraIcon, RocketIcon, ClockIcon, TruckIcon, StoreIcon } from '../components/icons/Icons.tsx';

// --- Dashboard Components ---

const DeploymentInfo: React.FC = () => (
  <div className="bg-white p-6 rounded-lg shadow-lg space-y-6">
    <div className="flex items-center gap-3">
        <RocketIcon className="w-8 h-8 text-teal-600" />
        <h2 className="text-2xl font-bold text-slate-800">راهنمای راه‌اندازی و نیازمندی‌ها</h2>
    </div>
    
    <div className="p-4 bg-blue-50 border-r-4 border-blue-500 rounded-lg">
      <h3 className="font-bold text-blue-800 text-lg">۱. راه‌اندازی نسخه دمو (وضعیت فعلی)</h3>
      <p className="mt-2 text-slate-700">
        برای استفاده کامل از تمام قابلیت‌های این نسخه دمو، فقط به یک چیز نیاز دارید:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600">
        <li>
          <strong>کلید API سرویس Google Gemini:</strong> این کلید برای فعال‌سازی هر دو قابلیت «برنامه هوشمند» و «لابراتوار عکس AI» ضروری است. کلید خود را از <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-semibold">Google AI Studio</a> دریافت کرده و در تب <strong>تنظیمات</strong> در فیلدهای مربوطه وارد کنید.
        </li>
      </ul>
      <p className="mt-3 text-sm text-slate-500">
        <strong>نکته:</strong> در این نسخه، تمام اطلاعات (کاربران، سفارشات، منو) در حافظه مرورگر شما (`localStorage`) ذخیره می‌شود و با پاک کردن حافظه مرورگر، اطلاعات پاک خواهد شد.
      </p>
    </div>

    <div className="p-4 bg-green-50 border-r-4 border-green-500 rounded-lg">
      <h3 className="font-bold text-green-800 text-lg">۲. راه‌اندازی سایت واقعی (برای آینده)</h3>
      <p className="mt-2 text-slate-700">
        برای اینکه این برنامه را به یک سایت واقعی تبدیل کنید، به زیرساخت قوی‌تری نیاز خواهید داشت:
      </p>
      <ul className="list-disc list-inside mt-2 space-y-2 text-slate-600">
        <li>
          <strong>سرور (Backend):</strong> شما به یک سرور برای مدیریت منطق برنامه، کاربران و ارتباط با دیتابیس نیاز دارید.
        </li>
        <li>
          <strong>دیتابیس (Database):</strong> به جای حافظه مرورگر، اطلاعات باید در یک دیتابیس واقعی (مانند PostgreSQL, MongoDB, و غیره) ذخیره شوند.
        </li>
        <li>
          <strong>امنیت کلید API:</strong> برای امنیت بیشتر، کلید API هوش مصنوعی نباید در کد کاربری (Frontend) قرار گیرد. باید آن را به سرور منتقل کرده و تمام درخواست‌ها به Gemini از طریق سرور شما انجام شود.
        </li>
      </ul>
       <p className="mt-3 text-sm text-slate-500">
        این پروژه یک پایه قدرتمند برای شروع است و با افزودن بک‌اند، می‌تواند به یک سرویس کامل تبدیل شود.
      </p>
    </div>
  </div>
);


const FoodManagement: React.FC = () => {
    const { dailyMenus, updateDailyMenu } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<FoodItem | null>(null);
    const { register, handleSubmit, reset } = useForm<FoodItem>();

    const dayTabs: { key: DayKey, name: string }[] = [
        { key: 'saturday', name: 'شنبه' },
        { key: 'sunday', name: 'یکشنبه' },
        { key: 'monday', name: 'دوشنبه' },
        { key: 'tuesday', name: 'سه‌شنبه' },
        { key: 'wednesday', name: 'چهارشنبه' },
        { key: 'thursday', name: 'پنجشنبه' },
        { key: 'friday', name: 'جمعه' },
    ];
    const [activeDay, setActiveDay] = useState<DayKey>('saturday');
    const activeMenu = dailyMenus[activeDay] || [];

    const openModal = (item: FoodItem | null = null) => {
        setEditingItem(item);
        reset(item || { id: Date.now(), name: '', description: '', price: 0, image: '' });
        setIsModalOpen(true);
    };

    const onSubmit = (data: FoodItem) => {
        const parsedData = {
            ...data,
            price: Number(data.price),
            discountPrice: data.discountPrice ? Number(data.discountPrice) : undefined,
        };
        let newMenu: FoodItem[];
        if (editingItem) {
            newMenu = activeMenu.map(item => item.id === editingItem.id ? parsedData : item);
        } else {
            newMenu = [...activeMenu, { ...parsedData, id: Date.now() }];
        }
        updateDailyMenu(activeDay, newMenu);
        setIsModalOpen(false);
    };
    
    const deleteItem = (id: number) => {
        if(window.confirm('آیا از حذف این آیتم از منوی این روز مطمئن هستید؟')) {
            const newMenu = activeMenu.filter(item => item.id !== id);
            updateDailyMenu(activeDay, newMenu);
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">مدیریت منوی روزانه</h2>
                <button onClick={() => openModal()} className="bg-teal-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"><PlusIcon className="w-5 h-5"/> افزودن غذا به منوی امروز</button>
            </div>

            <div className="flex border-b mb-4 overflow-x-auto">
                {dayTabs.map(tab => (
                    <button key={tab.key} onClick={() => setActiveDay(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 font-semibold border-b-2 transition-colors flex-shrink-0 ${activeDay === tab.key ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                        <span>{tab.name}</span>
                    </button>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow overflow-x-auto">
                <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-3">نام</th><th className="p-3">قیمت</th><th className="p-3">تخفیف</th><th className="p-3">عملیات</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeMenu.map(item => (
                            <tr key={item.id} className="border-b">
                                <td className="p-3 font-semibold">{item.name}</td>
                                <td className="p-3">{item.price.toLocaleString('fa-IR')}</td>
                                <td className="p-3">{item.discountPrice?.toLocaleString('fa-IR') || '-'}</td>
                                <td className="p-3 flex gap-2">
                                    <button onClick={() => openModal(item)} className="text-blue-600 p-1 hover:bg-blue-100 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                    <button onClick={() => deleteItem(item.id)} className="text-red-600 p-1 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? `ویرایش غذا در منوی ${dayTabs.find(d=>d.key === activeDay)?.name}` : `افزودن غذا به منوی ${dayTabs.find(d=>d.key === activeDay)?.name}`}>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <input {...register('name', {required: true})} placeholder="نام غذا" className="w-full p-2 border rounded"/>
                    <textarea {...register('description')} placeholder="توضیحات" className="w-full p-2 border rounded"/>
                    <input type="number" {...register('price', {required: true})} placeholder="قیمت" className="w-full p-2 border rounded"/>
                    <input type="number" {...register('discountPrice')} placeholder="قیمت با تخفیف (اختیاری)" className="w-full p-2 border rounded"/>
                    <input {...register('image', {required: true})} placeholder="آدرس URL عکس" className="w-full p-2 border rounded"/>
                    <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">ذخیره</button>
                </form>
            </Modal>
        </div>
    );
};

const UserManagement: React.FC = () => {
    const { getAllUsers } = useContext(AppContext);
    const users = getAllUsers();
    return (
        <div>
            <h2 className="text-xl font-bold mb-4">مدیریت کاربران ({users.length})</h2>
             <div className="bg-white rounded-lg shadow overflow-x-auto">
                 <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50"><tr><th className="p-3">ایمیل</th><th className="p-3">نام</th><th className="p-3">تلفن</th><th className="p-3">تاریخ عضویت</th></tr></thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.email} className="border-b">
                                <td className="p-3 font-semibold">{user.email}</td>
                                <td className="p-3">{user.fullName || '-'}</td>
                                <td className="p-3">{user.phone || '-'}</td>
                                <td className="p-3" dir="ltr">{new Date(user.createdAt).toLocaleDateString('fa-IR')}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    );
};

const OrderManagement: React.FC = () => {
    const { getAllOrders, getAllUsers } = useContext(AppContext);
    const orders = getAllOrders().sort((a, b) => b.createdAt - a.createdAt);
    const users = getAllUsers();
    const [viewingOrder, setViewingOrder] = useState<Order | null>(null);

    const getUserForOrder = (userId: string) => users.find(u => u.email === userId);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">مدیریت سفارشات ({orders.length})</h2>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
                 <table className="w-full text-sm text-right">
                    <thead className="bg-slate-50"><tr><th className="p-3">کاربر</th><th className="p-3">مبلغ کل</th><th className="p-3">روش پرداخت</th><th className="p-3">روش تحویل</th><th className="p-3">تاریخ</th><th className="p-3">جزئیات</th></tr></thead>
                    <tbody>
                        {orders.map(order => {
                            const user = getUserForOrder(order.userId);
                            return (
                                <tr key={order.id} className="border-b">
                                    <td className="p-3 font-semibold">{user?.fullName || order.userId}</td>
                                    <td className="p-3">{order.totalPrice.toLocaleString('fa-IR')} تومان</td>
                                    <td className="p-3">{order.paymentMethod}</td>
                                    <td className="p-3">{order.deliveryMethod}</td>
                                    <td className="p-3" dir="ltr">{new Date(order.createdAt).toLocaleDateString('fa-IR')}</td>
                                    <td className="p-3">
                                        <button onClick={() => setViewingOrder(order)} className="text-blue-600 hover:underline text-xs">نمایش</button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
             <Modal isOpen={!!viewingOrder} onClose={() => setViewingOrder(null)} title={`جزئیات سفارش ${viewingOrder?.id.slice(-6)}`}>
                {viewingOrder && (
                    <div className="space-y-3 text-sm">
                        <p><strong>کاربر:</strong> {getUserForOrder(viewingOrder.userId)?.fullName || viewingOrder.userId}</p>
                        <p className="flex items-center gap-2">
                           {viewingOrder.deliveryMethod === 'ارسال با پیک' ? <TruckIcon className="w-5 h-5 text-slate-600"/> : <StoreIcon className="w-5 h-5 text-slate-600"/>}
                           <strong>روش تحویل:</strong> {viewingOrder.deliveryMethod}
                        </p>
                         <p><strong>آدرس:</strong> {viewingOrder.address}</p>
                         <p className="flex items-center gap-2">
                            <ClockIcon className="w-5 h-5 text-slate-600"/>
                            <strong>ساعت تحویل:</strong> {viewingOrder.deliveryTime}
                         </p>
                        <p><strong>مبلغ:</strong> {viewingOrder.totalPrice.toLocaleString('fa-IR')} تومان</p>
                         <div className="border-t pt-3 mt-3">
                             <h4 className="font-bold mb-2">آیتم ها</h4>
                             <ul className="list-disc list-inside">
                                {viewingOrder.items.map(item => <li key={item.id}>{item.name} (x{item.quantity})</li>)}
                                {viewingOrder.drinks.map(drink => <li key={drink.id}>{drink.name} (x{drink.quantity})</li>)}
                             </ul>
                         </div>
                         {viewingOrder.receiptImage && (
                            <div className="border-t pt-3 mt-3">
                                <p className="font-bold">رسید پرداخت:</p>
                                <img src={viewingOrder.receiptImage} alt="Receipt" className="rounded-lg border max-w-full h-auto mt-2"/>
                            </div>
                         )}
                    </div>
                )}
            </Modal>
        </div>
    );
};

const EnhancedImageManagement: React.FC = () => {
    const { getAllEnhancedImages } = useContext(AppContext);
    const images = getAllEnhancedImages().sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">گالری عکس‌های AI ({images.length})</h2>
            {images.length === 0 ? (
                <p className="text-slate-500">هنوز هیچ عکسی توسط کاربران ساخته نشده است.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {images.map(img => (
                        <div key={img.id} className="bg-white p-4 rounded-lg shadow-md space-y-3">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <h4 className="text-xs font-bold mb-1 text-center">اصلی</h4>
                                    <img src={img.originalImage} alt="Original" className="w-full h-auto rounded-md aspect-square object-cover" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-bold mb-1 text-center">ساخته شده</h4>
                                    <img src={`data:image/jpeg;base64,${img.enhancedImage}`} alt="Enhanced" className="w-full h-auto rounded-md aspect-square object-cover" />
                                </div>
                            </div>
                            <div className="text-xs text-slate-500 border-t pt-2">
                                <p><strong>کاربر:</strong> {img.userId}</p>
                                <p><strong>تاریخ:</strong> {new Date(img.createdAt).toLocaleString('fa-IR')}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};


const SettingsManagement: React.FC = () => {
    const { getAdminSettings, saveAdminSettings } = useContext(AppContext);
    const { register, handleSubmit, reset, formState: { isDirty } } = useForm<AdminSettings>();
    
    useEffect(() => {
        reset(getAdminSettings());
    }, [getAdminSettings, reset]);

    const onSubmit = (data: AdminSettings) => {
        saveAdminSettings(data);
        alert('تنظیمات ذخیره شد.');
        reset(data); // To reset dirty state
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">تنظیمات کلی</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 bg-white p-6 rounded-lg shadow">
                 <div className="space-y-4 border-b pb-6">
                     <h3 className="text-lg font-bold text-slate-800">اطلاعات تماس</h3>
                     <div>
                        <label className="font-semibold block mb-1">آدرس (برای تحویل حضوری)</label>
                        <input {...register('contactAddress')} className="w-full p-2 border rounded mt-1"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">شماره تماس</label>
                        <input {...register('contactPhone')} className="w-full p-2 border rounded mt-1" dir="ltr"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">آیدی اینستاگرام (بدون @)</label>
                        <input {...register('contactInstagram')} className="w-full p-2 border rounded mt-1" dir="ltr"/>
                    </div>
                 </div>
                 
                 <div className="space-y-4 border-b pb-6">
                     <h3 className="text-lg font-bold text-slate-800">تنظیمات سایت</h3>
                     <div>
                        <label className="font-semibold block mb-1">آدرس کامل سایت (برای آینده)</label>
                        <input {...register('siteUrl')} className="w-full p-2 border rounded mt-1" dir="ltr"/>
                    </div>
                 </div>

                 <div className="space-y-4 border-b pb-6">
                     <h3 className="text-lg font-bold text-slate-800">تنظیمات ربات تلگرام</h3>
                    <div>
                        <label className="font-semibold block mb-1">توکن ربات تلگرام</label>
                        <input {...register('telegramToken')} className="w-full p-2 border rounded mt-1" dir="ltr"/>
                    </div>
                     <div>
                        <label className="font-semibold block mb-1">آیدی عددی چت ادمین</label>
                        <input {...register('telegramChatId')} className="w-full p-2 border rounded mt-1" dir="ltr"/>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="p-4 rounded-lg bg-teal-50 border-r-4 border-teal-500">
                         <h3 className="text-lg font-bold text-teal-800">تنظیمات برنامه هوشمند</h3>
                        <div className="mt-4 space-y-4">
                             <div>
                                <label className="font-semibold block mb-1">کلید API مدل Gemini</label>
                                <input 
                                    {...register('plannerApiKey')} 
                                    className="w-full p-2 border rounded mt-1" 
                                    dir="ltr"
                                    placeholder="کلید API برای برنامه هوشمند..."
                                />
                            </div>
                             <div>
                                <label className="font-semibold block mb-1">قالب پرامپت (دستور)</label>
                                 <p className="text-xs text-slate-500 mb-2">{"از متغیرهایی مانند `{{age}}`, `{{weight}}` و ... برای شخصی‌سازی استفاده کنید."}</p>
                                <textarea 
                                    {...register('plannerPrompt')} 
                                    className="w-full p-2 border rounded mt-1 font-mono text-sm h-60" 
                                    dir="ltr"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="p-4 rounded-lg bg-indigo-50 border-r-4 border-indigo-500">
                         <h3 className="text-lg font-bold text-indigo-800">تنظیمات لابراتوار عکس AI</h3>
                         <div className="mt-4 space-y-4">
                             <div>
                                <label className="font-semibold block mb-1">کلید API مدل Gemini/Imagen</label>
                                <input 
                                    {...register('photoLabApiKey')} 
                                    className="w-full p-2 border rounded mt-1" 
                                    dir="ltr"
                                    placeholder="کلید API برای لابراتوار عکس..."
                                />
                            </div>
                            <div>
                                <label className="font-semibold block mb-1">قالب پرامپت (دستور)</label>
                                 <p className="text-xs text-slate-500 mb-2">این پرامپت برای تحلیل عکس اولیه و ساخت یک پرامپت جدید برای مدل Imagen استفاده می‌شود.</p>
                                <textarea 
                                    {...register('photoLabPrompt')} 
                                    className="w-full p-2 border rounded mt-1 font-mono text-sm h-40" 
                                    dir="ltr"
                                />
                            </div>
                         </div>
                    </div>
                 </div>

                <button type="submit" disabled={!isDirty} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 disabled:bg-slate-400 disabled:cursor-not-allowed">
                    ذخیره همه تنظیمات
                </button>
            </form>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
  const { adminLogout } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('deployment');
  const TABS = [
      { id: 'deployment', label: 'راهنمای راه‌اندازی', icon: RocketIcon, component: DeploymentInfo },
      { id: 'food', label: 'غذاها', icon: PlateIcon, component: FoodManagement },
      { id: 'orders', label: 'سفارشات', icon: CartIcon, component: OrderManagement },
      { id: 'users', label: 'کاربران', icon: UserIcon, component: UserManagement },
      { id: 'ai-photos', label: 'عکس‌های AI', icon: CameraIcon, component: EnhancedImageManagement },
      { id: 'settings', label: 'تنظیمات', icon: SettingsIcon, component: SettingsManagement }
  ];

  const ActiveComponent = TABS.find(tab => tab.id === activeTab)?.component || DeploymentInfo;

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">پنل مدیریت فیت‌فود</h1>
            <button onClick={adminLogout} className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600">خروج</button>
        </div>
        <div className="flex border-b mb-6 overflow-x-auto">
            {TABS.map(tab => (
                 <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 font-semibold border-b-2 transition-colors flex-shrink-0 ${activeTab === tab.id ? 'border-teal-500 text-teal-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}>
                    <tab.icon className="w-5 h-5"/>
                    <span>{tab.label}</span>
                </button>
            ))}
        </div>
        <div>
            <ActiveComponent />
        </div>
    </div>
  );
};

// --- Main Admin Page ---
const Admin: React.FC = () => {
  return <AdminDashboard />;
};

export default Admin;