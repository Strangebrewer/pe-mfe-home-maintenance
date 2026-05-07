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

export const buildCreateHomeTask = (frequency: HomeTaskFrequency) => {
  const freq = frequency.toUpperCase();
  return `
    mutation CreateHomeTask($homeId: String!, $name: String!, $description: String) {
      createHomeTask(homeId: $homeId, name: $name, frequency: ${freq}, description: $description) {
        ${TASK_FIELDS}
      }
    }
  `;
};

export const buildUpdateHomeTask = (frequency?: HomeTaskFrequency) => {
  const freq = frequency ? `frequency: ${frequency.toUpperCase()}, ` : '';
  return `
    mutation UpdateHomeTask($id: String!, $name: String, $description: String) {
      updateHomeTask(id: $id, ${freq}name: $name, description: $description) {
        ${TASK_FIELDS}
      }
    }
  `;
};

export const DELETE_HOME_TASK = `
  mutation DeleteHomeTask($id: String!) {
    deleteHomeTask(id: $id) {
      deletedCount
    }
  }
`;
