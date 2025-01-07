# Todoist Integration for Rocket.Chat

The Todoist App for Rocket.Chat  provides a seamless integration between Todoist and Rocket.Chat and improves collaboration between teams.
The application allows users to create and manage thier projects and tasks, create new tasks, edit and delete their tasks, sections, comments & labels and do much more right from Rocket.Chat.


<h2>🚀 Features </h2>
<ul>
  <li>Quick and easy setup.</li> 
  <li>Login to Todoist with one click using built-in OAuth2 mechanism.</li>
  <li>Retreive and manage tasks right from Rocket.Chat channels.</li>
  <li>Create new tasks from Rocket.Chat and make channel of task assignees.</li>
  <li>Edit the tasks right in Rocket.Chat and share them with other channel members.</li>
</ul>


<h2>🔧 Installation steps </h2>

 1. Clone this repo and Change Directory: </br>
 `git clone https://github.com/RocketChat/Apps.Todoist.git && cd Apps.Todoist/`

 2. Install the required packages from `package.json`: </br>
	 `npm install`

 3. Deploy Rocket.Chat app: </br>
    `rc-apps deploy --url http://localhost:3000 --username user_username --password user_password`
    Where:
    - `http://localhost:3000` is your local server URL (if you are running in another port, change the 3000 to the appropriate port)
    - `user_username` is the username of your admin user.
    - `user_password` is the password of your admin user.

    For more info refer [this](https://developer.rocket.chat/apps-engine/getting-started/rocket.chat-app-engine-cli) guide

<h2>📲 Setup guide </h2>
 <ul>
  <li> Create an app on Todoist by following these steps:</li> 
  
  1. Click on your avatar on Todoist and click on Settings.
  
  2. Navigate to Integrations tab, select Developer and click on Build integrations.
  
  3. Click on Create an new app, enter desired app name and click on Create app.
  
  4. Now in Oauth redirect URL enter your app's todoist-app-callback url. (generally in format https://subdomain.domain.tld/api/apps/public/app-id/todoist-app-callback)
  
  5. Copy the Client ID and Client Secret from this page and click on Save settings.
  
  <li>Fill the details in the Todoist app on your server by following these steps:</li>
  
  1. Navigate to Administration->Apps. 
  
  2. Select the Installed tab.
  
  3. Click on Todoist, and go to Settings tab.
  
  4. Enter your generated a Client ID and Client Secret and click on Save changes button.
  
  <li>Start the authorization by using /todoist auth slash command.</li>
</ul>

