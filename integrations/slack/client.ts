import { WebClient } from '@slack/web-api'

export interface SlackNotification {
  channel: string
  message: string
  blocks?: any[]
  metadata?: Record<string, any>
}

export class SlackClient {
  private client: WebClient
  
  constructor(token: string) {
    this.client = new WebClient(token)
  }

  async sendNotification(notification: SlackNotification): Promise<void> {
    try {
      await this.client.chat.postMessage({
        channel: notification.channel,
        text: notification.message,
        blocks: notification.blocks
      })
    } catch (error) {
      console.error('Failed to send Slack notification:', error)
      throw error
    }
  }

  async sendCreativeReviewNotification(
    channel: string,
    assetTitle: string,
    projectName: string,
    reviewUrl: string
  ): Promise<void> {
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `*New Creative Asset Ready for Review*\n*Project:* ${projectName}\n*Asset:* ${assetTitle}`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: 'Review Now'
            },
            url: reviewUrl,
            style: 'primary'
          }
        ]
      }
    ]

    await this.sendNotification({
      channel,
      message: `New creative asset ready for review: ${assetTitle}`,
      blocks
    })
  }

  async sendPerformanceAlert(
    channel: string,
    campaignName: string,
    metric: string,
    value: string,
    threshold: string
  ): Promise<void> {
    const blocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `⚠️ *Performance Alert*\n*Campaign:* ${campaignName}\n*Metric:* ${metric}\n*Current:* ${value}\n*Threshold:* ${threshold}`
        }
      }
    ]

    await this.sendNotification({
      channel,
      message: `Performance alert for ${campaignName}`,
      blocks
    })
  }
}

export const createSlackClient = (token?: string): SlackClient => {
  const slackToken = token || process.env.SLACK_BOT_TOKEN
  
  if (!slackToken) {
    throw new Error('Slack bot token is required')
  }
  
  return new SlackClient(slackToken)
}
