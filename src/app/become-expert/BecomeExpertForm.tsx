'use client';

import React, { useState, FormEvent, ChangeEvent, KeyboardEvent } from 'react';
import { Education, Experience } from '@/types/expert';
import { Label } from '@/shared/components/ui/Label';
import { Input } from '@/shared/components/ui/Input';
import { Button } from '@/shared/components/ui/Button';
import { Textarea } from '@/shared/components/ui/Textarea';
import { XCircleIcon, PlusIcon } from '@heroicons/react/24/outline';
import styles from './BecomeExpertForm.module.css';

interface Certification {
  id: string;
  name: string;
  issuer: string;
  expertId: string;
  issuingOrganization: string;
  issueDate: string;
}

export interface FormData {
  image: string;
  title: string;
  bio: string;
  categories: string[];
  pricePerHour: number;
  education: Education[];
  experience: Experience[];
  certifications: Certification[];
}

interface BecomeExpertFormProps {
  onSave: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function BecomeExpertForm({ onSave, onCancel, isLoading = false }: BecomeExpertFormProps): React.ReactElement {
  const [formData, setFormData] = useState<FormData>({
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

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const value = e.currentTarget.value.trim();
      if (value && !formData.categories.includes(value)) {
        setFormData(prev => ({ ...prev, categories: [...prev.categories, value] }));
        e.currentTarget.value = '';
      }
    } else if (e.key === 'Backspace' && e.currentTarget.value === '' && formData.categories.length > 0) {
      setFormData(prev => ({ ...prev, categories: prev.categories.slice(0, -1) }));
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
    setFormData(prev => ({ ...prev, categories: prev.categories.filter((_, i) => i !== index) }));
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
    setEditingItems(prev => ({ ...prev, [type]: [...prev[type], index] }));
    setExpandedItems(prev => ({ ...prev, [type]: [...prev[type], index] }));
    setTempFormData(prev => ({ ...prev, [type]: [...formData[type]] }));
  };

  const cancelEditing = (type: 'education' | 'experience' | 'certifications', index: number) => {
    setEditingItems(prev => ({ ...prev, [type]: prev[type].filter(i => i !== index) }));
    setExpandedItems(prev => ({ ...prev, [type]: prev[type].filter(i => i !== index) }));
    setTempFormData(prev => ({ ...prev, [type]: [...formData[type]] }));
  };

  const saveEditing = (type: 'education' | 'experience' | 'certifications', index: number) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].map((item, i) => i === index ? tempFormData[type][i] : item)
    }));
    setEditingItems(prev => ({ ...prev, [type]: prev[type].filter(i => i !== index) }));
    setExpandedItems(prev => ({ ...prev, [type]: prev[type].filter(i => i !== index) }));
  };

  const handleEducationFieldChange = (index: number, field: keyof Education, value: string | number) => {
    setTempFormData(prev => ({
      ...prev,
      education: prev.education.map((edu, i) => (i === index ? { ...edu, [field]: value } : edu))
    }));
  };

  const addEducation = () => {
    const newEducation = { institution: '', degree: '', field: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() };
    const newIndex = formData.education.length;
    
    setFormData(prev => ({ ...prev, education: [...prev.education, newEducation] }));
    setTempFormData(prev => ({ ...prev, education: [...prev.education, newEducation] }));
    
    // Automatically expand and start editing new item
    setExpandedItems(prev => ({ ...prev, education: [...prev.education, newIndex] }));
    setEditingItems(prev => ({ ...prev, education: [...prev.education, newIndex] }));
  };

  const removeEducation = (index: number) => {
    setFormData(prev => ({ ...prev, education: prev.education.filter((_, i) => i !== index) }));
  };

  const handleExperienceFieldChange = (index: number, field: keyof Experience, value: string | number) => {
    setTempFormData(prev => ({
      ...prev,
      experience: prev.experience.map((exp, i) => (i === index ? { ...exp, [field]: value } : exp))
    }));
  };

  const addExperience = () => {
    const newExperience = { company: '', position: '', description: '', startYear: new Date().getFullYear(), endYear: new Date().getFullYear() };
    const newIndex = formData.experience.length;
    
    setFormData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
    setTempFormData(prev => ({ ...prev, experience: [...prev.experience, newExperience] }));
    
    // Automatically expand and start editing new item
    setExpandedItems(prev => ({ ...prev, experience: [...prev.experience, newIndex] }));
    setEditingItems(prev => ({ ...prev, experience: [...prev.experience, newIndex] }));
  };

  const removeExperience = (index: number) => {
    setFormData(prev => ({ ...prev, experience: prev.experience.filter((_, i) => i !== index) }));
  };

  const handleCertificationFieldChange = (index: number, field: keyof Certification, value: string | number) => {
    setTempFormData(prev => ({
      ...prev,
      certifications: prev.certifications.map((cert, i) => (i === index ? { ...cert, [field]: value } : cert))
    }));
  };

  const addCertification = () => {
    const newCertification: Certification = {
      id: '',
      name: '',
      issuer: '',
      expertId: '',
      issuingOrganization: '',
      issueDate: new Date().toISOString().split('T')[0]
    };
    const newIndex = formData.certifications.length;
    
    setFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCertification] }));
    setTempFormData(prev => ({ ...prev, certifications: [...prev.certifications, newCertification] }));
    
    // Automatically expand and start editing new item
    setExpandedItems(prev => ({ ...prev, certifications: [...prev.certifications, newIndex] }));
    setEditingItems(prev => ({ ...prev, certifications: [...prev.certifications, newIndex] }));
  };

  const removeCertification = (index: number) => {
    setFormData(prev => ({ ...prev, certifications: prev.certifications.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  return (
    <div className={styles.backdrop}> 
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.form}>
          {error && (
            <div className={styles.error}>
              <XCircleIcon className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}
          
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Become an Expert</h2>
            <p className={styles.sectionSubtitle}>Complete your expert profile to start offering your expertise on our platform.</p>
  
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
                rows={4}
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
                  step="1"
                  value={formData.pricePerHour}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === '') {
                      setFormData(prev => ({ ...prev, pricePerHour: 0 }));
                      return;
                    }
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue >= 0) {
                      setFormData(prev => ({ ...prev, pricePerHour: numValue }));
                    }
                  }}
                  onBlur={(e) => {
                    const value = parseFloat(e.target.value);
                    if (!isNaN(value) && value >= 0) {
                      setFormData(prev => ({ ...prev, pricePerHour: Math.round(value * 100) / 100 }));
                    }
                  }}
                  required
                  className={styles.input}
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">This will be your standard rate for consulting sessions.</p>
            </div>
          </div>
  
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Education</h2>
            <p className={styles.sectionSubtitle}>Add your educational background and qualifications.</p>
            
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                type="button"
                className={styles.addButton}
                onClick={addEducation}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Education
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.education.map((edu, index) => {
                const isExpanded = expandedItems.education.includes(index);
                const isEditing = editingItems.education.includes(index);
                
                return (
                  <div 
                    key={index} 
                    className={`${styles.itemCard} ${!isExpanded && !isEditing ? styles.itemCardCollapsed : ''}`}
                    onClick={() => !isEditing && toggleExpanded('education', index)}
                  >
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>
                        {edu.institution || 'New Education'}
                        {edu.degree && ` - ${edu.degree}`}
                      </h3>
                      <div className={styles.itemActions}>
                        {!isExpanded && !isEditing && (
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded('education', index);
                            }}
                          >
                            View
                          </button>
                        )}
                        {isExpanded && !isEditing && (
                          <>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.editButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing('education', index);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.cancelButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeEducation(index);
                              }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {(isExpanded || isEditing) && (
                      <div className="mt-4 space-y-4">
                        {isEditing ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`education-${index}-institution`}>Institution</Label>
                                <Input
                                  id={`education-${index}-institution`}
                                  value={tempFormData.education[index]?.institution || ''}
                                  onChange={(e) => handleEducationFieldChange(index, 'institution', e.target.value)}
                                  required
                                  className={styles.input}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`education-${index}-degree`}>Degree</Label>
                                <Input
                                  id={`education-${index}-degree`}
                                  value={tempFormData.education[index]?.degree || ''}
                                  onChange={(e) => handleEducationFieldChange(index, 'degree', e.target.value)}
                                  required
                                  className={styles.input}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`education-${index}-field`}>Field of Study</Label>
                              <Input
                                id={`education-${index}-field`}
                                value={tempFormData.education[index]?.field || ''}
                                onChange={(e) => handleEducationFieldChange(index, 'field', e.target.value)}
                                required
                                className={styles.input}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`education-${index}-startYear`}>Start Year</Label>
                                <Input
                                  id={`education-${index}-startYear`}
                                  type="number"
                                  min="1900"
                                  max={new Date().getFullYear()}
                                  value={tempFormData.education[index]?.startYear || ''}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      handleEducationFieldChange(index, 'startYear', value);
                                    }
                                  }}
                                  required
                                  className={styles.input}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`education-${index}-endYear`}>End Year</Label>
                                <Input
                                  id={`education-${index}-endYear`}
                                  type="number"
                                  min="1900"
                                  max={new Date().getFullYear() + 10}
                                  value={tempFormData.education[index]?.endYear || ''}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      handleEducationFieldChange(index, 'endYear', value);
                                    }
                                  }}
                                  required
                                  className={styles.input}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                type="button"
                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                onClick={() => cancelEditing('education', index)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionButton} ${styles.saveButton}`}
                                onClick={() => saveEditing('education', index)}
                              >
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p><strong>Institution:</strong> {edu.institution}</p>
                            <p><strong>Degree:</strong> {edu.degree}</p>
                            <p><strong>Field of Study:</strong> {edu.field}</p>
                            <p><strong>Years:</strong> {edu.startYear} - {edu.endYear}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
  
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Experience</h2>
            <p className={styles.sectionSubtitle}>Add your work experience.</p>
            
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                type="button"
                className={styles.addButton}
                onClick={addExperience}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Experience
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.experience.map((exp, index) => {
                const isExpanded = expandedItems.experience.includes(index);
                const isEditing = editingItems.experience.includes(index);
                
                return (
                  <div 
                    key={index} 
                    className={`${styles.itemCard} ${!isExpanded && !isEditing ? styles.itemCardCollapsed : ''}`}
                    onClick={() => !isEditing && toggleExpanded('experience', index)}
                  >
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>
                        {exp.company || 'New Experience'}
                        {exp.position && ` - ${exp.position}`}
                      </h3>
                      <div className={styles.itemActions}>
                        {!isExpanded && !isEditing && (
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded('experience', index);
                            }}
                          >
                            View
                          </button>
                        )}
                        {isExpanded && !isEditing && (
                          <>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.editButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing('experience', index);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.cancelButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeExperience(index);
                              }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {(isExpanded || isEditing) && (
                      <div className="mt-4 space-y-4">
                        {isEditing ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`experience-${index}-company`}>Company</Label>
                                <Input
                                  id={`experience-${index}-company`}
                                  value={tempFormData.experience[index]?.company || ''}
                                  onChange={(e) => handleExperienceFieldChange(index, 'company', e.target.value)}
                                  required
                                  className={styles.input}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`experience-${index}-position`}>Position</Label>
                                <Input
                                  id={`experience-${index}-position`}
                                  value={tempFormData.experience[index]?.position || ''}
                                  onChange={(e) => handleExperienceFieldChange(index, 'position', e.target.value)}
                                  required
                                  className={styles.input}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`experience-${index}-description`}>Description</Label>
                              <Textarea
                                id={`experience-${index}-description`}
                                value={tempFormData.experience[index]?.description || ''}
                                onChange={(e) => handleExperienceFieldChange(index, 'description', e.target.value)}
                                required
                                className={styles.textarea}
                                rows={3}
                              />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`experience-${index}-startYear`}>Start Year</Label>
                                <Input
                                  id={`experience-${index}-startYear`}
                                  type="number"
                                  min="1900"
                                  max={new Date().getFullYear()}
                                  value={tempFormData.experience[index]?.startYear || ''}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      handleExperienceFieldChange(index, 'startYear', value);
                                    }
                                  }}
                                  required
                                  className={styles.input}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`experience-${index}-endYear`}>End Year</Label>
                                <Input
                                  id={`experience-${index}-endYear`}
                                  type="number"
                                  min="1900"
                                  max={new Date().getFullYear() + 10}
                                  value={tempFormData.experience[index]?.endYear || ''}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      handleExperienceFieldChange(index, 'endYear', value);
                                    }
                                  }}
                                  required
                                  className={styles.input}
                                />
                              </div>
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                type="button"
                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                onClick={() => cancelEditing('experience', index)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionButton} ${styles.saveButton}`}
                                onClick={() => saveEditing('experience', index)}
                              >
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p><strong>Company:</strong> {exp.company}</p>
                            <p><strong>Position:</strong> {exp.position}</p>
                            <p><strong>Description:</strong> {exp.description}</p>
                            <p><strong>Years:</strong> {exp.startYear} - {exp.endYear}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
  
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Certifications</h2>
            <p className={styles.sectionSubtitle}>Add any relevant certifications.</p>
            
            <div className="flex justify-between items-center mb-4">
              <div></div>
              <button
                type="button"
                className={styles.addButton}
                onClick={addCertification}
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Add Certification
              </button>
            </div>
            
            <div className="space-y-4">
              {formData.certifications.map((cert, index) => {
                const isExpanded = expandedItems.certifications.includes(index);
                const isEditing = editingItems.certifications.includes(index);
                
                return (
                  <div 
                    key={index} 
                    className={`${styles.itemCard} ${!isExpanded && !isEditing ? styles.itemCardCollapsed : ''}`}
                    onClick={() => !isEditing && toggleExpanded('certifications', index)}
                  >
                    <div className={styles.itemHeader}>
                      <h3 className={styles.itemTitle}>
                        {cert.name || 'New Certification'}
                        {cert.issuingOrganization && ` - ${cert.issuingOrganization}`}
                      </h3>
                      <div className={styles.itemActions}>
                        {!isExpanded && !isEditing && (
                          <button
                            type="button"
                            className={styles.actionButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleExpanded('certifications', index);
                            }}
                          >
                            View
                          </button>
                        )}
                        {isExpanded && !isEditing && (
                          <>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.editButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing('certifications', index);
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              className={`${styles.actionButton} ${styles.cancelButton}`}
                              onClick={(e) => {
                                e.stopPropagation();
                                removeCertification(index);
                              }}
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {(isExpanded || isEditing) && (
                      <div className="mt-4 space-y-4">
                        {isEditing ? (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor={`certification-${index}-name`}>Name</Label>
                                <Input
                                  id={`certification-${index}-name`}
                                  value={tempFormData.certifications[index]?.name || ''}
                                  onChange={(e) => handleCertificationFieldChange(index, 'name', e.target.value)}
                                  required
                                  className={styles.input}
                                />
                              </div>
                              <div>
                                <Label htmlFor={`certification-${index}-issuer`}>Issuing Organization</Label>
                                <Input
                                  id={`certification-${index}-issuer`}
                                  value={tempFormData.certifications[index]?.issuingOrganization || ''}
                                  onChange={(e) => handleCertificationFieldChange(index, 'issuingOrganization', e.target.value)}
                                  required
                                  className={styles.input}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor={`certification-${index}-date`}>Issue Date</Label>
                              <Input
                                id={`certification-${index}-date`}
                                type="date"
                                value={tempFormData.certifications[index]?.issueDate || ''}
                                onChange={(e) => handleCertificationFieldChange(index, 'issueDate', e.target.value)}
                                required
                                className={styles.input}
                              />
                            </div>
                            <div className="flex justify-end space-x-2 mt-4">
                              <button
                                type="button"
                                className={`${styles.actionButton} ${styles.cancelButton}`}
                                onClick={() => cancelEditing('certifications', index)}
                              >
                                Cancel
                              </button>
                              <button
                                type="button"
                                className={`${styles.actionButton} ${styles.saveButton}`}
                                onClick={() => saveEditing('certifications', index)}
                              >
                                Save
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="space-y-2">
                            <p><strong>Name:</strong> {cert.name}</p>
                            <p><strong>Issuing Organization:</strong> {cert.issuingOrganization}</p>
                            <p><strong>Issue Date:</strong> {new Date(cert.issueDate).toLocaleDateString()}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
  
          <div className="flex justify-end space-x-4 mt-8">
            <Button
              type="button"
              onClick={onCancel}
              className={styles.secondaryButton}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={styles.primaryButton}
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
} 