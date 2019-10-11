'use strict';

const axios = require('axios');
const qs = require('qs');

const apiUrl = 'https://slack.com/api';

/*
 *  Get a list of authorized resources
 */

const findAuthedChannels = async(id, cursor) => {
  const bot = id;
  
  const data = {
    exclude_archived: true,
    user: bot
  };

  if (cursor) data.cursor = cursor;

  const result = await axios.post(`${apiUrl}/users.conversations`, data, {
    headers: {
      Authorization: 'Bearer ' + process.env.SLACK_ACCESS_TOKEN
    }
  });

  const { channels, response_metadata } = result.data;

  if (response_metadata.next_cursor !== '') {
    return channels.concat(await findAuthedChannels(id, response_metadata.next_cursor));
  } else {
    return channels;
  }
};

module.exports = { findAuthedChannels };
