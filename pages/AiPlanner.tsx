import React, { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { generatePlan } from '../services/geminiService.ts';
import type { UserInfo, FullPlan } from '../types.ts';
import { Gender, ActivityLevel, Goal } from '../types.ts';
import { AppleIcon, DumbbellIcon, FireIcon, CalendarIcon, SparklesIcon } from '../components/icons/Icons.tsx';
import { AppContext } from '../contexts/AppContext.tsx';
import { Link } from 'react-router-dom';

const PlanSkeleton: React.FC = () => (
    <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg mt-8 animate-fade-in-up">
        <div className="h-8 bg-slate-200 rounded-md w-1/2 mx-auto animate-skeleton-pulse"></div>
        <div className="mt-12">
            <div className="h-7 bg-slate-200 rounded-md w-1/4 mb-6 animate-skeleton-pulse"></div>
            <div className="h-16 bg-slate-100 rounded-lg w-full mb-6 animate-skeleton-pulse"></div>
            <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-slate-100 p-4 rounded-lg h-32 animate-skeleton-pulse"></div>
                <div className="bg-slate-100 p-4 rounded-lg h-32 animate-skeleton-pulse"></div>
                <div className="bg-slate-100 p-4 rounded-lg h-32 animate-skeleton-pulse"></div>
            </div>
        </div>
        <div className="mt-12">
            <div className="h-7 bg-slate-200 rounded-md w-1/4 mb-6 animate-skeleton-pulse"></div>
            <div className="space-y-6">
                <div className="bg-slate-100 p-4 rounded-lg h-40 animate-skeleton-pulse"></div>
                <div className="bg-slate-100 p-4 rounded-lg h-40 animate-skeleton-pulse"></div>
            </div>
        </div>
    </div>
);


const PlanDisplay: React.FC<{ plan: FullPlan }> = ({ plan }) => {
    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl mt-12 animate-fade-in-up">
            <h2 className="text-3xl font-extrabold text-center text-slate-800 mb-10">🚀 برنامه شخصی شما آمادست!</h2>
            <div className="mb-12">
                 <div className="flex items-center gap-3 mb-6">
                    <div className="bg-teal-100 p-2 rounded-full"><AppleIcon className="w-7 h-7 text-teal-600" /></div>
                    <h3 className="text-2xl font-bold text-teal-800 border-b-2 border-teal-200 pb-1">برنامه غذایی</h3>
                </div>
                <div className="bg-teal-50 border-r-4 border-teal-500 p-4 rounded-lg text-center mb-8 flex items-center justify-center gap-3">
                    <FireIcon className="w-6 h-6 text-orange-500" />
                    <p className="text-lg text-slate-700">کالری هدف روزانه: <span className="font-extrabold text-2xl text-teal-600 mx-1">{plan.diet_plan.daily_calories_goal}</span> کیلوکالری</p>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[plan.diet_plan.breakfast, plan.diet_plan.lunch, plan.diet_plan.dinner].map((meal, index) => (
                        <div key={index} className="bg-slate-50 p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                            <h4 className="font-bold text-lg mb-2 text-slate-800">{['صبحانه', 'ناهار', 'شام'][index]}</h4>
                            <p className="font-semibold text-teal-700">{meal.name}</p>
                            <p className="text-sm text-slate-600 my-2">{meal.description}</p>
                            <p className="text-sm font-bold mt-2 text-orange-600">{meal.calories} کالری</p>
                        </div>
                    ))}
                </div>
                {plan.diet_plan.snacks.length > 0 &&
                    <div className="mt-6">
                        <h4 className="font-bold text-lg mb-3 text-slate-800">میان‌وعده‌ها</h4>
                        <div className="bg-slate-50 p-5 rounded-xl shadow-sm space-y-4">
                         {plan.diet_plan.snacks.map((snack, index) => (
                             <div key={index} className="border-b border-slate-200 pb-3 last:border-b-0">
                                <p className="font-semibold text-teal-700">{snack.name}</p>
                                <p className="text-sm text-slate-600 my-1">{snack.description}</p>
                                <p className="text-sm font-bold text-orange-600">{snack.calories} کالری</p>
                             </div>
                         ))}
                        </div>
                    </div>
                }
            </div>
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-2 rounded-full"><DumbbellIcon className="w-7 h-7 text-indigo-600" /></div>
                    <h3 className="text-2xl font-bold text-indigo-800 border-b-2 border-indigo-200 pb-1">برنامه ورزشی</h3>
                </div>
                <div className="space-y-6">
                    {plan.exercise_plan.weekly_schedule.map((day, index) => (
                        <div key={index} className="bg-slate-50 p-5 rounded-xl shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-center gap-3 mb-4">
                               <CalendarIcon className="w-5 h-5 text-slate-500"/>
                               <h4 className="font-extrabold text-lg text-slate-800">{day.day}: <span className="font-bold text-indigo-600">{day.focus}</span></h4>
                            </div>
                            <ul className="space-y-4">
                                {day.exercises.map((ex, i) => (
                                    <li key={i} className="border-r-4 border-indigo-200 pr-4">
                                        <p className="font-semibold text-slate-700">{ex.name}</p>
                                        <p className="text-sm text-slate-500 font-medium my-1">{ex.sets}</p>
                                        <p className="text-sm text-slate-600">{ex.description}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                 <div className="bg-indigo-50 border-r-4 border-indigo-500 p-4 rounded-lg text-center mt-8">
                    <p className="text-md text-slate-700">توصیه روز استراحت: <span className="font-bold text-indigo-700">{plan.exercise_plan.rest_day_recommendation}</span></p>
                </div>
            </div>
        </div>
    );
};

const AiPlanner: React.FC = () => {
    const { user, getAdminSettings } = useContext(AppContext);
    const { register, handleSubmit, formState: { errors } } = useForm<UserInfo>({
        defaultValues: {
            age: 25,
            weight: 70,
            height: 175,
            gender: Gender.Male,
            activityLevel: ActivityLevel.LightlyActive,
            goal: Goal.Maintenance,
            dietaryRestrictions: '',
            vulnerableBodyParts: ''
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [plan, setPlan] = useState<FullPlan | null>(null);

    const isProfileComplete = user?.fullName && user?.phone;

    const onSubmit: SubmitHandler<UserInfo> = async (data) => {
        setLoading(true);
        setError(null);
        setPlan(null);
        try {
            const adminSettings = getAdminSettings();
            if (!adminSettings.plannerApiKey) {
                setError("کلید API برنامه هوشمند در پنل مدیریت تنظیم نشده است. لطفا با مدیر تماس بگیرید.");
                setLoading(false);
                return;
            }

            const formattedData = {
                ...data,
                age: Number(data.age),
                weight: Number(data.weight),
                height: Number(data.height),
            };
            const result = await generatePlan(
                formattedData,
                adminSettings.plannerApiKey,
                adminSettings.plannerPrompt
            );
            setPlan(result);
        } catch (e: any) {
            setError(e.message || "An unknown error occurred.");
        } finally {
            setLoading(false);
        }
    };
    
    const inputClass = "w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow";
    const labelClass = "block text-sm font-semibold text-slate-700 mb-2";

    if (!isProfileComplete) {
        return (
             <div className="max-w-2xl mx-auto text-center bg-white p-8 rounded-2xl shadow-xl">
                 <h2 className="text-2xl font-bold text-amber-700 mb-4">پروفایل شما ناقص است!</h2>
                 <p className="text-slate-600 mb-6">برای دریافت نتایج بهتر و برنامه‌های دقیق‌تر، لطفاً نام و شماره تماس خود را در پروفایل خود وارد کنید.</p>
                 <Link to="/profile" className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors">
                     رفتن به صفحه پروفایل
                 </Link>
             </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl">
                <div className="text-center mb-8">
                    <h2 className="text-3xl font-extrabold text-slate-800">برنامه شخصی خود را بسازید</h2>
                    <p className="text-slate-600 mt-2">اطلاعات خود را وارد کنید تا فیت‌فود بهترین برنامه را برای شما طراحی کند.</p>
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                    <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border rounded-lg">
                        <legend className="px-2 font-bold text-lg text-slate-700">اطلاعات پایه</legend>
                        <div>
                            <label htmlFor="age" className={labelClass}>سن</label>
                            <input type="number" id="age" {...register("age", { required: "سن الزامی است", min: 15, max: 100 })} className={inputClass} />
                            {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message as string}</p>}
                        </div>
                        <div>
                            <label htmlFor="gender" className={labelClass}>جنسیت</label>
                            <select id="gender" {...register("gender", { required: "جنسیت الزامی است" })} className={inputClass}>
                                {(Object.values(Gender) as string[]).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="weight" className={labelClass}>وزن (کیلوگرم)</label>
                            <input type="number" id="weight" {...register("weight", { required: "وزن الزامی است", min: 30, max: 300 })} className={inputClass} />
                            {errors.weight && <p className="text-red-500 text-xs mt-1">{errors.weight.message as string}</p>}
                        </div>
                        <div>
                            <label htmlFor="height" className={labelClass}>قد (سانتی‌متر)</label>
                            <input type="number" id="height" {...register("height", { required: "قد الزامی است", min: 100, max: 250 })} className={inputClass} />
                            {errors.height && <p className="text-red-500 text-xs mt-1">{errors.height.message as string}</p>}
                        </div>
                    </fieldset>
                    
                    <fieldset className="grid grid-cols-1 gap-6 p-4 border rounded-lg">
                         <legend className="px-2 font-bold text-lg text-slate-700">سبک زندگی و اهداف</legend>
                        <div>
                             <label htmlFor="activityLevel" className={labelClass}>سطح فعالیت</label>
                             <select id="activityLevel" {...register("activityLevel", { required: "سطح فعالیت الزامی است" })} className={inputClass}>
                                {(Object.values(ActivityLevel) as string[]).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="goal" className={labelClass}>هدف</label>
                             <select id="goal" {...register("goal", { required: "هدف الزامی است" })} className={inputClass}>
                                {(Object.values(Goal) as string[]).map(g => <option key={g} value={g}>{g}</option>)}
                            </select>
                        </div>
                        <div>
                             <label htmlFor="dietaryRestrictions" className={labelClass}>محدودیت‌های غذایی (اختیاری)</label>
                             <input type="text" placeholder="مثال: عدم مصرف لاکتوز، گیاهخواری" id="dietaryRestrictions" {...register("dietaryRestrictions")} className={inputClass} />
                        </div>
                        <div>
                             <label htmlFor="vulnerableBodyParts" className={labelClass}>عضو آسیب‌دیده یا آسیب‌پذیر (اختیاری)</label>
                             <input type="text" id="vulnerableBodyParts" placeholder="مثال: زانو، کمر، شانه" {...register("vulnerableBodyParts")} className={inputClass} />
                        </div>
                    </fieldset>

                    <div>
                        <button type="submit" disabled={loading} className="w-full flex justify-center items-center gap-3 bg-teal-600 text-white font-bold py-3.5 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 shadow-lg hover:shadow-teal-300/50 disabled:bg-slate-400 disabled:shadow-none transform hover:-translate-y-1">
                            {loading ? (
                                <>
                                 <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 <span>در حال ساخت برنامه... لطفاً شکیبا باشید</span>
                                </>
                            ) : (
                                <>
                                <SparklesIcon className="w-6 h-6"/>
                                <span>تولید برنامه با فیت‌فود</span>
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mt-6 animate-fade-in-up" role="alert">
                    <strong className="font-bold">خطا! </strong>
                    <span className="block sm:inline mr-2">{error}</span>
                </div>
            )}
            
            {loading && <PlanSkeleton />}
            {plan && <PlanDisplay plan={plan} />}

        </div>
    );
};

export default AiPlanner;