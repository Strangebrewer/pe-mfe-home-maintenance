import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { CREATE_VEHICLE, DELETE_VEHICLE, GET_VEHICLE, GET_VEHICLES, UPDATE_VEHICLE } from '../queries/vehicles';
import type { Vehicle } from '../../types/homeMaintenance';

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ['get-vehicles'],
    queryFn: () => gqlRequest(GET_VEHICLES).then((data) => data.getVehicles as Vehicle[]),
  });
};

export const useGetVehicle = (id: string) => {
  return useQuery({
    queryKey: ['get-vehicle', id],
    queryFn: () => gqlRequest<{ getVehicle: Vehicle }>(GET_VEHICLE, { id }).then((data) => data.getVehicle),
    enabled: !!id,
  });
};

export const useCreateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (variables: Omit<Vehicle, 'id'>) =>
      gqlRequest<{ createVehicle: Vehicle }>(CREATE_VEHICLE, variables).then((data) => data.createVehicle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-vehicles'] }),
  });
};

export const useUpdateVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...rest }: Partial<Vehicle> & { id: string }) =>
      gqlRequest<{ updateVehicle: Vehicle }>(UPDATE_VEHICLE, { id, ...rest }).then((data) => data.updateVehicle),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['get-vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['get-vehicle', data.id] });
    },
  });
};

export const useDeleteVehicle = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest(DELETE_VEHICLE, { id }).then((data) => data.deleteVehicle),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-vehicles'] }),
  });
};
