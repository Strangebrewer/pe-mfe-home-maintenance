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

export const CREATE_SERVICE_RECORD = `
  mutation CreateServiceRecord($input: CreateServiceRecordInput!) {
    createServiceRecord(input: $input) {
      ${SERVICE_RECORD_FIELDS}
    }
  }
`;

export const UPDATE_SERVICE_RECORD = `
  mutation UpdateServiceRecord($id: String!, $input: UpdateServiceRecordInput!) {
    updateServiceRecord(id: $id, input: $input) {
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
