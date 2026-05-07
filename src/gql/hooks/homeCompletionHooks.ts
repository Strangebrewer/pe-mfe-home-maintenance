import { useMutation, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { CREATE_HOME_COMPLETION, DELETE_HOME_COMPLETION } from '../queries/homeCompletions';
import type { HomeCompletion } from '../../types/homeMaintenance';

type CreateCompletionInput = {
  taskId: string;
  date: string;
  cost?: number;
  notes?: string;
};

export const useCreateHomeCompletion = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateCompletionInput) => {
      type ReturnType = { createHomeCompletion: HomeCompletion };
      const response = await gqlRequest<ReturnType>(CREATE_HOME_COMPLETION, input);
      return response?.createHomeCompletion;
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({
        queryKey: ['get-home-tasks', data.homeId],
      }),
  });
};

export const useDeleteHomeCompletion = (homeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await gqlRequest(DELETE_HOME_COMPLETION, { id });
      return response?.deleteHomeCompletion;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', homeId] }),
  });
};
