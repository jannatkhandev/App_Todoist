import { HttpStatusCode, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { MiscEnum } from '../../enums/Misc';
import { getActionsBlock, getButton, getSectionBlock } from '../../helpers/blockBuilder';
import { getSharedLabelsUrl } from '../../helpers/const';

export async function sharedLabels(
  app: TodoistApp,
  modify: IModify,
  context: SlashCommandContext
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(
    user,
    getSharedLabelsUrl(true) // true to omit personal labels
  );

  if (response.statusCode !== HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve shared labels! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

  if (!response.data || response.data.length === 0) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(
        'No shared labels found. Shared labels appear when collaborators add labels to shared tasks.'
      )
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

  const builder = modify.getCreator().startMessage().setRoom(room);
  const headerBlock = getSectionBlock('📑 Shared Labels');
  const labelBlocks = (await Promise.all(response.data.map(createSharedLabelSection))).reduce(
    (acc, val) => acc.concat(val),
    []
  ) as LayoutBlock[];
  const blocks: LayoutBlock[] = [headerBlock, ...labelBlocks];

  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
}

async function createSharedLabelSection(labelName: string): Promise<LayoutBlock[]> {
  const labelNameBlock = getSectionBlock(labelName);

  const renameButton = getButton({
    labelText: MiscEnum.RENAME_SHARED_LABEL_BUTTON,
    blockId: MiscEnum.SHARED_LABEL_ACTIONS_BLOCK,
    actionId: MiscEnum.RENAME_SHARED_LABEL_ACTION_ID,
    value: labelName,
  });

  const removeButton = getButton({
    labelText: MiscEnum.REMOVE_SHARED_LABEL_BUTTON,
    blockId: MiscEnum.SHARED_LABEL_ACTIONS_BLOCK,
    actionId: MiscEnum.REMOVE_SHARED_LABEL_ACTION_ID,
    value: labelName,
    style: 'danger',
  });

  const convertButton = getButton({
    labelText: MiscEnum.CONVERT_TO_PERSONAL_LABEL_BUTTON,
    blockId: MiscEnum.SHARED_LABEL_ACTIONS_BLOCK,
    actionId: MiscEnum.CONVERT_TO_PERSONAL_LABEL_ACTION_ID,
    value: labelName,
    style: 'primary',
  });

  const actionBlock = getActionsBlock(MiscEnum.SHARED_LABEL_ACTIONS_BLOCK, [
    renameButton,
    removeButton,
    convertButton,
  ]);

  return [labelNameBlock, actionBlock];
}
