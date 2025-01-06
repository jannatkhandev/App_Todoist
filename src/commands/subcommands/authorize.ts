import { IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { LayoutBlock } from '@rocket.chat/ui-kit';

import { TodoistApp } from '../../../TodoistApp';
import { getButton, getSectionBlock } from '../../helpers/blockBuilder';
import { sendDirectMessage } from '../../helpers/message';

export async function authorize(
  app: TodoistApp,
  read: IRead,
  modify: IModify,
  user: IUser,
  persistence: IPersistence
): Promise<void> {
  const url = await app.getOauth2ClientInstance().getUserAuthorizationUrl(user);
  const block: LayoutBlock[] = [];

  let authButton = await getButton('Authorize', '', '', '', 'primary', url.toString());
  let textsectionBlock = await getSectionBlock(
    'Please click the button below to authorize access to your Todoist account 👇',
    authButton
  );
  block.push(textsectionBlock);

  await sendDirectMessage(read, modify, user, '', persistence, block);
}
