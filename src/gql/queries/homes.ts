const HOME_FIELDS = `
  id address isPrimary yearBuilt sqFootage notes customData
`;

export const GET_HOMES = `
  query GetHomes {
    getHomes {
      ${HOME_FIELDS}
    }
  }
`;

export const GET_HOME = `
  query GetHome($id: String!) {
    getHome(id: $id) {
      ${HOME_FIELDS}
    }
  }
`;

export const CREATE_HOME = `
  mutation CreateHome($address: String!, $yearBuilt: Float, $sqFootage: Float, $notes: String, $customData: String) {
    createHome(address: $address, yearBuilt: $yearBuilt, sqFootage: $sqFootage, notes: $notes, customData: $customData) {
      ${HOME_FIELDS}
    }
  }
`;

export const UPDATE_HOME = `
  mutation UpdateHome($id: String!, $address: String, $yearBuilt: Float, $sqFootage: Float, $notes: String, $customData: String) {
    updateHome(id: $id, address: $address, yearBuilt: $yearBuilt, sqFootage: $sqFootage, notes: $notes, customData: $customData) {
      ${HOME_FIELDS}
    }
  }
`;

export const DELETE_HOME = `
  mutation DeleteHome($id: String!) {
    deleteHome(id: $id) {
      deletedCount
    }
  }
`;

export const SET_PRIMARY_HOME = `
  mutation SetPrimaryHome($id: String!) {
    setPrimaryHome(id: $id) {
      ${HOME_FIELDS}
    }
  }
`;
