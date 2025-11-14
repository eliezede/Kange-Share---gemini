import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { dataStore } from '../data';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, ArrowLeftOnRectangleIcon, TrashIcon, ShieldCheckIcon } from '../components/Icons';
import { useAuth } from '../App';

const ImageCropperModal: React.FC<{
  imageSrc: string;
  onCropComplete: (croppedImage: string) => void;
  onClose: () => void;
}> = ({ imageSrc, onCropComplete, onClose }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getCroppedImg = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const image = imageRef.current;
      if (!image) return reject('Image not loaded');

      const canvas = document.createElement('canvas');
      const finalSize = 256; // Output size for the profile picture
      canvas.width = finalSize;
      canvas.height = finalSize;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Canvas context not available');

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      
      const sourceSize = (image.width < image.height ? image.width : image.height);
      const sourceX = (image.naturalWidth - (sourceSize * scaleX)) / 2 - (offset.x * scaleX / zoom);
      const sourceY = (image.naturalHeight - (sourceSize * scaleY)) / 2 - (offset.y * scaleY / zoom);
      const sourceWidth = sourceSize * scaleX / zoom;
      const sourceHeight = sourceSize * scaleY / zoom;

      ctx.beginPath();
      ctx.arc(finalSize / 2, finalSize / 2, finalSize / 2, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      
      ctx.drawImage(
        image,
        sourceX, sourceY, sourceWidth, sourceHeight,
        0, 0, finalSize, finalSize
      );

      canvas.toBlob(
        (blob) => {
          if (!blob) return reject('Canvas is empty');
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        },
        'image/jpeg',
        0.8 // Compression quality
      );
    });
  };

  const handleCrop = async () => {
    try {
      const croppedImage = await getCroppedImg();
      onCropComplete(croppedImage);
    } catch (e) {
      console.error(e);
      alert("Could not crop image.");
    }
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    const x = e.clientX - dragStart.x;
    const y = e.clientY - dragStart.y;
    setOffset({ x, y });
  };
  
  const handleMouseUp = () => setIsDragging(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center animate-fade-in-up transition-opacity" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-4">Crop Your Photo</h2>
        <div
          ref={containerRef}
          className="relative w-full aspect-square bg-gray-900 rounded-lg overflow-hidden cursor-move"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <img
            ref={imageRef}
            src={imageSrc}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              minWidth: '100%',
              minHeight: '100%',
              objectFit: 'cover'
            }}
            draggable={false}
          />
          <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed border-white/80"></div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm font-medium text-gray-700">Zoom:</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 transition">Cancel</button>
          <button onClick={handleCrop} className="px-5 py-2.5 rounded-xl font-semibold bg-brand-blue text-white hover:bg-blue-600 transition">Crop & Save</button>
        </div>
      </div>
    </div>
  );
};

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

const parsePhoneNumber = (phone: string, countryName: string): { countryCode: string; number: string } => {
    for (const country of COUNTRIES) {
        if (phone.startsWith(country.code)) {
            const number = phone.substring(country.code.length).trim();
            if (country.code === '+1' && country.name !== countryName) {
                continue;
            }
            return { countryCode: country.code, number };
        }
    }
    const match = phone.match(/^(\+\d+)\s*(.*)$/);
    if (match) {
        return { countryCode: match[1], number: match[2] };
    }
    
    return { countryCode: '+1', number: phone };
};


export default function UserProfilePage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [user, setUser] = useState<User>({ ...dataStore.currentUser });
  const [isDirty, setIsDirty] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user.profilePicture);
  const [phoneParts, setPhoneParts] = useState(() => parsePhoneNumber(user.phone, user.address.country));
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const ALL_PH_LEVELS = [2.5, 8.5, 9.0, 9.5, 11.5];
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];


  useEffect(() => {
    // Check if user object is different from the one in the store
    const isUserChanged = JSON.stringify(user) !== JSON.stringify(dataStore.currentUser);
    setIsDirty(isUserChanged);
  }, [user]);
  
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
       if (!file.type.startsWith('image/')) {
          alert('Please select an image file.');
          return;
       }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setPreviewImage(croppedImage);
    setUser(prev => ({ ...prev, profilePicture: croppedImage }));
    setImageToCrop(null); // Close modal
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dataStore.currentUser = { ...user };
    alert('Profile saved!');
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
                 <div className="flex items-center gap-8 mt-4">
                    <Link to={`/profile/${user.id}/followers`} className="text-center text-gray-700 hover:text-black">
                        <p className="font-bold text-xl">{user.followers.length}</p>
                        <p className="text-sm text-gray-500">Followers</p>
                    </Link>
                    <Link to={`/profile/${user.id}/following`} className="text-center text-gray-700 hover:text-black">
                        <p className="font-bold text-xl">{user.following.length}</p>
                        <p className="text-sm text-gray-500">Following</p>
                    </Link>
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
                <Link 
                    to="/admin"
                    className="w-full flex items-center justify-center gap-2 text-left p-3 bg-brand-light hover:bg-blue-100 rounded-lg font-semibold text-brand-blue transition-colors"
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                </Link>
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
       {imageToCrop && (
          <ImageCropperModal
            imageSrc={imageToCrop}
            onCropComplete={handleCropComplete}
            onClose={() => setImageToCrop(null)}
          />
        )}
    </div>
  );
}