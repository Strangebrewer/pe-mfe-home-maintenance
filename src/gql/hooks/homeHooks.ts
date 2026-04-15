import { useQuery } from '@tanstack/react-query';
import { gqlRequest } from '../../utils/graphqlClient';
import { GET_HOMES } from '../queries/homes';
import type { Home } from '../../types/homeMaintenance';

export const useGetHomes = () => {
  return useQuery({
    queryKey: ['get-homes'],
    queryFn: () => gqlRequest(GET_HOMES).then((data) => data.getHomes as Home[]),
  });
};
