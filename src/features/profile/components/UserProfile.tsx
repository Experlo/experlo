'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { User } from '@/types/user';
import { SerializedExpert } from '@/types/expert';
import { Button } from '@/shared/components/ui/Button';
import Link from 'next/link';
import EditExpertProfile from './EditExpertProfile';

interface UserProfileProps {
  user: Partial<User>;
  expertData?: SerializedExpert | null;
  isOwnProfile?: boolean;
}

export default function UserProfile({ user, expertData, isOwnProfile = false }: UserProfileProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingExpert, setIsEditingExpert] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    image: user.image || '',
  });
  const [previewUrl, setPreviewUrl] = useState<string | null>(user.image || null);

  const handleImageClick = () => {
    if (isOwnProfile && isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setIsLoading(true);
        setError('');

        // Create preview
        setPreviewUrl(URL.createObjectURL(file));

        // Upload image
        const formData = new FormData();
        formData.append('file', file);
        
        const uploadRes = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Failed to upload image');
        }

        const { url } = await uploadRes.json();
        setFormData(prev => ({ ...prev, image: url }));

        // Update profile with new image
        const res = await fetch('/api/user/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ image: url }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update profile');
        }

        // Force session update
        await fetch('/api/auth/session?update=true');
      } catch (err) {
        console.error('Error uploading image:', err);
        setError(err instanceof Error ? err.message : 'Failed to upload image');
        // Reset preview on error
        setPreviewUrl(user.image || null);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update profile');
      }

      // Force session update
      await fetch('/api/auth/session?update=true');
      setIsEditing(false);
      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* Profile Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="relative">
                <div 
                  className={`h-32 w-32 rounded-full overflow-hidden bg-gray-100 ${isOwnProfile && isEditing ? 'cursor-pointer hover:opacity-80' : ''}`}
                  onClick={handleImageClick}
                >
                  {(previewUrl || user.image) ? (
                    <Image
                      src={previewUrl || user.image!}
                      alt={`${formData.firstName} ${formData.lastName}'s profile picture`}
                      width={128}
                      height={128}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="text-4xl text-gray-500">
                        {formData.firstName[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                  )}
                  {isOwnProfile && isEditing && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-40">
                      <svg
                        className="h-8 w-8 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <div>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="First name"
                        />
                        <input
                          type="text"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder="Last name"
                        />
                      </>
                    ) : (
                      <h1 className="text-2xl font-bold text-gray-900">{`${formData.firstName} ${formData.lastName}`}</h1>
                    )}
                    {user.isExpert && (
                      <div className="mt-1 flex items-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                          Expert
                        </span>
                        {expertData && (
                          <span className="ml-2 text-sm text-gray-500">
                            ${expertData.pricePerHour}/hour
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {isOwnProfile && (
                    <div className="flex space-x-3">
                      {isEditing ? (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              setIsEditing(false);
                              setFormData({
                                firstName: user.firstName || '',
                                lastName: user.lastName || '',
                                image: user.image || ''
                              });
                              setPreviewUrl(user.image || null);
                            }}
                            disabled={isLoading}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="default"
                            onClick={handleSubmit}
                            disabled={isLoading}
                          >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button variant="secondary" onClick={() => setIsEditing(true)}>
                            Edit Profile
                          </Button>
                          {user.isExpert && expertData && (
                            <Button variant="secondary" onClick={() => setIsEditingExpert(true)}>
                              Edit Expert Profile
                            </Button>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Bio */}
                {isEditingExpert && expertData ? (
                  <EditExpertProfile
                    expertData={expertData}
                    onCancel={() => setIsEditingExpert(false)}
                    onSave={() => {
                      setIsEditingExpert(false);
                      window.location.reload();
                    }}
                  />
                ) : (
                  <>
                    {expertData?.bio && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-500">{expertData.bio}</p>
                      </div>
                    )}

                    {/* Expertise Areas */}
                    {expertData?.categories && expertData.categories.length > 0 && (
                      <div className="mt-4">
                        <h3 className="text-sm font-medium text-gray-500">Expertise</h3>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {expertData.categories.map((area: string, index: number) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <div className="bg-white shadow rounded-lg divide-y divide-gray-200">
          {/* Education */}
          {expertData?.education && expertData.education.length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Education</h2>
              <ul className="space-y-4">
                {expertData.education.map((edu, index) => (
                  <li key={index} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{edu.school}</p>
                      <div className="text-gray-600">
                        {edu.school}, {edu.degree} in {edu.field} ({edu.startYear}-{edu.endYear})
                      </div>
                    </div>
                    <p className="text-sm text-gray-500">{edu.startYear}-{edu.endYear}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Certifications */}
          {expertData?.certifications && expertData.certifications.length > 0 && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Certifications</h2>
              <ul className="space-y-4">
                {expertData.certifications.map((cert, index) => (
                  <li key={index} className="flex justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{cert.name}</p>
                      <p className="text-sm text-gray-500">{cert.issuer}</p>
                    </div>
                    <p className="text-sm text-gray-500">{cert.year}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact Information */}
          {isOwnProfile && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h2>
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{user.email}</dd>
                </div>

              </dl>
            </div>
          )}

          {/* Account Settings - Only visible to the profile owner */}
          {isOwnProfile && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Account Settings</h2>
              <div className="space-y-4">
                <Button variant="secondary">Change Password</Button>
                {!user.isExpert && (
                  <div>
                    <Link href="/become-expert" passHref>
                      <Button variant="default">Become an Expert</Button>
                    </Link>
                    <p className="mt-2 text-sm text-gray-500">
                      Share your expertise and earn by helping others
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
