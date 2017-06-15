require('dotenv').config();

const http = require('http');
const express = require('express');
const bodyParser = require('body-parser');
const slackEventsAPI = require('@slack/events-api');
const slackInteractiveMessages = require('@slack/interactive-messages');
const normalizePort = require('normalize-port');
const bot = require('./lib/bot');

// --- Slack Events ---
const slackEvents = slackEventsAPI.createSlackEventAdapter(process.env.SLACK_VERIFICATION_TOKEN);

bot.getAuthorizedUser();

slackEvents.on('message', (event) => {
  // Filter out messages from this bot itself or updates to messages
  if (event.subtype === 'bot_message' || event.subtype === 'message_changed' || event.subtype === 'message_deleted') {
    return;
  }
  bot.handleDirectMessage(event.user, event.channel, event.text);
});

// --- Slack Interactive Messages ---
const slackMessages =
  slackInteractiveMessages.createMessageAdapter(process.env.SLACK_VERIFICATION_TOKEN);

// Action handling

slackMessages.action('startAnnouncement', payload =>
   bot.startAnnouncement(payload.user.id)
);

slackMessages.action(/confirmAnnouncement:(\w+)/, payload =>
  bot.confirmAnnouncement(payload.user.id, payload.actions[0].value)
);

slackMessages.action(/processAnnouncement:(\w+)/, (payload) => {
  const reg = /processAnnouncement:(\w+)/;
  const announcementRequester = (payload.callback_id).match(reg)[1];
  return bot.processAnnouncement(announcementRequester, payload.actions[0].value);
});

slackMessages.action(/postAnnouncement:(\w+)/, payload =>
  bot.postAnnouncement(payload.user.id)
);

// Create the server
const port = normalizePort(process.env.PORT || '3000');
const app = express();
app.use(bodyParser.json());
app.use('/slack/events', slackEvents.expressMiddleware());
app.use(bodyParser.urlencoded({ extended: false }));
app.use('/slack/actions', slackMessages.expressMiddleware());

app.get('/', (req, res) => {
  res.send('<h2>The Announcements Approval app is running</h2> <p>Follow the' +
  ' instructions in the README to configure the Slack App and your environment variables.</p>');
});

// Start the server
http.createServer(app).listen(port, () => {
  console.log(`server listening on port ${port}`);
});
