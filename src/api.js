'use strict';

const axios = require('axios');
const payloads = require('./payloads');
const apiUrl = 'https://slack.com/api';

/**
 * helper function to call POST methods of Slack API
 */
const callAPIMethodPost = async (method, payload) => {
  let result = await axios.post(`${apiUrl}/${method}`, payload, {
    headers: { Authorization: "Bearer " + process.env.SLACK_ACCESS_TOKEN }
  });
  return result.data;
}

/**
 * helper function to call GET methods of Slack API
 */
const callAPIMethodGet = async (method, payload) => {
  payload.token = process.env.SLACK_ACCESS_TOKEN
  let params = Object.keys(payload).map(key => `${key}=${payload[key]}`).join('&')
  let result = await axios.get(`${apiUrl}/${method}?${params}`);
  return result.data;
}

/**
 * helper function to receive all channels our bot user is a member of
 */
const getChannels = async (userId, channels, cursor) => {
  channels = channels || []

  let payload = {}
  if (cursor) payload.cursor = cursor
  let result = await callAPIMethodPost('users.conversations', payload)
  channels = channels.concat(result.channels)
  if (result.response_metadata && result.response_metadata.next_cursor && result.response_metadata.next_cursor.length)
    return getChannels(userId, channels, result.response_metadata.next_cursor)

  return channels
}

const requestAnnouncement = async (user, submission) => {
  // Send the approver a direct message with "Approve" and "Reject" buttons 
  let res = await callAPIMethodPost('im.open', {
    user: submission.approver
  })
  submission.requester = user.id;
  submission.channel = res.channel.id;
  await callAPIMethodPost('chat.postMessage', payloads.approve(submission));
};

const rejectAnnouncement = async (payload, announcement) => {
  // 1. update the approver's message that this request has been denied
  await callAPIMethodPost('chat.update', {
    channel: payload.channel.id,
    ts: payload.message.ts,
    text: 'This request has been denied. I am letting the requester know!',
    blocks: null
  });

  // 2. send a notification to the requester
  let res = await callAPIMethodPost('im.open', {
    user: announcement.requester
  })
  await callAPIMethodPost('chat.postMessage', payloads.rejected({
    channel: res.channel.id,
    title: announcement.title,
    details: announcement.details,
    channelString: announcement.channelString
  }));
}

const postAnnouncement = async (payload, announcement) => {
  await callAPIMethodPost('chat.update', {
    channel: payload.channel.id,
    ts: payload.message.ts,
    text: 'Thanks! This post has been announced.',
    blocks: null
  });

  announcement.channels.forEach(channel => {
    callAPIMethodPost('chat.postMessage', payloads.announcement({
      channel: channel,
      title: announcement.title,
      details: announcement.details,
      requester: announcement.requester,
      approver: announcement.approver
    }));
  })
}



module.exports = {
  callAPIMethodPost,
  callAPIMethodGet,
  getChannels,
  rejectAnnouncement,
  postAnnouncement,
  requestAnnouncement
}

// const postAnnouncement = (announcement) => {
//   const { title, details, channel, requester } = announcement;

//   channel.channel_id.selected_channels.forEach(id => {
//     postAnnouncementToChannels(title.title_id.value, details.details_id.value, id, requester);
//   })

//   sendShortMessage(requester, ':tada: Your announcement has been approved and posted!');
// };

// const postAnnouncementToChannels = (title, details, channel, requester) => {
//   let announcementData = {
//     token: process.env.SLACK_ACCESS_TOKEN,
//     channel: channel,
//     text: `:loudspeaker: Announcement from: <@${requester}>`,
//     blocks: [
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text: title
//         }
//       },
//       {
//         type: 'divider'
//       },
//       {
//         type: 'section',
//         text: {
//           type: 'mrkdwn',
//           text: details
//         }
//       },
//       {
//         type: 'context',
//         elements: [
//           {
//             type: 'mrkdwn',
//             text: `Posted by <@${requester}>`
//           }
//         ]
//       }
//     ]
//   };
//   send(announcementData, false);
// }
