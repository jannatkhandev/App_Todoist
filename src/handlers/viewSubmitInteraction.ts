import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import {
  UIKitInteractionContext,
  UIKitViewSubmitInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../TodoistApp';
import { ModalsEnum } from '../enums/Modals';
import { createTask } from '../lib/create/createTask';
import { deleteComment, deleteLabel, deleteSection, deleteTask } from '../lib/delete/deleteItem';

export class ExecuteViewSubmitHandler {
  constructor(
    private readonly app: TodoistApp,
    private readonly read: IRead,
    private readonly http: IHttp,
    private readonly modify: IModify,
    private readonly persistence: IPersistence
  ) {}

  public async run(
    app: TodoistApp,
    context: UIKitViewSubmitInteractionContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify,
    slashcommandcontext?: SlashCommandContext,
    uikitcontext?: UIKitInteractionContext
  ) {
    const data = context.getInteractionData();
    let { user, view, room } = data;
    const elements = view.id.split('#');
    const viewId = elements[0];
    const roomId = elements[1];
    if (!room) room = await read.getRoomReader().getById(roomId);
    try {
      switch (viewId) {
        case ModalsEnum.CREATE_TASK:
          await createTask({ app, context, data, room, read, persistence, modify, http });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_TASK:
          await deleteTask({ app, context, data, room, read, persistence, modify, roomId });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_SECTION:
          await deleteSection({ app, context, data, room, read, persistence, modify, roomId });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_LABEL:
          await deleteLabel({ app, context, data, room, read, persistence, modify, roomId });
          return context.getInteractionResponder().successResponse();
        case ModalsEnum.DELETE_COMMENT:
          await deleteComment({ app, context, data, room, read, persistence, modify, roomId });
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
