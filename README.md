## About @announcebot

This bot will send announcements into a channel of your choice (chosen during the install process). Users can DM `@announcebot` to get their announcements into a review queue. Once the approver (set to be the app installer) gives the thumbs up, the user will get a message that gives them the option to post the announcement at their leisure.

![announcements_approvals](https://user-images.githubusercontent.com/700173/27061536-9446d3b6-4f99-11e7-8e55-d019764de7ca.gif)

## Set Up

You should start by [creating a Slack app](https://api.slack.com/slack-apps) and configuring it
with a bot user, event subscriptions, and an incoming webhook. This sample app uses the
[Slack Event Adapter](https://github.com/slackapi/node-slack-events-api), and the [Slack ](https://github.com/slackapi/node-slack-interactive-messages)

### Bot user

Click on the Bot User pane in your app settings. Assign your bot a username such as
`@annoucebot`, enable it to be always online, and save your changes.

### Event subscriptions

Turn on Event Subscriptions for the Slack app. You must input and verify a Request URL, and the
easiest way to do this is to
[use a development proxy as described in the Events API module](https://github.com/slackapi/node-slack-events-api#configuration).

The application listens for events at the path `/slack/events`. For example, the Request URL may
look like `https://myapprovals.ngrok.io/slack/events`.
Add an event subscription to the `message.im` bot event. Save your changes.

### Interactive messages

Turn on Interactive Messages for the Slack app. You must input a Request URL, and the
easiest way to do this is to
[use a development proxy as described in the Events API module](https://github.com/slackapi/node-slack-events-api#configuration).

The application listens for Interactive Message events at the path `/slack/actions`. For example, the Request URL may
look like `https://myapprovals.ngrok.io/slack/actions`.

### Incoming webhook

Add an incoming webhook to your app's configuration. During the install process, be sure to associate the webhook with announcements channel you'd like to enable approved posting for (such as #general).

### Environment variables

Retrieve the Slack verification token, webhook URL, and client and bot tokens from your Slack app settings.
Create a new file named `.env` within the directory and set the values accordingly.

```
SLACK_VERIFICATION_TOKEN=xxxxxxxxxxxxxxxxxxx
SLACK_CLIENT_TOKEN=xoxp-0000000000-0000000000-0000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_BOT_TOKEN=xoxb-0000000000-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/xxxxxxxxx/yyyyyyyyy/zzzzzzzzzzzzzzzzzzzzzzzz
SLACK_ANNOUNCEMENT_CHANNEL=#general
```

## Running the project

Download the dependencies for the application by running `npm install`. Note that this
example assumes you are using a currently supported LTS version of Node (at this time, v6 or above).

Finally, run the application using `npm start`. The installer should get a welcome message, and you can ask another user to DM `@announcebot` to see the app's full workflow!
