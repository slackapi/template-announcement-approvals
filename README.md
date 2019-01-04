# Approval Workflows with AnnounceBot


> :sparkles: *Updated Jan 2019: All the changes from the previous version of this example, read the [diff.md](diff.md)*

---

This app lets its bot to post an approved message into a public channel- A user DMs to bot to create an announcement, and once it is approved by another user, the message will be posted to public.

User A ("girlie_mac") wants to announce about donuts on `#random` channel, and User B ("Slack Boss") approves it:

![announcements_approvals](images/demo_approval_flow.gif)

## API & Features

This app uses:
- Web API `
    - `chat.postMessage` to post messages
    - `users.conversations` to get which channels a user (in this case, bot, is on)
- Events API `messages.im` to see when a DM message is sent
- Interactive messages with buttons
- Dialogs API with the dynamic menus

## Setup

### 1. Clone this repo, or Remix this Glitch repo

Clone the repo (then `npm install` to install the dependencies), or if you'd like to work on Glitch, remix from the button below:

[![Remix on Glitch](https://cdn.glitch.com/2703baf2-b643-4da7-ab91-7ee2a2d00b5b%2Fremix-button.svg)](https://glitch.com/edit/#!/remix/slack-announcements-approval-blueprint)

#### 2. Create a Slack app

1. Create an app at [api.slack.com/apps](https://api.slack.com/apps)
1. Navigate to **Bot Users** and click "Add a Bot User" to create one.
1. Navigate to the OAuth & Permissions page and add the following scopes:
    * `bot`
1. Enable the events (See below *Enable the Events API*)
1. Enable the interactive messages (See below *Enable Interactive Messages*)
1. Click 'Save Changes' and install the app (You should get an OAuth access token after the installation


#### Enable the Events API
1. Click on **Events Subscriptions** and enable events.
1. Set the Request URL to your server (or Glitch URL) + `/events` (*e.g.* `https://your-server.com/events`)
1. On the same page, go down to **Subscribe to Bot Events** section and subscribe to the `message.im` events
1. Save

#### Enable Interactive Messages

To enable interactive UI components (This example uses buttons):

1. Click on **Interactive Components** and enable the interactivity.
1. Set the Request URL to your server or Glitch URL + `/interactions`

To dynamically populate a drop-down menu list in a dialog (This example uses a list of channels):

1. Insert the Options Load URL (*e.g.* `https://your-server.com/channels`) in the **Message Menus** section
1. Save

#### 3. Run this App
Set Environment Variables and run:

1. Set the following environment variables in `.env` (copy from `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's `xoxb-` token (available on the Install App page after the installation)
    * `SLACK_SIGNING_SECRET`: Your app's Signing Secret (available on the **Basic Information** page)
1. If you're running the app locally:
    * Start the app (`npm start`)

On Slack client, "invite" your bot to appropriate channels. The bot cannot post messages to the channels where the bot is not added.

## The app sequence diagram

![dialog](images/diagram_approval_flow.png)