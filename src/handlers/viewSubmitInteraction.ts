import { IModify, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { ModalsEnum } from '../enums/Modals';
import { createTask } from '../lib/create/createTask';
import { deleteComment, deleteLabel, deleteSection, deleteTask } from '../lib/delete/deleteItem';

export class ExecuteViewSubmitHandler {
  constructor(
    private readonly app: TodoistApp,
    private readonly read: IRead,
    private readonly modify: IModify
  ) {}

  public async run(context: UIKitViewSubmitInteractionContext) {
    const data = context.getInteractionData();
    let { view, room } = data;
    const elements = view.id.split('#');
    const viewId = elements[0];
    const roomId = elements[1];
    if (!room) room = await this.read.getRoomReader().getById(roomId);
    if (!room) return context.getInteractionResponder().errorResponse();
    try {
      switch (viewId) {
        case ModalsEnum.CREATE_TASK:
          await createTask({ app: this.app, context, room, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_TASK:
          await deleteTask({ app: this.app, context, room, read: this.read, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_SECTION:
          await deleteSection({
            app: this.app,
            context,
            room,
            read: this.read,
            modify: this.modify,
          });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_LABEL:
          await deleteLabel({ app: this.app, context, room, read: this.read, modify: this.modify });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_COMMENT:
          await deleteComment({
            app: this.app,
            context,
            room,
            read: this.read,
            modify: this.modify,
          });
          return context.getInteractionResponder().successResponse();
        default:
          break;
      }
    } catch (error) {
      return context.getInteractionResponder().viewErrorResponse({
        viewId: data.view.id,
        errors: error,
      });
    }
    return {
      success: true,
    };
  }
}
