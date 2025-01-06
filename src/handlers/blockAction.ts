import { IApp } from '@rocket.chat/apps-engine/definition/IApp';
import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { SlashCommandContext } from '@rocket.chat/apps-engine/definition/slashcommands';
import {
  IUIKitResponse,
  UIKitBlockInteractionContext,
} from '@rocket.chat/apps-engine/definition/uikit';
import { UIKitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

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
    private readonly app: IApp,
    private readonly read: IRead,
    private readonly http: IHttp,
    private readonly modify: IModify,
    private readonly persistence: IPersistence
  ) {}

  public async run(
    app: TodoistApp,
    context: UIKitBlockInteractionContext,
    read: IRead,
    http: IHttp,
    persistence: IPersistence,
    modify: IModify,
    slashcommandcontext?: SlashCommandContext,
    uikitcontext?: UIKitInteractionContext
  ): Promise<IUIKitResponse> {
    const data = context.getInteractionData();
    const { actionId, user, triggerId, room } = data;

    try {
      switch (actionId) {
        case MiscEnum.CREATE_TASK_IN_PROJECT_BUTTON_ACTION_ID:
          const modal = await createTaskModal({ projectId: data.value, roomId: room!.id });
          await modify.getUiController().openSurfaceView(modal, { triggerId }, user);
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_PROJECT_ACTION_ID:
          await shareProject({ app, context, data, room, read, persistence, modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_TASK_ACTION_ID:
          await shareTask({ app, context, data, room, read, persistence, modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_SECTION_ACTION_ID:
          await shareSection({ app, context, data, room, read, persistence, modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.SHARE_COMMENT_ACTION_ID:
          await shareComment({ app, context, data, room, read, persistence, modify });
          return context.getInteractionResponder().successResponse();
        case MiscEnum.GET_COMMENTS_ACTION_ID:
          await getComments(app, read, modify, context, persistence);
          return context.getInteractionResponder().successResponse();
        case MiscEnum.DELETE_TASK_ACTION_ID:
        case MiscEnum.DELETE_SECTION_ACTION_ID:
        case MiscEnum.DELETE_LABEL_ACTION_ID:
        case MiscEnum.DELETE_COMMENT_ACTION_ID:
          await handleDeleteAction(app, context, read, modify, persistence, room!);
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
