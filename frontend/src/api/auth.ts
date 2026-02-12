import client from './client';
import type { TokenResponse, User } from '@/types';

export async function login(email: string, password: string): Promise<TokenResponse> {
  const formData = new URLSearchParams();
  formData.append('username', email);
  formData.append('password', password);

  const response = await client.post<TokenResponse>('/auth/login', formData, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return response.data;
}

export async function register(
  email: string,
  password: string,
  display_name: string
): Promise<User> {
  const response = await client.post<User>('/auth/register', {
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
