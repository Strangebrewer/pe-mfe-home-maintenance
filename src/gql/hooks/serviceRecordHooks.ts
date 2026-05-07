import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import {
  DELETE_SERVICE_RECORD,
  GET_SERVICE_RECORDS,
  UPDATE_SERVICE_RECORD,
  buildCreateServiceRecord,
} from '../queries/serviceRecords';
import type { ServiceRecord, ServiceRecordType } from '../../types/homeMaintenance';

export const useGetServiceRecords = (vehicleId: string | undefined) => {
  return useQuery({
    queryKey: ['get-service-records', vehicleId],
    queryFn: async () => {
      type ReturnType = { getServiceRecords: ServiceRecord[] };
      const response = await gqlRequest<ReturnType>(GET_SERVICE_RECORDS, { vehicleId });
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
    mutationFn: async ({ type, ...rest }: CreateServiceRecordInput) => {
      type ReturnType = { createServiceRecord: ServiceRecord };
      const query = buildCreateServiceRecord(type);
      const response = await gqlRequest<ReturnType>(query, rest);
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
    mutationFn: async ({ vehicleId: _, ...rest }: UpdateServiceRecordInput) => {
      type ReturnType = { updateServiceRecord: ServiceRecord };
      const response = await gqlRequest<ReturnType>(UPDATE_SERVICE_RECORD, rest);
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
