# What's New? - Updates from the Previous Example

Now all the Blueprints examples have been updated with new Slack platform features also switched to the [workspace token](https://api.slack.com/docs/working-with-workspace-tokens) model. So what are the *diffs* in this updated example?

So what are the *diffs* in this updated example?

## App design changes

This sample has been re-written from scratch, instead of updating the previous code samples for the recent token model change. Also:

* User flow is more simplifed. 
* This app sample is now more consistent with other Blueprints examples- *e.g.* file names, using the same frameworks such as Express.js.
* The *bot user* has been retired with the workspace token, so now the `app_home` DMs users.
* Also the *incoming webhook* has been deprecated in the workspace token model, so instead of using a webhook to send messages, the app sendsmessages via the `chat.postMessage` method.
* Changed the UX of picking approver and the channel where an announcement to be posted. (the UX change is unrelated to the recent API changes, however, to load available channels, where the app is installed, use the new Permmisions API method, `apps.permissions.resources.list`).


## Creating an app

To create a new "workspace app" at [https://api.slack.com/apps?new_app_token=1](https://api.slack.com/apps?new_app_token=1), instead of using the previous App creation page.

## OAuth Scopes

Some scopes are no longer valid with workspace apps.

In previous example, these scopes were required:
* `chat:write:bot`

In the new version, you need to enable:
* `chat:write` (to post messages. due to the change from user- to workspace token.)
* `conversations.app_home:create` (to be able to DM anybody. due to the change from user- to workspace token.)
* `conversations:read` (to get channel names from the IDs.)

Notice that the `bot` scope is no longer supported because there is a no "bot user" for the new workspace apps.

You can learn more about scopes at [https://api.slack.com/scopes](https://api.slack.com/scopes)

## OAuth Token

Your OAuth access token should begins with `-xoxa`, instead of `-xoxp`.

## Events

To monitor the DM-to-app activity, listen to the newly introduced [`message.app_home`](https://api.slack.com/events/message.app_home) event. You can also learn at the Recent Updates [A new app home event for workspace apps](https://api.slack.com/changelog/2018-05-app-home-events-for-workspace-apps).

## Installation and Permission

When a user is installing your app, the user will be ask to choose which channel(s) to install. After the installation, the app name appears under "Apps" at the menu pane on Slack client, and this is now called `app_home`, a where your app can send DM to the user who installed your app. 

Also, your app is only available on the channels that your app is installed, unless some user adds it on other channels. 


## Sigining Secret 

*This requires to update your code!*

Previously, you needed to verify a *verificatin token* to see if a request was coming from Slack, not from some malicious place by simply comparing a string with the legacy token with a token received with a payload. But now you must use more secure *sigining secrets*.

Basically, you need to compare the value of the `X-Slack-Signature`, the HMAC-SHA256 keyed hash of the raw request payload, with a hashed string containing your Slack signin secret code, combined with the version and `X-Slack-Request-Timestamp`. 

Learn more at [Verifying requests from Slack](https://api.slack.com/docs/verifying-requests-from-slack).

## Token rotation

OAuth refresh tokens are also introduced as a security feature, which allows the app owners to proactively rotate tokens when the tokens are compromised.

Your workspace app can use the new `apps.uninstall` method to uninstall itself from a single workspace, revoking all tokens associated with it. To revoke a workspace token without uninstalling the app, use `auth.revoke`.

Although the example of using the short-lived refresh token is *not* included in this Blurprints example since this tutorial is written for internal integration, if you are distributing your app, use a short-lived OAuth Refresh token. Implementing token rotation is required for all apps that are distributed, whether submitted for the App Directory or not.

To lean more, read [Token rotation for workspace apps](https://api.slack.com/docs/rotating-and-refreshing-credentials).


:gift: If you are using the [Node SDK](https://github.com/slackapi/node-slack-sdk/issues/617), the token refresh feature is available for you already!