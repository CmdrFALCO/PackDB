import client from './client';
import type { CompareResponse } from '@/types';

export async function comparePacks(ids: number[]): Promise<CompareResponse> {
  const response = await client.get<CompareResponse>('/compare', {
    params: { ids: ids.join(',') },
  });
  return response.data;
}
