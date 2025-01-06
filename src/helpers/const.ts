const ApiBaseUrl: string = 'https://api.todoist.com/rest';

const ApiVersion = {
  V1: 'v1',
  V2: 'v2',
};

const ApiEndpoint = {
  Projects: 'projects',
  Sections: 'sections',
  Tasks: 'tasks',
  Comments: 'comments',
  Project: (projectId: string) => `projects/${projectId}`,
  Section: (sectionId: string) => `sections/${sectionId}`,
  Task: (taskId: string, subCommand?: 'close' | 'reopen') =>
    `tasks/${taskId}${subCommand ? `/${subCommand}` : ''}`,
  Comment: (commentId: string) => `comments/${commentId}`,
  CollaboratorsOf: (projectId: string) => `projects/${projectId}/collaborators`,
  Labels: 'labels',
  SharedLabels: 'labels/shared',
  Label: (labelId: string) => `labels/${labelId}`,
  RenameSharedLabel: 'labels/shared/rename',
  RemoveSharedLabel: 'labels/shared/remove',
};

export const getProjectsUrl = () => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Projects}`;
};

export const getSectionsUrl = () => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Sections}`;
};

export const getTasksUrl = () => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Tasks}`;
};

export const getCommentsUrl = (taskId?: string, projectId?: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Comments}${projectId ? `?project_id=${projectId}` : `?task_id=${taskId}`}`;
};

export const getCollaboratorsOfProject = (projectId: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.CollaboratorsOf(projectId)}`;
};

export const getProjectUrl = (projectId: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Project(projectId)}`;
};

export const getSectionUrl = (sectionId: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Section(sectionId)}`;
};

export const getTaskUrl = (taskId: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Task(taskId)}`;
};

export const getCommentUrl = (commentId: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Comment(commentId)}`;
};

export const getLabelsUrl = () => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Labels}`;
};

export const getSharedLabelsUrl = (omitPersonal: boolean = false) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.SharedLabels}${omitPersonal ? '?omit_personal=true' : ''}`;
};

export const getLabelUrl = (labelId: string) => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.Label(labelId)}`;
};

export const renameSharedLabelUrl = () => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.RenameSharedLabel}`;
};

export const removeSharedLabelUrl = () => {
  return `${ApiBaseUrl}/${ApiVersion.V2}/${ApiEndpoint.RemoveSharedLabel}`;
};
