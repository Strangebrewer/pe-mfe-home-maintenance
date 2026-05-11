import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import {
  CREATE_VEHICLE,
  DELETE_VEHICLE,
  GET_VEHICLE,
  GET_VEHICLES,
  UPDATE_VEHICLE,
} from '../queries/vehicles';
import type { Vehicle } from '../../types/homeMaintenance';

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ['get-vehicles'],
    queryFn: async () => {
      const response = await gqlRequest(GET_VEHICLES);
      return response.getVehicles as Vehicle[];
    },
  });
};

export const useGetVehicle = (id: string) => {
  return useQuery({
    queryKey: ['get-vehicle', id],
    queryFn: async () => {
      type ReturnType = { getVehicle: Vehicle };
      const response = await gqlRequest<ReturnType>(GET_VEHICLE, { id });
      return response.getVehicle;
    },
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: Omit<Vehicle, 'id'>) => {
      type ReturnType = { createVehicle: Vehicle };
      const response = await gqlRequest<ReturnType>(CREATE_VEHICLE, { input });
      return response?.createVehicle;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-vehicles'] }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Vehicle> & { id: string }) => {
      type ReturnType = { updateVehicle: Vehicle };
      const response = await gqlRequest<ReturnType>(UPDATE_VEHICLE, { id, input });
      return response?.updateVehicle;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['get-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['get-vehicle', data.id] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await gqlRequest(DELETE_VEHICLE, { id });
      return response?.deleteVehicle;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-vehicles'] }),
  });
};
