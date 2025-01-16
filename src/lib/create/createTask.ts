import { HttpStatusCode, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../../TodoistApp';
import { ModalsEnum } from '../../enums/Modals';
import { getTasksUrl } from '../../helpers/const';

export async function createTask({
  app,
  context,
  room,
  modify,
}: {
  app: TodoistApp;
  context: UIKitViewSubmitInteractionContext;
  room?: IRoom;
  modify: IModify;
}) {
  const logger = app.getLogger();
  const data = context.getInteractionData();
  const state = data.view.state;
  const user: IUser = context.getInteractionData().user;
  const project_id = state?.[ModalsEnum.PROJECT_ID_BLOCK]?.[ModalsEnum.PROJECT_ID_INPUT];
  const taskName = state?.[ModalsEnum.TASK_NAME_BLOCK]?.[ModalsEnum.TASK_NAME_INPUT];
  const taskPriority =
    state?.[ModalsEnum.TASK_PRIORITY_BLOCK]?.[ModalsEnum.TASK_PRIORITY_ACTION_ID];
  const description =
    state?.[ModalsEnum.TASK_DESCRIPTION_BLOCK]?.[ModalsEnum.TASK_DESCRIPTION_INPUT];
  const taskdueDate = Math.floor(
    new Date(state?.[ModalsEnum.TASK_DUE_DATE_BLOCK]?.[ModalsEnum.TASK_DUE_DATE_INPUT]).getTime() *
      1
  );

  if (!taskName) {
    const error = 'Task name is missing!';
    logger.error(error);
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to create task! \n Error: ${error}}`)
      .setRoom(room!);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }

  const body = {
    content: `${taskName}`,
    ...(description && { description }),
    ...(project_id && { project_id }),
    due_date: taskdueDate
      ? new Date(taskdueDate).toISOString().split('T')[0] // Formatted as YYYY-MM-DD
      : new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow's date
    priority: parseInt(taskPriority),
  };

  const url = getTasksUrl();

  const response = await app.getHttpHelperInstance().post(user, url, { data: body });

  if (response.statusCode === HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(
        `✅️ Task created successfully! \n Task: [${taskName}](${response.data.url}) | When: ${response.data.due.string}`
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
