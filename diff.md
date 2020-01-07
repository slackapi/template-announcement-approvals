# What's New? - Updates from the Previous Example

---
## Changes made in January 2020

### Modals

*Major updates!: This requires to update your scopes in App Management!*

We have intruduced more granular OAuth permissions for the apps that uses a bot token. Now, this sample app requires the scopes, `chat:write`, `im:write`, `im:history`, and `channels:read`, where it used to require only `bot` scope.

To learn more about the change, please refer [Migration guide for classic Slack apps](https://api.slack.com/authentication/migration).

---
## Changes made in October 2019

### Modals

*Major updates!: This requires to update your code!*

We released [Modals](https://api.slack.com/block-kit/surfaces/modals), which is replacing the existing Dialogs, with more powerful features.

Now, instead of calling an API to open a dialog is replaced with the new view API to open a modal with Block Kit in the code sample.

---
## Changes made in January 2019

### App design changes

* The overall user flow is simplifed. 
* This app sample is now more consistent with other Blueprints examples- *e.g.* file names, using the same frameworks such as Express.js.
* Sticking with the Web APIs- instead of using a webhook, the app sends messages via `chat.postMessage` method.
* UX Change: A user can pick an approver and the channel where an announcement to be posted. This change gives you more use cases with Dialogs API's dynamic menu!

### OAuth Scopes

Some scopes are no longer valid with workspace apps.

In previous example, these scopes were required:
* `chat:write:bot`

In the new version, you need to enable:
* `bot` 

### OAuth Token

Your OAuth access token should begins with `xoxb-`, instead of `xoxp-`.


### Sigining Secret 

*This requires to update your code!*

Previously, you needed to verify a *verificatin token* to see if a request was coming from Slack, not from some malicious place by simply comparing a string with the legacy token with a token received with a payload. But now you must use more secure *sigining secrets*.

Basically, you need to compare the value of the `X-Slack-Signature`, the HMAC-SHA256 keyed hash of the raw request payload, with a hashed string containing your Slack signin secret code, combined with the version and `X-Slack-Request-Timestamp`. 

Learn more at [Verifying requests from Slack](https://api.slack.com/docs/verifying-requests-from-slack).
