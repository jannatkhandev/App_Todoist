import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import {
  IUIKitResponse,
  UIKitActionButtonInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { MiscEnum } from '../enums/Misc';
import { createTaskModal } from '../modals/createTaskModal';

export class ExecuteActionButtonHandler {
  constructor(
    public readonly app: TodoistApp,
    public readonly modify: IModify
  ) {}

  public async run(context: UIKitActionButtonInteractionContext): Promise<IUIKitResponse> {
    const data = context.getInteractionData();
    const { actionId, user, triggerId, room, message } = data;
    try {
      switch (actionId) {
        case MiscEnum.CREATE_TASK_FROM_MESSAGE_BUTTON_ACTION_ID:
          const createTaskFromMessageModal = await createTaskModal({
            descriptionText: message?.text,
            projectId: undefined,
            roomId: room!.id,
          });
          await this.modify
            .getUiController()
            .openSurfaceView(createTaskFromMessageModal, { triggerId }, user);
          return context.getInteractionResponder().successResponse();
        default:
          break;
      }
    } catch (error) {
      return context.getInteractionResponder().viewErrorResponse({
        viewId: actionId,
        errors: error,
      });
    }

    return context.getInteractionResponder().successResponse();
  }
}
