import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import {
  CREATE_HOME,
  DELETE_HOME,
  GET_HOME,
  GET_HOMES,
  SET_PRIMARY_HOME,
  UPDATE_HOME,
} from '../queries/homes';
import type { Home } from '../../types/homeMaintenance';

export const useGetHomes = () => {
  return useQuery({
    queryKey: ['get-homes'],
    queryFn: async () => {
      const response = await gqlRequest(GET_HOMES);
      return response.getHomes;
    },
  });
};

export const useGetHome = (id: string) => {
  return useQuery({
    queryKey: ['get-home', id],
    queryFn: async () => {
      type ReturnType = { getHome: Home };
      const response = await gqlRequest<ReturnType>(GET_HOME, { id });
      return response.getHome;
    },
    enabled: !!id,
  });
};

export const useCreateHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (variables: Omit<Home, 'id' | 'isPrimary'>) => {
      type ReturnType = { createHome: Home };
      const response = await gqlRequest<ReturnType>(CREATE_HOME, variables);
      return response?.createHome;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-homes'] }),
  });
};

export const useUpdateHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...rest }: Partial<Home> & { id: string }) => {
      type ReturnType = { updateHome: Home };
      const response = await gqlRequest<ReturnType>(UPDATE_HOME, { id, ...rest });
      return response?.updateHome;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['get-homes'] });
      queryClient.invalidateQueries({ queryKey: ['get-home', data.id] });
    },
  });
};

export const useDeleteHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await gqlRequest(DELETE_HOME, { id });
      return response?.deleteHome;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-homes'] }),
  });
};

export const useSetPrimaryHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      type ReturnType = { setPrimaryHome: Home };
      const response = await gqlRequest<ReturnType>(SET_PRIMARY_HOME, { id });
      return response?.setPrimaryHome;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-homes'] }),
  });
};
