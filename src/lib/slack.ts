const COMMITTEE_CHANNEL_ENV: Record<string, string | undefined> = {
  Newsletter: process.env.SLACK_CHANNEL_NEWSLETTER,
  Events: process.env.SLACK_CHANNEL_EVENTS,
  "Emergency Hub": process.env.SLACK_CHANNEL_EMERGENCY_HUB,
  Communications: process.env.SLACK_CHANNEL_COMMUNICATIONS,
  Advocacy: process.env.SLACK_CHANNEL_ADVOCACY,
  Business: process.env.SLACK_CHANNEL_BUSINESS,
};

async function postToChannel(channel: string, text: string): Promise<void> {
  const token = process.env.SLACK_BOT_TOKEN;
  if (!token) return;

  await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ channel, text }),
  });
}

export async function postToSlack(text: string, committeeName?: string): Promise<void> {
  const channel =
    (committeeName && COMMITTEE_CHANNEL_ENV[committeeName]) || process.env.SLACK_CHANNEL_STEERING;
  if (!channel) return;

  await postToChannel(channel, text);
}

export async function postContactToSlack(text: string): Promise<void> {
  const channel = process.env.SLACK_CHANNEL_CONTACT;
  if (!channel) return;

  await postToChannel(channel, text);
}
