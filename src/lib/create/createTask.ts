import {
  HttpStatusCode,
  IHttp,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUIKitViewSubmitIncomingInteraction } from '@rocket.chat/apps-engine/definition/uikit/UIKitIncomingInteractionTypes';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../../TodoistApp';
import { ModalsEnum } from '../../enums/Modals';
import { getTasksUrl } from '../../helpers/const';

export async function createTask({
  app,
  context,
  data,
  room,
  read,
  persistence,
  modify,
  http,
}: {
  app: TodoistApp;
  context: UIKitViewSubmitInteractionContext;
  data: IUIKitViewSubmitIncomingInteraction;
  room?: IRoom;
  read: IRead;
  persistence: IPersistence;
  modify: IModify;
  http: IHttp;
}) {
  const logger = app.getLogger();
  const state = data.view.state;
  const user: IUser = context.getInteractionData().user;
  const project_id = state?.[ModalsEnum.PROJECT_ID_BLOCK]?.[ModalsEnum.PROJECT_ID_INPUT];
  const taskName = state?.[ModalsEnum.TASK_NAME_BLOCK]?.[ModalsEnum.TASK_NAME_INPUT];
  const taskPriority =
    state?.[ModalsEnum.TASK_PRIORITY_BLOCK]?.[ModalsEnum.TASK_PRIORITY_ACTION_ID];
  const taskDescription =
    state?.[ModalsEnum.TASK_DESCRIPTION_BLOCK]?.[ModalsEnum.TASK_DESCRIPTION_INPUT];
  const taskdueDate = Math.floor(
    new Date(state?.[ModalsEnum.TASK_DUE_DATE_BLOCK]?.[ModalsEnum.TASK_DUE_DATE_INPUT]).getTime() *
      1
  );
  //   const notifyUser = state?.[ModalsEnum.ASSIGNEE_NOTIFY_BLOCK]?.[ModalsEnum.ASSIGNEE_NOTIFY_ACTION_ID] == "Yes" ? "true" : "false";
  //   const assignee = state?.[ModalsEnum.TASK_ASSIGNEES_BLOCK]?.[ModalsEnum.TASK_ASSIGNEES_INPUT];
  logger.info(project_id);
  const body = {
    content: `${taskName}`,
    description: `${taskDescription}`,
    ...(project_id && { project_id }),
    due_date: taskdueDate
      ? new Date(taskdueDate).toISOString().split('T')[0] // Format as YYYY-MM-DD
      : new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
    priority: parseInt(taskPriority),
  };

  const url = getTasksUrl();
  logger.info(url);
  logger.info(body);
  const response = await app.getHttpHelperInstance().post(user, url, { data: body });
  logger.info(response.data);
  if (response.statusCode === HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(
        `✅️ Task created successfully! \n You may access it at [${taskName}](${response.data.url})`
      )
      .setRoom(room!);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  } else {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to create task! \n Error ${JSON.stringify(response)}`)
      .setRoom(room!);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
