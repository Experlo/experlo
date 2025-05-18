import { createContext, useContext, useEffect, useState } from 'react';
import type { User } from '@/types/schema';

interface UserContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  refetchUser: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  loading: false,
  error: null,
  refetchUser: async () => {},
});

export const useUser = () => useContext(UserContext);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching user profile...');
      const response = await fetch('/api/user/profile', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        // Try to get more detailed error information
        let errorMessage = 'Failed to fetch user data';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('API error details:', errorData);
        } catch (e) {
          console.error('Could not parse error response:', e);
        }
        
        if (response.status === 401) {
          console.log('User not authenticated (401)');
          // Not authenticated, clear user
          setUser(null);
          return;
        }
        
        throw new Error(`${errorMessage} (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('User data fetched successfully:', data);
      setUser(data);
    } catch (err) {
      console.error('Error fetching user:', err);
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetchUser: fetchUser }}>
      {children}
    </UserContext.Provider>
  );
}
