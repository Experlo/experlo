import type { SerializedExpert } from '@/types/expert';

export async function getExpertById(id: string): Promise<SerializedExpert | null> {
  try {
    const response = await fetch(`/api/experts/${id}`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error('Failed to fetch expert');
    }
    return response.json();
  } catch (error) {
    console.error('Error fetching expert:', error);
    return null;
  }
}
