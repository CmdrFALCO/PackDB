import client from './client';
import type { SourcePriority } from '@/types';

export async function getSourcePriority(): Promise<SourcePriority> {
  const response = await client.get<SourcePriority>('/preferences/sources');
  return response.data;
}

export async function updateSourcePriority(data: {
  priority_order: string[];
}): Promise<SourcePriority> {
  const response = await client.put<SourcePriority>('/preferences/sources', data);
  return response.data;
}
