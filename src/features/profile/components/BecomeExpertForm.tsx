'use client';

import { useState, KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/Button';
import { CheckCircleIcon, PlusIcon, XMarkIcon, XCircleIcon } from '@heroicons/react/24/outline';
import { Education, Experience, Certification } from '@/types/expert';

const inputBaseClasses = "block w-full rounded-lg border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-gray-900";
const sectionClasses = "bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200";
const addButtonClasses = "inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer";

interface FormData {
  title: string;
  bio: string;
  categories: string[];
  pricePerHour: number;
  education: Omit<Education, 'id' | 'expertId' | 'createdAt' | 'updatedAt'>[];
  experience: Omit<Experience, 'id' | 'expertId' | 'createdAt' | 'updatedAt'>[];
  certifications: Omit<Certification, 'id' | 'expertId' | 'createdAt' | 'updatedAt'>[];
  isAvailable: boolean;
}

interface BecomeExpertFormProps {
  error?: string | string[] | undefined;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export default function BecomeExpertForm({ error: serverError, user }: BecomeExpertFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(serverError?.toString() || null);
  const [formData, setFormData] = useState<FormData>({
    title: '',
    bio: '',
    categories: [],
    pricePerHour: 0,
    education: [],
    experience: [],
    certifications: [],
    isAvailable: true
  });

  const addEducation = () => {
    setFormData(prev => ({
      ...prev,
      education: [
        ...prev.education,
        {
          school: '',
          degree: '',
          field: '',
          startYear: new Date().getFullYear(),
          endYear: new Date().getFullYear()
        }
      ]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const updateEducation = (index: number, field: keyof Omit<Education, 'id' | 'expertId' | 'createdAt' | 'updatedAt'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      experience: [
        ...prev.experience,
        {
          company: '',
          position: '',
          description: '',
          startYear: new Date().getFullYear(),
          endYear: new Date().getFullYear()
        }
      ]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const updateExperience = (index: number, field: keyof Omit<Experience, 'id' | 'expertId' | 'createdAt' | 'updatedAt'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) =>
        i === index ? { ...exp, [field]: value } : exp
      )
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        {
          name: '',
          issuer: '',
          year: new Date().getFullYear()
        }
      ]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const updateCertification = (index: number, field: keyof Omit<Certification, 'id' | 'expertId' | 'createdAt' | 'updatedAt'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      )
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.title || !formData.bio || formData.categories.length === 0 || formData.pricePerHour <= 0) {
        throw new Error('Please fill in all required fields');
      }

      // Validate education entries
      const invalidEducation = formData.education.some(
        edu => !edu.school || !edu.degree || !edu.field || !edu.startYear || !edu.endYear
      );
      if (invalidEducation) {
        throw new Error('Please complete all education entries');
      }

      // Validate experience entries
      const invalidExperience = formData.experience.some(
        exp => !exp.company || !exp.position || !exp.description || !exp.startYear
      );
      if (invalidExperience) {
        throw new Error('Please complete all experience entries');
      }

      // Validate certification entries
      const invalidCertifications = formData.certifications.some(
        cert => !cert.name || !cert.issuer || !cert.year
      );
      if (invalidCertifications) {
        throw new Error('Please complete all certification entries');
      }

      const response = await fetch('/api/experts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userId: user.id
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit expert application');
      }

      setIsSuccess(true);
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit expert application');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 p-8">
        <CheckCircleIcon className="h-12 w-12 text-green-500" />
        <h2 className="text-2xl font-semibold text-gray-900">
          Application Submitted Successfully!
        </h2>
        <p className="text-gray-600">Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600 mb-4">
          Become an Expert
        </h2>
        <p className="text-xl text-gray-600">
          Share your expertise with others and start earning by providing consultations.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Basic Information */}
      <div className={`${sectionClasses} space-y-6`}>
        <h3 className="text-xl font-semibold text-gray-900">Basic Information</h3>
        
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Professional Title
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
              placeholder="e.g., Senior Software Engineer"
              className={inputBaseClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="categories" className="block text-sm font-medium text-gray-700">
            Areas of Expertise
          </label>
          <div className="mt-1 relative">
            <div className={`${inputBaseClasses} min-h-[2.5rem] flex flex-wrap gap-2 p-2`}>
              {formData.categories.map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-indigo-100 text-indigo-800"
                >
                  {category}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        categories: prev.categories.filter((_, i) => i !== index)
                      }));
                    }}
                    className="ml-1.5 inline-flex items-center justify-center h-4 w-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none cursor-pointer"
                  >
                    <XCircleIcon className="h-4 w-4" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                id="categories"
                className="flex-1 outline-none bg-transparent min-w-[150px] text-sm"
                placeholder={formData.categories.length === 0 ? "e.g., JavaScript, React, Node.js (press Enter to add)" : ""}
                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter' || e.key === ',') {
                    e.preventDefault();
                    const input = e.currentTarget;
                    const value = input.value.trim();
                    if (value && !formData.categories.includes(value)) {
                      setFormData(prev => ({
                        ...prev,
                        categories: [...prev.categories, value]
                      }));
                      input.value = '';
                    }
                  } else if (e.key === 'Backspace' && e.currentTarget.value === '' && formData.categories.length > 0) {
                    setFormData(prev => ({
                      ...prev,
                      categories: prev.categories.slice(0, -1)
                    }));
                  }
                }}
              />
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio
          </label>
          <div className="mt-1">
            <textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
              required
              rows={4}
              placeholder="Tell us about your experience and what you can offer..."
              className={inputBaseClasses}
            />
          </div>
        </div>

        <div>
          <label htmlFor="pricePerHour" className="block text-sm font-medium text-gray-700">
            Hourly Rate (USD)
          </label>
          <div className="mt-1">
            <input
              type="number"
              id="pricePerHour"
              value={formData.pricePerHour}
              onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: Number(e.target.value) }))}
              required
              min="1"
              step="1"
              className={inputBaseClasses}
            />
          </div>
        </div>
      </div>

      {/* Education Section */}
      <div className={`${sectionClasses} space-y-4`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Education</h3>
          <Button type="button" onClick={addEducation} variant="outline" size="sm" className={addButtonClasses}>
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Education
          </Button>
        </div>

        {formData.education.map((edu, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4 hover:bg-white transition-colors duration-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeEducation(index)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">School</label>
                <input
                  type="text"
                  value={edu.school}
                  onChange={(e) => updateEducation(index, 'school', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Degree</label>
                <input
                  type="text"
                  value={edu.degree}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Field of Study</label>
                <input
                  type="text"
                  value={edu.field}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Year</label>
                  <input
                    type="number"
                    value={edu.startYear}
                    onChange={(e) => updateEducation(index, 'startYear', Number(e.target.value))}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className={inputBaseClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Year</label>
                  <input
                    type="number"
                    value={edu.endYear}
                    onChange={(e) => updateEducation(index, 'endYear', Number(e.target.value))}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className={inputBaseClasses}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Experience Section */}
      <div className={`${sectionClasses} space-y-4`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Experience</h3>
          <Button type="button" onClick={addExperience} variant="outline" size="sm" className={addButtonClasses}>
            <PlusIcon className="h-5 w-5 mr-1 cursor-pointer" />
            Add Experience
          </Button>
        </div>

        {formData.experience.map((exp, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4 hover:bg-white transition-colors duration-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeExperience(index)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company</label>
                <input
                  type="text"
                  value={exp.company}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Position</label>
                <input
                  type="text"
                  value={exp.position}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={exp.description}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  required
                  rows={3}
                  className={inputBaseClasses}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Start Year</label>
                  <input
                    type="number"
                    value={exp.startYear}
                    onChange={(e) => updateExperience(index, 'startYear', Number(e.target.value))}
                    required
                    min="1900"
                    max={new Date().getFullYear()}
                    className={inputBaseClasses}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">End Year</label>
                  <input
                    type="number"
                    value={exp.endYear}
                    onChange={(e) => updateExperience(index, 'endYear', Number(e.target.value))}
                    min="1900"
                    max={new Date().getFullYear()}
                    className={inputBaseClasses}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Certifications Section */}
      <div className={`${sectionClasses} space-y-4`}>
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">Certifications</h3>
          <Button type="button" onClick={addCertification} variant="outline" size="sm" className={addButtonClasses}>
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Certification
          </Button>
        </div>

        {formData.certifications.map((cert, index) => (
          <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-4 hover:bg-white transition-colors duration-200">
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => removeCertification(index)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={cert.name}
                  onChange={(e) => updateCertification(index, 'name', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Issuer</label>
                <input
                  type="text"
                  value={cert.issuer}
                  onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
                  required
                  className={inputBaseClasses}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <input
                  type="number"
                  value={cert.year}
                  onChange={(e) => updateCertification(index, 'year', Number(e.target.value))}
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  className={inputBaseClasses}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="px-6 cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="px-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700 cursor-pointer"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </Button>
      </div>
      </form>
    </div>
  );
}
