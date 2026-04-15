export const GET_VEHICLES = `
  query GetVehicles {
    getVehicles {
      id
      year
      make
      model
      mileage
      color
      trim
      plate
      vin
      insuranceId
    }
  }
`;
