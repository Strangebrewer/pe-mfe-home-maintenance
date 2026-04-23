import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { CREATE_HOME, DELETE_HOME, GET_HOME, GET_HOMES, SET_PRIMARY_HOME, UPDATE_HOME } from '../queries/homes';
import type { Home } from '../../types/homeMaintenance';

export const useGetHomes = () => {
  return useQuery({
    queryKey: ['get-homes'],
    queryFn: () => gqlRequest(GET_HOMES).then((data) => data.getHomes as Home[]),
  });
};

export const useGetHome = (id: string) => {
  return useQuery({
    queryKey: ['get-home', id],
    queryFn: () => gqlRequest<{ getHome: Home }>(GET_HOME, { id }).then((data) => data.getHome),
    enabled: !!id,
  });
};

export const useCreateHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: Omit<Home, 'id' | 'isPrimary'>) =>
      gqlRequest<{ createHome: Home }>(CREATE_HOME, variables).then((data) => data.createHome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-homes'] }),
  });
};

export const useUpdateHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }: Partial<Home> & { id: string }) =>
      gqlRequest<{ updateHome: Home }>(UPDATE_HOME, { id, ...rest }).then((data) => data.updateHome),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['get-homes'] });
      queryClient.invalidateQueries({ queryKey: ['get-home', data.id] });
    },
  });
};

export const useDeleteHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest(DELETE_HOME, { id }).then((data) => data.deleteHome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-homes'] }),
  });
};

export const useSetPrimaryHome = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest<{ setPrimaryHome: Home }>(SET_PRIMARY_HOME, { id }).then((data) => data.setPrimaryHome),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-homes'] }),
  });
};
