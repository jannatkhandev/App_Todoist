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
import { ILabel } from '../../interfaces/labels';

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

  if (response.statusCode !== HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve labels! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

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
  const blocks = (await Promise.all(response.data.map(createLabelSection))).reduce(
    (acc, val) => acc.concat(val),
    []
  ) as LayoutBlock[];
  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
}

async function createLabelSection(label: ILabel): Promise<LayoutBlock[]> {
  const labelNameBlock = getSectionBlock(`${label.name}`);
  const labelContextBlock = getContextBlock(
    `Color: ${String(label.color).charAt(0).toUpperCase() + String(label.color).slice(1)} | ` +
      `Order: ${label.order} | Favorite: ${label.is_favorite ? 'Yes' : 'No'}`
  );

  const shareButton = getButton({
    labelText: MiscEnum.SHARE_LABEL_BUTTON,
    blockId: MiscEnum.LABEL_ACTIONS_BLOCK,
    actionId: MiscEnum.SHARE_LABEL_ACTION_ID,
    value: `${label.id}`,
    style: 'primary',
  });

  const deleteButton = getButton({
    labelText: MiscEnum.DELETE_LABEL_BUTTON,
    blockId: MiscEnum.LABEL_ACTIONS_BLOCK,
    actionId: MiscEnum.DELETE_LABEL_ACTION_ID,
    value: `${label.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(MiscEnum.LABEL_ACTIONS_BLOCK, [shareButton, deleteButton]);

  return [labelNameBlock, labelContextBlock, actionBlock];
}
