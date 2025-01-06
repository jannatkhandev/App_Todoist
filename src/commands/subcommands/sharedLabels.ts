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
import { getSharedLabelsUrl } from '../../helpers/const';

export async function sharedLabels(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  context: SlashCommandContext,
  persistence: IPersistence
): Promise<void> {
  const user = context.getSender();
  const room = context.getRoom();

  const response = await app.getHttpHelperInstance().get(
    user,
    getSharedLabelsUrl(true) // true to omit personal labels
  );

  if (response.statusCode === HttpStatusCode.OK) {
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
    const block: LayoutBlock[] = [];

    // Add header for shared labels
    block.push(await getSectionBlock('📑 Shared Labels'));

    for (const labelName of response.data) {
      let labelNameBlock = await getSectionBlock(`${labelName}`);
      block.push(labelNameBlock);

      let renameButton = await getButton(
        MiscEnum.RENAME_SHARED_LABEL_BUTTON,
        MiscEnum.SHARED_LABEL_ACTIONS_BLOCK,
        MiscEnum.RENAME_SHARED_LABEL_ACTION_ID,
        labelName
      );
      let removeButton = await getButton(
        MiscEnum.REMOVE_SHARED_LABEL_BUTTON,
        MiscEnum.SHARED_LABEL_ACTIONS_BLOCK,
        MiscEnum.REMOVE_SHARED_LABEL_ACTION_ID,
        labelName,
        'danger'
      );
      let convertButton = await getButton(
        MiscEnum.CONVERT_TO_PERSONAL_LABEL_BUTTON,
        MiscEnum.SHARED_LABEL_ACTIONS_BLOCK,
        MiscEnum.CONVERT_TO_PERSONAL_LABEL_ACTION_ID,
        labelName,
        'primary'
      );
      let actionBlock = await getActionsBlock(MiscEnum.SHARED_LABEL_ACTIONS_BLOCK, [
        renameButton,
        removeButton,
        convertButton,
      ]);
      block.push(actionBlock);
    }

    builder.setBlocks(block);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } else {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve shared labels! \n Error ${JSON.stringify(response)}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
