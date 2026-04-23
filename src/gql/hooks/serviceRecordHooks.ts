import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { DELETE_SERVICE_RECORD, GET_SERVICE_RECORDS, UPDATE_SERVICE_RECORD, makeCreateServiceRecord } from '../queries/serviceRecords';
import type { ServiceRecord, ServiceRecordType } from '../../types/homeMaintenance';

export const useGetServiceRecords = (vehicleId: string | undefined) => {
  return useQuery({
    queryKey: ['get-service-records', vehicleId],
    queryFn: () =>
      gqlRequest<{ getServiceRecords: ServiceRecord[] }>(GET_SERVICE_RECORDS, { vehicleId }).then((data) => data.getServiceRecords),
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
    mutationFn: ({ type, ...rest }: CreateServiceRecordInput) =>
      gqlRequest<{ createServiceRecord: ServiceRecord }>(makeCreateServiceRecord(type), rest).then((data) => data.createServiceRecord),
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['get-service-records', data.vehicleId] }),
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
    mutationFn: ({ vehicleId: _, ...rest }: UpdateServiceRecordInput) =>
      gqlRequest<{ updateServiceRecord: ServiceRecord }>(UPDATE_SERVICE_RECORD, rest).then((data) => data.updateServiceRecord),
    onSuccess: (data) => queryClient.invalidateQueries({ queryKey: ['get-service-records', data.vehicleId] }),
  });
};

export const useDeleteServiceRecord = (vehicleId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      gqlRequest(DELETE_SERVICE_RECORD, { id }).then((data) => data.deleteServiceRecord),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['get-service-records', vehicleId] }),
  });
};
