// app/[[...sign-in]]/page.js
'use client';
import { useUser, SignIn, useAuth } from "@clerk/nextjs";
import { useState, useEffect } from "react";

export default function Home() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    occupation: ''
  });

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3001/api/user-profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      const data = await response.json();
      setProfileData(data);
      if (data) {
        setFormData({
          name: data.name || '',
          occupation: data.occupation || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await getToken();
      const response = await fetch('http://localhost:3001/api/complete-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setProfileData(data);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (!isLoaded) return <div>Loading...</div>;

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Welcome!</h1>
          <p className="mb-4">Please sign in to continue.</p>
          <SignIn routing="hash" redirectUrl="/" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-2xl font-bold mb-4">Welcome {user.firstName}</h1>
        
        {!profileData?.profileCompleted ? (
          <div>
            <h2 className="text-xl mb-4">Please complete your profile</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Occupation
                </label>
                <input
                  type="text"
                  value={formData.occupation}
                  onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Submit
              </button>
            </form>
          </div>
        ) : (
          <div>
            <h2 className="text-xl mb-4">Your Profile</h2>
            <div className="space-y-2">
              <p><strong>Name:</strong> {profileData.name}</p>
              <p><strong>Occupation:</strong> {profileData.occupation}</p>
              <p><strong>Role:</strong> {profileData.role}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}