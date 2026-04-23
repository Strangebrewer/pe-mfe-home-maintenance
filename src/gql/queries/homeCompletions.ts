const COMPLETION_FIELDS = `
  id homeId taskId date cost notes
`;

export const GET_COMPLETIONS_BY_TASK = `
  query GetHomeCompletionsByTask($taskId: String!) {
    getHomeCompletionsByTask(taskId: $taskId) {
      ${COMPLETION_FIELDS}
    }
  }
`;

export const CREATE_HOME_COMPLETION = `
  mutation CreateHomeCompletion($taskId: String!, $date: String!, $cost: Float, $notes: String) {
    createHomeCompletion(taskId: $taskId, date: $date, cost: $cost, notes: $notes) {
      ${COMPLETION_FIELDS}
    }
  }
`;

export const DELETE_HOME_COMPLETION = `
  mutation DeleteHomeCompletion($id: String!) {
    deleteHomeCompletion(id: $id) {
      deletedCount
    }
  }
`;
