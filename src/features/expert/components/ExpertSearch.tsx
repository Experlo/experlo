'use client';

import { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/shared/components/ui/Accordion';
import { Slider } from '@/shared/components/ui/Slider';
import { Button } from '@/shared/components/ui/Button';
import { Checkbox } from '@/shared/components/ui/Checkbox';
import { Label } from '@/shared/components/ui/Label';

// All possible categories from our experts
const ALL_CATEGORIES = [
  'Medical', 'Cardiology', 'Mental Health', 'Psychiatry', 
  'Legal', 'Corporate Law', 'Immigration Law', 'Business Law', 'Visa Consulting',
  'Finance', 'Investment Strategy', 'Tax Planning', 'Financial Consulting', 'Wealth Management',
  'Technology', 'Software Architecture', 'Cybersecurity', 'Cloud Computing', 'Information Security',
  'Business', 'Strategy', 'Human Resources', 'Management Consulting', 'Organizational Development',
  'Marketing', 'Digital Strategy', 'Growth Marketing', 'Brand Development',
  'Design', 'UX/UI', 'Product Design',
  'Education', 'Academic Advising', 'Language Learning', 'ESL', 'College Admissions',
  'Science', 'Environment', 'Data Science', 'Sustainability', 'Research Methods',
  'Health', 'Nutrition', 'Fitness', 'Wellness', 'Athletic Performance',
  'Arts', 'Art History', 'Music', 'Entertainment', 'Cultural Consulting'
];

interface ExpertSearchProps {
  onSearch: (params: SearchParams) => void;
}

export interface SearchParams {
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
}

export default function ExpertSearch({ onSearch }: ExpertSearchProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 300]);
  const [minRating, setMinRating] = useState(0);
  const [debouncedSearchText, setDebouncedSearchText] = useState('');
  
  // Debounce search text to avoid excessive API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText);
    }, 300); // 300ms delay
    
    return () => clearTimeout(timer);
  }, [searchText]);
  
  // Trigger search when debounced text changes
  useEffect(() => {
    triggerSearch();
  }, [debouncedSearchText]);
  
  // Group categories for better organization
  const categoryGroups = {
    'Medical & Health': ALL_CATEGORIES.filter(c => 
      ['Medical', 'Health', 'Cardiology', 'Mental Health', 'Psychiatry', 'Nutrition', 'Fitness', 'Wellness'].includes(c)),
    'Business & Finance': ALL_CATEGORIES.filter(c => 
      ['Finance', 'Business', 'Investment', 'Tax', 'Strategy', 'Management', 'Consulting'].includes(c)),
    'Technology & Design': ALL_CATEGORIES.filter(c => 
      ['Technology', 'Design', 'Software', 'UX/UI', 'Cybersecurity', 'Cloud', 'Product'].includes(c)),
    'Legal': ALL_CATEGORIES.filter(c => 
      ['Legal', 'Corporate Law', 'Immigration Law', 'Business Law', 'Visa'].includes(c)),
    'Education & Science': ALL_CATEGORIES.filter(c => 
      ['Education', 'Science', 'Academic', 'Research', 'Language', 'Data Science', 'Environment', 'Sustainability'].includes(c)),
    'Arts & Culture': ALL_CATEGORIES.filter(c => 
      ['Arts', 'Music', 'Entertainment', 'Art History', 'Cultural'].includes(c)),
  };

  // Function to trigger search with current parameters
  const triggerSearch = useCallback(() => {
    const params: SearchParams = {
      search: searchText,
      category: selectedCategory,
      minPrice: priceRange[0],
      maxPrice: priceRange[1],
      minRating: minRating,
    };
    onSearch(params);
  }, [searchText, selectedCategory, priceRange, minRating, onSearch]);
  
  // Handle search submission via form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    triggerSearch();
    
    // Close the filters panel after applying filters
    if (isFiltersOpen) {
      setIsFiltersOpen(false);
    }
  };

  // Reset all filters
  const handleReset = () => {
    setSearchText('');
    setSelectedCategory('');
    setPriceRange([0, 300]);
    setMinRating(0);
    
    // Trigger search with reset values
    onSearch({
      search: '',
      category: '',
      minPrice: 0,
      maxPrice: 300,
      minRating: 0,
    });
  };
  
  // Trigger search when filter parameters change
  useEffect(() => {
    // Only trigger for filter changes, not search text (which has its own debounce)
    if (debouncedSearchText === searchText) {
      triggerSearch();
    }
  }, [selectedCategory, priceRange, minRating]);

  return (
    <div className="w-full mb-8">
      <form onSubmit={handleSubmit}>
        {/* Search Bar */}
        <div className="relative flex items-center bg-white rounded-md border border-gray-300 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
          <div className="flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search by name, title, or expertise..."
            className="flex-1 border-none bg-transparent py-2 pl-2 outline-none focus:ring-0"
            aria-label="Search experts"
          />
          <div className="flex items-center pr-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="h-8 px-2 mr-1 cursor-pointer"
            >
              <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500" />
            </Button>
            <Button 
              type="submit" 
              variant="default" 
              size="sm"
              className="h-8 cursor-pointer"
            >
              Search
            </Button>
          </div>
        </div>

        {/* Filters Section */}
        {isFiltersOpen && (
          <div className="mt-4 p-5 border border-gray-200 rounded-md bg-gray-50 shadow-sm">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-medium text-gray-900">Filters</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="h-9 cursor-pointer"
              >
                Reset Filters
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Categories */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                  <Accordion type="single" collapsible className="w-full">
                    {Object.entries(categoryGroups).map(([groupName, categories]) => (
                      <AccordionItem value={groupName} key={groupName}>
                        <AccordionTrigger className="text-sm cursor-pointer">{groupName}</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-1">
                            {categories.map((category) => (
                              <div className="flex items-center space-x-2" key={category}>
                                <Checkbox
                                  id={`category-${category}`}
                                  checked={selectedCategory === category}
                                  onCheckedChange={() => {
                                    setSelectedCategory(
                                      selectedCategory === category ? '' : category
                                    );
                                  }}
                                />
                                <Label
                                  htmlFor={`category-${category}`}
                                  className="text-sm font-normal cursor-pointer"
                                >
                                  {category}
                                </Label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>

              <div className="space-y-6">
                {/* Price Range */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Price Range (${priceRange[0]} - ${priceRange[1]})
                  </h4>
                  <Slider
                    min={0}
                    max={500}
                    step={10}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mt-6 cursor-pointer"
                  />
                </div>

                {/* Min Rating */}
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">
                    Minimum Rating ({minRating} stars)
                  </h4>
                  <Slider
                    min={0}
                    max={5}
                    step={0.5}
                    value={[minRating]}
                    onValueChange={(value: number[]) => setMinRating(value[0])}
                    className="mt-6 cursor-pointer"
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <Button
                type="submit"
                variant="default"
                className="w-full sm:w-auto h-9 cursor-pointer"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
