


import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../api';
import { User, DistributorVerificationStatus, DistributorProofDocument } from '../types';
import { ChevronLeftIcon, CameraIcon, ArrowLeftOnRectangleIcon, TrashIcon, ShieldCheckIcon, SpinnerIcon, SunIcon, MoonIcon, ProfilePicture, VideoCameraIcon, ArrowUpTrayIcon, DocumentTextIcon, CheckCircleIcon, ShieldExclamationIcon } from '../components/Icons';
import { useAuth, useTheme } from '../App';
import { useToast } from '../hooks/useToast';

const PhotoSourceModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ isOpen, onClose, onFileSelect }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center animate-fade-in-up transition-opacity" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-xs m-4 p-6 text-center" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold mb-6 dark:text-white">Change Photo</h2>
                <div className="space-y-4">
                    <label htmlFor="camera-upload" className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors">
                        <VideoCameraIcon className="w-6 h-6" />
                        <span>Take a Photo</span>
                        <input id="camera-upload" type="file" accept="image/*" capture="user" className="hidden" onChange={onFileSelect} />
                    </label>
                    <label htmlFor="gallery-upload" className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors">
                        <CameraIcon className="w-6 h-6" />
                        <span>Choose from Gallery</span>
                        <input id="gallery-upload" type="file" accept="image/*" className="hidden" onChange={onFileSelect} />
                    </label>
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

const cropImageToSquare = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) return reject('Canvas context not available');

                let sourceX, sourceY, sourceSize;
                const outputSize = 512; // A good resolution for profile pictures

                if (img.width > img.height) {
                    sourceSize = img.height;
                    sourceX = (img.width - img.height) / 2;
                    sourceY = 0;
                } else {
                    sourceSize = img.width;
                    sourceX = 0;
                    sourceY = (img.height - img.width) / 2;
                }

                canvas.width = outputSize;
                canvas.height = outputSize;

                ctx.drawImage(
                    img,
                    sourceX,
                    sourceY,
                    sourceSize,
                    sourceSize,
                    0,
                    0,
                    outputSize,
                    outputSize
                );

                canvas.toBlob(
                    (blob) => {
                        if (blob) {
                            resolve(blob);
                        } else {
                            reject('Failed to create blob from canvas');
                        }
                    },
                    'image/jpeg',
                    0.9 // Quality
                );
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const VerificationStatusBadge: React.FC<{ status: DistributorVerificationStatus }> = ({ status }) => {
    const statusInfo: Record<DistributorVerificationStatus, { text: string; className: string }> = {
        none: { text: 'Not Verified', className: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
        pending: { text: 'Pending Review', className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300' },
        approved: { text: 'Official Enagic® Distributor', className: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' },
        rejected: { text: 'Verification Rejected', className: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' },
        revoked: { text: 'Verification Revoked', className: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300' },
    };

    const { text, className } = statusInfo[status];
    return <span className={`px-3 py-1 text-sm font-semibold rounded-full ${className}`}>{text}</span>;
};


export default function UserProfilePage() {
  const navigate = useNavigate();
  const { userData, setUserData } = useAuth();
  const { showToast } = useToast();
  
  const [user, setUser] = useState<User | null>(null);
  const [originalUser, setOriginalUser] = useState<User | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [phoneParts, setPhoneParts] = useState({ countryCode: '+1', number: '' });
  const [isPhotoSourceModalOpen, setIsPhotoSourceModalOpen] = useState(false);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [deletingDocId, setDeletingDocId] = useState<string | null>(null);
  const [isSubmittingVerification, setIsSubmittingVerification] = useState(false);

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

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    e.target.value = ''; // Reset input to allow re-selecting the same file
    setIsPhotoSourceModalOpen(false);

    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file.', 'error');
        return;
    }

    if (!user) return;

    setIsUploadingPhoto(true);
    try {
        const imageBlob = await cropImageToSquare(file);
        const downloadURL = await api.uploadProfilePicture(user.id, imageBlob);
        
        const updates = { profilePicture: downloadURL };
        await api.updateUser(user.id, updates);

        const updatedUserWithPic = { ...user, profilePicture: downloadURL };
        
        setUserData(updatedUserWithPic);
        setUser(updatedUserWithPic);
        setOriginalUser(JSON.parse(JSON.stringify(updatedUserWithPic)));
        showToast('Profile picture updated!', 'success');
        
    } catch (error) {
        console.error("Failed to upload profile picture:", error);
        showToast("Could not upload your photo. Please try again.", 'error');
    } finally {
        setIsUploadingPhoto(false);
    }
  };
  
  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!user) return;
    setIsSaving(true);
    
    // Create a mutable copy for URL validation
    const userToSave = { ...user };
    userToSave.displayName = `${userToSave.firstName} ${userToSave.lastName}`.trim();

    const socialFields = ['instagram', 'facebook', 'linkedin', 'website'] as const;
    socialFields.forEach(field => {
      const url = userToSave[field];
      if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
        userToSave[field] = `https://${url}`;
      }
    });

    await api.updateUser(user.id, userToSave);
    setUserData(userToSave); // Update global context with validated URLs
    setOriginalUser(JSON.parse(JSON.stringify(userToSave)));
    setIsSaving(false);
    if (e) showToast('Profile saved!', 'success');
  };
  
  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return;
    const files = Array.from(e.target.files);
    e.target.value = ''; // Reset input

    setIsUploadingDocument(true);
    try {
        const uploadPromises = files.map((file: File) => api.uploadDistributorProofDocument(user.id, file));
        const newDocuments = await Promise.all(uploadPromises);
        
        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                distributorProofDocuments: [...(prevUser.distributorProofDocuments || []), ...newDocuments],
            };
        });
        
        showToast(`${files.length} document(s) uploaded successfully!`, 'success');
    } catch (error) {
        console.error("Failed to upload document:", error);
        showToast("Could not upload document. Please try again.", 'error');
    } finally {
        setIsUploadingDocument(false);
    }
  };

  const handleDocumentDelete = async (documentToDelete: DistributorProofDocument) => {
    if (!user) return;
    
    setDeletingDocId(documentToDelete.id);
    try {
        await api.deleteDistributorProofDocument(user.id, documentToDelete);

        setUser(prevUser => {
            if (!prevUser) return null;
            return {
                ...prevUser,
                distributorProofDocuments: prevUser.distributorProofDocuments.filter(
                    doc => doc.id !== documentToDelete.id
                ),
            };
        });

        showToast('Document deleted successfully.', 'success');
    } catch (error) {
        console.error("Failed to delete document:", error);
        showToast("Could not delete document. Please try again.", 'error');
    } finally {
        setDeletingDocId(null);
    }
  };
  
  const handleSubmitVerification = async () => {
      if (!user || !user.distributorId?.trim() || user.distributorProofDocuments.length === 0) {
          showToast('Please provide your Distributor ID and upload at least one proof document.', 'error');
          return;
      }
      setIsSubmittingVerification(true);
      try {
          await api.submitForDistributorVerification(user.id, user.distributorId);
          const updatedUser = { ...user, distributorVerificationStatus: 'pending' as DistributorVerificationStatus };
          setUser(updatedUser);
          setUserData(updatedUser);
          setOriginalUser(JSON.parse(JSON.stringify(updatedUser)));
          showToast('Verification submitted for review!', 'success');
      } catch (error) {
          console.error("Failed to submit for verification:", error);
          showToast("Could not submit for verification. Please try again.", 'error');
      } finally {
          setIsSubmittingVerification(false);
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
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" disabled={user.isBlocked}>
          <ChevronLeftIcon className="w-6 h-6 text-gray-800 dark:text-gray-200" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center dark:text-gray-100">Edit Profile</h1>
        <button 
          type="submit" form="user-profile-form" disabled={!isDirty || isSaving || user.isBlocked}
          className="font-semibold text-brand-blue disabled:text-gray-400 dark:disabled:text-gray-500 transition-colors px-4 w-16"
        >
          {isSaving ? <SpinnerIcon className="w-5 h-5 animate-spin mx-auto" /> : "Save"}
        </button>
      </header>
      
      {user.isBlocked && (
        <div className="p-4 bg-red-100 dark:bg-red-900/50 border-b border-red-200 dark:border-red-700 flex items-center gap-3 text-red-800 dark:text-red-200">
            <ShieldExclamationIcon className="w-6 h-6" />
            <div>
                <h3 className="font-bold">Account Blocked</h3>
                <p className="text-sm">Your account has been blocked by an administrator. You cannot make changes to your profile or use app features.</p>
            </div>
        </div>
      )}

      <div className="p-4 md:p-6 space-y-6">
        <fieldset disabled={user.isBlocked}>
            <form id="user-profile-form" onSubmit={handleSave} className="space-y-6">
                <div className="flex flex-col items-center">
                    <div className="relative w-32 h-32 mb-2">
                        <ProfilePicture src={user.profilePicture} alt="Profile" className="w-full h-full rounded-full object-cover shadow-md border-4 border-white dark:border-gray-800" />
                        {isUploadingPhoto ? (
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                <SpinnerIcon className="w-8 h-8 text-white animate-spin" />
                            </div>
                        ) : (
                            <button type="button" onClick={() => setIsPhotoSourceModalOpen(true)} className="absolute bottom-1 right-1 bg-white dark:bg-gray-600 p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-500 transition">
                                <CameraIcon className="w-6 h-6 text-gray-700 dark:text-gray-200" />
                            </button>
                        )}
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
                    <InputField label="Display Name" id="displayName" name="displayName" value={user.displayName} onChange={handleInputChange} />
                    <div>
                    <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        maxLength={300}
                        value={user.bio || ''}
                        onChange={handleInputChange}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
                        placeholder="Tell us a little about yourself..."
                    />
                    <p className="text-right text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {user.bio?.length || 0} / 300
                    </p>
                    </div>
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

                <FormSection title="Social Links">
                    <InputField label="Instagram URL" id="instagram" name="instagram" value={user.instagram || ''} onChange={handleInputChange} placeholder="instagram.com/yourprofile" />
                    <InputField label="Facebook URL" id="facebook" name="facebook" value={user.facebook || ''} onChange={handleInputChange} placeholder="facebook.com/yourprofile" />
                    <InputField label="LinkedIn URL" id="linkedin" name="linkedin" value={user.linkedin || ''} onChange={handleInputChange} placeholder="linkedin.com/in/yourprofile" />
                    <InputField label="Website" id="website" name="website" value={user.website || ''} onChange={handleInputChange} placeholder="yourwebsite.com" />
                </FormSection>

                <FormSection title="Host Settings">
                    {user.isHost ? (<>
                    <div className="flex justify-between items-center">
                        <div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">Available to share water</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Control whether you appear in host searches.</p>
                        </div>
                        <Toggle checked={user.isAcceptingRequests} onChange={(checked) => handleToggleChange('isAcceptingRequests', checked)} />
                    </div>
                    <div className="h-px bg-gray-200 dark:bg-gray-700"></div>

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
                    </>) : (
                        <div className="text-center text-gray-500 dark:text-gray-400">
                            <p>To share water as a host you must first be an officially verified Enagic distributor.</p>
                        </div>
                    )}
                </FormSection>

                <FormSection title="Distributor Verification">
                    {user.distributorVerificationStatus === 'approved' ? (
                        <div className="p-4 bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700/60 rounded-lg text-green-800 dark:text-green-200 text-center">
                            <CheckCircleIcon className="w-8 h-8 mx-auto mb-2" />
                            <p className="font-semibold">You are an Official Enagic® Distributor!</p>
                        </div>
                    ) : user.distributorVerificationStatus === 'pending' ? (
                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/40 border border-yellow-200 dark:border-yellow-700/60 rounded-lg text-yellow-800 dark:text-yellow-200 text-center">
                            <p className="font-semibold">Verification in progress...</p>
                            <p className="text-sm mt-1">Your documents are under review. We will notify you once it's complete.</p>
                        </div>
                    ) : (
                        <>
                            <div className="p-3 bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-700/60 rounded-lg text-blue-800 dark:text-blue-200 text-sm">
                                <p>To become a host and share Kangen water with other official owners, you must be an Official Enagic® Distributor. Please enter your Enagic Distributor ID and upload your proof document.</p>
                            </div>

                            {(user.distributorVerificationStatus === 'rejected' || user.distributorVerificationStatus === 'revoked') && user.distributorRejectionReason && (
                                <div className="p-3 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700/60 rounded-lg text-red-800 dark:text-red-200 text-sm">
                                    <p className="font-semibold mb-1">Verification Not Approved:</p>
                                    <p>{user.distributorRejectionReason}</p>
                                    <p className="mt-2">Please update your ID and/or documents and resubmit.</p>
                                </div>
                            )}
                            
                            <InputField label="Enagic Distributor ID" id="distributorId" name="distributorId" value={user.distributorId} onChange={handleInputChange} required />
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Upload proof of distributor status</label>
                                <label htmlFor="document-upload" className="w-full flex items-center justify-center gap-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-4 rounded-xl cursor-pointer transition-colors">
                                    {isUploadingDocument ? <><SpinnerIcon className="w-5 h-5 animate-spin" /><span>Uploading...</span></>
                                    : <><ArrowUpTrayIcon className="w-5 h-5" /><span>Upload Document(s)</span></>}
                                    <input id="document-upload" type="file" multiple accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleDocumentUpload} disabled={isUploadingDocument} />
                                </label>
                            </div>

                            {user.distributorProofDocuments && user.distributorProofDocuments.length > 0 && (
                                <div>
                                    <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Uploaded Documents</h3>
                                    <ul className="space-y-2">
                                        {user.distributorProofDocuments.map(doc => (
                                            <li key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <DocumentTextIcon className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                                                    <div className="min-w-0">
                                                        <p className="font-medium text-gray-800 dark:text-gray-200 truncate">{doc.fileName}</p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => handleDocumentDelete(doc)} disabled={deletingDocId === doc.id} className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 ml-2" aria-label={`Delete ${doc.fileName}`}>
                                                    {deletingDocId === doc.id ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <TrashIcon className="w-5 h-5" />}
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <button type="button" onClick={handleSubmitVerification} disabled={isSubmittingVerification} className="w-full flex items-center justify-center gap-2 bg-brand-blue text-white font-semibold py-3 px-4 rounded-xl hover:bg-blue-600 transition-colors disabled:bg-blue-300">
                                {isSubmittingVerification ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Submit for Verification'}
                            </button>
                        </>
                    )}
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
        </fieldset>
      </div>
      <PhotoSourceModal
        isOpen={isPhotoSourceModalOpen}
        onClose={() => setIsPhotoSourceModalOpen(false)}
        onFileSelect={handlePhotoChange}
      />
    </div>
  );
}