import client from './client';
import type { Domain, Field } from '@/types';

export async function listDomains(): Promise<Domain[]> {
  const response = await client.get<Domain[]>('/domains/');
  return response.data;
}

export async function listFields(domainId: number): Promise<Field[]> {
  const response = await client.get<Field[]>(`/domains/${domainId}/fields`);
  return response.data;
}

export async function createField(
  domainId: number,
  data: {
    name: string;
    display_name: string;
    unit?: string;
    data_type?: string;
    select_options?: string[];
    description?: string;
    sort_order?: number;
  }
): Promise<Field> {
  const response = await client.post<Field>(`/domains/${domainId}/fields`, data);
  return response.data;
}
