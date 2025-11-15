import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon, ArrowLeftOnRectangleIcon, TrashIcon, ShieldCheckIcon, SpinnerIcon, SunIcon, MoonIcon, ProfilePicture } from '../components/Icons';
import { useAuth, useTheme } from '../App';

const ImageCropperModal: React.FC<{
  imageSrc: string;
  onCropComplete: (croppedImage: Blob) => void;
  onClose: () => void;
}> = ({ imageSrc, onCropComplete, onClose }) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getCroppedImg = (): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const image = imageRef.current;
        const container = containerRef.current;

        if (!image || !container || !image.complete || image.naturalWidth === 0) {
            return reject('Image or container not available');
        }

        const outputSize = 256;
        const canvas = document.createElement('canvas');
        canvas.width = outputSize;
        canvas.height = outputSize;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return reject('Failed to get canvas 2D context');
        }

        // The scale of the image to 'cover' the container, before user zoom
        const coverScale = Math.max(
            container.clientWidth / image.naturalWidth,
            container.clientHeight / image.naturalHeight
        );

        // How many original image pixels correspond to one container pixel
        const imagePixelPerContainerPixel = 1 / coverScale;

        // The size of the visible area in terms of original image pixels, before user zoom
        let sourceVisibleWidth = container.clientWidth * imagePixelPerContainerPixel;
        let sourceVisibleHeight = container.clientHeight * imagePixelPerContainerPixel;
        
        // The top-left corner of this visible area on the original image, for centering 'cover'
        let sourceX = (image.naturalWidth - sourceVisibleWidth) / 2;
        let sourceY = (image.naturalHeight - sourceVisibleHeight) / 2;

        // Now, account for user zoom. Zooming in means we see a smaller portion of the source image.
        const zoomedSourceWidth = sourceVisibleWidth / zoom;
        const zoomedSourceHeight = sourceVisibleHeight / zoom;

        // Adjust the sourceX/Y to keep the zoom centered
        sourceX += (sourceVisibleWidth - zoomedSourceWidth) / 2;
        sourceY += (sourceVisibleHeight - zoomedSourceHeight) / 2;

        // Finally, account for user pan. A pan in container pixels needs to be converted to original image pixels.
        // A pan in a direction on the screen moves the source window in the opposite direction.
        sourceX -= offset.x * imagePixelPerContainerPixel;
        sourceY -= offset.y * imagePixelPerContainerPixel;

        // Draw the calculated source area onto the final canvas
        ctx.beginPath();
        ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2, true);
        ctx.clip();

        ctx.drawImage(
            image,
            sourceX,
            sourceY,
            zoomedSourceWidth,
            zoomedSourceHeight,
            0, 0, // Draw at top-left of canvas
            outputSize, outputSize // Fill the entire canvas
        );

        canvas.toBlob(
            (blob) => {
                if (!blob) {
                    return reject('Canvas is empty');
                }
                resolve(blob);
            },
            'image/jpeg',
            0.9
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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm m-4 p-6" onClick={e => e.stopPropagation()}>
        <h2 className="text-2xl font-bold text-center mb-4 dark:text-white">Crop Your Photo</h2>
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
            crossOrigin="anonymous"
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              transition: isDragging ? 'none' : 'transform 0.1s ease-out',
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
            draggable={false}
          />
          <div className="absolute inset-0 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-[90%] h-[90%] -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-dashed border-white/80"></div>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Zoom:</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer"
          />
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-xl font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition">Cancel</button>
          <button onClick={handleCrop} className="px-5 py-2.5 rounded-xl font-semibold bg-brand-blue text-white hover:bg-blue-600 transition">Crop & Save</button>
        </div>
      </div>
    </div>
  );
};

const FormSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 dark:border-gray-700">{title}</h2>
    <div className="space-y-4">
      {children}
    </div>
  </div>
);

const InputField: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</label>
    <input
      id={id}
      {...props}
      className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
    />
  </div>
);

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${checked ? 'bg-brand-blue' : 'bg-gray-300 dark:bg-gray-600'}`}
  >
    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const COUNTRIES = [
  { name: 'United States', code: '+1', flag: '🇺🇸' }, { name: 'Brazil', code: '+55', flag: '🇧🇷' },
  { name: 'United Kingdom', code: '+44', flag: '🇬🇧' }, { name: 'Canada', code: '+1', flag: '🇨🇦' },
  { name: 'Australia', code: '+61', flag: '🇦🇺' }, { name: 'Germany', code: '+49', flag: '🇩🇪' },
  { name: 'France', code: '+33', flag: '🇫🇷' }, { name: 'Japan', code: '+81', flag: '🇯🇵' },
  { name: 'Portugal', code: '+351', flag: '🇵🇹' },
];

const parsePhoneNumber = (phone: string): { countryCode: string; number: string } => {
    const match = phone.match(/^(\+\d+)\s*(.*)$/);
    if (match) {
        return { countryCode: match[1], number: match[2] };
    }
    return { countryCode: '+1', number: phone };
};


export default function UserProfilePage() {
  const navigate = useNavigate();
  const { logout, userData, setUserData } = useAuth();
  const { theme, toggleTheme } = useTheme();
  
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [phoneParts, setPhoneParts] = useState({ countryCode: '+1', number: '' });
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const ALL_PH_LEVELS = [2.5, 8.5, 9.0, 9.5, 11.5];
  const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  useEffect(() => {
    if (userData) {
      const userCopy = JSON.parse(JSON.stringify(userData));
      setUser(userCopy);
      setOriginalUser(userCopy);
      setPhoneParts(parsePhoneNumber(userCopy.phone));
    }
  }, [userData]);

  useEffect(() => {
    if (user && originalUser) {
        setIsDirty(JSON.stringify(user) !== JSON.stringify(originalUser));
    }
  }, [user, originalUser]);
  
  const handlePhoneChange = (part: 'countryCode' | 'number', value: string) => {
    if (!user) return;
    const newParts = { ...phoneParts, [part]: value };
    setPhoneParts(newParts);
    setUser(prevUser => prevUser ? ({ ...prevUser, phone: `${newParts.countryCode} ${newParts.number}`.trim() }) : null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prevUser => {
      if (!prevUser) return null;
      if (name.includes('.')) {
        const [section, key] = name.split('.');
        return {
          ...prevUser,
          [section]: {
            ...(prevUser[section as keyof User] as object || {}),
            [key]: value,
          },
        };
      }
      return { ...prevUser, [name]: value };
    });
  };
  
  const handleToggleChange = (name: keyof User, value: boolean) => {
    setUser(prev => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleAvailabilityChange = (day: string, field: 'enabled' | 'startTime' | 'endTime', value: boolean | string) => {
    setUser(prev => {
        if (!prev) return null;

        const currentAvailability = prev.availability || {};
        const dayAvailability = currentAvailability[day] || { enabled: false, startTime: '09:00', endTime: '17:00' };

        return {
            ...prev,
            availability: {
                ...currentAvailability,
                [day]: {
                    ...dayAvailability,
                    [field]: value
                }
            }
        };
    });
  };
  
  const togglePh = (ph: number) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        const newPhLevels = prevUser.phLevels.includes(ph) ? prevUser.phLevels.filter(p => p !== ph) : [...prevUser.phLevels, ph];
        newPhLevels.sort((a, b) => a - b);
        return { ...prevUser, phLevels: newPhLevels };
    });
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) { alert('Please select an image file.'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { setImageToCrop(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!user) return;
    setIsSaving(true);
    const downloadURL = await api.uploadProfilePicture(user.id, croppedImageBlob);
    const updatedUser = { ...user, profilePicture: downloadURL };
    await handleSave(undefined, updatedUser); // Save with new image URL
    setImageToCrop(null); // Close modal
    setIsSaving(false);
  };

  const handleSave = async (e?: React.FormEvent, userToSave?: User) => {
    e?.preventDefault();
    const finalUser = userToSave || user;
    if (!finalUser) return;
    setIsSaving(true);
    await api.updateUser(finalUser.id, finalUser);
    setUserData(finalUser); // Update global context
    setOriginalUser(JSON.parse(JSON.stringify(finalUser)));
    setIsSaving(false);
    if (e) alert('Profile saved!');
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
        alert('Account deleted.');
        logout();
        navigate('/');
    }
  };
  
  if (!user) {
    return (
        <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
            <SpinnerIcon className="w-10 h-10 text-brand-blue animate-spin" />
        </div>
    );
  }

  return (
    <div className="pb-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <header className="p-4 flex items-center border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center dark:text-gray-100">Edit Profile</h1>
        <button 
          type="submit" form="user-profile-form" disabled={!isDirty || isSaving}
          className="font-semibold text-brand-blue disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors px-4 w-16"
        >
          {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto" /> : "Save"}
        </button>
      </header>
      
      <div className="p-4 md:p-6 space-y-6">
        <form id="user-profile-form" onSubmit={handleSave} className="space-y-6">
            <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-2">
                    <ProfilePicture src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800" />
                    <label htmlFor="photo-upload" className="absolute bottom-1 right-1 bg-white dark:bg-gray-600 p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition">
                    <CameraIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                    <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                    </label>
                </div>
                 <div className="flex items-center gap-8 mt-4">
                    <Link to={`/profile/${user.id}/followers`} className="text-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        <p className="font-bold text-xl">{user.followers.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Followers</p>
                    </Link>
                    <Link to={`/profile/${user.id}/following`} className="text-center text-gray-700 dark:text-gray-300 hover:text-black dark:hover:text-white">
                        <p className="font-bold text-xl">{user.following.length}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Following</p>
                    </Link>
                </div>
            </div>

            <FormSection title="Personal Info">
                <InputField label="Name" id="name" name="name" value={user.name} onChange={handleInputChange} />
                <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                <div className="flex items-center gap-2">
                    <select 
                        name="countryCode" value={phoneParts.countryCode} onChange={(e) => handlePhoneChange('countryCode', e.target.value)}
                        className="p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                    >
                        {COUNTRIES.map((c) => (<option key={c.name} value={c.code}>{c.flag} {c.code}</option>))}
                    </select>
                    <input
                        id="phone" type="tel" value={phoneParts.number} onChange={(e) => handlePhoneChange('number', e.target.value)}
                        placeholder="(555) 123-4567"
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition flex-1"
                    />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Shared only after you accept a water request.</p>
                </div>
            </FormSection>

            <FormSection title="Host Settings">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">Are you available to host?</span>
                  <Toggle checked={user.isHost} onChange={(checked) => handleToggleChange('isHost', checked)} />
                </div>
                {user.isHost && (<>
                  <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Water Available (pH)</label>
                      <div className="flex flex-wrap gap-2">
                          {ALL_PH_LEVELS.map(ph => (
                              <button key={ph} type="button" onClick={() => togglePh(ph)} className={`px-4 py-2 rounded-full font-semibold transition text-sm ${user.phLevels.includes(ph) ? 'bg-brand-blue text-white' : 'bg-gray-200 dark:bg-gray-600 dark:text-gray-100 hover:bg-gray-300 dark:hover:bg-gray-500'}`}>
                                  {ph.toFixed(1)}
                              </button>
                          ))}
                      </div>
                  </div>
                  <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pickup Availability</label>
                  <div className="space-y-3">
                      {DAYS_OF_WEEK.map(day => (
                      <div key={day} className="space-y-2">
                          <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">{day}</span>
                          <Toggle 
                              checked={user.availability[day]?.enabled || false}
                              onChange={(checked) => handleAvailabilityChange(day, 'enabled', checked)}
                          />
                          </div>
                          {user.availability[day]?.enabled && (
                          <div className="grid grid-cols-2 gap-3 pl-4">
                              <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">From</label>
                              <input type="time" value={user.availability[day].startTime} onChange={(e) => handleAvailabilityChange(day, 'startTime', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-1 focus:ring-brand-blue focus:border-transparent outline-none"/>
                              </div>
                              <div>
                              <label className="text-xs text-gray-500 dark:text-gray-400">To</label>
                              <input type="time" value={user.availability[day].endTime} onChange={(e) => handleAvailabilityChange(day, 'endTime', e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md text-sm focus:ring-1 focus:ring-brand-blue focus:border-transparent outline-none"/>
                              </div>
                          </div>
                          )}
                      </div>
                      ))}
                  </div>
                  </div>
                  <InputField label="Last Filter Change" id="maintenance.lastFilterChange" name="maintenance.lastFilterChange" type="date" value={user.maintenance.lastFilterChange} onChange={handleInputChange} />
                  <InputField label="Last E-Cleaning" id="maintenance.lastECleaning" name="maintenance.lastECleaning" type="date" value={user.maintenance.lastECleaning} onChange={handleInputChange} />
                </>)}
            </FormSection>

            <FormSection title="Address">
                <InputField label="Street" id="address.street" name="address.street" value={user.address.street} onChange={handleInputChange} />
                <InputField label="Number" id="address.number" name="address.number" value={user.address.number} onChange={handleInputChange} placeholder="Apt, suite, etc." />
                <InputField label="Postal Code" id="address.postalCode" name="address.postalCode" value={user.address.postalCode} onChange={handleInputChange} />
                <InputField label="City" id="address.city" name="address.city" value={user.address.city} onChange={handleInputChange} />
                <InputField label="Country" id="address.country" name="address.country" value={user.address.country} onChange={handleInputChange} />
                <p className="text-xs text-gray-500 dark:text-gray-400 !mt-2">Your street and number will only be visible to users with an accepted request. Other address details are public.</p>
            </FormSection>
        </form>
        
        <FormSection title="Appearance">
            <div className="flex justify-between items-center">
                <label htmlFor="dark-mode-toggle" className="font-medium text-gray-700 dark:text-gray-300">Dark Mode</label>
                <button
                    id="dark-mode-toggle" type="button" role="switch" aria-checked={theme === 'dark'} onClick={toggleTheme}
                    className={`relative inline-flex items-center h-8 w-14 rounded-full transition-colors bg-gray-200 dark:bg-gray-700`}
                >
                    <span className="sr-only">Toggle Dark Mode</span>
                    <span className={`inline-flex items-center justify-center w-6 h-6 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`}>
                        {theme === 'dark' ? <MoonIcon className="w-4 h-4 text-gray-800" /> : <SunIcon className="w-4 h-4 text-gray-800" />}
                    </span>
                </button>
            </div>
        </FormSection>
        
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
            <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100 border-b pb-2 dark:border-gray-700">Account Actions</h2>
            <div className="space-y-3">
                <Link 
                    to="/admin"
                    className="w-full flex items-center justify-center gap-2 text-left p-3 bg-brand-light dark:bg-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg font-semibold text-brand-blue dark:text-blue-300 transition-colors"
                >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Admin Dashboard</span>
                </Link>
                <button 
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 text-left p-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg font-semibold text-gray-700 dark:text-gray-200 transition-colors"
                >
                    <ArrowLeftOnRectangleIcon className="w-5 h-5" />
                    <span>Logout</span>
                </button>
                 <button 
                    onClick={handleDeleteAccount}
                    className="w-full flex items-center justify-center gap-2 text-left p-3 bg-red-50 hover:bg-red-100 dark:bg-red-900/40 dark:hover:bg-red-900/60 rounded-lg font-semibold text-red-600 dark:text-red-300 transition-colors"
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