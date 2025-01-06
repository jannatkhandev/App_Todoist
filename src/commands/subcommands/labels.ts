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
import { getLabelsUrl } from '../../helpers/const';

export async function labels(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  context: SlashCommandContext,
  persistence: IPersistence
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(user, getLabelsUrl());

  if (response.statusCode === HttpStatusCode.OK) {
    if (!response.data || response.data.length === 0) {
      const msg = modify
        .getCreator()
        .startMessage()
        .setText('No personal labels found. Create one using the Todoist app or website.')
        .setRoom(room);
      await modify.getNotifier().notifyUser(user, msg.getMessage());
      return;
    }

    const builder = modify.getCreator().startMessage().setRoom(room);
    const block: LayoutBlock[] = [];

    for (const label of response.data) {
      let labelNameBlock = await getSectionBlock(`${label.name}`);
      let labelContextBlock = await getContextBlock(
        `Color: ${String(label.color).charAt(0).toUpperCase() + String(label.color).slice(1)} | ` +
          `Order: ${label.order} | Favorite: ${label.is_favorite ? 'Yes' : 'No'}`
      );
      block.push(labelNameBlock, labelContextBlock);

      let shareButton = await getButton(
        MiscEnum.SHARE_LABEL_BUTTON,
        MiscEnum.LABEL_ACTIONS_BLOCK,
        MiscEnum.SHARE_LABEL_ACTION_ID,
        `${label.id}`,
        'primary'
      );
      let deleteButton = await getButton(
        MiscEnum.DELETE_LABEL_BUTTON,
        MiscEnum.LABEL_ACTIONS_BLOCK,
        MiscEnum.DELETE_LABEL_ACTION_ID,
        `${label.id}`,
        'danger'
      );
      let actionBlock = await getActionsBlock(MiscEnum.LABEL_ACTIONS_BLOCK, [
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
      .setText(`❗️ Unable to retrieve labels! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
