import {
  HttpStatusCode,
  IModify,
  IPersistence,
  IRead,
} from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import { UIKitBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../../TodoistApp';
import { HttpMethod } from '../../helpers/http';

interface ShareItemParams {
  app: TodoistApp;
  context: UIKitBlockInteractionContext;
  data: any;
  room: IRoom;
  read: IRead;
  persistence: IPersistence;
  modify: IModify;
  getUrl: (id?: string) => string;
  formatMessage: (response: any) => string;
  method?: HttpMethod; // Optional - defaults to GET
}

export async function shareItem({
  app,
  context,
  data,
  room,
  read,
  persistence,
  modify,
  getUrl,
  formatMessage,
  method = 'GET',
}: ShareItemParams) {
  const itemId = context.getInteractionData().value;
  const user = context.getInteractionData().user;

  try {
    const response = await app.getHttpHelperInstance().call(user, method, getUrl(itemId));

    if (response.statusCode === HttpStatusCode.OK) {
      const message = formatMessage(response.data);
      const textSender = modify.getCreator().startMessage().setText(message);

      if (room) {
        textSender.setRoom(room);
      }

      await modify.getCreator().finish(textSender);
    } else {
      throw new Error(response.data?.err || 'Unknown error occurred');
    }
  } catch (error) {
    const errorMessage = `❗️ Unable to share item! \nError: ${error.message}`;
    const textSender = modify.getCreator().startMessage().setText(errorMessage);

    if (room) {
      textSender.setRoom(room);
    }

    await modify.getCreator().finish(textSender);
  }
}
