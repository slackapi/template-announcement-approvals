'use strict';

const axios = require('axios');
const qs = require('qs');

const apiUrl = 'https://slack.com/api';
const slackAuthToken = process.env.SLACK_ACCESS_TOKEN;

/*
 *  Get a list of authorized resources
 */

const findAuthedChannels = (cursor) => {
  const data = {
    token: slackAuthToken
  };
  if(cursor) {
    data.cursor = cursor;
  }
  const promise = axios.post(`${apiUrl}/apps.permissions.resources.list`, qs.stringify(data));
  return promise;
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
