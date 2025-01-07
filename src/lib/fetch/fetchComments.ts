import {
  HttpStatusCode,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { MiscEnum } from '../../enums/Misc';
import {
  getActionsBlock,
  getButton,
  getContextBlock,
  getSectionBlock,
} from '../../helpers/blockBuilder';
import { getCommentsUrl } from '../../helpers/const';

export async function getComments(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  context: UIKitBlockInteractionContext,
  persistence: IPersistence
): Promise<void> {
  const user = context.getInteractionData().user;
  const room = context.getInteractionData().room;
  const itemId = context.getInteractionData().value;
  const blockId = context.getInteractionData().blockId;

  const isProject = blockId.includes('project');

  const url = getCommentsUrl(isProject ? undefined : itemId, isProject ? itemId : undefined);

  const response = await app.getHttpHelperInstance().get(user, url);

  if (response.statusCode === HttpStatusCode.OK) {
    if (!response.data || response.data.length === 0) {
      const msg = modify
        .getCreator()
        .startMessage()
        .setText(
          `No comments found on ${isProject ? 'project' : 'task'} ${itemId}. Create one using the Todoist app or website.`
        )
        .setRoom(room!);
      await modify.getNotifier().notifyUser(user, msg.getMessage());
      return;
    }
    const builder = modify.getCreator().startMessage().setRoom(room!);
    const block: LayoutBlock[] = [];

    for (const comment of response.data) {
      let commentContentBlock = await getSectionBlock(`${comment.content}`);
      let commentContextBlock = await getContextBlock(
        `Posted: ${new Date(comment.posted_at).toLocaleString()}`
      );
      block.push(commentContentBlock, commentContextBlock);

      let shareButton = await getButton(
        MiscEnum.SHARE_COMMENT_BUTTON,
        MiscEnum.COMMENT_ACTIONS_BLOCK,
        MiscEnum.SHARE_COMMENT_ACTION_ID,
        `${comment.id}`,
        'primary'
      );
      let deleteButton = await getButton(
        MiscEnum.DELETE_COMMENT_BUTTON,
        MiscEnum.COMMENT_ACTIONS_BLOCK,
        MiscEnum.DELETE_COMMENT_ACTION_ID,
        `${comment.id}`,
        'danger'
      );
      let actionBlock = await getActionsBlock(MiscEnum.COMMENT_ACTIONS_BLOCK, [
        shareButton,
        deleteButton,
      ]);
      block.push(actionBlock);

      if (comment.attachment) {
        let attachmentBlock = await getSectionBlock(
          `📎 Attachment: ${comment.attachment.file_name}`
        );
        block.push(attachmentBlock);
      }
    }

    builder.setBlocks(block);
    await modify.getNotifier().notifyUser(user, builder.getMessage());
  } else {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve comments! \n Error ${JSON.stringify(response)}`)
      .setRoom(room!);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
