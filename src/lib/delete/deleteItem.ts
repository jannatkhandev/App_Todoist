import { HttpStatusCode, IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
  UIKitBlockInteractionContext,
  UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../../TodoistApp';
import { MiscEnum } from '../../enums/Misc';
import { getCommentUrl, getLabelUrl, getSectionUrl, getTaskUrl } from '../../helpers/const';
import { deleteConfirmationModal } from '../../modals/deleteConfirmationModal';

interface DeleteItemParams {
  app: TodoistApp;
  context: UIKitViewSubmitInteractionContext;
  room: IRoom;
  read: IRead;
  modify: IModify;
  getUrl: (id?: string) => string;
  itemType: string;
}

interface DeleteHandlerParams {
  context: UIKitViewSubmitInteractionContext;
  room: IRoom;
  read: IRead;
  modify: IModify;
  app?: TodoistApp;
}

export async function deleteItem({
  app,
  context,
  room,
  read,
  modify,
  getUrl,
  itemType,
}: DeleteItemParams) {
  const data = context.getInteractionData();
  const itemId = data.view.submit!.value;
  const user = data.user;
  const roomId = room.id;
  let roomFromId = await read.getRoomReader().getById(roomId);
  if (!room) room = roomFromId!;
  try {
    const response = await app.getHttpHelperInstance().delete(user, getUrl(itemId));

    if (response.statusCode === HttpStatusCode.NO_CONTENT) {
      const successMessage = modify
        .getCreator()
        .startMessage()
        .setText(`✅ ${itemType} deleted successfully!`)
        .setRoom(room);
      await modify.getNotifier().notifyUser(user, successMessage.getMessage());
    } else {
      throw new Error(response.data?.err || 'Unknown error occurred');
    }
  } catch (error) {
    const errorMessage = modify
      .getCreator()
      .startMessage()
      .setText(`❗️ Unable to delete ${itemType}! \nError: ${error.message}`)
      .setRoom(room);
    await modify.getNotifier().notifyUser(user, errorMessage.getMessage());
  }
}

export async function deleteTask(params: DeleteHandlerParams) {
  return deleteItem({
    ...params,
    getUrl: getTaskUrl,
    itemType: 'Task',
    app: params.app!,
  });
}

export async function deleteSection(params: DeleteHandlerParams) {
  return deleteItem({
    ...params,
    getUrl: getSectionUrl,
    itemType: 'Section',
    app: params.app!,
  });
}

export async function deleteLabel(params: DeleteHandlerParams) {
  return deleteItem({
    ...params,
    getUrl: getLabelUrl,
    itemType: 'Label',
    app: params.app!,
  });
}

export async function deleteComment(params: DeleteHandlerParams) {
  return deleteItem({
    ...params,
    getUrl: getCommentUrl,
    itemType: 'Comment',
    app: params.app!,
  });
}

export async function handleDeleteAction(
  app: TodoistApp,
  context: UIKitBlockInteractionContext,
  modify: IModify
): Promise<void> {
  const data = context.getInteractionData();
  const actionId = data.actionId;
  const itemId = data.value!;
  const user = data.user;
  const roomId = data.room!.id;

  try {
    let itemType: string;
    let itemName: string;

    // Get item details based on action type
    switch (actionId) {
      case MiscEnum.DELETE_TASK_ACTION_ID:
        itemType = 'Task';
        const taskResponse = await app.getHttpHelperInstance().get(user, getTaskUrl(itemId));
        itemName = taskResponse.data.content;
        break;

      case MiscEnum.DELETE_SECTION_ACTION_ID:
        itemType = 'Section';
        const sectionResponse = await app.getHttpHelperInstance().get(user, getSectionUrl(itemId));
        itemName = sectionResponse.data.name;
        break;

      case MiscEnum.DELETE_LABEL_ACTION_ID:
        itemType = 'Label';
        const labelResponse = await app.getHttpHelperInstance().get(user, getLabelUrl(itemId));
        itemName = labelResponse.data.name;
        break;

      case MiscEnum.DELETE_COMMENT_ACTION_ID:
        itemType = 'Comment';
        const commentResponse = await app.getHttpHelperInstance().get(user, getCommentUrl(itemId));
        itemName = commentResponse.data.content;
        break;

      default:
        throw new Error('Unknown delete action');
    }

    // Show confirmation modal
    const modal = await deleteConfirmationModal({
      itemType,
      itemName,
      itemId,
      actionId,
      roomId,
    });

    await modify.getUiController().openSurfaceView(modal, data, user);
  } catch (error) {
    const msg = modify
      .getCreator()
      .startMessage()
      .setText(`Error opening delete confirmation: ${error.message}`)
      .setRoom(context.getInteractionData().room!);
    await modify.getNotifier().notifyUser(user, msg.getMessage());
  }
}
