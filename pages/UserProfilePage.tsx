import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER } from '../data';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, ArrowLeftOnRectangleIcon, TrashIcon } from '../components/Icons';
import { useAuth } from '../App';

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
    />
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-brand-blue' : 'bg-gray-300'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' },
  { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' },
  { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' },
  { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' },
  { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
];

const parsePhoneNumber = (phone: string): { countryCode: string; number: string } => {
    for (const country of COUNTRIES) {
        if (phone.startsWith(country.code)) {
            const number = phone.substring(country.code.length).trim();
            // Handle cases where a country code is a prefix of another (e.g., +1 for US/Canada)
            const isAmbiguous = COUNTRIES.some(c => c.code.startsWith(country.code) && c.code !== country.code);
            if (isAmbiguous && MOCK_USER.address.country === 'Canada' && country.code === '+1') {
                // Heuristic: default to Canada if address matches
                continue;
            }
            return { countryCode: country.code, number };
        }
    }
    // Default fallback
    const match = phone.match(/^(\+\d+)\s*(.*)$/);
    if (match) {
        return { countryCode: match[1], number: match[2] };
    }
    
    return { countryCode: '+1', number: phone };
};


export default function UserProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isDirty, setIsDirty] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user.profilePicture);
  const [phoneParts, setPhoneParts] = useState(() => parsePhoneNumber(MOCK_USER.phone));

  const ALL_PH_LEVELS = [2.5, 8.5, 9.0, 9.5, 11.5];
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    const isUserChanged = JSON.stringify(user) !== JSON.stringify(MOCK_USER);
    const isImageChanged = previewImage !== MOCK_USER.profilePicture;
    setIsDirty(isUserChanged || isImageChanged);
  }, [user, previewImage]);
  
  const handlePhoneChange = (part: 'countryCode' | 'number', value: string) => {
    const newParts = { ...phoneParts, [part]: value };
    setPhoneParts(newParts);
    setUser(prevUser => ({
      ...prevUser,
      phone: `${newParts.countryCode} ${newParts.number}`.trim()
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, key] = name.split('.');
      setUser(prevUser => ({
        ...prevUser,
        [section]: {
          ...(prevUser[section as keyof User] as object),
          [key]: value
        }
      }));
    } else {
      setUser(prevUser => ({ ...prevUser, [name]: value }));
    }
  };

  const handleAvailabilityChange = (day: string, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setUser(prev => ({
      ...prev,
      availability: {
        ...prev.availability,
        [day]: {
          ...prev.availability[day],
          [field]: value,
        }
      }
    }));
  };
  
  const togglePh = (ph: number) => {
    setUser(prevUser => {
        const newPhLevels = prevUser.phLevels.includes(ph)
            ? prevUser.phLevels.filter(p => p !== ph)
            : [...prevUser.phLevels, ph];
        newPhLevels.sort((a, b) => a - b);
        return { ...prevUser, phLevels: newPhLevels };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Saving user data:', { ...user, profilePicture: previewImage });
    alert('Profile saved!');
    // In a real app, you would also update the MOCK_USER or send to an API
    // For this example, we just reset the dirty state.
    // To see persistence, you would need to lift state up.
    setIsDirty(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deleted.');
        logout();
        navigate('/');
    }
  };

  return (
    <div className="pb-6 bg-gray-50 min-h-screen">
      <header className="p-4 flex items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">Edit Profile</h1>
        <button 
          type="submit"
          form="user-profile-form"
          disabled={!isDirty}
          className="font-semibold text-brand-blue disabled:text-gray-400 transition-colors px-4"
        >
          Save
        </button>
      </header>
      
      <div className="p-4 md:p-6 space-y-6">
        <form id="user-profile-form" onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center">
            <div className="relative w-32 h-32 mb-2">
                <img src={previewImage || 'https://via.placeholder.com/128'} alt="Profile" className="w-full h-full rounded-full object-cover shadow-md border-4 border-white" />
                <label htmlFor="photo-upload" className="absolute bottom-1 right-1 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition">
                <CameraIcon className="w-6 h-6 text-gray-700" />
                <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                </label>
            </div>
            </div>

            <FormSection title="Personal Info">
                <InputField label="Name" id="name" name="name" value={user.name} onChange={handleInputChange} />
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <div className="flex items-center gap-2">
                    <select 
                        name="countryCode"
                        value={phoneParts.countryCode}
                        onChange={(e) => handlePhoneChange('countryCode', e.target.value)}
                        className="p-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                    >
                        {COUNTRIES.map((country) => (
                            <option key={country.name} value={country.code}>
                                {country.flag} {country.code}
                            </option>
                        ))}
                    </select>
                    <input
                        id="phone"
                        type="tel"
                        value={phoneParts.number}
                        onChange={(e) => handlePhoneChange('number', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition flex-1"
                    />
                </div>
                <p className="text-xs text-gray-500 mt-1">Shared only after you accept a water request.</p>
                </div>
            </FormSection>

            <FormSection title="Host Settings">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Water Available (pH)</label>
                    <div className="flex flex-wrap gap-2">
                        {ALL_PH_LEVELS.map(ph => (
                            <button key={ph} type="button" onClick={() => togglePh(ph)} className={`px-4 py-2 rounded-full font-semibold transition text-sm ${user.phLevels.includes(ph) ? 'bg-brand-blue text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                                {ph.toFixed(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Availability</label>
                <div className="space-y-3">
                    {DAYS_OF_WEEK.map(day => (
                    <div key={day} className="space-y-2">
                        <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-800">{day}</span>
                        <Toggle 
                            checked={user.availability[day]?.enabled || false}
                            onChange={(checked) => handleAvailabilityChange(day, 'enabled', checked)}
                        />
                        </div>
                        {user.availability[day]?.enabled && (
                        <div className="grid grid-cols-2 gap-3 pl-4">
                            <div>
                            <label className="text-xs text-gray-500">From</label>
                            <input type="time" value={user.availability[day].startTime} onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-blue focus:border-transparent outline-none"/>
                            </div>
                            <div>
                            <label className="text-xs text-gray-500">To</label>
                            <input type="time" value={user.availability[day].endTime} onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)} className="w-full p-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-brand-blue focus:border-transparent outline-none"/>
                            </div>
                        </div>
                        )}
                    </div>
                    ))}
                </div>
                </div>
                <InputField label="Last Filter Change" id="maintenance.lastFilterChange" name="maintenance.lastFilterChange" type="date" value={user.maintenance.lastFilterChange} onChange={handleInputChange} />
                <InputField label="Last E-Cleaning" id="maintenance.lastECleaning" name="maintenance.lastECleaning" type="date" value={user.maintenance.lastECleaning} onChange={handleInputChange} />
            </FormSection>

            <FormSection title="Address">
                <InputField label="Street" id="address.street" name="address.street" value={user.address.street} onChange={handleInputChange} />
                <InputField label="Number" id="address.number" name="address.number" value={user.address.number} onChange={handleInputChange} placeholder="Apt, suite, etc." />
                <InputField label="Postal Code" id="address.postalCode" name="address.postalCode" value={user.address.postalCode} onChange={handleInputChange} />
                <InputField label="City" id="address.city" name="address.city" value={user.address.city} onChange={handleInputChange} />
                <InputField label="Country" id="address.country" name="address.country" value={user.address.country} onChange={handleInputChange} />
                <p className="text-xs text-gray-500 !mt-2">Your street and number will only be visible to users with an accepted request. Other address details are public.</p>
            </FormSection>
        </form>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Account Actions</h2>
            <div className="space-y-3">
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-gray-700 transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                </button>
                 <button 
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-center gap-2 text-left p-3 bg-red-50 hover:bg-red-100 rounded-lg font-semibold text-red-600 transition-colors"
                >
                    <TrashIcon className="w-5 h-5" />
                    <span>Delete Account</span>
                </button>
            </div>
        </div>

      </div>
    </div>
  );
}