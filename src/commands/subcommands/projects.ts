import {
  HttpStatusCode,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { MiscEnum } from '../../enums/Misc';
import {
  getActionsBlock,
  getButton,
  getContextBlock,
  getSectionBlock,
} from '../../helpers/blockBuilder';
import { getProjectsUrl } from '../../helpers/const';
import { sendDirectMessage, sendMessage } from '../../helpers/message';

export async function projects(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  context: SlashCommandContext,
  persistence: IPersistence
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(user, getProjectsUrl());
  if (response.statusCode == HttpStatusCode.OK) {
    if (!response.data || response.data.length === 0) {
      const msg = modify
        .getCreator()
        .startMessage()
        .setText('No projects found. Create one using the Todoist app or website.')
        .setRoom(room);
      await modify.getNotifier().notifyUser(user, msg.getMessage());
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room);
    const block: LayoutBlock[] = [];
    for (const project of response.data) {
      let projectNameSectionBlock = await getSectionBlock(`${project.name}`);
      let projectDescriptionContextBlock = await getContextBlock(
        `Color: ` +
          `${String(project.color).charAt(0).toUpperCase() + String(project.color).slice(1)}` +
          ` | Favourite: ` +
          `${project.is_favourite ? 'Yes' : 'No'}`
      );
      block.push(projectNameSectionBlock, projectDescriptionContextBlock);

      let viewprojectButton = await getButton(
        MiscEnum.VIEW_PROJECT_BUTTON,
        MiscEnum.PROJECT_ACTIONS_BLOCK,
        MiscEnum.VIEW_PROJECT_ACTION_ID,
        `${project.url}`,
        'success',
        `${project.url}`
      );
      let shareprojectButton = await getButton(
        MiscEnum.SHARE_PROJECT_BUTTON,
        MiscEnum.PROJECT_ACTIONS_BLOCK,
        MiscEnum.SHARE_PROJECT_ACTION_ID,
        `${project.id}`,
        'primary'
      );
      let createtaskinprojectButton = await getButton(
        MiscEnum.CREATE_TASK_IN_PROJECT_BUTTON,
        MiscEnum.PROJECT_ACTIONS_BLOCK,
        MiscEnum.CREATE_TASK_IN_PROJECT_BUTTON_ACTION_ID,
        `${project.id}`
      );
      let getCommentsButton = await getButton(
        MiscEnum.GET_COMMENTS_BUTTON,
        MiscEnum.PROJECT_ACTIONS_BLOCK,
        MiscEnum.GET_COMMENTS_ACTION_ID,
        `${project.id}`
      );
      let projectActionBlock = await getActionsBlock(MiscEnum.PROJECT_ACTIONS_BLOCK, [
        viewprojectButton,
        shareprojectButton,
        createtaskinprojectButton,
        getCommentsButton,
      ]);
      block.push(projectActionBlock);
    }

    builder.setBlocks(block);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } else {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve projects! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
