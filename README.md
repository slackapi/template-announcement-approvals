## About @announcebot

This bot will send announcements into a channel of your choice (chosen during the install process). Users can DM `@announcebot` to get their announcements into a review queue. Once the approver (set to be the app installer) gives the thumbs up, the user will get a message that gives them the option to post the announcement at their leisure.

This sample app uses the
[Slack Event Adapter](https://github.com/slackapi/node-slack-events-api), and the [Slack ](https://github.com/slackapi/node-slack-interactive-messages) module for button and dialog fuctionalirt.

![announcements_approvals](https://user-images.githubusercontent.com/915297/30937963-50e4176c-a38d-11e7-94ee-81fae196b506.gif)

## Setup

#### Create a Slack app

1. Create an app at api.slack.com/apps
1. Click on `Bot Users`
1. Add a bot user with a descriptive name and make sure it always stays online
1. Click on `Incoming webhooks` and enable the feature
1. Scroll to the bottom of the page and click 'Add New Webhook to Team'
1. During the install process, be sure to associate the webhook with announcements channel you'd like to enable approved posting for (such as #general)

#### Run locally or [![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-announcements-approval-blueprint)
1. Get the code
    * Either clone this repo and run `npm install`
    * Or visit https://glitch.com/edit/#!/remix/slack-announcements-approval-blueprint
1. Set the following environment variables in `.env` (copy from `.env.sample`):
    * `SLACK_CLIENT_TOKEN`: Your app's `xoxp-` token (available on the Install App page)
    * `SLACK_BOT_TOKEN`: Your app's `xoxb-` token (available on the Install App page)
    * `SLACK_WEBHOOK_URL`: Your app's incoming webhook URL (available on the Incoming Webhook page)
    * `SLACK_ANNOUNCEMENT_CHANNEL`: The name of the channel where the incoming webhook will post (available on the Incoming Webhook page)
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. If you're running the app locally:
    1. Start the app (`npm start`)
    1. In another windown, start ngrok on the same port as your webserver (`ngrok http $PORT`)

#### Enable the Events API
1. Go back to the app settings and click on Events Subscriptions
1. Set the Request URL to your ngrok or Glitch URL + /slack/events
1. On the same page, subscribe to the `message.im` event

#### Enable Interactive Messages

1. In the app settings, click on Interactive Components
1. Set the Request URL to your ngrok or Glitch URL + /slack/actions
