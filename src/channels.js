'use strict';

const axios = require('axios');
const qs = require('qs');

const apiUrl = 'https://slack.com/api';
const slackAuthToken = process.env.SLACK_ACCESS_TOKEN;

/*
 *  Get a list of authorized resources
 */

const getBotId = async() => {
  const data = {
    token: slackAuthToken
  };
  return axios.post(`${apiUrl}/bots.info`, qs.stringify(data));
}

const findAuthedChannels = async(id, cursor) => {
  const bot = id;
  
  const args = {
    token: slackAuthToken,
    exclude_archived: true,
    user: bot
  };

  if (cursor) args.cursor = cursor;

  const result = await axios.post(`${apiUrl}/users.conversations`, qs.stringify(args));

  const { channels, response_metadata } = result.data;

  if (response_metadata.next_cursor !== '') {
    return channels.concat.findAuthedChannels(bot, response_metadata.next_cursor)
  } else {
    return channels;
  }
  
};

/*
 *  Get a channel name from the id
 */

const getChannelName = (channelId) => {
  const data = {
    token: slackAuthToken,
    channel: channelId
  };
  const promise = axios.post(`${apiUrl}/conversations.info`, qs.stringify(data));
  return promise;
};

module.exports = { findAuthedChannels, getChannelName };
