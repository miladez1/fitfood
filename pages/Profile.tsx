import React, { useContext, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { AppContext } from '../contexts/AppContext.tsx';
import { UserIcon, SettingsIcon, PlateIcon, DumbbellIcon, MapPinIcon, PlusIcon, EditIcon, TrashIcon } from '../components/icons/Icons.tsx';
import type { Address } from '../types.ts';
import Modal from '../components/Modal.tsx';

type ProfileFormInputs = {
  fullName: string;
  phone: string;
};

type AddressFormInputs = {
  alias: string;
  fullAddress: string;
};

const AddressManager: React.FC = () => {
    const { user, addAddress, updateAddress, deleteAddress } = useContext(AppContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const { register, handleSubmit, reset, formState: { errors } } = useForm<AddressFormInputs>();

    const openModal = (address: Address | null = null) => {
        setEditingAddress(address);
        if (address) {
            reset({ alias: address.alias, fullAddress: address.fullAddress });
        } else {
            reset({ alias: '', fullAddress: '' });
        }
        setIsModalOpen(true);
    };
    
    const closeModal = () => {
        setIsModalOpen(false);
        setEditingAddress(null);
    };

    const onAddressSubmit = (data: AddressFormInputs) => {
        if (editingAddress) {
            updateAddress({ ...editingAddress, ...data });
        } else {
            addAddress(data);
        }
        closeModal();
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('آیا از حذف این آدرس مطمئن هستید؟')) {
            deleteAddress(id);
        }
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg mt-8">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">آدرس‌های من</h2>
                <button onClick={() => openModal()} className="flex items-center gap-2 bg-teal-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-teal-700 transition-colors">
                    <PlusIcon className="w-5 h-5"/>
                    <span>افزودن آدرس</span>
                </button>
            </div>
            
            <div className="space-y-4">
                {(user?.addresses || []).length === 0 ? (
                    <p className="text-slate-500 text-center py-4">هنوز آدرسی ثبت نکرده‌اید.</p>
                ) : (
                    user?.addresses.map(addr => (
                        <div key={addr.id} className="border p-4 rounded-lg flex justify-between items-start bg-slate-50">
                            <div className="flex items-start gap-3">
                                <MapPinIcon className="w-6 h-6 text-slate-500 mt-1"/>
                                <div>
                                    <p className="font-bold">{addr.alias}</p>
                                    <p className="text-sm text-slate-600">{addr.fullAddress}</p>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-shrink-0">
                                <button onClick={() => openModal(addr)} className="text-blue-600 p-1.5 hover:bg-blue-100 rounded-full"><EditIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(addr.id)} className="text-red-600 p-1.5 hover:bg-red-100 rounded-full"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={closeModal} title={editingAddress ? 'ویرایش آدرس' : 'افزودن آدرس جدید'}>
                <form onSubmit={handleSubmit(onAddressSubmit)} className="space-y-4">
                    <div>
                        <label htmlFor="alias" className="block text-sm font-semibold text-slate-700 mb-2">عنوان آدرس</label>
                        <input
                            id="alias"
                            {...register('alias', { required: 'عنوان آدرس الزامی است' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg"
                            placeholder="مثلا: خانه، محل کار"
                        />
                        {errors.alias && <p className="text-red-500 text-xs mt-1">{errors.alias.message as string}</p>}
                    </div>
                    <div>
                        <label htmlFor="fullAddress" className="block text-sm font-semibold text-slate-700 mb-2">آدرس کامل</label>
                        <textarea
                            id="fullAddress"
                            {...register('fullAddress', { required: 'آدرس کامل الزامی است' })}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg h-24"
                            placeholder="آدرس دقیق خود را وارد کنید"
                        />
                         {errors.fullAddress && <p className="text-red-500 text-xs mt-1">{errors.fullAddress.message as string}</p>}
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={closeModal} className="text-slate-600 font-semibold px-4 py-2 rounded-lg hover:bg-slate-100 ml-2">انصراف</button>
                        <button type="submit" className="bg-teal-600 text-white font-semibold px-6 py-2 rounded-lg hover:bg-teal-700">ذخیره</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};


const Profile: React.FC = () => {
  const { user, updateUser } = useContext(AppContext);
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ProfileFormInputs>();

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName || '',
        phone: user.phone || '',
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileFormInputs) => {
    if (!user) return;
    updateUser({
      fullName: data.fullName,
      phone: data.phone,
    });
    alert('پروفایل با موفقیت بروزرسانی شد!');
    reset(data); // To reset the dirty state
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto animate-fade-in-up">
      <div className="flex flex-col md:flex-row items-center gap-6 bg-white p-8 rounded-2xl shadow-xl mb-8">
        <UserIcon className="w-24 h-24 text-teal-600 bg-teal-50 p-4 rounded-full" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800">{user.fullName || 'کاربر فیت‌فود'}</h1>
          <p className="text-slate-500 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">تنظیمات پروفایل</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">نام و نام خانوادگی</label>
              <input
                id="fullName"
                type="text"
                {...register('fullName', { required: 'نام و نام خانوادگی الزامی است' })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
                placeholder="نام کامل خود را وارد کنید"
              />
              {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName.message as string}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-semibold text-slate-700 mb-2">شماره تماس</label>
              <input
                id="phone"
                type="tel"
                {...register('phone', { required: 'شماره تماس الزامی است', pattern: { value: /09[0-9]{9}/, message: "فرمت شماره موبایل صحیح نیست (مثال: 09123456789)" } })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg"
                placeholder="09123456789"
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message as string}</p>}
            </div>
            <div>
              <button
                type="submit"
                disabled={!isDirty}
                className="bg-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-teal-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
              >
                ذخیره تغییرات
              </button>
            </div>
          </form>
       </div>

       <AddressManager />
    </div>
  );
};

export default Profile;