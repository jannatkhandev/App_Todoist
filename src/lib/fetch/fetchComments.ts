import { HttpStatusCode, IModify } from '@rocket.chat/apps-engine/definition/accessors';
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

interface IComment {
  id: string;
  content: string;
  posted_at: string;
  attachment?: {
    file_name: string;
  };
}

export async function getComments(
  app: TodoistApp,
  modify: IModify,
  context: UIKitBlockInteractionContext
): Promise<void> {
  const data = context.getInteractionData();
  const user = data.user;
  const room = data.room;
  const itemId = data.value;
  const blockId = data.blockId;

  const isProject = blockId.includes('project');
  const url = getCommentsUrl(isProject ? undefined : itemId, isProject ? itemId : undefined);

  const response = await app.getHttpHelperInstance().get(user, url);

  if (response.statusCode !== HttpStatusCode.OK) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to retrieve comments! \n Error ${JSON.stringify(response)}`)
      .setRoom(room!);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
    return;
  }

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
  const blocks = (
    await Promise.all(response.data.map((comment: IComment) => createCommentSection(comment)))
  ).reduce((acc, val) => acc.concat(val), []) as LayoutBlock[];

  builder.setBlocks(blocks);
  await modify.getNotifier().notifyUser(user, builder.getMessage());
}

async function createCommentSection(comment: IComment): Promise<LayoutBlock[]> {
  const blocks: LayoutBlock[] = [];

  const commentContentBlock = getSectionBlock(comment.content);
  const commentContextBlock = getContextBlock(
    `Posted: ${new Date(comment.posted_at).toLocaleString()}`
  );
  blocks.push(commentContentBlock, commentContextBlock);

  const shareButton = getButton({
    labelText: MiscEnum.SHARE_COMMENT_BUTTON,
    blockId: MiscEnum.COMMENT_ACTIONS_BLOCK,
    actionId: MiscEnum.SHARE_COMMENT_ACTION_ID,
    value: `${comment.id}`,
    style: 'primary',
  });

  const deleteButton = getButton({
    labelText: MiscEnum.DELETE_COMMENT_BUTTON,
    blockId: MiscEnum.COMMENT_ACTIONS_BLOCK,
    actionId: MiscEnum.DELETE_COMMENT_ACTION_ID,
    value: `${comment.id}`,
    style: 'danger',
  });

  const actionBlock = getActionsBlock(MiscEnum.COMMENT_ACTIONS_BLOCK, [shareButton, deleteButton]);
  blocks.push(actionBlock);

  if (comment.attachment) {
    const attachmentBlock = getSectionBlock(`📎 Attachment: ${comment.attachment.file_name}`);
    blocks.push(attachmentBlock);
  }

  return blocks;
}
