const { WebClient } = require('@slack/client');
const axios = require('axios');

const slackClientOptions = {};
if (process.env.SLACK_ENV) {
  slackClientOptions.slackAPIUrl = `https://${process.env.SLACK_ENV}.slack.com/api/`;
}

const bot = {
  web: new WebClient(process.env.SLACK_BOT_TOKEN, slackClientOptions),
  approver_user_id: '',
  announcements: {},

  getAuthorizedUser() {
    axios.get(`${this.web.slackAPIUrl}auth.test`, {
      params: {
        token: process.env.SLACK_CLIENT_TOKEN,
      },
    }).then((res) => {
      this.approver_user_id = res.data.user_id;
      this.introduceToAdmin();
    });
  },

  introduceToAdmin() {
    this.web.im.open(this.approver_user_id)
      .then(res => this.web.chat.postMessage(res.channel.id, `:wave: Hello! I'm here to help your team make approved announcements into the ${process.env.SLACK_ANNOUNCEMENT_CHANNEL} channel.\n Since you installed me, I will send any suggested announcements from the team for you to approve.`))
      .catch(console.error);
  },

  handleDirectMessage(userId, channelId) {
    const announcement = this.announcements[userId];

    if (userId === this.approver_user_id) {
      this.web.chat.postMessage(channelId, 'Hi! I will be sure to let you know if someone submits an announcement request!');
    } else if (!announcement) {
      // no announcement found. Start the announcements process
      this.web.chat.postMessage(channelId, `:wave: Hello! I'm here to help your team make approved announcements into the ${process.env.SLACK_ANNOUNCEMENT_CHANNEL} channel.`, {
        attachments: [
          {
            text: 'Do you have something to announce?',
            callback_id: 'startAnnouncement',
            actions: [
              {
                name: 'start',
                text: 'Make announcement',
                type: 'button',
                value: 'startAnnouncement',
              },
            ],
          },
        ],
      });
    }
  },

  startAnnouncement(userId, channelId, triggerId) {
    if (this.announcements[userId]) {
      return Promise.resolve({
        text: 'You already have an announcement in progress.',
        replace_original: false,
      });
    }

    const announcementForm = this.getAnnouncementForm(`previewAnnouncement:${channelId}`);
    this.sendAnnouncementForm(triggerId, announcementForm);
    return Promise.resolve();
  },

  previewAnnouncement(userId, channelId, formData) {
    this.announcements[userId] = {};
    const announcement = this.announcements[userId];
    announcement.channel = channelId;
    announcement.title = formData.title;
    announcement.text = formData.details;
    announcement.isApproved = false;

    this.web.chat.postMessage(announcement.channel, `Got it. How does this look?\n\n:loudspeaker: Announcement from <@${userId}>`, {
      attachments: [
        {
          mrkdwn_in: ['pretext', 'text'],
          title: announcement.title,
          text: announcement.text,
        },
        {
          pretext: `Should I send this announcement message to <@${this.approver_user_id}> for approval?`,
          callback_id: `confirmAnnouncement:${userId}`,
          actions: [
            {
              name: 'sendToAdmin',
              text: 'Send it in!',
              type: 'button',
              value: 'sendToAdmin',
              style: 'primary',
            },
            {
              name: 'retryAnnouncement',
              text: 'Try again',
              type: 'button',
              value: 'retry',
            },
            {
              name: 'cancelAnnouncement',
              text: 'Nevermind, cancel it',
              type: 'button',
              value: 'cancel',
              style: 'danger',
            },
          ],
        },
      ],
    }).then(() => Promise.resolve());
  },

  confirmAnnouncement(userId, actionValue, channelId, triggerId, announcementDraft) {
    if (actionValue === 'sendToAdmin') {
      this.sendApprovalRequest(userId);
      return Promise.resolve({
        text: 'Thanks! Your announcement will be reviewed soon.',
        attachments: [
          {
            pretext: 'Proposed Announcement',
            mrkdwn_in: ['pretext', 'text'],
            title: announcementDraft.title,
            text: announcementDraft.text,
          },
          {
            callback_id: `confirmAnnouncement:${userId}`,
            actions: [
              {
                name: 'cancelAnnouncement',
                text: 'Nevermind, cancel it',
                type: 'button',
                value: 'cancel',
                style: 'danger',
              },
            ],
          },
        ],
      });
    } else if (actionValue === 'retry') {
      delete this.announcements[userId];
      const announcementForm = this.getAnnouncementForm(`previewAnnouncement:${channelId}`, announcementDraft.title, announcementDraft.text);
      this.sendAnnouncementForm(triggerId, announcementForm);
    } else if (actionValue === 'cancel') {
      delete this.announcements[userId];
      return Promise.resolve({
        text: 'Announcement cancelled! Come back anytime.',
      });
    }
    return Promise.resolve();
  },

  sendApprovalRequest(requesterId) {
    const announcement = this.announcements[requesterId];
    this.web.im.open(this.approver_user_id)
      .then(res => this.web.chat.postMessage(res.channel.id, `An announcement is requested by <@${requesterId}>.`, {
        attachments: [
          {
            mrkdwn_in: ['pretext', 'text'],
            pretext: '*Announcement Preview*',
            title: announcement.title,
            text: announcement.text,
          },
          {
            text: `Would you like to approve <@${requesterId}>'s' announcement?`,
            callback_id: `processAnnouncement:${requesterId}`,
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
              },
            ],
          },
        ],
      })
    );
  },

  processAnnouncement(requesterId, approvalAction) {
    const announcement = this.announcements[requesterId];

    if (approvalAction === 'approve') {
      announcement.isApproved = true;
    }

    if (announcement.isApproved) {
      this.web.chat.postMessage(announcement.channel,
        ':tada: Your announcement has been approved! :tada:', {
          attachments: [
            {
              mrkdwn_in: ['pretext', 'text'],
              pretext: '*Announcement Preview*',
              title: announcement.title,
              text: announcement.text,
            },
            {
              text: `You can now post the announcement into ${process.env.SLACK_ANNOUNCEMENT_CHANNEL} anytime by clicking the button below`,
              callback_id: `postAnnouncement:${requesterId}`,
              actions: [
                {
                  name: 'post',
                  text: 'Post it!',
                  type: 'button',
                  value: 'post',
                },
              ],
            },
          ],
        }
      );
    } else {
      this.web.chat.postMessage(announcement.channel,
        ':pensive: Your announcement was not approved.', {
          attachments: [
            {
              mrkdwn_in: ['pretext', 'text'],
              pretext: '*Announcement Preview*',
              title: announcement.title,
              text: announcement.text,
            },
          ],
        }).then(() => { delete this.announcements[requesterId]; });
    }

    return Promise.resolve({ text: `:white_check_mark: Thanks for processing <@${requesterId}>'s announcement! I'll let <@${requesterId}> know.` });
  },

  postAnnouncement(userId) {
    const announcement = this.announcements[userId];
    if (announcement.isApproved) {
      return axios.post(process.env.SLACK_WEBHOOK_URL, {
        text: `:loudspeaker: Announcement from: <@${userId}>`,
        attachments: [
          {
            text: announcement.text,
            footer: 'DM me to make announcements here.',
          },
        ],
      }).then(() => { delete this.announcements[userId]; }
      ).then(() => Promise.resolve({ text: 'Your announcement has been posted!' }));
    }

    delete this.announcements[userId];
    return Promise.resolve({ text: ':thinking_face: That announcement can\'t be posted. Sorry about that! DM me and let\'s try again.' });
  },

  sendAnnouncementForm(triggerId, announcementForm) {
    axios.post(`${this.web.slackAPIUrl}dialog.open`, {
      token: process.env.SLACK_CLIENT_TOKEN,
      trigger_id: triggerId,
      dialog: JSON.stringify(announcementForm),
    }).then((res) => {
      if (res.status === 200 && res.data.ok) {
        return Promise.resolve(true);
      }
      console.log(res);
      return Promise.resolve(false);
    });
  },

  getAnnouncementForm(callbackId = null, title = '', details = '') {
    return {
      title: 'Request an announcement',
      callback_id: callbackId,
      submit_label: 'Request',
      elements: [
        {
          type: 'text',
          name: 'title',
          label: 'Title',
          value: title,
        },
        {
          type: 'textarea',
          name: 'details',
          label: 'Details',
          value: details,
        },
      ],
    };
  },
};

module.exports = bot;
