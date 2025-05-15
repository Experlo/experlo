'use client';

import { useState } from 'react';
import { NewExpert, Education, Certification } from '@/core/types/expert';
import { Button } from '@/shared/components/ui/Button';

interface EditExpertProfileProps {
  expertData: NewExpert;
  onCancel: () => void;
  onSave: () => void;
}

export default function EditExpertProfile({ expertData, onCancel, onSave }: EditExpertProfileProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    bio: expertData.bio || '',
    expertise: expertData.expertise || [],
    minuteRate: expertData.hourlyRate || 0,
    education: expertData.education || [],
    certifications: expertData.certifications || [],
  });

  const handleExpertiseChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const expertise = e.target.value.split(',').map(item => item.trim()).filter(Boolean);
    setFormData(prev => ({ ...prev, expertise }));
  };

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
          endYear: new Date().getFullYear(),
        },
      ],
    }));
  };

  const updateEducation = (index: number, field: keyof Education, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) =>
        i === index ? { ...edu, [field]: value } : edu
      ),
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    setFormData(prev => ({
      ...prev,
      certifications: [
        ...prev.certifications,
        { name: '', issuer: '', year: new Date().getFullYear() }
      ],
    }));
  };

  const updateCertification = (index: number, field: keyof Certification, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) =>
        i === index ? { ...cert, [field]: value } : cert
      ),
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/experts/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update expert profile');
      }

      onSave();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update expert profile');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Bio */}
      <div>
        <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
          Bio
        </label>
        <textarea
          id="bio"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.bio}
          onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
        />
      </div>

      {/* Expertise */}
      <div>
        <label htmlFor="expertise" className="block text-sm font-medium text-gray-700">
          Expertise (comma-separated)
        </label>
        <textarea
          id="expertise"
          rows={2}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.expertise.join(', ')}
          onChange={handleExpertiseChange}
        />
      </div>

      {/* Minute Rate */}
      <div>
        <label htmlFor="minuteRate" className="block text-sm font-medium text-gray-700">
          Rate per minute ($)
        </label>
        <input
          type="number"
          id="minuteRate"
          min={0}
          step={0.1}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          value={formData.minuteRate}
          onChange={(e) => setFormData(prev => ({ ...prev, minuteRate: parseFloat(e.target.value) || 0 }))}
        />
      </div>

      {/* Education */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Education</h3>
          <Button
            type="button"
            variant="outline"
            onClick={addEducation}
          >
            Add Education
          </Button>
        </div>
        {formData.education.map((edu, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-md mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">School</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={edu.school}
                onChange={(e) => updateEducation(index, 'school', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Degree</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={edu.degree}
                onChange={(e) => updateEducation(index, 'degree', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Field</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={edu.field}
                onChange={(e) => updateEducation(index, 'field', e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Start Year</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={edu.startYear}
                  onChange={(e) => updateEducation(index, 'startYear', parseInt(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">End Year</label>
                <input
                  type="number"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  value={edu.endYear}
                  onChange={(e) => updateEducation(index, 'endYear', parseInt(e.target.value))}
                />
              </div>
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeEducation(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Certifications</h3>
          <Button
            type="button"
            variant="outline"
            onClick={addCertification}
          >
            Add Certification
          </Button>
        </div>
        {formData.certifications.map((cert, index) => (
          <div key={index} className="space-y-4 p-4 border rounded-md mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={cert.name}
                onChange={(e) => updateCertification(index, 'name', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Issuer</label>
              <input
                type="text"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={cert.issuer}
                onChange={(e) => updateCertification(index, 'issuer', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Year</label>
              <input
                type="number"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                value={cert.year}
                onChange={(e) => updateCertification(index, 'year', parseInt(e.target.value))}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              onClick={() => removeCertification(index)}
            >
              Remove
            </Button>
          </div>
        ))}
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </form>
  );
}
