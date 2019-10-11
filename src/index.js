require('dotenv').config();

const util = require('util');
const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const api = require('./api');
const signature = require('./verifySignature');
const channels = require('./channels');

const app = express();

const apiUrl = 'https://slack.com/api';
const announcements = {};
let bot = '';

/*
 * Parse application/x-www-form-urlencoded && application/json
 * Use body-parser's `verify` callback to export a parsed raw body
 * that you need to use to verify the signature
 */

const rawBodyBuffer = (req, res, buf, encoding) => {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
};

app.use(bodyParser.urlencoded({verify: rawBodyBuffer, extended: true }));
app.use(bodyParser.json({ verify: rawBodyBuffer }));

app.get('/', (req, res) => {
  res.send('<h2>The Approval Flow app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your' +
  ' environment variables.</p>');
});

/*
 * Endpoint to receive events from Slack's Events API.
 * It handles `message.im` event callbacks.
 */

app.post('/events', (req, res) => {
  switch (req.body.type) {
    case 'url_verification': {
      // verify Events API endpoint by returning challenge if present
      res.send({ challenge: req.body.challenge });
      break;
    }
    case 'event_callback': {
      // Verify the signing secret
      if (!signature.isVerified(req)) {
        res.sendStatus(404);
        return;
      } else {
        const { user, bot_id } = req.body.event;

        if (bot_id) { 
          bot = user;
          console.log(`Bot User ID: ${bot}`);
          return;
        } else {
          handleEvent(req.body.event, user)
        }
        res.sendStatus(200);
      }
      break;
    }
    default: { res.sendStatus(404); }
  }
});
  
/*
 * Endpoint to receive events from interactive message and a dialog on Slack. 
 * Verify the signing secret before continuing.
 */
app.post('/interactions', async(req, res) => {
  if(!signature.isVerified(req)) {
    res.sendStatus(404); 
    return;
  } else {
    const payload = JSON.parse(req.body.payload);

    /* Button press event 
     * Check `callback_id` / `value` when handling multiple buttons in an app
     */

    if(payload.type === 'block_actions') { 

      let action = payload.actions[0]

      switch (action.action_id) {
        case 'make_announcement': 
          await api.openRequestModal(payload.trigger_id);
          break;
        case 'dismiss': 
          await api.deleteMessage(payload.channel, payload.message);
          break;
        case 'approve': 
          await api.deleteMessage(payload.channel, payload.message);
          await api.sendShortMessage(payload.user.id, 'Thanks! This post has been announced.');
          await api.postAnnouncement(JSON.parse(action.value));
          break;  
        case 'reject': 
          await api.deleteMessage(payload.channel, payload.message);
          let value = JSON.parse(action.value)
          await api.sendShortMessage(value.requester, 'Sorry, your request has been denied.');
          await api.sendShortMessage(payload.user.id, 'This request has been denied. I am letting the requester know!');
          break;    
      }
    } else if (payload.type === 'view_submission') {
      return handleViewSubmission(payload, res);
    }

      // acknowledge event
    return res.sendStatus(200); 
  } 
});

const handleEvent = async (event, user) => {
  switch(event.type) {
    case 'app_home_opened': 
      let history = await api.retrieveHistory(event.channel);
      if(!history.messages.length) await api.postInitMessage(user);
      break;
    case 'message':
      await api.postInitMessage(user);
      break;
  }
}

const handleViewSubmission = async (payload, res) => {
  switch(payload.view.callback_id) {
    case 'request_announcement': 
      const values = payload.view.state.values;
        let channels = values.channel.channel_id.selected_channels.map(channel => {
          return `<#${channel}>`
        }).join(', ');

        return res.send({
          response_action: 'push',
          view: {
            callback_id: 'confirm_announcement',
            type: 'modal',
            title: {
              type: 'plain_text',
              text: 'Submit request'
            },
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*TITLE*`
                }
              },
              {
                type: 'divider'
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: values.title.title_id.value
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*DETAILS*`
                }
              },
              {
                type: 'divider'
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: values.details.details_id.value
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*APPROVER*`
                }
              },
              {
                type: 'divider'
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `<@${values.approver.approver_id.selected_user}>`
                }
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*CHANNELS*`
                }
              },
              {
                type: 'divider'
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: channels
                }
              }
            ],
            close: {
              type: 'plain_text',
              text: 'Back'
            },
            submit: {
              type: 'plain_text',
              text: 'Submit'
            },
            private_metadata: JSON.stringify(payload.view.state.values)
          }
        })
    case 'confirm_announcement': 
      let data = payload.view.private_metadata;
      await api.requestApproval(payload.user, data);
      // clear modal stack
      return res.send({
        response_action: 'clear'
      })
  }
}

// open the dialog by calling dialogs.open method and sending the payload


  
const server = app.listen(process.env.PORT || 5000, () => {
  console.log('Express server listening on port %d in %s mode', server.address().port, app.settings.env);
});