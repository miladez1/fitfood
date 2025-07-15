import React, { useContext } from 'react';
import { AppContext } from '../contexts/AppContext.tsx';
import { MapPinIcon, PhoneIcon, InstagramIcon } from '../components/icons/Icons.tsx';

const ContactUs: React.FC = () => {
  const { getAdminSettings } = useContext(AppContext);
  const settings = getAdminSettings();

  const contactInfo = [
    {
      icon: MapPinIcon,
      title: 'آدرس',
      value: settings.contactAddress,
      href: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(settings.contactAddress)}`
    },
    {
      icon: PhoneIcon,
      title: 'شماره تماس',
      value: settings.contactPhone,
      href: `tel:${settings.contactPhone}`
    },
    {
      icon: InstagramIcon,
      title: 'اینستاگرام',
      value: `@${settings.contactInstagram}`,
      href: `https://instagram.com/${settings.contactInstagram}`
    }
  ];

  return (
    <div className="animate-fade-in-up max-w-3xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-slate-800">تماس با ما</h1>
        <p className="text-lg text-slate-500 mt-2">خوشحال می‌شویم صدای شما را بشنویم!</p>
      </div>
      
      <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl">
        <div className="space-y-8">
          {contactInfo.map((item, index) => (
            <a 
              key={index} 
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-5 group"
            >
              <div className="flex-shrink-0 bg-teal-100 p-4 rounded-full">
                <item.icon className="w-7 h-7 text-teal-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">{item.title}</h3>
                <p className="text-md text-slate-600 mt-1 group-hover:text-teal-700 transition-colors" dir="ltr">
                  {item.value}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactUs;
