import { axiosAuth } from './authClient';

const GQL_URL = process.env.GQL_URL || 'http://localhost:4000';

export async function gqlRequest<T = any>(query: string, variables?: Record<string, any>): Promise<T> {
  const response = await axiosAuth.post(GQL_URL, { query, variables });
  if (response.data.errors) {
    throw new Error(response.data.errors[0].message);
  }
  return response.data.data;
}
