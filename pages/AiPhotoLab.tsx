import React, { useState, useContext, useMemo } from 'react';
import { AppContext } from '../contexts/AppContext.tsx';
import { reimagineImage } from '../services/geminiService.ts';
import { SparklesIcon, CameraIcon } from '../components/icons/Icons.tsx';

const AiPhotoLab: React.FC = () => {
    const { user, getAdminSettings, checkAndIncrementEnhancementUsage, saveEnhancedImage } = useContext(AppContext);
    
    const [originalImage, setOriginalImage] = useState<string | null>(null);
    const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const remainingUses = useMemo(() => {
        if (!user) return 0;
        const today = new Date();
        const lastReset = new Date(user.dailyEnhancements.lastReset);
        if (today.getDate() !== lastReset.getDate() || today.getMonth() !== lastReset.getMonth() || today.getFullYear() !== lastReset.getFullYear()) {
            return 2; // Needs reset, so they have full uses
        }
        return 2 - user.dailyEnhancements.count;
    }, [user]);

    const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setError(null);
            setEnhancedImage(null);
            const reader = new FileReader();
            reader.onloadend = () => {
                setOriginalImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEnhanceClick = async () => {
        if (!originalImage) {
            setError("لطفا ابتدا یک عکس انتخاب کنید.");
            return;
        }

        const hasUsage = checkAndIncrementEnhancementUsage();
        if (!hasUsage) {
            setError("محدودیت استفاده روزانه شما به پایان رسیده است. فردا دوباره تلاش کنید.");
            return;
        }
        
        setLoading(true);
        setError(null);
        setEnhancedImage(null);
        
        try {
            const adminSettings = getAdminSettings();
            if (!adminSettings.photoLabApiKey || !adminSettings.photoLabPrompt) {
                setError("کلید API یا پرامپت لابراتوار عکس در پنل مدیریت تنظیم نشده است. لطفا با مدیر تماس بگیرید.");
                setLoading(false);
                return;
            }
            
            const resultBase64 = await reimagineImage(
                originalImage,
                adminSettings.photoLabApiKey,
                adminSettings.photoLabPrompt
            );
            setEnhancedImage(resultBase64);
            saveEnhancedImage(originalImage, resultBase64);

        } catch (e: any) {
            setError(e.message || "خطایی در بازآفرینی تصویر رخ داد.");
        } finally {
            setLoading(false);
        }
    };

    const ImagePlaceholder = () => (
        <div className="w-full aspect-square bg-slate-100 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-slate-300 text-slate-500">
            <CameraIcon className="w-16 h-16 mb-4"/>
            <p className="font-semibold">عکس شما اینجا نمایش داده می‌شود</p>
        </div>
    );
    
    const ImageSkeleton = () => (
         <div className="w-full aspect-square bg-slate-200 rounded-2xl animate-skeleton-pulse"></div>
    );

    return (
        <div className="max-w-5xl mx-auto animate-fade-in-up">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold text-slate-800">لابراتوار عکس AI</h1>
                <p className="text-lg text-slate-500 mt-2">عکس باشگاهی خود را به یک اثر هنری تبدیل کنید!</p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-xl">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    {/* Image Display */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-bold text-center mb-2">عکس اصلی</h3>
                            {originalImage ? <img src={originalImage} alt="Original" className="w-full aspect-square object-cover rounded-2xl shadow-md" /> : <ImagePlaceholder />}
                        </div>
                        <div>
                            <h3 className="font-bold text-center mb-2">عکس بهبود یافته</h3>
                            {loading && <ImageSkeleton />}
                            {enhancedImage && <img src={`data:image/jpeg;base64,${enhancedImage}`} alt="Enhanced" className="w-full aspect-square object-cover rounded-2xl shadow-md animate-fade-in-up" />}
                            {!loading && !enhancedImage && <ImagePlaceholder />}
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="image-upload" className="w-full cursor-pointer bg-teal-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
                                <CameraIcon className="w-6 h-6"/>
                                <span>انتخاب فایل عکس</span>
                            </label>
                            <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleImageUpload} />
                        </div>

                        <div className="text-center text-sm text-slate-600">
                            <p>شما <span className="font-bold text-teal-600 text-lg">{remainingUses}</span> فرصت از ۲ فرصت امروز خود را باقی دارید.</p>
                        </div>

                        <button 
                            onClick={handleEnhanceClick} 
                            disabled={loading || !originalImage || remainingUses <= 0}
                            className="w-full flex justify-center items-center gap-3 bg-indigo-600 text-white font-bold py-3.5 px-4 rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300 shadow-lg hover:shadow-indigo-300/50 disabled:bg-slate-400 disabled:shadow-none disabled:cursor-not-allowed transform hover:-translate-y-1"
                        >
                            {loading ? (
                                <>
                                 <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                 </svg>
                                 <span>در حال خلق اثر هنری...</span>
                                </>
                            ) : (
                                <>
                                <SparklesIcon className="w-6 h-6"/>
                                <span>بهبود عکس با هوش مصنوعی</span>
                                </>
                            )}
                        </button>

                        {error && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg text-center" role="alert">
                                <strong className="font-bold">خطا! </strong>
                                <span className="block sm:inline">{error}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiPhotoLab;