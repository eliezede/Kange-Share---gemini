import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_USER } from '../data';
import { User } from '../types';
import { ChevronLeftIcon, CameraIcon } from '../components/Icons';

export default function UserProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User>(MOCK_USER);
  const [isDirty, setIsDirty] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(user.profilePicture);

  useEffect(() => {
    // Check if form is dirty
    const hasChanged = user.name !== MOCK_USER.name || 
                       user.preferredCities.join(',') !== MOCK_USER.preferredCities.join(',') ||
                       previewImage !== MOCK_USER.profilePicture;
    setIsDirty(hasChanged);
  }, [user, previewImage]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUser(prevUser => ({
      ...prevUser,
      [name]: name === 'preferredCities' ? value.split(',').map(city => city.trim()) : value
    }));
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

  const handleSave = () => {
    // In a real app, you would send this data to your backend.
    console.log('Saving user data:', { ...user, profilePicture: previewImage });
    alert('Profile saved!');
    // Ideally, you'd update your global state/context here.
    setIsDirty(false);
  };

  return (
    <div className="pb-6">
      <header className="p-4 flex items-center border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-sm z-10">
        <button onClick={() => navigate(-1)} className="p-1 rounded-full hover:bg-gray-100">
          <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-xl font-bold flex-1 text-center">Edit Profile</h1>
        <button 
          onClick={handleSave}
          disabled={!isDirty}
          className="font-semibold text-brand-blue disabled:text-gray-400 transition-colors"
        >
          Save
        </button>
      </header>

      <div className="p-6 space-y-8">
        <div className="flex flex-col items-center">
          <div className="relative w-32 h-32 mb-4">
            <img src={previewImage || 'https://via.placeholder.com/128'} alt="Profile" className="w-full h-full rounded-full object-cover shadow-md" />
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition">
              <CameraIcon className="w-6 h-6 text-gray-700" />
              <input id="photo-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
            </label>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={user.name}
              onChange={handleInputChange}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
            />
          </div>
          <div>
            <label htmlFor="preferredCities" className="block text-sm font-medium text-gray-700 mb-1">Preferred Cities</label>
            <textarea
              id="preferredCities"
              name="preferredCities"
              value={user.preferredCities.join(', ')}
              onChange={handleInputChange}
              rows={3}
              placeholder="e.g. San Francisco, Tokyo, Bali"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-500 mt-1">Separate cities with a comma.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
