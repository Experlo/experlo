'use client';

import React, { useState, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Education, Experience, Certification } from '@/types/expert';
import { Label } from '@/shared/components/ui/Label';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import styles from './BecomeExpertForm.module.css';

interface CertificationForm extends Omit<Certification, 'createdAt' | 'updatedAt'> {
  id: string;
  name: string;
  issuer: string;
  year: number;
  expertId: string;
  issuingOrganization: string;
  issueDate: string;
}

export interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  title?: string;
  bio?: string;
  categories: string[];
  pricePerHour: number;
  education: Education[];
  experience: Experience[];
  certifications: CertificationForm[];
}

interface BecomeExpertFormProps {
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BecomeExpertForm({ onSave, onCancel, isLoading = false }: BecomeExpertFormProps): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    image: '',
    title: '',
    bio: '',
    categories: [],
    pricePerHour: 0,
    education: [],
    experience: [],
    certifications: [],
  });

  const [error, setError] = useState('');
  const [expandedItems, setExpandedItems] = useState<Record<'education' | 'experience' | 'certifications', number[]>>({
    education: [],
    experience: [],
    certifications: []
  });
  
  const [editingItems, setEditingItems] = useState<Record<'education' | 'experience' | 'certifications', number[]>>({
    education: [],
    experience: [],
    certifications: []
  });
  
  const [tempFormData, setTempFormData] = useState<FormData>({
    ...formData
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = (e.target as HTMLInputElement).value;
      addCategory(value);
      (e.target as HTMLInputElement).value = '';
    }
  };

  const addCategory = (value: string) => {
    const trimmedValue = value.trim();
    if (trimmedValue && !formData.categories.includes(trimmedValue)) {
      setFormData(prev => ({
        ...prev,
        categories: [...prev.categories, trimmedValue]
      }));
    }
  };

  const removeCategory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter((_, i) => i !== index)
    }));
  };

  const toggleExpanded = (type: 'education' | 'experience' | 'certifications', index: number) => {
    if (editingItems[type].includes(index)) return;
    setExpandedItems(prev => ({
      ...prev,
      [type]: prev[type].includes(index)
        ? prev[type].filter(i => i !== index)
        : [...prev[type], index]
    }));
  };

  const startEditing = (type: 'education' | 'experience' | 'certifications', index: number) => {
    setEditingItems(prev => ({
      ...prev,
      [type]: [...prev[type], index]
    }));
    setExpandedItems(prev => ({
      ...prev,
      [type]: [...prev[type], index]
    }));
    setTempFormData(prev => ({
      ...prev,
      [type]: [...formData[type]]
    }));
  };

  const cancelEditing = (type: 'education' | 'experience' | 'certifications', index: number) => {
    setEditingItems(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== index)
    }));
    setExpandedItems(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== index)
    }));
    setTempFormData(prev => ({
      ...prev,
      [type]: [...formData[type]]
    }));
  };

  const saveEditing = (type: 'education' | 'experience' | 'certifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) =>
        i === index ? tempFormData[type][i] : item
      )
    }));
    setEditingItems(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== index)
    }));
    setExpandedItems(prev => ({
      ...prev,
      [type]: prev[type].filter(i => i !== index)
    }));
  };

  const handleEducationFieldChange = (index: number, field: keyof Education, value: string | number) => {
    setTempFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => {
        if (i === index) {
          return { ...edu, [field]: value };
        }
        return edu;
      })
    }));
  };

  const addEducation = () => {
    const newEducation = { institution: '', degree: '', field: '', startYear: 0, endYear: 0 };
    const newIndex = formData.education.length;
    
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setTempFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    
    setEditingItems(prev => ({
      ...prev,
      education: [...prev.education, newIndex]
    }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
    setTempFormData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleExperienceFieldChange = (index: number, field: keyof Experience, value: string | number) => {
    setTempFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => {
        if (i === index) {
          return { ...exp, [field]: value };
        }
        return exp;
      })
    }));
  };

  const addExperience = () => {
    const newExperience = { company: '', position: '', description: '', startYear: 0, endYear: 0 };
    const newIndex = formData.experience.length;
    
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    setTempFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    
    setEditingItems(prev => ({
      ...prev,
      experience: [...prev.experience, newIndex]
    }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
    setTempFormData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const handleCertificationFieldChange = (index: number, field: keyof CertificationForm, value: string | number) => {
    setTempFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => {
        if (i === index) {
          return { ...cert, [field]: value };
        }
        return cert;
      })
    }));
  };

  const addCertification = () => {
    const newCertification = { id: '', name: '', issuer: '', year: 0, expertId: '', issuingOrganization: '', issueDate: '' };
    const newIndex = formData.certifications.length;
    
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    setTempFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    
    setEditingItems(prev => ({
      ...prev,
      certifications: [...prev.certifications, newIndex]
    }));
    startEditing('certifications', newIndex);
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
    setTempFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="title">Professional Title</Label>
          <Input
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            required
          />
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            required
            rows={4}
          />
        </div>

        <div>
          <Label htmlFor="categories">Areas of Expertise</Label>
          <div className={styles.tagsContainer}>
            {formData.categories.map((category, index) => (
              <div key={index} className={styles.tag}>
                <span className={styles.tagText}>{category}</span>
                <XCircleIcon
                  className={styles.tagDelete}
                  onClick={() => removeCategory(index)}
                />
              </div>
            ))}
          </div>
          <Input
            id="categories"
            placeholder="Type and press Enter to add"
            onKeyDown={handleCategoryKeyDown}
          />
        </div>

        <div>
          <Label htmlFor="pricePerHour">Hourly Rate (USD)</Label>
          <Input
            id="pricePerHour"
            name="pricePerHour"
            type="number"
            value={formData.pricePerHour}
            onChange={handleInputChange}
            required
            min={0}
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Education</Label>
            <Button
              type="button"
              onClick={addEducation}
              className={styles.actionButton}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Education
            </Button>
          </div>
          {formData.education.map((edu, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  placeholder="Institution"
                  value={tempFormData.education[index]?.institution || ''}
                  onChange={(e) => handleEducationFieldChange(index, 'institution', e.target.value)}
                  disabled={!editingItems.education.includes(index)}
                />
                <Input
                  placeholder="Degree"
                  value={tempFormData.education[index]?.degree || ''}
                  onChange={(e) => handleEducationFieldChange(index, 'degree', e.target.value)}
                  disabled={!editingItems.education.includes(index)}
                />
                <Input
                  placeholder="Field of Study"
                  value={tempFormData.education[index]?.field || ''}
                  onChange={(e) => handleEducationFieldChange(index, 'field', e.target.value)}
                  disabled={!editingItems.education.includes(index)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Start Year"
                    value={tempFormData.education[index]?.startYear || ''}
                    onChange={(e) => handleEducationFieldChange(index, 'startYear', parseInt(e.target.value))}
                    disabled={!editingItems.education.includes(index)}
                  />
                  <Input
                    type="number"
                    placeholder="End Year"
                    value={tempFormData.education[index]?.endYear || ''}
                    onChange={(e) => handleEducationFieldChange(index, 'endYear', parseInt(e.target.value))}
                    disabled={!editingItems.education.includes(index)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {editingItems.education.includes(index) ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => saveEditing('education', index)}
                      className={`${styles.actionButton}`}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={() => cancelEditing('education', index)}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => startEditing('education', index)}
                      className={styles.actionButton}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeEducation(index)}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Experience</Label>
            <Button
              type="button"
              onClick={addExperience}
              className={styles.actionButton}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Experience
            </Button>
          </div>
          {formData.experience.map((exp, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  placeholder="Company"
                  value={tempFormData.experience[index]?.company || ''}
                  onChange={(e) => handleExperienceFieldChange(index, 'company', e.target.value)}
                  disabled={!editingItems.experience.includes(index)}
                />
                <Input
                  placeholder="Position"
                  value={tempFormData.experience[index]?.position || ''}
                  onChange={(e) => handleExperienceFieldChange(index, 'position', e.target.value)}
                  disabled={!editingItems.experience.includes(index)}
                />
                <Textarea
                  placeholder="Description"
                  value={tempFormData.experience[index]?.description || ''}
                  onChange={(e) => handleExperienceFieldChange(index, 'description', e.target.value)}
                  disabled={!editingItems.experience.includes(index)}
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Start Year"
                    value={tempFormData.experience[index]?.startYear || ''}
                    onChange={(e) => handleExperienceFieldChange(index, 'startYear', parseInt(e.target.value))}
                    disabled={!editingItems.experience.includes(index)}
                  />
                  <Input
                    type="number"
                    placeholder="End Year"
                    value={tempFormData.experience[index]?.endYear || ''}
                    onChange={(e) => handleExperienceFieldChange(index, 'endYear', parseInt(e.target.value))}
                    disabled={!editingItems.experience.includes(index)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {editingItems.experience.includes(index) ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => saveEditing('experience', index)}
                      className={styles.actionButton}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={() => cancelEditing('experience', index)}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => startEditing('experience', index)}
                      className={styles.actionButton}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeExperience(index)}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <Label>Certifications</Label>
            <Button
              type="button"
              onClick={addCertification}
              className={styles.actionButton}
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Certification
            </Button>
          </div>
          {formData.certifications.map((cert, index) => (
            <div key={index} className="mb-4 p-4 border rounded-lg">
              <div className="grid grid-cols-1 gap-4">
                <Input
                  placeholder="Name"
                  value={tempFormData.certifications[index]?.name || ''}
                  onChange={(e) => handleCertificationFieldChange(index, 'name', e.target.value)}
                  disabled={!editingItems.certifications.includes(index)}
                />
                <Input
                  placeholder="Issuing Organization"
                  value={tempFormData.certifications[index]?.issuingOrganization || ''}
                  onChange={(e) => handleCertificationFieldChange(index, 'issuingOrganization', e.target.value)}
                  disabled={!editingItems.certifications.includes(index)}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Year"
                    value={tempFormData.certifications[index]?.year || ''}
                    onChange={(e) => handleCertificationFieldChange(index, 'year', parseInt(e.target.value))}
                    disabled={!editingItems.certifications.includes(index)}
                  />
                  <Input
                    type="date"
                    placeholder="Issue Date"
                    value={tempFormData.certifications[index]?.issueDate || ''}
                    onChange={(e) => handleCertificationFieldChange(index, 'issueDate', e.target.value)}
                    disabled={!editingItems.certifications.includes(index)}
                  />
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-2">
                {editingItems.certifications.includes(index) ? (
                  <>
                    <Button
                      type="button"
                      onClick={() => saveEditing('certifications', index)}
                      className={styles.actionButton}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={() => cancelEditing('certifications', index)}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      type="button"
                      onClick={() => startEditing('certifications', index)}
                      className={styles.actionButton}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className={`${styles.actionButton} ${styles.cancelButton}`}
                    >
                      Remove
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="text-red-500 mb-4">{error}</div>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
            className={styles.secondaryButton}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className={styles.primaryButton}
          >
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  );
}
