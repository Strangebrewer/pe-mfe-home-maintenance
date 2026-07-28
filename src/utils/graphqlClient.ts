import { axiosAuth } from './authClient';
import { baseGqlRequest } from '@bka-stuff/pe-mfe-utils';

const GQL_URL = process.env.GQL_URL || 'http://localhost:4000';

export const gqlRequest = baseGqlRequest(GQL_URL, axiosAuth);
