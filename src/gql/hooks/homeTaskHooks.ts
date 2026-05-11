import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import {
  CREATE_HOME_TASK,
  DELETE_HOME_TASK,
  GET_HOME_TASKS,
  UPDATE_HOME_TASK,
} from '../queries/homeTasks';
import type { HomeTask, HomeTaskFrequency } from '../../types/homeMaintenance';

export const useGetHomeTasks = (homeId: string | undefined) => {
  return useQuery({
    queryKey: ['get-home-tasks', homeId],
    queryFn: async () => {
      type ReturnType = { getHomeTasks: HomeTask[] };
      const response = await gqlRequest<ReturnType>(GET_HOME_TASKS, { id: homeId });
      return response.getHomeTasks;
    },
    enabled: !!homeId,
  });
};

type CreateHomeTaskInput = {
  homeId: string;
  name: string;
  frequency: HomeTaskFrequency;
  description?: string;
};

export const useCreateHomeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateHomeTaskInput) => {
      type ReturnType = { createHomeTask: HomeTask };
      const response = await gqlRequest<ReturnType>(CREATE_HOME_TASK, { input });
      return response?.createHomeTask;
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['get-home-tasks', data.homeId] }),
  });
};

type UpdateHomeTaskInput = {
  id: string;
  homeId: string;
  name?: string;
  frequency?: HomeTaskFrequency;
  description?: string;
};

export const useUpdateHomeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, homeId, ...input }: UpdateHomeTaskInput) => {
      type ReturnType = { updateHomeTask: HomeTask };
      const response = await gqlRequest<ReturnType>(UPDATE_HOME_TASK, { id, input });
      return response?.updateHomeTask;
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['get-home-tasks', data.homeId] }),
  });
};

export const useDeleteHomeTask = (homeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await gqlRequest(DELETE_HOME_TASK, { id });
      return response?.deleteHomeTask;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', homeId] }),
  });
};
