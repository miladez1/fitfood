import React, { createContext, useState, useEffect, useCallback, useMemo } from 'react';
import type { User, CartItem, FoodItem, Order, AdminSettings, EnhancedImage, DailyMenus, DayKey, Address } from '../types.ts';
import { sendTelegramNotification } from '../services/telegramService.ts';

// --- INITIAL DATA ---
const INITIAL_FOOD_MENU: FoodItem[] = [
    { id: 1, name: 'سالاد سزار با مرغ گریل', description: 'کاهو، نان تست، پنیر پارمزان، سس سزار و فیله مرغ گریل شده', price: 180000, image: 'https://picsum.photos/id/102/400/300' },
    { id: 2, name: 'ساندویچ استیک', description: 'گوشت استیک ورقه شده، پنیر، قارچ و پیاز کاراملی در نان چاپاتا', price: 250000, image: 'https://picsum.photos/id/218/400/300' },
    { id: 3, name: 'پاستا آلفردو با مرغ', description: 'پاستا پنه با سس خامه‌ای آلفردو، مرغ و قارچ', price: 220000, image: 'https://picsum.photos/id/25/400/300', discountPrice: 200000 },
    { id: 4, name: 'ماهی سالمون گریل شده', description: 'فیله ماهی سالمون تازه گریل شده به همراه سبزیجات بخارپز', price: 350000, image: 'https://picsum.photos/id/30/400/300' },
    { id: 5, name: 'اسموتی سبز', description: 'ترکیبی از اسفناج، موز، سیب و دانه چیا برای یک شروع پرانرژی', price: 95000, image: 'https://picsum.photos/id/76/400/300' },
    { id: 6, name: 'کاسه کینوا و سبزیجات', description: 'کینوا، نخود، فلفل دلمه‌ای، خیار و سس لیمویی', price: 150000, image: 'https://picsum.photos/id/42/400/300' },
];

const days: DayKey[] = ['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
const INITIAL_DAILY_MENUS: DailyMenus = days.reduce((acc, day) => {
    acc[day] = INITIAL_FOOD_MENU.map(item => ({...item, id: Math.random()})); // Give unique ids for demo
    return acc;
}, {} as DailyMenus);


const DEFAULT_GEMINI_PROMPT_TEMPLATE = `
لطفا یک برنامه غذایی و ورزشی کامل و شخصی‌سازی شده برای کاربر با مشخصات زیر تهیه کن.
برنامه باید واقع‌بینانه، عملی و متناسب با هدف کاربر باشد.
تمام متن‌ها باید به زبان فارسی روان باشد.

مشخصات کاربر:
- سن: {{age}}
- جنسیت: {{gender}}
- وزن: {{weight}} کیلوگرم
- قد: {{height}} سانتی‌متر
- سطح فعالیت: {{activityLevel}}
- هدف اصلی: {{goal}}
- محدودیت‌های غذایی: {{dietaryRestrictions}}
- عضو آسیب‌پذیر یا آسیب‌دیده: {{vulnerableBodyParts}}

قوانین:
1.  **برنامه غذایی**: وعده‌های غذایی (صبحانه، ناهار، شام) و میان‌وعده‌ها را با جزئیات، نام غذا، و کالری تقریبی مشخص کن. غذاها باید ایرانی و در دسترس باشند.
2.  **برنامه ورزشی**: یک برنامه هفتگی با تقسیم‌بندی روزها و عضلات هدف ارائه بده. برای هر حرکت، نام، تعداد ست و تکرار، و یک توضیح کوتاه بنویس.
3.  **قانون ایمنی مهم**: اگر کاربر عضو آسیب‌دیده مشخص کرده است، برنامه ورزشی باید طوری طراحی شود که هیچ فشاری به آن ناحیه وارد نکند. حرکات جایگزین یا تقویتی مناسب پیشنهاد بده.
4.  **زبان**: پاسخ باید کاملا به زبان فارسی باشد.
5.  **ساختار**: خروجی را دقیقا مطابق با ساختار JSON درخواستی تولید کن.
`.trim();

const DEFAULT_PHOTOLAB_PROMPT_TEMPLATE = `
Describe this image in English in a detailed but concise manner. Focus on the main person, their clothing, their pose, their facial expression, and the background. Return only the description, without any preamble or extra text.
`.trim();


// --- STORAGE UTILS ---
const getFromStorage = <T,>(key: string, defaultValue: T): T => {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage key “${key}”:`, error);
        return defaultValue;
    }
};

const saveToStorage = <T,>(key: string, value: T): void => {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error(`Error writing to localStorage key “${key}”:`, error);
    }
};


// --- CONTEXT DEFINITION ---
interface IAppContext {
    // Auth
    user: User | null;
    isAdmin: boolean;
    login: (email: string, password: string) => User;
    logout: () => void;
    adminLogin: (password: string) => boolean;
    adminLogout: () => void;
    updateUser: (updatedUser: Partial<User>) => void;
    addAddress: (address: Omit<Address, 'id'>) => void;
    updateAddress: (address: Address) => void;
    deleteAddress: (addressId: string) => void;

    // Cart
    cart: CartItem[];
    addToCart: (item: FoodItem) => void;
    removeFromCart: (itemId: number) => void;
    updateQuantity: (itemId: number, quantity: number) => void;
    clearCart: () => void;

    // Data
    dailyMenus: DailyMenus;
    tomorrowsMenu: FoodItem[];
    tomorrowsDayName: string;
    updateDailyMenu: (day: DayKey, menu: FoodItem[]) => void;
    getAllUsers: () => User[];
    getAllOrders: () => Order[];
    getAdminSettings: () => AdminSettings;
    saveAdminSettings: (settings: AdminSettings) => void;
    createOrder: (order: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status'>) => Promise<Order>;

    // AI Photo Lab
    checkAndIncrementEnhancementUsage: () => boolean;
    saveEnhancedImage: (originalImage: string, enhancedImage: string) => void;
    getAllEnhancedImages: () => EnhancedImage[];
}

export const AppContext = createContext<IAppContext>(null!);


// --- PROVIDER COMPONENT ---
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(() => getFromStorage('fitfood_user', null));
    const [isAdmin, setIsAdmin] = useState<boolean>(() => getFromStorage('fitfood_isAdmin', false));
    const [cart, setCart] = useState<CartItem[]>(() => getFromStorage('fitfood_cart', []));
    const [dailyMenus, setDailyMenus] = useState<DailyMenus>(() => {
        const storedMenus = getFromStorage<DailyMenus>('fitfood_daily_menus', null);
        return storedMenus ? storedMenus : INITIAL_DAILY_MENUS;
    });

    // --- Effects to sync state with localStorage ---
    useEffect(() => { saveToStorage('fitfood_user', user); }, [user]);
    useEffect(() => { saveToStorage('fitfood_isAdmin', isAdmin); }, [isAdmin]);
    useEffect(() => { saveToStorage('fitfood_cart', cart); }, [cart]);
    useEffect(() => { saveToStorage('fitfood_daily_menus', dailyMenus); }, [dailyMenus]);

    // --- DERIVED STATE for Tomorrow's Menu ---
    const { tomorrowsMenu, tomorrowsDayName } = useMemo(() => {
        const dayMap: { key: DayKey; name: string }[] = [
            { key: 'sunday', name: 'یکشنبه' },
            { key: 'monday', name: 'دوشنبه' },
            { key: 'tuesday', name: 'سه‌شنبه' },
            { key: 'wednesday', name: 'چهارشنبه' },
            { key: 'thursday', name: 'پنجشنبه' },
            { key: 'friday', name: 'جمعه' },
            { key: 'saturday', name: 'شنبه' },
        ];
        const tomorrowJsDay = (new Date().getDay() + 1) % 7;
        const tomorrowsDayInfo = dayMap[tomorrowJsDay];
        
        return {
            tomorrowsMenu: dailyMenus[tomorrowsDayInfo.key] || [],
            tomorrowsDayName: tomorrowsDayInfo.name,
        };
    }, [dailyMenus]);


    // --- AUTH METHODS ---
    const login = (email: string, password: string): User => {
        const allUsers = getFromStorage<User[]>('fitfood_users', []);
        const existingUser = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

        if (existingUser) {
            if (existingUser.password !== password) {
                throw new Error("رمز عبور اشتباه است.");
            }
            setUser(existingUser);
            return existingUser;
        } else {
            const newUser: User = { 
                email, 
                password, 
                createdAt: Date.now(),
                addresses: [],
                dailyEnhancements: { count: 0, lastReset: Date.now() }
            };
            saveToStorage('fitfood_users', [...allUsers, newUser]);
            setUser(newUser);
            return newUser;
        }
    };
    
    const logout = () => {
        setUser(null);
        setIsAdmin(false);
    };

    const adminLogin = (password: string): boolean => {
        if (password === 'f26560291b') {
            setIsAdmin(true);
            return true;
        }
        return false;
    };
    
    const adminLogout = () => setIsAdmin(false);

    const updateUser = (updatedUserData: Partial<User>) => {
        if (!user) return;
        const finalUser = { ...user, ...updatedUserData };
        setUser(finalUser);
        const allUsers = getFromStorage<User[]>('fitfood_users', []);
        const userIndex = allUsers.findIndex(u => u.email === finalUser.email);
        if (userIndex > -1) {
            allUsers[userIndex] = finalUser;
            saveToStorage('fitfood_users', allUsers);
        }
    };

    // --- Address Management ---
    const addAddress = (addressData: Omit<Address, 'id'>) => {
        if (!user) return;
        const newAddress: Address = { ...addressData, id: `addr_${Date.now()}` };
        const newAddresses = [...(user.addresses || []), newAddress];
        updateUser({ addresses: newAddresses });
    };

    const updateAddress = (updatedAddress: Address) => {
        if (!user || !user.addresses) return;
        const newAddresses = user.addresses.map(addr => addr.id === updatedAddress.id ? updatedAddress : addr);
        updateUser({ addresses: newAddresses });
    };

    const deleteAddress = (addressId: string) => {
        if (!user || !user.addresses) return;
        const newAddresses = user.addresses.filter(addr => addr.id !== addressId);
        updateUser({ addresses: newAddresses });
    };

    // --- CART METHODS ---
    const addToCart = (item: FoodItem) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
            if (existingItem) {
                return prevCart.map(cartItem =>
                    cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevCart, { ...item, quantity: 1 }];
        });
    };
    
    const removeFromCart = (itemId: number) => {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
        } else {
            setCart(prevCart =>
                prevCart.map(item => (item.id === itemId ? { ...item, quantity } : item))
            );
        }
    };

    const clearCart = () => setCart([]);

    // --- DATA METHODS ---
    const updateDailyMenu = (day: DayKey, menu: FoodItem[]) => {
        setDailyMenus(prev => ({
            ...prev,
            [day]: menu,
        }));
    };

    const getAllUsers = (): User[] => getFromStorage('fitfood_users', []);
    const getAllOrders = (): Order[] => getFromStorage('fitfood_orders', []);
    const getAdminSettings = (): AdminSettings => getFromStorage('fitfood_admin_settings', { 
        telegramToken: '', 
        telegramChatId: '',
        plannerApiKey: '',
        plannerPrompt: DEFAULT_GEMINI_PROMPT_TEMPLATE,
        photoLabApiKey: '',
        photoLabPrompt: DEFAULT_PHOTOLAB_PROMPT_TEMPLATE,
        contactAddress: 'تهران، خیابان فیتنس، پلاک ۱۲۳، باشگاه فیت‌فود',
        contactPhone: '021-12345678',
        contactInstagram: 'fitfood_app',
        siteUrl: 'http://your-domain.com'
    });
    const saveAdminSettings = (settings: AdminSettings) => saveToStorage('fitfood_admin_settings', settings);

    const createOrder = useCallback(async (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status'>): Promise<Order> => {
        if (!user) throw new Error("User not logged in");
        const newOrder: Order = {
            ...orderData,
            id: `order_${Date.now()}`,
            userId: user.email,
            createdAt: Date.now(),
            status: 'Pending',
        };
        const allOrders = getFromStorage<Order[]>('fitfood_orders', []);
        saveToStorage('fitfood_orders', [...allOrders, newOrder]);
        clearCart();
        const settings = getAdminSettings();
        if (settings.telegramToken && settings.telegramChatId) {
             await sendTelegramNotification(newOrder, user, settings);
        }
        return newOrder;
    }, [user, getAdminSettings]);

    // --- AI PHOTO LAB METHODS ---
    const checkAndIncrementEnhancementUsage = useCallback((): boolean => {
        if (!user) return false;
        const now = new Date();
        const lastResetDate = new Date(user.dailyEnhancements.lastReset);
        let currentUserEnhancements = user.dailyEnhancements;
        if (now.getDate() !== lastResetDate.getDate() || now.getMonth() !== lastResetDate.getMonth() || now.getFullYear() !== lastResetDate.getFullYear()) {
            currentUserEnhancements = { count: 0, lastReset: now.getTime() };
        }
        if (currentUserEnhancements.count >= 2) {
            return false; // Limit reached
        }
        const updatedEnhancements = {
            ...currentUserEnhancements,
            count: currentUserEnhancements.count + 1,
        };
        updateUser({ dailyEnhancements: updatedEnhancements });
        return true;
    }, [user, updateUser]);

    const saveEnhancedImage = useCallback((originalImage: string, enhancedImage: string) => {
        if (!user) return;
        const newImageRecord: EnhancedImage = {
            id: `img_${Date.now()}`,
            userId: user.email,
            originalImage,
            enhancedImage,
            createdAt: Date.now(),
        };
        const allImages = getFromStorage<EnhancedImage[]>('fitfood_enhanced_images', []);
        saveToStorage('fitfood_enhanced_images', [...allImages, newImageRecord]);
    }, [user]);

    const getAllEnhancedImages = (): EnhancedImage[] => getFromStorage('fitfood_enhanced_images', []);


    const value = {
        user,
        isAdmin,
        login,
        logout,
        adminLogin,
        adminLogout,
        updateUser,
        addAddress,
        updateAddress,
        deleteAddress,
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        dailyMenus,
        tomorrowsMenu,
        tomorrowsDayName,
        updateDailyMenu,
        getAllUsers,
        getAllOrders,
        getAdminSettings,
        saveAdminSettings,
        createOrder,
        checkAndIncrementEnhancementUsage,
        saveEnhancedImage,
        getAllEnhancedImages,
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
