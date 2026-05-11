import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import {
  CREATE_SERVICE_RECORD,
  DELETE_SERVICE_RECORD,
  GET_SERVICE_RECORDS,
  UPDATE_SERVICE_RECORD,
} from '../queries/serviceRecords';
import type { ServiceRecord, ServiceRecordType } from '../../types/homeMaintenance';

export const useGetServiceRecords = (vehicleId: string | undefined) => {
  return useQuery({
    queryKey: ['get-service-records', vehicleId],
    queryFn: async () => {
      type ReturnType = { getServiceRecords: ServiceRecord[] };
      const response = await gqlRequest<ReturnType>(GET_SERVICE_RECORDS, { id: vehicleId });
      return response.getServiceRecords;
    },
    enabled: !!vehicleId,
  });
};

type CreateServiceRecordInput = {
  vehicleId: string;
  type: ServiceRecordType;
  date: string;
  mileage: number;
  cost?: number;
  name?: string;
  description?: string;
};

export const useCreateServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateServiceRecordInput) => {
      type ReturnType = { createServiceRecord: ServiceRecord };
      const response = await gqlRequest<ReturnType>(CREATE_SERVICE_RECORD, { input });
      return response?.createServiceRecord;
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['get-service-records', data.vehicleId] }),
  });
};

type UpdateServiceRecordInput = {
  id: string;
  vehicleId: string;
  date?: string;
  mileage?: number;
  cost?: number;
  name?: string;
  description?: string;
};

export const useUpdateServiceRecord = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, vehicleId, ...input }: UpdateServiceRecordInput) => {
      type ReturnType = { updateServiceRecord: ServiceRecord };
      const response = await gqlRequest<ReturnType>(UPDATE_SERVICE_RECORD, { id, input });
      return response?.updateServiceRecord;
    },
    onSuccess: (data) =>
      queryClient.invalidateQueries({ queryKey: ['get-service-records', data.vehicleId] }),
  });
};

export const useDeleteServiceRecord = (vehicleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await gqlRequest(DELETE_SERVICE_RECORD, { id });
      return response?.deleteServiceRecord;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['get-service-records', vehicleId] }),
  });
};
