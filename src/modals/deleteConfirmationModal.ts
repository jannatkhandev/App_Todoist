import { IModify, IUIKitSurfaceViewParam } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitSurfaceType } from '@rocket.chat/apps-engine/definition/uikit';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { ModalsEnum } from '../enums/Modals';
import { getButton, getSectionBlock } from '../helpers/blockBuilder';

export async function deleteConfirmationModal({
  modify,
  itemType,
  itemName,
  itemId,
  actionId,
  roomId,
}: {
  modify: IModify;
  itemType: string;
  itemName: string;
  itemId: string;
  actionId: string;
  roomId: string;
}): Promise<IUIKitSurfaceViewParam> {
  const modalKey = `DELETE_${itemType.toUpperCase()}` as keyof typeof ModalsEnum;
  const viewId = ModalsEnum[modalKey] + `#${roomId}`;
  const block: LayoutBlock[] = [];

  const confirmationMessage = await getSectionBlock(
    `Are you sure you want to delete ${itemType}: *${itemName}*?`
  );
  block.push(confirmationMessage);

  const closeButton = await getButton('Cancel', '', '', 'secondary');
  const submitButton = await getButton(
    ModalsEnum.DELETE_CONFIRMATION_SUBMIT_BUTTON_LABEL,
    '',
    actionId,
    itemId,
    'danger'
  );

  return {
    id: viewId,
    type: UIKitSurfaceType.MODAL,
    title: {
      type: 'plain_text',
      text: ModalsEnum.DELETE_CONFIRMATION_MODAL_NAME,
    },
    close: closeButton,
    submit: submitButton,
    blocks: block,
  };
}
