const VEHICLE_FIELDS = `
  id year make model mileage color trim plate vin insuranceId
`;

export const GET_VEHICLES = `
  query GetVehicles {
    getVehicles {
      ${VEHICLE_FIELDS}
    }
  }
`;

export const GET_VEHICLE = `
  query GetVehicle($id: String!) {
    getVehicle(id: $id) {
      ${VEHICLE_FIELDS}
    }
  }
`;

export const CREATE_VEHICLE = `
  mutation CreateVehicle($input: CreateVehicleInput!) {
    createVehicle(input: $input) {
      ${VEHICLE_FIELDS}
    }
  }
`;

export const UPDATE_VEHICLE = `
  mutation UpdateVehicle($id: String!, $input: UpdateVehicleInput!) {
    updateVehicle(id: $id, input: $input) {
      ${VEHICLE_FIELDS}
    }
  }
`;

export const DELETE_VEHICLE = `
  mutation DeleteVehicle($id: String!) {
    deleteVehicle(id: $id) {
      deletedCount
    }
  }
`;
