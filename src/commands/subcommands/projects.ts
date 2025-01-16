import { HttpStatusCode, IModify } from '@rocket.chat/apps-engine/definition/accessors';
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
import { getProjectsUrl } from '../../helpers/const';
import { IProject } from '../../interfaces/projects';

export async function projects(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(user, getProjectsUrl());

  if (response.statusCode !== HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve projects! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

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
  const blocks = (await Promise.all(response.data.map(createProjectSection))).reduce(
    (acc, val) => acc.concat(val),
    []
  ) as LayoutBlock[];

  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
}

async function createProjectSection(project: IProject): Promise<LayoutBlock[]> {
  const projectNameSectionBlock = getSectionBlock(project.name);
  const projectDescriptionContextBlock = getContextBlock(
    `Color: ${String(project.color).charAt(0).toUpperCase() + String(project.color).slice(1)} | ` +
      `Favourite: ${project.is_favorite ? 'Yes' : 'No'}`
  );

  const viewProjectButton = getButton({
    labelText: MiscEnum.VIEW_PROJECT_BUTTON,
    blockId: MiscEnum.PROJECT_ACTIONS_BLOCK,
    actionId: MiscEnum.VIEW_PROJECT_ACTION_ID,
    value: `${project.url}`,
    style: 'success',
    url: `${project.url}`,
  });

  const shareProjectButton = getButton({
    labelText: MiscEnum.SHARE_PROJECT_BUTTON,
    blockId: MiscEnum.PROJECT_ACTIONS_BLOCK,
    actionId: MiscEnum.SHARE_PROJECT_ACTION_ID,
    value: `${project.id}`,
    style: 'primary',
  });

  const createTaskInProjectButton = getButton({
    labelText: MiscEnum.CREATE_TASK_IN_PROJECT_BUTTON,
    blockId: MiscEnum.PROJECT_ACTIONS_BLOCK,
    actionId: MiscEnum.CREATE_TASK_IN_PROJECT_BUTTON_ACTION_ID,
    value: `${project.id}`,
  });

  const getCommentsButton = getButton({
    labelText: MiscEnum.GET_COMMENTS_BUTTON,
    blockId: MiscEnum.PROJECT_ACTIONS_BLOCK,
    actionId: MiscEnum.GET_COMMENTS_ACTION_ID,
    value: `${project.id}`,
  });

  const projectActionBlock = getActionsBlock(MiscEnum.PROJECT_ACTIONS_BLOCK, [
    viewProjectButton,
    shareProjectButton,
    createTaskInProjectButton,
    getCommentsButton,
  ]);

  return [projectNameSectionBlock, projectDescriptionContextBlock, projectActionBlock];
}
