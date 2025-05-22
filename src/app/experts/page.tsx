'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ExpertCard from '@/features/expert/components/ExpertCard';
import ExpertSearch, { SearchParams } from '@/features/expert/components/ExpertSearch';
import type { SerializedExpert } from '@/types/expert';

export default function ExpertsPage() {
  const [experts, setExperts] = useState<SerializedExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false); // Separate state for search refinements
  const [error, setError] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  // Parse search parameters from URL
  const currentSearch = searchParams.get('search') || '';
  const currentCategory = searchParams.get('category') || '';
  const currentMinPrice = Number(searchParams.get('minPrice')) || 0;
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || 300;
  const currentMinRating = Number(searchParams.get('minRating')) || 0;

  const fetchExperts = async (params?: SearchParams, isRefinement = false) => {
    // Only set loading to true on initial load, not for search refinements
    if (!isRefinement) {
      setLoading(true);
    } else {
      setSearching(true); // Use the searching state for refinements
    }
    
    try {
      // Construct the query string
      const queryParams = new URLSearchParams();
      
      if (params) {
        if (params.search) queryParams.set('search', params.search);
        if (params.category) queryParams.set('category', params.category);
        if (params.minPrice > 0) queryParams.set('minPrice', params.minPrice.toString());
        if (params.maxPrice < 300) queryParams.set('maxPrice', params.maxPrice.toString());
        if (params.minRating > 0) queryParams.set('minRating', params.minRating.toString());
      } else {
        // Use parameters from URL if no explicit params provided
        if (currentSearch) queryParams.set('search', currentSearch);
        if (currentCategory) queryParams.set('category', currentCategory);
        if (currentMinPrice > 0) queryParams.set('minPrice', currentMinPrice.toString());
        if (currentMaxPrice < 300) queryParams.set('maxPrice', currentMaxPrice.toString());
        if (currentMinRating > 0) queryParams.set('minRating', currentMinRating.toString());
      }
      
      const queryString = queryParams.toString();
      const url = `/api/experts${queryString ? `?${queryString}` : ''}`;
      
      // Add cache: 'no-store' to ensure fresh data and prevent caching issues
      const response = await fetch(url, { cache: 'no-store' });
      
      // Check the content type to ensure we're getting JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      if (!response.ok) {
        console.error(`API error: ${response.status} ${response.statusText}`);
        setError(`Error ${response.status}: Failed to fetch experts`);
        setExperts([]);
        return;
      }
      
      // If it's not JSON, don't try to parse it
      if (!isJson) {
        console.error('Response is not JSON:', contentType);
        setError('The API returned an invalid format. Expected JSON but received something else.');
        setExperts([]);
        return;
      }
      
      try {
        const data = await response.json();
        if (Array.isArray(data)) {
          setExperts(data);
          setError(null);
        } else {
          console.error('API returned non-array data:', data);
          setError('Invalid data format received from the server');
          setExperts([]);
        }
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        setError('Failed to parse the response from the server. Please try again later.');
        setExperts([]);
      }
    } catch (error) {
      console.error('Error fetching experts:', error);
      setError('Failed to load experts. Please try again later.');
    } finally {
      setLoading(false);
      setSearching(false);
    }
  };

  // Handle search and filter
  const handleSearch = (params: SearchParams) => {
    // Update URL with search parameters
    const queryParams = new URLSearchParams();
    if (params.search) queryParams.set('search', params.search);
    if (params.category) queryParams.set('category', params.category);
    if (params.minPrice > 0) queryParams.set('minPrice', params.minPrice.toString());
    if (params.maxPrice < 300) queryParams.set('maxPrice', params.maxPrice.toString());
    if (params.minRating > 0) queryParams.set('minRating', params.minRating.toString());
    
    const queryString = queryParams.toString();
    router.push(`/experts${queryString ? `?${queryString}` : ''}`);
    
    // Fetch experts with the new parameters but mark it as a refinement
    // to prevent full loading state activation
    fetchExperts(params, true);
  };

  useEffect(() => {
    fetchExperts();
  }, [currentSearch, currentCategory, currentMinPrice, currentMaxPrice, currentMinRating]);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      {/* Account for fixed header with proper margin instead of padding */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16"> {/* Added margin-top for header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Our Experts</h1>
          <p className="text-lg text-gray-600">
            Connect with our top-rated experts in various fields
          </p>
        </div>
        
        {/* Search and Filter Component */}
        <ExpertSearch 
          onSearch={handleSearch}
        />

        {/* Search status indicator */}
        {searching && (
          <div className="flex justify-center items-center py-2 mb-4">
            <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-indigo-600 border-r-transparent mr-2"></div>
            <span className="text-sm text-gray-600">Updating results...</span>
          </div>
        )}
        
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-600 text-lg">{error}</p>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchExperts();
              }}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Try Again
            </button>
          </div>
        ) : loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="mt-4 h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        ) : (
          <div>
            {experts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-600">No experts found for your search criteria. Try adjusting your filters.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-600 mb-4">Found {experts.length} expert{experts.length !== 1 ? 's' : ''}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {experts.map((expert) => (
                    <ExpertCard key={expert.id} expert={expert} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
