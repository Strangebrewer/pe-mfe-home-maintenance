import { HomeTaskFrequency } from '../../types/homeMaintenance';

const TASK_FIELDS = `
  id homeId name frequency description lastCompletionDate
`;

export const GET_HOME_TASKS = `
  query GetHomeTasks($homeId: String!) {
    getHomeTasks(homeId: $homeId) {
      ${TASK_FIELDS}
    }
  }
`;

export const makeCreateHomeTask = (frequency: HomeTaskFrequency) => `
  mutation CreateHomeTask($homeId: String!, $name: String!, $description: String) {
    createHomeTask(homeId: $homeId, name: $name, frequency: ${frequency.toUpperCase()}, description: $description) {
      ${TASK_FIELDS}
    }
  }
`;

export const makeUpdateHomeTask = (frequency?: HomeTaskFrequency) => `
  mutation UpdateHomeTask($id: String!, $name: String, $description: String) {
    updateHomeTask(id: $id, ${frequency ? `frequency: ${frequency.toUpperCase()}, ` : ''}name: $name, description: $description) {
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
