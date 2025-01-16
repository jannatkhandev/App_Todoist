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
import { getSectionsUrl } from '../../helpers/const';
import { ISection } from '../../interfaces/sections';

export async function sections(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(user, getSectionsUrl());

  if (response.statusCode !== HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve sections! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

  if (!response.data || response.data.length === 0) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText('No sections found. Create one using the Todoist app or website.')
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

  const builder = modify.getCreator().startMessage().setRoom(room);
  const blocks = (await Promise.all(response.data.map(createSectionBlock))).reduce(
    (acc, val) => acc.concat(val),
    []
  ) as LayoutBlock[];

  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
}

async function createSectionBlock(section: ISection): Promise<LayoutBlock[]> {
  const sectionNameBlock = getSectionBlock(section.name);
  const sectionContextBlock = getContextBlock(
    `Project ID: ${section.project_id} | Order: ${section.order}`
  );

  const shareButton = getButton({
    labelText: MiscEnum.SHARE_SECTION_BUTTON,
    blockId: MiscEnum.SECTION_ACTIONS_BLOCK,
    actionId: MiscEnum.SHARE_SECTION_ACTION_ID,
    value: `${section.id}`,
    style: 'primary',
  });

  const deleteButton = getButton({
    labelText: MiscEnum.DELETE_SECTION_BUTTON,
    blockId: MiscEnum.SECTION_ACTIONS_BLOCK,
    actionId: MiscEnum.DELETE_SECTION_ACTION_ID,
    value: `${section.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(MiscEnum.SECTION_ACTIONS_BLOCK, [shareButton, deleteButton]);

  return [sectionNameBlock, sectionContextBlock, actionBlock];
}
