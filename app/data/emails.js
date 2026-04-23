export const simulatedEmails = [
  {
    id: 'email-1',
    sender: 'Sarah Jenkins (HR)',
    senderEmail: 's.jenkins@company-internal.com',
    subject: 'Updated Holiday Schedule 2024',
    content: `
      <p>Hello Team,</p>
      <p>Please find the updated holiday schedule for the upcoming quarter attached. We've added a few extra wellness days!</p>
      <p>Best regards,<br/>Sarah</p>
    `,
    timestamp: '10:30 AM',
    type: 'Legitimate',
    correctAction: 'Reply',
    feedback: "Correct! This is a standard internal email. Replying or keeping it is the right move.",
    points: 10
  },
  {
    id: 'email-2',
    sender: 'John Miller (CEO)',
    senderEmail: 'ceo.office@company-hr-portal.co',
    subject: 'URGENT: Confidential Wire Transfer',
    content: `
      <p>I'm currently in a sensitive board meeting and cannot take calls. I need you to process an urgent vendor payment of $4,200 immediately.</p>
      <p>Click below to authorize the transfer via our secure portal:</p>
      <div style="margin: 20px 0;">
        <a href="#" style="background: #7c3aed; color: white; padding: 10px 20px; border-radius: 5px; text-decoration: none;">Authorize Payment</a>
      </div>
      <p>This is time-sensitive. Do not discuss this with others yet.</p>
    `,
    timestamp: '11:15 AM',
    type: 'Phishing (CEO Fraud)',
    correctAction: 'Report',
    feedback: "Pass! This was CEO Fraud. Notice the '.co' domain and the high-pressure request for money.",
    points: 100
  },
  {
    id: 'email-3',
    sender: 'Microsoft Security',
    senderEmail: 'security@microsft-support.com',
    subject: 'Unusual Login Activity Detected',
    content: `
      <p>Your account was recently accessed from a new location in <b>Moscow, RU</b>.</p>
      <p>If this wasn't you, please secure your account immediately by verifying your credentials:</p>
      <div style="margin: 20px 0;">
        <a href="#" style="color: #7c3aed; text-decoration: underline;">Verify Account Now</a>
      </div>
      <p>Failure to act within 24 hours will result in temporary account suspension.</p>
    `,
    timestamp: '09:00 AM',
    type: 'Phishing (Account Harvest)',
    correctAction: 'Report',
    feedback: "Great catch! The sender's domain 'microsft-support.com' is misspelled (missing the second 'o'). This is a credential harvesting attempt.",
    points: 80
  }
];
