import { IHttp, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { IRoom } from '@rocket.chat/apps-engine/definition/rooms';
import {
  ISlashCommand,
  SlashCommandContext,
} from '@rocket.chat/apps-engine/definition/slashcommands';
import { IUser } from '@rocket.chat/apps-engine/definition/users';

import { TodoistApp } from '../../TodoistApp';
import { sendNotification } from '../helpers/message';
import { authorize } from './subcommands/authorize';
import { labels } from './subcommands/labels';
import { projects } from './subcommands/projects';
import { sections } from './subcommands/sections';
import { sharedLabels } from './subcommands/sharedLabels';
import { task } from './subcommands/task';
import { tasks } from './subcommands/tasks';

export class TodoistCommand implements ISlashCommand {
  public command = 'todoist';
  public i18nParamsExample = 'slashcommand_params';
  public i18nDescription = 'slashcommand_description';
  public providesPreview = false;

  constructor(private readonly app: TodoistApp) {}

  public async executor(
    context: SlashCommandContext,
    read: IRead,
    modify: IModify,
    http: IHttp,
    persistence: IPersistence
  ): Promise<void> {
    const command = this.getCommandFromContextArguments(context);
    if (!command) {
      return await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
    }

    switch (command) {
      case 'help':
        await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
        break;
      case 'auth':
        await authorize(this.app, read, modify, context.getSender(), persistence);
        break;
      case 'projects':
        await projects(this.app, read, modify, context, persistence);
        break;
      case 'task':
        await task(this.app, read, modify, context, persistence);
        break;
      case 'tasks':
        await tasks(this.app, read, modify, context, persistence);
        break;
      case 'sections':
        await sections(this.app, read, modify, context, persistence);
        break;
      case 'labels':
        await labels(this.app, read, modify, context, persistence);
      case 'shared-labels':
        await sharedLabels(this.app, read, modify, context, persistence);
        break;
      default:
        await this.displayAppHelpMessage(read, modify, context.getSender(), context.getRoom());
        break;
    }
  }

  private getCommandFromContextArguments(context: SlashCommandContext): string {
    const [command] = context.getArguments();
    return command;
  }

  private async displayAppHelpMessage(
    read: IRead,
    modify: IModify,
    user: IUser,
    room: IRoom
  ): Promise<void> {
    const text = `Todoist App provides you the following slash commands, /todoist:

    1) *help:* shows this list.
    2) *auth:* starts the process to authorize your Todoist Account.
`;

    return sendNotification(read, modify, user, room, text);
  }
}
