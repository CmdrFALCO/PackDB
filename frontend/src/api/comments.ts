import client from './client';
import type { Comment } from '@/types';

export async function listComments(valueId: number): Promise<Comment[]> {
  const response = await client.get<Comment[]>(`/values/${valueId}/comments`);
  return response.data;
}

export async function createComment(
  valueId: number,
  data: { text: string }
): Promise<Comment> {
  const response = await client.post<Comment>(`/values/${valueId}/comments`, data);
  return response.data;
}
