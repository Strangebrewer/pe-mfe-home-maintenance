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
  mutation CreateVehicle($year: Float!, $make: String!, $model: String!, $mileage: Float!, $color: String, $trim: String, $plate: String, $vin: String, $insuranceId: String) {
    createVehicle(year: $year, make: $make, model: $model, mileage: $mileage, color: $color, trim: $trim, plate: $plate, vin: $vin, insuranceId: $insuranceId) {
      ${VEHICLE_FIELDS}
    }
  }
`;

export const UPDATE_VEHICLE = `
  mutation UpdateVehicle($id: String!, $year: Float, $make: String, $model: String, $mileage: Float, $color: String, $trim: String, $plate: String, $vin: String, $insuranceId: String) {
    updateVehicle(id: $id, year: $year, make: $make, model: $model, mileage: $mileage, color: $color, trim: $trim, plate: $plate, vin: $vin, insuranceId: $insuranceId) {
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
