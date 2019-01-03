'use strict';

const axios = require('axios');
const qs = require('qs');

const apiUrl = 'https://slack.com/api';

/*
 *  Post message via chat.postMessage 
 */

const postInitMessage = (userId) => {
  let messageData = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: userId,
    text: ':wave: Hello! I\'m here to help your team make approved announcements into a channel.',
    attachments: JSON.stringify([
      {
        text: 'Do you have something to announce?',
        callback_id: 'makeAnnouncement',
        actions: [
          {
            name: 'start',
            text: 'Make announcement',
            type: 'button',
            value: 'makeAnnouncement',
          }
        ]
      }
    ])
  };
  send(messageData);
};


const requestApproval = (userId, announcement) => {
  // 1. Send the user a message
  sendShortMessage(userId, 'Your announcement will be reviewed soon.');

  // 2. Send the approver a message with "Approve" and "Deny" buttons
  sendRequestToApprover (userId, announcement); 
};

const postAnnouncement = (userId, announcement) => {
  // 1. Post on a channel
  postAnnouncementToChannel(userId, announcement);

  // 2. Post a confirmation to the approver
  sendShortMessage(announcement.approver, 'Thank you. The announcement is being posted!');

  // 3. Post a confirmation to the user
  sendShortMessage(userId, ':tada: Your announcement has been approved and posted! :tada:');
};

const postAnnouncementToChannel = (user, announcement) => {
  const { title, details, channel } = announcement;

  let announcementData = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel,
    text: `:loudspeaker: Announcement from: <@${user}>`,
    attachments: JSON.stringify([
      {
        title: title,
        text: details,
        footer: 'DM me to make announcements.'
      }
    ])
  };
  send(announcementData, user);
}

const sendRequestToApprover = (userId, announcement) => {
  const { title, details, channel, approver } = announcement;

  let messageData = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: approver,
    text: `Announcement approval is requested by <@${userId}>`,
    attachments: JSON.stringify([
      {
        title: title,
        text: details,
        color: '#36a64f'
      },
      {
        text: `Would you like to post the announcement now?`,
        callback_id: `adminApprove:${userId}`,
        actions: [
          {
            name: 'approve',
            text: 'Approve',
            type: 'button',
            value: 'approve',
          },
          {
            name: 'deny',
            text: 'Deny',
            type: 'button',
            value: 'deny',
          }
        ],
      }
    ])
  };
  send(messageData);
};

const sendShortMessage = (userId, text) => { 
  let data = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: userId,
    text: text,
  };
  send(data);
};

const send = async(data) => { 
  data.as_user = true; // send DM as a bot, not Slackbot
  const result = await axios.post(`${apiUrl}/chat.postMessage`, qs.stringify(data))
  try {
    if(result.data.error) console.log(`PostMessage Error: ${result.data.error}`);
  } catch(err) {
    console.log(err);
  }
};

module.exports = { postInitMessage, requestApproval, postAnnouncement, sendShortMessage };
