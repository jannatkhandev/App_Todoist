import {
  HttpStatusCode,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { MiscEnum } from '../../enums/Misc';
import {
  getActionsBlock,
  getButton,
  getContextBlock,
  getSectionBlock,
} from '../../helpers/blockBuilder';
import { getTasksUrl } from '../../helpers/const';
import { ITask } from '../../interfaces/tasks';

export async function tasks(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  context: SlashCommandContext,
  persistence: IPersistence
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(user, getTasksUrl());

  if (response.statusCode !== HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve tasks! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

  if (!response.data || response.data.length === 0) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText('No tasks found. Create one using the Todoist app or website.')
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

  const builder = modify.getCreator().startMessage().setRoom(room);
  const blocks = (await Promise.all(response.data.map(createTaskSection))).reduce(
    (acc, val) => acc.concat(val),
    []
  ) as LayoutBlock[];

  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
}

async function createTaskSection(task: ITask): Promise<LayoutBlock[]> {
  const dueInfo = task.due ? `Due: ${task.due.string || task.due.date}` : 'No due date';

  const taskNameBlock = getSectionBlock(`${task.content}`);
  const taskContextBlock = getContextBlock(
    `${dueInfo} | Priority: ${task.priority} | Labels: ${task.labels.join(', ')}`
  );

  const viewButton = getButton({
    labelText: MiscEnum.VIEW_TASK_BUTTON,
    blockId: MiscEnum.TASK_ACTIONS_BLOCK,
    actionId: MiscEnum.VIEW_TASK_ACTION_ID,
    value: `${task.url}`,
    style: 'success',
    url: `${task.url}`,
  });

  const shareButton = getButton({
    labelText: MiscEnum.SHARE_TASK_BUTTON,
    blockId: MiscEnum.TASK_ACTIONS_BLOCK,
    actionId: MiscEnum.SHARE_TASK_ACTION_ID,
    value: `${task.id}`,
    style: 'primary',
  });

  const getCommentsButton = getButton({
    labelText: MiscEnum.GET_COMMENTS_BUTTON,
    blockId: MiscEnum.TASK_ACTIONS_BLOCK,
    actionId: MiscEnum.GET_COMMENTS_ACTION_ID,
    value: `${task.id}`,
  });

  const deleteButton = getButton({
    labelText: MiscEnum.DELETE_TASK_BUTTON,
    blockId: MiscEnum.TASK_ACTIONS_BLOCK,
    actionId: MiscEnum.DELETE_TASK_ACTION_ID,
    value: `${task.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(MiscEnum.TASK_ACTIONS_BLOCK, [
    viewButton,
    shareButton,
    getCommentsButton,
    deleteButton,
  ]);

  return [taskNameBlock, taskContextBlock, actionBlock];
}
