const TASK_FIELDS = `
  id homeId name frequency description lastCompletionDate
`;

export const GET_HOME_TASKS = `
  query GetHomeTasks($id: String!) {
    getHomeTasks(id: $id) {
      ${TASK_FIELDS}
    }
  }
`;

export const CREATE_HOME_TASK = `
  mutation CreateHomeTask($input: CreateHomeTaskInput!) {
    createHomeTask(input: $input) {
      ${TASK_FIELDS}
    }
  }
`;

export const UPDATE_HOME_TASK = `
  mutation UpdateHomeTask($id: String!, $input: UpdateHomeTaskInput!) {
    updateHomeTask(id: $id, input: $input) {
      ${TASK_FIELDS}
    }
  }
`;

export const DELETE_HOME_TASK = `
  mutation DeleteHomeTask($id: String!) {
    deleteHomeTask(id: $id) {
      deletedCount
    }
  }
`;
