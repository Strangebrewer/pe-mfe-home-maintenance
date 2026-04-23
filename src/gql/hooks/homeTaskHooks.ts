import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { DELETE_HOME_TASK, GET_HOME_TASKS, makeCreateHomeTask, makeUpdateHomeTask } from '../queries/homeTasks';
import type { HomeTask, HomeTaskFrequency } from '../../types/homeMaintenance';

export const useGetHomeTasks = (homeId: string | undefined) => {
  return useQuery({
    queryKey: ['get-home-tasks', homeId],
    queryFn: () =>
      gqlRequest<{ getHomeTasks: HomeTask[] }>(GET_HOME_TASKS, { homeId }).then((data) => data.getHomeTasks),
    enabled: !!homeId,
  });
};

type CreateHomeTaskInput = { homeId: string; name: string; frequency: HomeTaskFrequency; description?: string };

export const useCreateHomeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ frequency, ...rest }: CreateHomeTaskInput) =>
      gqlRequest<{ createHomeTask: HomeTask }>(makeCreateHomeTask(frequency), rest).then((data) => data.createHomeTask),
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', data.homeId] }),
  });
};

type UpdateHomeTaskInput = { id: string; homeId: string; name?: string; frequency?: HomeTaskFrequency; description?: string };

export const useUpdateHomeTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, homeId: _, frequency, ...rest }: UpdateHomeTaskInput) =>
      gqlRequest<{ updateHomeTask: HomeTask }>(makeUpdateHomeTask(frequency), { id, ...rest }).then((data) => data.updateHomeTask),
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', data.homeId] }),
  });
};

export const useDeleteHomeTask = (homeId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest(DELETE_HOME_TASK, { id }).then((data) => data.deleteHomeTask),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-home-tasks', homeId] }),
  });
};
