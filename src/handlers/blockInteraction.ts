import { IModify } from '@rocket.chat/apps-engine/definition/accessors';
import {
  IUIKitResponse,
  UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { MiscEnum } from '../enums/Misc';
import { handleDeleteAction } from '../lib/delete/deleteItem';
import { getComments } from '../lib/fetch/fetchComments';
import { shareComment } from '../lib/share/shareComment';
import { shareProject } from '../lib/share/shareProject';
import { shareSection } from '../lib/share/shareSection';
import { shareTask } from '../lib/share/shareTask';
import { createTaskModal } from '../modals/createTaskModal';

export class ExecuteBlockActionHandler {
  constructor(
    private readonly app: TodoistApp,
    private readonly modify: IModify
  ) {}

  public async run(context: UIKitBlockInteractionContext): Promise<IUIKitResponse> {
    const data = context.getInteractionData();
    const { actionId, user, triggerId, room } = data;
    const logger = this.app.getLogger();
    if (!room) {
      logger.warn('Room data not present in context.');
      return context.getInteractionResponder().errorResponse();
    }
    logger.debug(
      `Action ID: ${actionId}, Trigger ID: ${triggerId}, User ID: ${user.id}, Room ID: ${room.id}`
    );
    try {
      switch (actionId) {
        case MiscEnum.CREATE_TASK_IN_PROJECT_BUTTON_ACTION_ID:
          const createTaskFromProjectModal = await createTaskModal({
            projectId: data.value,
            roomId: room.id,
          });
          await this.modify
            .getUiController()
            .openSurfaceView(createTaskFromProjectModal, data, user);
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_PROJECT_ACTION_ID:
          await shareProject({ app: this.app, context, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_TASK_ACTION_ID:
          await shareTask({ app: this.app, context, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_SECTION_ACTION_ID:
          await shareSection({ app: this.app, context, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_COMMENT_ACTION_ID:
          await shareComment({ app: this.app, context, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.GET_COMMENTS_ACTION_ID:
          await getComments(this.app, this.modify, context);
          return context.getInteractionResponder().successResponse();
        case MiscEnum.DELETE_TASK_ACTION_ID:
        case MiscEnum.DELETE_SECTION_ACTION_ID:
        case MiscEnum.DELETE_LABEL_ACTION_ID:
        case MiscEnum.DELETE_COMMENT_ACTION_ID:
          await handleDeleteAction(this.app, context, this.modify);
          return context.getInteractionResponder().successResponse();
        default:
          logger.warn(`Invalid Action ID: ${actionId} received.`);
          return context.getInteractionResponder().errorResponse();
      }
    } catch (error) {
      logger.error(error);
      return context.getInteractionResponder().viewErrorResponse({
        viewId: actionId,
        errors: error,
      });
    }
  }
}
