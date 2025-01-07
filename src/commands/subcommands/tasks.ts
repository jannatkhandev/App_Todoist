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

  if (response.statusCode === HttpStatusCode.OK) {
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
    const block: LayoutBlock[] = [];

    for (const task of response.data) {
      const dueInfo = task.due ? `Due: ${task.due.string || task.due.date}` : 'No due date';

      let taskNameBlock = await getSectionBlock(`${task.content}`);
      let taskContextBlock = await getContextBlock(
        `${dueInfo} | Priority: ${task.priority} | Labels: ${task.labels.join(', ')}`
      );
      block.push(taskNameBlock, taskContextBlock);

      let viewButton = await getButton(
        MiscEnum.VIEW_TASK_BUTTON,
        MiscEnum.TASK_ACTIONS_BLOCK,
        MiscEnum.VIEW_TASK_ACTION_ID,
        `${task.url}`,
        'success',
        `${task.url}`
      );
      let shareButton = await getButton(
        MiscEnum.SHARE_TASK_BUTTON,
        MiscEnum.TASK_ACTIONS_BLOCK,
        MiscEnum.SHARE_TASK_ACTION_ID,
        `${task.id}`,
        'primary'
      );
      let getCommentsButton = await getButton(
        MiscEnum.GET_COMMENTS_BUTTON,
        MiscEnum.TASK_ACTIONS_BLOCK,
        MiscEnum.GET_COMMENTS_ACTION_ID,
        `${task.id}`
      );
      let deleteButton = await getButton(
        MiscEnum.DELETE_TASK_BUTTON,
        MiscEnum.TASK_ACTIONS_BLOCK,
        MiscEnum.DELETE_TASK_ACTION_ID,
        `${task.id}`,
        'danger'
      );
      let actionBlock = await getActionsBlock(MiscEnum.TASK_ACTIONS_BLOCK, [
        viewButton,
        shareButton,
        getCommentsButton,
        deleteButton,
      ]);
      block.push(actionBlock);
    }

    builder.setBlocks(block);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } else {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve tasks! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
