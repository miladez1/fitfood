import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircleIcon } from '../components/icons/Icons.tsx';

const OrderSuccess: React.FC = () => {
  return (
    <div className="flex justify-center items-center py-12 animate-fade-in-up">
      <div className="w-full max-w-lg bg-white text-center p-8 rounded-2xl shadow-xl">
        <CheckCircleIcon className="h-20 w-20 text-green-500 mx-auto" />
        <h1 className="text-3xl font-extrabold text-slate-800 mt-6">
          سفارش شما ثبت شد!
        </h1>
        <p className="text-slate-600 mt-2 text-lg">
          زودی میرسونیم بهتون
        </p>
        <div className="mt-8">
          <Link
            to="/order"
            className="bg-teal-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-teal-700 transition-colors duration-300"
          >
            بازگشت به منو
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;