import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { CREATE_HOME_COMPLETION, DELETE_HOME_COMPLETION } from '../queries/homeCompletions';
import type { HomeCompletion } from '../../types/homeMaintenance';

type CreateCompletionInput = { taskId: string; homeId: string; date: string; cost?: number; notes?: string };

export const useCreateHomeCompletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ homeId: _, ...rest }: CreateCompletionInput) =>
      gqlRequest<{ createHomeCompletion: HomeCompletion }>(CREATE_HOME_COMPLETION, rest).then((data) => data.createHomeCompletion),
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', data.homeId] }),
  });
};

export const useDeleteHomeCompletion = (homeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest(DELETE_HOME_COMPLETION, { id }).then((data) => data.deleteHomeCompletion),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', homeId] }),
  });
};
