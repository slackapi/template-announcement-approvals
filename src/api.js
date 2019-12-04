'use strict';

const axios = require('axios');

const apiUrl = 'https://slack.com/api';

/*
 *  Post message via chat.postMessage 
 */

const postInitMessage = (userId) => {
  let messageData = {
    channel: userId,
    text: ":wave: Hello! I\'m here to help your team make approved announcements into a channel.",
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: ":wave: Hello! I'm here to help your team make approved announcements into a channel."
        }
      },
      {
        type: "actions",
        elements: [
          {
            action_id: 'make_announcement',
            type: "button",
            text: {
              type: "plain_text",
              text: "Make Announcement"
            },
            style: "primary",
            value: "make_announcement"
          },
          {
            action_id: 'dismiss',
            type: "button",
            text: {
              type: "plain_text",
              text: "Dismiss"
            },
            value: "dismiss"
          }
        ]
      }
    ]
  };
  send(messageData, true);
};

const requestApproval = (user, submission) => {
  // 1. Send the user a message
  sendShortMessage(user.id, 'Your announcement has been sent for approval.');

  // 2. Send the approver a message with "Approve" and "Reject" buttons
  sendRequestToApprover(user, submission); 
};

const postAnnouncement = (announcement) => {
  const { title, details, channel, requester } = announcement;

  channel.channel_id.selected_channels.forEach(id => {
    postAnnouncementToChannels(title.title_id.value, details.details_id.value, id, requester);
  })
  
  sendShortMessage(requester, ':tada: Your announcement has been approved and posted!');
};

const postAnnouncementToChannels = (title, details, channel, requester) => {
  let announcementData = {
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: channel,
    text: `:loudspeaker: Announcement from: <@${requester}>`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: title
        }
      },
      {
        type: 'divider'
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: details
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Posted by <@${requester}>`
          }
        ]
      }
    ]
  };
  send(announcementData, false);
}

const sendRequestToApprover = (user, announcement) => {
  announcement = JSON.parse(announcement)
  const { title, details, channel, approver } = announcement;
  announcement.requester = user.id;

  let channels = channel.channel_id.selected_channels.map(channel => {
    return `<#${channel}>`
  }).join(', ');

  let messageData = {
    channel: approver.approver_id.selected_user,
    text: `Announcement approval is requested by <@${user.id}>`,
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `<@${user.id}> is requesting an announcement.`
        }
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `>>> *TITLE*\n${title.title_id.value}\n\n*DETAILS*\n${details.details_id.value}`
        }
      },
      {
        type: 'context',
        elements: [
          {
            type: 'mrkdwn',
            text: `Requested channels: ${channels}`
          }
        ]
      },
      {
        type: 'actions',
        elements: [
          {
            action_id: 'approve',
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Approve',
              emoji: true
            },
            style: 'primary',
            value: JSON.stringify(announcement)
          },
          {
            action_id: 'reject',
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Reject',
              emoji: true
            },
            style: 'danger',
            value: JSON.stringify({requester: user.id})
          }
        ]
      }
    ]
  };
  send(messageData, true);
};

const sendShortMessage = (userId, text) => { 
  let data = {
    channel: userId,
    text: text,
  };
  send(data, true);
};

const deleteMessage = async(channel, message) => {
  let data = {
    channel: channel.id,
    ts: message.ts
  };
  const result = await axios.post(`${apiUrl}/chat.delete`, data, {
    headers: {
      Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN
    }
  });
  try {
    if(result.data.error) console.log(`PostMessage Error: ${result.data.error}`);
  } catch(err) {
    console.log(err);
  }
}

const send = async(data, as_user) => { 
  if(as_user) data.as_user = as_user; // send DM as a bot, not Slackbot
  const result = await axios.post(`${apiUrl}/chat.postMessage`, data, {
    headers: {
      Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN
    }
  });
  try {
    if(result.data.error) console.log(`PostMessage Error: ${result.data.error}`);
  } catch(err) {
    console.log(err);
  }
};

const retrieveHistory = async (channel) => {
  console.log(channel)
  let history = await axios.post(`${apiUrl}/im.history`, {
      channel: channel,
      limit: 1
    }, {
      headers: {
        Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN
      }
    });
  return history.data; 
}

const openRequestModal = async(trigger_id) => {

  const data = {
    token: process.env.SLACK_ACCESS_TOKEN,
    trigger_id: trigger_id,
    view: {
      type: 'modal',
      title: {
        type: 'plain_text',
        text: 'Request an announcement'
      },
      callback_id: 'request_announcement',
      blocks: [
        {
          block_id: 'title',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Title'
          },
          element: {
            action_id: 'title_id',
            type: 'plain_text_input',
            max_length: 100
          }
        },
        {
          block_id: 'details',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Details'
          },
          element: {
            action_id: 'details_id',
            type: 'plain_text_input',
            multiline: true,
            max_length: 500
          }
        },
        {
          block_id: 'approver',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Select approver'
          },
          element: {
            action_id: 'approver_id',
            type: 'users_select'
          }
        },
        {
          block_id: 'channel',
          type: 'input',
          label: {
            type: 'plain_text',
            text: 'Select channels'
          },
          element: {
            action_id: 'channel_id',
            type: 'multi_channels_select'
          }
        }
      ],
      submit: {
        type: 'plain_text',
        text: 'Next'
      }
    }
  };

  // open a modal by calling views.open method and sending the payload
  await axios.post(`${apiUrl}/views.open`, data, {
    headers: {
      Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN
    }
  });
};

module.exports = { postInitMessage, requestApproval, postAnnouncement, sendShortMessage, deleteMessage, openRequestModal, retrieveHistory };
