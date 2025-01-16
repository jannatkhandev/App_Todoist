import { IAppAccessors, IAppInstallationContext, IConfigurationExtend, IHttp, ILogger, IModify, IPersistence, IRead } from '@rocket.chat/apps-engine/definition/accessors';
import { App } from '@rocket.chat/apps-engine/definition/App';
import { IAppInfo } from '@rocket.chat/apps-engine/definition/metadata';
import { IAuthData, IOAuth2Client, IOAuth2ClientOptions } from '@rocket.chat/apps-engine/definition/oauth2/IOAuth2';
import { createOAuth2Client } from '@rocket.chat/apps-engine/definition/oauth2/OAuth2';
import { UIActionButtonContext } from '@rocket.chat/apps-engine/definition/ui';
import { IUIKitResponse, UIKitActionButtonInteractionContext, UIKitBlockInteractionContext, UIKitViewSubmitInteractionContext } from '@rocket.chat/apps-engine/definition/uikit';
import { IUser } from '@rocket.chat/apps-engine/definition/users';
import { TodoistCommand } from './src/commands/TodoistCommand';
import { MiscEnum } from './src/enums/Misc';
import { ExecuteActionButtonHandler } from './src/handlers/actionButtonInteraction';
import { ExecuteBlockActionHandler } from './src/handlers/blockInteraction';
import { ExecuteViewSubmitHandler } from './src/handlers/viewSubmitInteraction';
import { HttpHelper } from './src/helpers/http';
import { isUserHighHierarchy, sendDirectMessage } from './src/helpers/message';

export class TodoistApp extends App {
    public readonly botUsername: string = 'todoist-app.bot';
    public botUser: IUser;
    private readonly oauth2ClientInstance: IOAuth2Client;
    private httpHelperInstance: HttpHelper;
    private oauth2Config: IOAuth2ClientOptions = {
      alias: 'todoist-app',
      accessTokenUri: 'https://todoist.com/oauth/access_token',
      authUri: 'https://todoist.com/oauth/authorize',
      refreshTokenUri: 'https://todoist.com/oauth/access_token',
      revokeTokenUri: 'https://todoist.com/oauth/access_token',
      authorizationCallback: this.authorizationCallback.bind(this),
      defaultScopes: ["task:add,data:read,data:read_write,data:delete"]
    };

    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
        this.oauth2ClientInstance = createOAuth2Client(this, this.oauth2Config);
    }

    private async authorizationCallback(token: IAuthData, user: IUser, read: IRead, modify: IModify, http: IHttp, persistence: IPersistence) {
        const text = `The authentication process has succeeded! :tada:`;
        await sendDirectMessage(read, modify, user, text, persistence);
    }

    public async onInstall(context: IAppInstallationContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<void> {
        const user = context.user;

        const quickReminder =
            'Quick reminder: Let your team members know about the Todoist App,\
                                so everyone will be able to manage their tasks.\n';

        const text = `Welcome to the Todoist Rocket.Chat App!\n` + `To start managing your projects, tasks, etc. ` + `You first need to complete the app's setup and then authorize your Todoist account.\n` + `To do so, type  \`/todoist auth\`\n` + `${isUserHighHierarchy(user) ? quickReminder : ''}`;

        await sendDirectMessage(read, modify, user, text, persistence);
    }

    public getOauth2ClientInstance(): IOAuth2Client {
        return this.oauth2ClientInstance;
    }

    public getHttpHelperInstance(): HttpHelper {
        if (!this.httpHelperInstance) {
            this.httpHelperInstance = new HttpHelper(this, this.getAccessors().http);
        }
        return this.httpHelperInstance;
    }

    public async executeBlockActionHandler(context: UIKitBlockInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteBlockActionHandler(this, modify);
        return handler.run(context);
    }

    public async executeViewSubmitHandler(context: UIKitViewSubmitInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteViewSubmitHandler(this, read, modify);
        return handler.run(context);
      }

    public async executeActionButtonHandler(context: UIKitActionButtonInteractionContext, read: IRead, http: IHttp, persistence: IPersistence, modify: IModify): Promise<IUIKitResponse> {
        const handler = new ExecuteActionButtonHandler(this, modify);
        return handler.run(context);
    }


    public async extendConfiguration(configuration: IConfigurationExtend): Promise<void> {    
        await Promise.all([this.getOauth2ClientInstance().setup(configuration), configuration.slashCommands.provideSlashCommand(new TodoistCommand(this))]);
        configuration.ui.registerButton({
			actionId: MiscEnum.CREATE_TASK_FROM_MESSAGE_BUTTON_ACTION_ID,
			labelI18n: MiscEnum.CREATE_TASK_FROM_MESSAGE_BUTTON,
			context: UIActionButtonContext.MESSAGE_ACTION,
		});
    }

}
