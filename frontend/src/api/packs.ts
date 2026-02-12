import client from './client';
import type { Pack, PackListResponse, PackDetailResponse } from '@/types';

export interface PackListParams {
  page?: number;
  page_size?: number;
  search?: string;
  oem?: string;
  fuel_type?: string;
  vehicle_class?: string;
  market?: string;
  year_min?: number;
  year_max?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}

export async function listPacks(params?: PackListParams): Promise<PackListResponse> {
  const response = await client.get<PackListResponse>('/packs', { params });
  return response.data;
}

export async function getPack(id: number): Promise<PackDetailResponse> {
  const response = await client.get<PackDetailResponse>(`/packs/${id}`);
  return response.data;
}

export async function createPack(data: {
  oem: string;
  model: string;
  year: number;
  variant?: string;
  market?: string;
  fuel_type?: string;
  vehicle_class?: string;
  drivetrain?: string;
  platform?: string;
}): Promise<Pack> {
  const response = await client.post<Pack>('/packs', data);
  return response.data;
}

export async function updatePack(
  id: number,
  data: Partial<{
    oem: string;
    model: string;
    year: number;
    variant: string;
    market: string;
    fuel_type: string;
    vehicle_class: string;
    drivetrain: string;
    platform: string;
  }>
): Promise<Pack> {
  const response = await client.put<Pack>(`/packs/${id}`, data);
  return response.data;
}

export async function deletePack(id: number): Promise<void> {
  await client.delete(`/packs/${id}`);
}
