import { HttpStatusCode, IModify } from '@rocket.chat/apps-engine/definition/accessors';
import { UIKitBlockInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';

import { TodoistApp } from '../../../TodoistApp';
import { HttpMethod } from '../../helpers/http';

interface ShareItemParams {
  app: TodoistApp;
  context: UIKitBlockInteractionContext;
  modify: IModify;
  getUrl: (id?: string) => string;
  formatMessage: (response: any) => string;
  method?: HttpMethod;
}

export async function shareItem({
  app,
  context,
  modify,
  getUrl,
  formatMessage,
  method = 'GET',
}: ShareItemParams) {
  const data = context.getInteractionData();
  const itemId = data.value;
  const user = data.user;
  const room = data.room;
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
    const textSender = modify.getCreator().startMessage().setText(errorMessage).setRoom(room!);
    await modify.getCreator().finish(textSender);
  }
}
