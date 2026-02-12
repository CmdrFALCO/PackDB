import client from './client';
import type { FieldValue } from '@/types';

export async function createValue(
  packId: number,
  data: {
    field_id: number;
    value_text: string;
    source_type: string;
    source_detail: string;
  }
): Promise<FieldValue> {
  const response = await client.post<FieldValue>(`/packs/${packId}/values`, data);
  return response.data;
}

export async function updateValue(
  valueId: number,
  data: {
    value_text?: string;
    source_detail?: string;
  }
): Promise<FieldValue> {
  const response = await client.put<FieldValue>(`/values/${valueId}`, data);
  return response.data;
}

export async function deleteValue(valueId: number): Promise<void> {
  await client.delete(`/values/${valueId}`);
}
