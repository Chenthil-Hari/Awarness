import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.titan.email',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '465'),
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
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
    const info = await transporter.sendMail({
      from: `"Awareness Pro" <${process.env.EMAIL_SERVER_USER}>`,
      to,
      subject: "🛡️ Welcome to Awareness Pro - Your Security Journey Begins!",
      html,
    });
    console.log("Welcome email sent: %s", info.messageId);
    return info;
  } catch (error) {
    console.error("Email send error:", error);
    throw error;
  }
};
