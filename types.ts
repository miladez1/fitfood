export interface FoodItem {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  discountPrice?: number;
}

export type DayKey = 'saturday' | 'sunday' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday';

export type DailyMenus = Record<DayKey, FoodItem[]>;

export interface CartItem extends FoodItem {
  quantity: number;
}

export interface Drink {
  id: string;
  name: string;
  price: number;
}

export interface OrderItem extends CartItem {}
export interface OrderDrink extends Drink { quantity: number; }

export interface Address {
  id: string;
  alias: string;
  fullAddress: string;
}

export enum PaymentMethod {
  Gateway = 'درگاه پرداخت',
  CardToCard = 'کارت به کارت',
  CashOnDelivery = 'پرداخت درب منزل',
}

export type DeliveryMethod = 'ارسال با پیک' | 'تحویل حضوری';

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  drinks: OrderDrink[];
  totalPrice: number;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
  address: string; 
  deliveryTime: string;
  status: 'Pending' | 'Completed' | 'Cancelled';
  createdAt: number;
  receiptImage?: string; // base64 encoded image for card-to-card
}


export interface User {
  email: string;
  password: string; 
  fullName?: string;
  phone?: string;
  addresses: Address[];
  createdAt: number;
  dailyEnhancements: {
    count: number;
    lastReset: number; // Timestamp of the last reset
  };
}

export interface EnhancedImage {
  id: string;
  userId: string;
  originalImage: string; // base64
  enhancedImage: string; // base64
  createdAt: number;
}


export enum Gender {
  Male = 'مرد',
  Female = 'زن',
}

export enum ActivityLevel {
  Sedentary = 'بی‌تحرک (کار اداری)',
  LightlyActive = 'کمی فعال (ورزش ۱-۳ روز در هفته)',
  ModeratelyActive = 'فعالیت متوسط (ورزش ۳-۵ روز در هفته)',
  VeryActive = 'بسیار فعال (ورزش ۶-۷ روز در هفته)',
  SuperActive = 'فوق‌العاده فعال (ورزش سنگین روزانه یا شغل فیزیکی)',
}

export enum Goal {
  WeightLoss = 'کاهش وزن',
  MuscleGain = 'افزایش عضله',
  Maintenance = 'حفظ وزن',
}

export interface UserInfo {
  age: number;
  gender: Gender;
  weight: number;
  height: number;
  activityLevel: ActivityLevel;
  goal: Goal;
  dietaryRestrictions: string;
  vulnerableBodyParts?: string;
}

export interface Meal {
  name: string;
  description: string;
  calories: number;
}

export interface DietPlan {
  daily_calories_goal: number;
  breakfast: Meal;
  lunch: Meal;
  dinner: Meal;
  snacks: Meal[];
}

export interface Exercise {
  name: string;
  sets: string;
  description: string;
}

export interface WorkoutDay {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface ExercisePlan {
  weekly_schedule: WorkoutDay[];
  rest_day_recommendation: string;
}

export interface FullPlan {
  diet_plan: DietPlan;
  exercise_plan: ExercisePlan;
}

export interface AdminSettings {
    telegramToken: string;
    telegramChatId: string;
    plannerApiKey: string;
    plannerPrompt: string;
    photoLabApiKey: string;
    photoLabPrompt: string;
    contactAddress: string;
    contactPhone: string;
    contactInstagram: string;
    siteUrl: string;
}