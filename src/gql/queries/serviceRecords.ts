import { ServiceRecordType } from '../../types/homeMaintenance';

const SERVICE_RECORD_FIELDS = `
  id vehicleId type date mileage cost name description
`;

export const GET_SERVICE_RECORDS = `
  query GetServiceRecords($id: String!) {
    getServiceRecords(id: $id) {
      ${SERVICE_RECORD_FIELDS}
    }
  }
`;

export const buildCreateServiceRecord = (type: ServiceRecordType) => `
  mutation CreateServiceRecord($id: String!, $date: String!, $mileage: Float!, $cost: Float, $name: String, $description: String) {
    createServiceRecord(id: $id, type: ${type.toUpperCase()}, date: $date, mileage: $mileage, cost: $cost, name: $name, description: $description) {
      ${SERVICE_RECORD_FIELDS}
    }
  }
`;

export const UPDATE_SERVICE_RECORD = `
  mutation UpdateServiceRecord($id: String!, $date: String, $mileage: Float, $cost: Float, $name: String, $description: String) {
    updateServiceRecord(id: $id, date: $date, mileage: $mileage, cost: $cost, name: $name, description: $description) {
      ${SERVICE_RECORD_FIELDS}
    }
  }
`;

export const DELETE_SERVICE_RECORD = `
  mutation DeleteServiceRecord($id: String!) {
    deleteServiceRecord(id: $id) {
      deletedCount
    }
  }
`;
