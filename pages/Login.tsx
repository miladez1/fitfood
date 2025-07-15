import React, { useState, useContext } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from '../contexts/AppContext.tsx';
import { LogoIcon } from '../components/icons/Icons.tsx';

type FormInputs = {
  usernameOrEmail: string;
  password?: string;
};

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<FormInputs>();
  const [error, setError] = useState<string | null>(null);
  const { login, adminLogin } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/";

  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    try {
      setError(null);
      const { usernameOrEmail, password } = data;

      if (!password) {
          setError("رمز عبور الزامی است.");
          return;
      }

      if (usernameOrEmail.toLowerCase() === 'fitfood') {
        // Admin login attempt
        if (adminLogin(password)) {
          navigate('/admin');
        } else {
          setError('نام کاربری یا رمز عبور اشتباه است.');
        }
      } else {
        // User login/register attempt
        login(usernameOrEmail, password);
        // Send them back to the page they were trying to visit.
        navigate(from, { replace: true });
      }
    } catch (e: any) {
      setError(e.message || "خطایی رخ داد. لطفا دوباره تلاش کنید.");
    }
  };

  return (
    <div className="flex justify-center items-center py-12 animate-fade-in-up">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl">
        <div className="text-center mb-8">
            <LogoIcon className="h-16 w-16 text-teal-600 mx-auto" />
            <h1 className="text-3xl font-extrabold text-slate-800 mt-4">به فیت‌فود خوش آمدید</h1>
            <p className="text-slate-500 mt-2">برای ادامه، وارد شوید یا ثبت‌نام کنید.</p>
        </div>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label htmlFor="usernameOrEmail" className="block text-sm font-semibold text-slate-700 mb-2">
              ایمیل
            </label>
            <input
              id="usernameOrEmail"
              {...register("usernameOrEmail", { 
                required: "این فیلد الزامی است",
              })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
              placeholder="you@example.com"
            />
            {errors.usernameOrEmail && <p className="text-red-500 text-xs mt-1">{errors.usernameOrEmail.message}</p>}
          </div>
          
           <div>
            <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
              رمز عبور
            </label>
            <input
              type="password"
              id="password"
              {...register("password", { required: "رمز عبور الزامی است" })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-shadow"
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div>
            <button type="submit" className="w-full flex justify-center items-center gap-3 bg-teal-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300 shadow-lg hover:shadow-teal-300/50 transform hover:-translate-y-1">
              ورود / ثبت نام
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
