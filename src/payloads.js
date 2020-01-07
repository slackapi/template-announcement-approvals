module.exports = {
    short_message: context => {
        return {
            channel: context.channel,
            text: context.text
        }
    },
    welcome_message: context => {
        return {
            channel: context.channel,
            text: ':wave: Hello! I\'m here to help your team make approved announcements into a channel.',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':wave: Hello! I\'m here to help your team make approved announcements into a channel.'
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            action_id: 'make_announcement',
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Make Announcement'
                            },
                            style: 'primary',
                            value: 'make_announcement'
                        },
                        {
                            action_id: 'dismiss',
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Dismiss'
                            },
                            value: 'dismiss'
                        }
                    ]
                }
            ]
        }
    },
    welcome_home: context => {
        return {
            type: 'home',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: ':wave: Hello! I\'m here to help your team make approved announcements into a channel.'
                    }
                },
                {
                    type: 'actions',
                    elements: [
                        {
                            action_id: 'make_announcement',
                            type: 'button',
                            text: {
                                type: 'plain_text',
                                text: 'Make Announcement'
                            },
                            style: 'primary',
                            value: 'make_announcement'
                        }
                    ]
                }
            ]
        }
    },
    request_announcement: context => {
        return {
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
                        type: 'multi_external_select',
                        min_query_length: 0
                    }
                }
            ],
            submit: {
                type: 'plain_text',
                text: 'Next'
            }
        }
    },
    confirm_announcement: context => {
        return {
            response_action: 'push',
            view: {
                callback_id: 'confirm_announcement',
                type: 'modal',
                title: {
                    type: 'plain_text',
                    text: 'Confirm request'
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
                            text: context.announcement.title
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
                            text: context.announcement.details
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
                            text: `<@${context.announcement.approver}>`
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
                            text: context.announcement.channelString
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
                private_metadata: JSON.stringify(context.announcement)
            }
        }
    },
    finish_announcement: context => {
        return {
            response_action: 'update',
            view: {
                callback_id: 'finish_announcement',
                clear_on_close: true,
                type: 'modal',
                title: {
                    type: 'plain_text',
                    text: 'Success :tada:',
                    emoji: true
                },
                blocks: [
                    {
                        type: 'section',
                        text: {
                            type: 'mrkdwn',
                            text: `Your announcement has been sent for approval.`
                        }
                    }
                ],
                close: {
                    type: 'plain_text',
                    text: 'Done'
                }
            }
        }
    },
    approve: context => {
        return {
            channel: context.channel,
            text: `Announcement approval is requested by <@${context.requester}>`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `<@${context.requester}> is requesting an announcement.`
                    }
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `>>> *TITLE*\n${context.title}\n\n*DETAILS*\n${context.details}`
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `Requested channels: ${context.channelString}`
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
                            value: JSON.stringify(context)
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
                            value: JSON.stringify(context)
                        }
                    ]
                }
            ]
        }
    },
    rejected: context => {
        return {
            channel: context.channel,
            text: 'Your announcement has been rejected.',
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: 'Your announcement has been rejected.'
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `>>> *TITLE*\n${context.title}\n\n*DETAILS*\n${context.details}`
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `Requested channels: ${context.channelString}`
                        }
                    ]
                }
            ]
        }
    },
    announcement: context => {
        return {
            channel: context.channel,
            text: `:loudspeaker: Announcement from: <@${context.requester}>`,
            blocks: [
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: `*${context.title}*`
                    }
                },
                {
                    type: 'divider'
                },
                {
                    type: 'section',
                    text: {
                        type: 'mrkdwn',
                        text: context.details
                    }
                },
                {
                    type: 'context',
                    elements: [
                        {
                            type: 'mrkdwn',
                            text: `:memo: Posted by <@${context.requester}>`
                        },
                        {
                            type: 'mrkdwn',
                            text: `:heavy_check_mark: Approved by <@${context.approver}>`
                        }
                    ]
                }
            ]
        }
    }

}