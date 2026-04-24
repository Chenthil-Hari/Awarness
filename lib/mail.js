import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.titan.email',
  port: 587,
  secure: false, // false for 587
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false // Helps with some shared hosting certificates
  },
  debug: true,
  logger: true 
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ EMAIL SERVER ERROR:', error.message);
  } else {
    console.log('✅ EMAIL SERVER CONNECTED - Ready to send');
  }
});

export const sendWelcomeEmail = async (to, name) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #7c3aed, #06b6d4); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; line-height: 1.6; color: #1e293b; }
        .footer { padding: 20px; text-align: center; font-size: 0.8rem; color: #64748b; background-color: #f1f5f9; }
        .button { display: inline-block; padding: 14px 28px; background-color: #7c3aed; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3); }
        .tip-card { background-color: #f1f5f9; border-left: 4px solid #06b6d4; padding: 15px; margin-top: 30px; border-radius: 0 8px 8px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px;">Welcome to Awareness Pro!</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Your journey to security mastery starts here.</p>
        </div>
        <div class="content">
          <h2 style="margin-top:0;">Hello ${name},</h2>
          <p>Thank you for joining <strong>Awareness Pro</strong>. You've just taken the first step toward becoming unphishable and mastering the digital world.</p>
          
          <p>Our platform is designed to give you hands-on experience with real-world security challenges through interactive simulations and live drills.</p>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}" class="button">Go to Dashboard</a>
          </div>

          <div class="tip-card">
            <strong style="color: #06b6d4;">🛡️ First Pro Tip:</strong>
            <p style="margin: 5px 0 0; font-size: 14px;">Always check the sender's email domain before clicking any links. Attackers often use "look-alike" addresses to trick you!</p>
          </div>
          
          <p style="margin-top: 30px;">See you in the simulations,<br><strong>The Awareness Pro Team</strong></p>
        </div>
        <div class="footer">
          &copy; 2026 Awareness Pro. All rights reserved. <br>
          Sent via Titan Mail Security.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const fromEmail = process.env.EMAIL_SERVER_USER;
    if (!fromEmail) throw new Error("EMAIL_SERVER_USER is not defined in environment");

    const info = await transporter.sendMail({
      from: `"Awareness Pro" <${fromEmail}>`,
      to,
      subject: "🛡️ Welcome to Awareness Pro - Your Security Journey Begins!",
      html,
    });
    console.log("✅ Welcome email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email send error:", error.message);
    throw error;
  }
};

export const sendStreakLostEmail = async (to, name, lastStreak) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #fff7ed; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 20px; border: 1px solid #ffedd5; }
        .header { background: linear-gradient(135deg, #f97316, #ef4444); padding: 40px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; line-height: 1.6; color: #1e293b; text-align: center; }
        .streak-badge { font-size: 48px; margin: 20px 0; }
        .button { display: inline-block; padding: 14px 28px; background-color: #f97316; color: white; text-decoration: none; border-radius: 12px; font-weight: bold; margin-top: 20px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin:0; font-size: 28px;">Your Streak is in Danger! 🔥</h1>
          <p style="margin: 10px 0 0; opacity: 0.9;">Don't let your hard work fade away.</p>
        </div>
        <div class="content">
          <div class="streak-badge">📉</div>
          <h2>Oh no, ${name}!</h2>
          <p>It's been 2 days since your last security drill. Your previous streak of <strong>${lastStreak} days</strong> is about to reset!</p>
          
          <p>Consistency is the key to building bulletproof awareness. Jump back in now to save your progress and keep climbing the leaderboard.</p>
          
          <a href="${process.env.NEXTAUTH_URL}" class="button">Resume Training Now</a>
          
          <p style="margin-top: 30px; font-size: 0.9rem; color: #64748b;">
            "The best time to start was yesterday. The second best time is now."
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Awareness Pro Sentinel" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject: "🔥 Quick! Your security streak is about to reset!",
      html,
    });
    console.log("Streak lost email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};

export const sendWeeklySummaryEmail = async (to, name, xp, level) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; margin-top: 20px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); }
        .header { background: #1e293b; padding: 30px 20px; text-align: center; color: white; }
        .content { padding: 40px 30px; color: #1e293b; }
        .stat-grid { display: flex; justify-content: space-around; margin: 30px 0; background: #f8fafc; padding: 20px; border-radius: 12px; }
        .stat-item { text-align: center; }
        .stat-value { display: block; font-size: 24px; font-weight: 800; color: #7c3aed; }
        .stat-label { font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #1e293b; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; background: #dcfce7; color: #166534; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2 style="margin:0; letter-spacing: 2px;">WEEKLY DEFENDER REPORT</h2>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="status-badge">ACTIVE DEFENDER</div>
            <h1 style="margin:0 0 10px;">Great work, ${name}!</h1>
            <p style="color: #64748b;">Here is your security awareness progress for the past 7 days.</p>
          </div>

          <div class="stat-grid">
            <div class="stat-item">
              <span class="stat-value">${level}</span>
              <span class="stat-label">Current Level</span>
            </div>
            <div style="width: 1px; background: #e2e8f0;"></div>
            <div class="stat-item">
              <span class="stat-value">${xp}</span>
              <span class="stat-label">Total XP</span>
            </div>
          </div>

          <p style="font-size: 14px; line-height: 1.6;">Your consistency is building a stronger shield around your digital identity. This week, you've successfully identified new threats and expanded your knowledge in the Wiki Hub.</p>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXTAUTH_URL}" class="button">Visit Your Dashboard</a>
          </div>
        </div>
        <div style="text-align: center; padding: 20px; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9;">
          You are receiving this because you are an active member of Awareness Pro.<br>
          Keep your skills sharp. Stay safe.
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    const info = await transporter.sendMail({
      from: `"Awareness Pro Reports" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject: `📊 Your Weekly Security Report: Level ${level} Reached!`,
      html,
    });
    console.log("Weekly summary email sent to: %s", to);
    return info;
  } catch (error) {
    console.error("Weekly email error:", error);
    throw error;
  }
};
