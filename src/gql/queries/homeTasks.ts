import { HomeTaskFrequency } from '../../types/homeMaintenance';

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

export const buildCreateHomeTask = (frequency: HomeTaskFrequency) => `
  mutation CreateHomeTask($homeId: String!, $name: String!, $description: String) {
    createHomeTask(input: { homeId: $homeId, name: $name, frequency: ${frequency.toUpperCase()}, description: $description }) {
      ${TASK_FIELDS}
    }
  }
`;

export const buildUpdateHomeTask = (frequency?: HomeTaskFrequency) => {
  const freq = frequency ? `frequency: ${frequency.toUpperCase()}, ` : '';
  return `
    mutation UpdateHomeTask($id: String!, $name: String, $description: String) {
      updateHomeTask(id: $id, input: { ${freq}name: $name, description: $description }) {
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
