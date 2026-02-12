import client from './client';
import type { TokenResponse, User } from '@/types';

export async function login(email: string, password: string): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/auth/login', {
    email,
    password,
  });
  return response.data;
}

export async function register(
  email: string,
  password: string,
  display_name: string
): Promise<TokenResponse> {
  const response = await client.post<TokenResponse>('/auth/register', {
    email,
    password,
    display_name,
  });
  return response.data;
}

export async function getMe(): Promise<User> {
  const response = await client.get<User>('/auth/me');
  return response.data;
}
