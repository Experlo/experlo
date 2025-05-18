'use client';

import React, { useState, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { SerializedUser } from '@/types/user';
import { Expert, Education, Experience } from '@/types/expert';
// Simple ID generator function to replace uuid
const generateId = () => Math.random().toString(36).substring(2, 15);
import { Label } from '@/shared/components/ui/Label';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import styles from './EditProfile.module.css';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  year: number;
  expertId: string;
  issuingOrganization: string;
  issueDate: string;
  createdAt: string;
  updatedAt: string;
}

interface CertificationForm extends Omit<Certification, 'createdAt' | 'updatedAt' | 'year'> {
  id: string;
  name: string;
  issuer: string;
  expertId: string;
  issuingOrganization: string;
  issueDate: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  gender?: string | null;
  dateOfBirth?: string | null;
  title?: string;
  bio?: string;
  categories: string[];
  pricePerHour: number;
  education: Education[];
  experience: Experience[];
  certifications: CertificationForm[];
}

interface EditProfile {
  userData: SerializedUser;
  expertData?: Expert;
  onCancel: () => void;
  onSave: (data: any) => void;
  isLoading?: boolean;
}

export default function EditProfile({ userData, expertData, onCancel, onSave, isLoading = false }: EditProfile): React.ReactElement {
  // Debug user data
  console.log('User data in edit profile:', userData);
  // Check if user is an expert
  const isExpert = !!expertData;

  // Format date of birth for the date input (YYYY-MM-DD format)
  const formatDateForInput = (dateString: string | null | undefined) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };

  const [formData, setFormData] = useState<FormData>({
    firstName: userData.firstName || '',
    lastName: userData.lastName || '',
    email: userData.email || '',
    image: userData.image || '',
    gender: userData.gender || null,
    dateOfBirth: formatDateForInput(userData.dateOfBirth),
    title: isExpert && expertData?.title ? expertData.title : '',
    bio: isExpert && expertData?.bio ? expertData.bio : '',
    categories: isExpert && expertData?.categories ? expertData.categories : [],
    pricePerHour: isExpert && expertData?.pricePerHour ? expertData.pricePerHour : 0,
    education: isExpert && expertData?.education ? expertData.education.map(item => ({
      ...item,
      id: item.id || generateId(),
      // Map school to institution if institution is not present
      institution: item.institution || item.school || ''
    })) : [],
    experience: isExpert && expertData?.experience ? expertData.experience.map(item => ({
      ...item,
      id: item.id || generateId()
    })) : [],
    certifications: isExpert && expertData?.certifications ? expertData.certifications.map(item => ({
      ...item,
      id: item.id || generateId()
    })) : [],
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
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
    if (editingItems[type].includes(index)) return; // Don't toggle if editing
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
    // Copy current data to temp data
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
    // Revert changes
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
    const newEducation = { institution: '', degree: '', field: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() };
    const newIndex = formData.education.length;
    
    setFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    setTempFormData(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
    // Automatically expand and start editing new item
    setExpandedItems(prev => ({
      ...prev,
      education: [...prev.education, newIndex]
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
    const newExperience = { company: '', position: '', description: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() };
    const newIndex = formData.experience.length;
    
    setFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    setTempFormData(prev => ({
      ...prev,
      experience: [...prev.experience, newExperience]
    }));
    // Automatically expand and start editing new item
    setExpandedItems(prev => ({
      ...prev,
      experience: [...prev.experience, newIndex]
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
    const newCertification: CertificationForm = {
      id: '',
      name: '',
      issuer: '',
      expertId: '',
      issuingOrganization: '',
      issueDate: new Date().toISOString().split('T')[0]
    };
    const newIndex = formData.certifications.length;
    
    setFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    setTempFormData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCertification]
    }));
    // Automatically expand and start editing new item
    setExpandedItems(prev => ({
      ...prev,
      certifications: [...prev.certifications, newIndex]
    }));
    setEditingItems(prev => ({
      ...prev,
      certifications: [...prev.certifications, newIndex]
    }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await onSave(formData);
      onCancel();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save changes');
    }
  };

  return (
    <div className={styles.modal}>
      <div className={styles.backdrop} onClick={onCancel} />
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <XCircleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
        
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Personal Information</h2>
            <p className={styles.sectionSubtitle}>Update your personal details.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={styles.fieldGroup}>
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  placeholder="First Name"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  placeholder="Last Name"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  required
                  className={styles.input}
                />
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                disabled
                className={`${styles.input} bg-gray-100`}
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className={styles.fieldGroup}>
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth || ''}
                  onChange={handleInputChange}
                  className={styles.input}
                />
              </div>
              <div className={styles.fieldGroup}>
                <Label htmlFor="gender">Gender</Label>
                <div className="flex space-x-4 mt-2">
                  <div className="flex items-center">
                    <input
                      id="gender-male"
                      name="gender"
                      type="radio"
                      value="male"
                      checked={formData.gender === 'male'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    {/* Debug info rendered separately */}
                    <label htmlFor="gender-male" className="ml-2 block text-sm text-gray-700">
                      Male
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="gender-female"
                      name="gender"
                      type="radio"
                      value="female"
                      checked={formData.gender === 'female'}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <label htmlFor="gender-female" className="ml-2 block text-sm text-gray-700">
                      Female
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {isExpert && (
              <>
                <div className={styles.fieldGroup}>
                  <Label htmlFor="title">Professional Title</Label>
                  <Input
                    id="title"
                    name="title"
                    type="text"
                    placeholder="e.g., Senior Software Engineer, Business Consultant"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                    className={styles.input}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Label htmlFor="bio">Professional Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about your professional background, expertise, and what makes you unique..."
                    value={formData.bio}
                    onChange={handleInputChange}
                    required
                    className={styles.textarea}
                  />
                </div>

                <div className={styles.fieldGroup}>
                  <Label htmlFor="categories">Areas of Expertise</Label>
                  <div className={styles.tagsContainer}>
                    {formData.categories.map((category, index) => (
                      <div className={styles.tag} key={index}>
                        <span className={styles.tagText}>{category}</span>
                        <button
                          type="button"
                          onClick={() => removeCategory(index)}
                          className="ml-1"
                        >
                          <XCircleIcon className={styles.tagDelete} />
                        </button>
                      </div>
                    ))}
                    <input
                      type="text"
                      id="categories"
                      className={styles.tagInput}
                      placeholder={formData.categories.length === 0 ? "e.g., Business Strategy, Technology Consulting (press Enter)" : ""}
                      onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.currentTarget.value.trim();
                          if (value) {
                            addCategory(value);
                            e.currentTarget.value = '';
                          }
                        } else if (e.key === 'Backspace' && e.currentTarget.value === '' && formData.categories.length > 0) {
                          setFormData((prev) => ({
                            ...prev,
                            categories: prev.categories.slice(0, -1)
                          }));
                        }
                      }}
                    />
                  </div>
                </div>

                <div className={styles.fieldGroup}>
                  <Label htmlFor="pricePerHour">Hourly Rate (USD)</Label>
                  <div className="relative">
                    <Input
                      id="pricePerHour"
                      name="pricePerHour"
                      type="number"
                      min="0"
                      step=""
                      value={formData.pricePerHour}
                      onChange={handleInputChange}
                      required
                      onBlur={(e) => {
                        const value = parseFloat(e.target.value);
                        if (!isNaN(value) && value >= 0) {
                          setFormData(prev => ({ ...prev, pricePerHour: Math.round(value * 100) / 100 }));
                        }
                      }}
                      className={styles.input}
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">USD</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">This will be your standard rate for consulting sessions.</p>
                </div>
              </>
            )}
          </div>

          {/* Expert Profile Section */}
          {isExpert && (
            <>
              {/* Education Section */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Education</h2>
                <p className={styles.sectionSubtitle}>Add your educational background and qualifications.</p>

                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      
                    </div>
                    <button
                      type="button"
                      onClick={addEducation}
                      className={styles.addButton}
                    >
                      <PlusIcon className="h-5 w-5" />
                      Add Education
                    </button>
                  </div>
                  {formData.education.map((edu, idx) => {
                    const isExpanded = expandedItems.education.includes(idx);
                    const isEditing = editingItems.education.includes(idx);
                    const currentData = isEditing ? tempFormData.education[idx] : edu;
                    
                    return (
                      <div key={idx} className={`${styles.itemCard} ${!isExpanded ? styles.itemCardCollapsed : ''}`}>
                        <div className={styles.itemHeader}>
                          <div 
                            className={styles.itemTitle}
                            onClick={() => !isEditing && toggleExpanded('education', idx)}
                          >
                            {edu.institution || 'New Education'} - {edu.degree || 'Degree'}
                          </div>
                          <div className={styles.itemActions}>
                            {!isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditing('education', idx)}
                                  className={`${styles.actionButton} ${styles.editButton}`}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeEducation(idx)}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEditing('education', idx)}
                                  className={`${styles.actionButton} ${styles.saveButton}`}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cancelEditing('education', idx)}
                                  className={`${styles.actionButton} ${styles.cancelButton}`}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className={styles.itemContent}>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`institution-${idx}`}>Institution</Label>
                                <Input
                                  id={`institution-${idx}`}
                                  value={currentData.institution}
                                  onChange={(e) => handleEducationFieldChange(idx, 'institution', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`degree-${idx}`}>Degree</Label>
                                <Input
                                  id={`degree-${idx}`}
                                  value={currentData.degree}
                                  onChange={(e) => handleEducationFieldChange(idx, 'degree', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`field-${idx}`}>Field of Study</Label>
                                <Input
                                  id={`field-${idx}`}
                                  value={currentData.field}
                                  onChange={(e) => handleEducationFieldChange(idx, 'field', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`startYear-${idx}`}>Start Year</Label>
                                  <Input
                                    id={`startYear-${idx}`}
                                    type="date"
                                    value={currentData.startYear ? new Date(currentData.startYear, 0, 1).toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                      const date = new Date(e.target.value);
                                      handleEducationFieldChange(idx, 'startYear', date.getFullYear());
                                    }}
                                    className={styles.input}
                                    disabled={!isEditing}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`endYear-${idx}`}>End Year</Label>
                                  <Input
                                    id={`endYear-${idx}`}
                                    type="date"
                                    value={currentData.endYear ? new Date(currentData.endYear, 0, 1).toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                      const date = new Date(e.target.value);
                                      handleEducationFieldChange(idx, 'endYear', date.getFullYear());
                                    }}
                                    className={styles.input}
                                    disabled={!isEditing}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                </div>

              {/* Experience Section */}
              
                <div className={styles.section}>

                <h2 className={styles.sectionTitle}>Experience</h2>
                <p className={styles.sectionSubtitle}>Add your work experience.</p>
                {/* Experience content */}
                                {/* Experience Section */}
                                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <div></div>
                    <button
                      type="button"
                      onClick={addExperience}
                      className={styles.addButton}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Experience
                    </button>
                  </div>
                  {formData.experience.map((exp, idx) => {
                    const isExpanded = expandedItems.experience.includes(idx);
                    const isEditing = editingItems.experience.includes(idx);
                    const currentData = isEditing ? tempFormData.experience[idx] : exp;
                    
                    return (
                      <div key={idx} className={`${styles.itemCard} ${!isExpanded ? styles.itemCardCollapsed : ''}`}>
                        <div className={styles.itemHeader}>
                          <div 
                            className={styles.itemTitle}
                            onClick={() => !isEditing && toggleExpanded('experience', idx)}
                          >
                            {exp.company || 'New Experience'} - {exp.position || 'Position'}
                          </div>
                          <div className={styles.itemActions}>
                            {!isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => startEditing('experience', idx)}
                                  className={`${styles.actionButton} ${styles.editButton}`}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeExperience(idx)}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                >
                                  Delete
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => saveEditing('experience', idx)}
                                  className={`${styles.actionButton} ${styles.saveButton}`}
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => cancelEditing('experience', idx)}
                                  className={`${styles.actionButton} ${styles.cancelButton}`}
                                >
                                  Cancel
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className={styles.itemContent}>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`company-${idx}`}>Company</Label>
                                <Input
                                  id={`company-${idx}`}
                                  value={currentData.company}
                                  onChange={(e) => handleExperienceFieldChange(idx, 'company', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`position-${idx}`}>Position</Label>
                                <Input
                                  id={`position-${idx}`}
                                  value={currentData.position}
                                  onChange={(e) => handleExperienceFieldChange(idx, 'position', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor={`startYear-${idx}`}>Start Year</Label>
                                  <Input
                                    id={`startYear-${idx}`}
                                    type="date"
                                    value={currentData.startYear ? new Date(currentData.startYear, 0, 1).toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                      const date = new Date(e.target.value);
                                      handleExperienceFieldChange(idx, 'startYear', date.getFullYear());
                                    }}
                                    className={styles.input}
                                    disabled={!isEditing}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`endYear-${idx}`}>End Year</Label>
                                  <Input
                                    id={`endYear-${idx}`}
                                    type="date"
                                    value={currentData.endYear ? new Date(currentData.endYear, 0, 1).toISOString().split('T')[0] : ''}
                                    onChange={(e) => {
                                      const date = new Date(e.target.value);
                                      handleExperienceFieldChange(idx, 'endYear', date.getFullYear());
                                    }}
                                    className={styles.input}
                                    disabled={!isEditing}
                                  />
                                </div>
                              </div>
                              <div className="col-span-2">
                                <Label htmlFor={`description-${idx}`}>Description</Label>
                                <Textarea
                                  id={`description-${idx}`}
                                  value={currentData.description}
                                  onChange={(e) => handleExperienceFieldChange(idx, 'description', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Certifications Section */}
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Certifications</h2>
                <p className={styles.sectionSubtitle}>Add your certifications.</p>
                {/* Certifications content */}
                {/* Certifications */}
                <div className="mt-8">
                  <div className="flex justify-between items-center mb-4">
                    <div></div> 
                    <button
                      type="button"
                      onClick={addCertification}
                      className={styles.addButton}
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add Certification
                    </button>
                  </div>
                  {formData.certifications.map((cert, idx) => {
                    const isExpanded = expandedItems.certifications.includes(idx);
                    const isEditing = editingItems.certifications.includes(idx);
                    const currentData = isEditing ? tempFormData.certifications[idx] : cert;
                    
                    return (
                      <div key={idx} className={`${styles.itemCard} ${!isExpanded ? styles.itemCardCollapsed : ''}`}>
                        <div className={styles.itemHeader}>
                          <div 
                            className={styles.itemTitle}
                            onClick={() => !isEditing && toggleExpanded('certifications', idx)}
                          >
                            {cert.name || 'New Certification'} - {cert.issuer || 'Issuer'}
                          </div>
                          <div className={styles.itemActions}>
                            {!isEditing ? (
                              <>
                                <button
                                  type="button"
                                  onClick={() => removeCertification(idx)}
                                  className={`${styles.actionButton} ${styles.deleteButton}`}
                                >
                                  Delete
                                </button>
                                <button
                                  type="button"
                                  onClick={() => startEditing('certifications', idx)}
                                  className={`${styles.actionButton} ${styles.editButton}`}
                                >
                                  Edit
                                </button>
                              
                              </>
                            ) : (
                              <>
                              <button
                                  type="button"
                                  onClick={() => cancelEditing('certifications', idx)}
                                  className={`${styles.actionButton} ${styles.cancelButton}`}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  onClick={() => saveEditing('certifications', idx)}
                                  className={`${styles.actionButton} ${styles.saveButton}`}
                                >
                                  Save
                                </button>
                                
                              </>
                            )}
                          </div>
                        </div>
                        
                        {isExpanded && (
                          <div className={styles.itemContent}>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`certName-${idx}`}>Name</Label>
                                <Input
                                  id={`certName-${idx}`}
                                  value={currentData.name}
                                  onChange={(e) => handleCertificationFieldChange(idx, 'name', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`certIssuer-${idx}`}>Issuing Organization</Label>
                                <Input
                                  id={`certIssuer-${idx}`}
                                  value={currentData.issuer}
                                  onChange={(e) => handleCertificationFieldChange(idx, 'issuer', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`issueDate-${idx}`}>Issue Date</Label>
                                <Input
                                  id={`issueDate-${idx}`}
                                  type="date"
                                  value={currentData.issueDate || ''}
                                  onChange={(e) => handleCertificationFieldChange(idx, 'issueDate', e.target.value)}
                                  className={styles.input}
                                  disabled={!isEditing}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
              
            </>
          )}
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
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
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}


