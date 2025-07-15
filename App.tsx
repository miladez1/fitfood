import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header.tsx';
import { AuthGuard } from './components/AuthGuard.tsx';
import { AdminGuard } from './components/AdminGuard.tsx';

// Import pages directly
import FoodOrder from './pages/FoodOrder.tsx';
import AiPlanner from './pages/AiPlanner.tsx';
import Login from './pages/Login.tsx';
import Profile from './pages/Profile.tsx';
import Checkout from './pages/Checkout.tsx';
import Admin from './pages/Admin.tsx';
import OrderSuccess from './pages/OrderSuccess.tsx';
import AiPhotoLab from './pages/AiPhotoLab.tsx';
import ContactUs from './pages/ContactUs.tsx';


const App: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen text-slate-800">
      <Header />
      <main>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/order" element={<FoodOrder />} />
              <Route path="/login" element={<Login />} />
              <Route path="/contact-us" element={<ContactUs />} />
              <Route path="/admin" element={<AdminGuard><Admin /></AdminGuard>} />

              {/* Protected Routes */}
              <Route path="/planner" element={<AuthGuard><AiPlanner /></AuthGuard>} />
              <Route path="/photo-lab" element={<AuthGuard><AiPhotoLab /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/checkout" element={<AuthGuard><Checkout /></AuthGuard>} />
              <Route path="/order-success" element={<AuthGuard><OrderSuccess /></AuthGuard>} />
              
              <Route path="*" element={<Navigate to="/order" />} />
            </Routes>
        </div>
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm">
        <p>ساخته شده با ❤️ توسط فیت‌فود</p>
      </footer>
    </div>
  );
};

export default App;