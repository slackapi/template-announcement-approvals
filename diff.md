# What's New? - Updates from the Previous Example

## App design changes

* The overall user flow is simplifed. 
* This app sample is now more consistent with other Blueprints examples- *e.g.* file names, using the same frameworks such as Express.js.
* Sticking with the Web APIs- instead of using a webhook, the app sends messages via `chat.postMessage` method.
* UX Change: A user can pick an approver and the channel where an announcement to be posted. This change gives you more use cases with Dialogs API's dynamic menu!

## OAuth Scopes

Some scopes are no longer valid with workspace apps.

In previous example, these scopes were required:
* `chat:write:bot`

In the new version, you need to enable:
* `bot` 

## OAuth Token

Your OAuth access token should begins with `xoxb-`, instead of `xoxp-`.


## Sigining Secret 

*This requires to update your code!*

Previously, you needed to verify a *verificatin token* to see if a request was coming from Slack, not from some malicious place by simply comparing a string with the legacy token with a token received with a payload. But now you must use more secure *sigining secrets*.

Basically, you need to compare the value of the `X-Slack-Signature`, the HMAC-SHA256 keyed hash of the raw request payload, with a hashed string containing your Slack signin secret code, combined with the version and `X-Slack-Request-Timestamp`. 

Learn more at [Verifying requests from Slack](https://api.slack.com/docs/verifying-requests-from-slack).
