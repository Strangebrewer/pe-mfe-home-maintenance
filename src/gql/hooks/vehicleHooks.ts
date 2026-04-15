import { useQuery } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { GET_VEHICLES } from '../queries/vehicles';
import type { Vehicle } from '../../types/homeMaintenance';

export const useGetVehicles = () => {
  return useQuery({
    queryKey: ['get-vehicles'],
    queryFn: () => gqlRequest(GET_VEHICLES).then((data) => data.getVehicles as Vehicle[]),
  });
};
