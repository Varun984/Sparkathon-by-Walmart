import { useAuth } from '@clerk/clerk-react';

export const useAuthenticatedApi = () => {
  const { getToken, sessionId } = useAuth();

  const callApi = async (endpoint: string, options: RequestInit = {}) => {
    try {
      const token = await getToken();
      
      if (!token || !sessionId) {
        throw new Error('No authentication token available');
      }
      
      const response = await fetch(`http://localhost:8000${endpoint}?session_id=${sessionId}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  };

  return { callApi };
};
