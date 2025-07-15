import React, { useState, useContext, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { PlateIcon, SparklesIcon, LogoIcon, UserIcon, LogoutIcon, CameraIcon, MenuIcon, CloseIcon, PhoneIcon } from './icons/Icons.tsx';
import { AppContext } from '../contexts/AppContext.tsx';

const Header: React.FC = () => {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location]);

  const activeLinkClass = 'bg-teal-600 text-white';
  const inactiveLinkClass = 'text-slate-200 hover:bg-teal-800/50 hover:text-white';
  
  const linkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-md font-medium transition-colors duration-200 ${isActive ? activeLinkClass : inactiveLinkClass}`;

  const mobileLinkClasses = (isActive: boolean) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg font-semibold ${isActive ? 'bg-teal-100 text-teal-700' : 'text-slate-700 hover:bg-slate-100'}`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const NavLinks: React.FC<{isMobile?: boolean}> = ({ isMobile = false }) => (
    <>
      <NavLink to="/order" className={({ isActive }) => isMobile ? mobileLinkClasses(isActive) : linkClasses(isActive)}>
        <PlateIcon className="w-5 h-5" />
        <span>سفارش فیت فود</span>
      </NavLink>
      <NavLink to="/planner" className={({ isActive }) => isMobile ? mobileLinkClasses(isActive) : linkClasses(isActive)}>
        <SparklesIcon className="w-5 h-5" />
        <span>برنامه هوشمند</span>
      </NavLink>
      <NavLink to="/photo-lab" className={({ isActive }) => isMobile ? mobileLinkClasses(isActive) : linkClasses(isActive)}>
        <CameraIcon className="w-5 h-5" />
        <span>لابراتوار عکس AI</span>
      </NavLink>
      <NavLink to="/contact-us" className={({ isActive }) => isMobile ? mobileLinkClasses(isActive) : linkClasses(isActive)}>
        <PhoneIcon className="w-5 h-5" />
        <span>تماس با ما</span>
      </NavLink>
    </>
  );

  return (
    <>
      <header className="sticky top-0 z-50 bg-teal-700/80 backdrop-blur-sm shadow-lg">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <LogoIcon className="h-10 w-10 text-white" />
              <h1 className="text-2xl font-bold text-white">
                فیت‌فود
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-2 space-x-reverse">
              <NavLinks />
            </div>

            {/* Right side controls */}
            <div className="flex items-center gap-2">
              {user ? (
                <NavLink to="/profile" className={({ isActive }) => linkClasses(isActive)}>
                  <UserIcon className="w-5 h-5" />
                  <span className="hidden md:inline">پروفایل من</span>
                </NavLink>
              ) : (
                <NavLink to="/login" className={({ isActive }) => linkClasses(isActive)}>
                  <UserIcon className="w-5 h-5" />
                  <span>ورود / ثبت نام</span>
                </NavLink>
              )}
              
              {/* Mobile Menu Button */}
              <div className="md:hidden">
                <button onClick={() => setMenuOpen(true)} className="p-2 text-white hover:bg-teal-800/50 rounded-md">
                  <MenuIcon className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Flyout Menu */}
      <div 
        className={`fixed inset-0 z-[100] transition-all duration-300 ${isMenuOpen ? 'visible' : 'invisible'}`}
        onClick={() => setMenuOpen(false)}
      >
        <div 
          className={`absolute inset-y-0 right-0 w-full max-w-xs bg-white shadow-xl transition-transform duration-300 ease-in-out ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between p-4 border-b">
             <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
                <LogoIcon className="h-8 w-8 text-teal-700" />
                <h1 className="text-xl font-bold text-teal-700">فیت‌فود</h1>
              </div>
            <button onClick={() => setMenuOpen(false)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-full">
              <CloseIcon className="w-6 h-6" />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            <NavLinks isMobile />
            {user && (
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-semibold rounded-lg">
                  <LogoutIcon className="w-5 h-5" />
                  <span>خروج از حساب</span>
              </button>
            )}
          </nav>
        </div>
      </div>
    </>
  );
};

export default Header;