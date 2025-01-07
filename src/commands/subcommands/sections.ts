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
import { getSectionsUrl } from '../../helpers/const';

export async function sections(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  context: SlashCommandContext,
  persistence: IPersistence
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(user, getSectionsUrl());

  if (response.statusCode === HttpStatusCode.OK) {
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
    const block: LayoutBlock[] = [];

    for (const section of response.data) {
      let sectionNameBlock = await getSectionBlock(`${section.name}`);
      let sectionContextBlock = await getContextBlock(
        `Project ID: ${section.project_id} | Order: ${section.order}`
      );
      block.push(sectionNameBlock, sectionContextBlock);

      let shareButton = await getButton(
        MiscEnum.SHARE_SECTION_BUTTON,
        MiscEnum.SECTION_ACTIONS_BLOCK,
        MiscEnum.SHARE_SECTION_ACTION_ID,
        `${section.id}`,
        'primary'
      );
      let deleteButton = await getButton(
        MiscEnum.DELETE_SECTION_BUTTON,
        MiscEnum.SECTION_ACTIONS_BLOCK,
        MiscEnum.DELETE_SECTION_ACTION_ID,
        `${section.id}`,
        'danger'
      );
      let actionBlock = await getActionsBlock(MiscEnum.SECTION_ACTIONS_BLOCK, [
        shareButton,
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
      .setText(`❗️ Unable to retrieve sections! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
