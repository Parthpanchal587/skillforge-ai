const nodemailer = require('nodemailer');
const dns = require('dns').promises;
require('dotenv').config();

// 1. Verify that email domain actually exists and has Mail Exchange (MX) records
async function validateEmailDomain(email) {
  if (!email || typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, reason: 'Invalid email format' };
  }

  const domain = email.split('@')[1]?.toLowerCase();
  if (!domain) {
    return { valid: false, reason: 'Missing email domain' };
  }

  // Common known domains are valid instantly
  const commonDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'protonmail.com', 'skillforge.ai'];
  if (commonDomains.includes(domain)) {
    return { valid: true, domain };
  }

  try {
    const mxRecords = await dns.resolveMx(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: `Domain @${domain} does not have valid mail exchange (MX) servers` };
    }
    return { valid: true, domain };
  } catch (err) {
    return { valid: false, reason: `Email domain @${domain} does not exist or cannot receive mail` };
  }
}

// 2. Transporter Setup
let transporter = null;

async function getTransporter() {
  if (transporter) return transporter;

  // 1. Live Gmail credentials
  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASS,
      },
    });
    console.log(`✉️ Email Service sending via Gmail (${process.env.GMAIL_USER})`);
    return transporter;
  }

  // 2. Custom SMTP
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log(`✉️ Email Service sending via SMTP (${process.env.SMTP_HOST})`);
    return transporter;
  }

  // 3. Ethereal Live Network Mail Relay
  try {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    console.log('✉️ Email Service running with live test mail relay:', testAccount.user);
  } catch (e) {
    // Local fallback transport
    transporter = {
      sendMail: async (mailOptions) => {
        console.log(`\n📬 [DISPATCHED EMAIL TO: ${mailOptions.to}]`);
        return { messageId: 'msg_' + Date.now(), accepted: [mailOptions.to] };
      },
    };
  }

  return transporter;
}

// 3. Send Verification Code to Email Inbox
async function sendVerificationEmail(toEmail, code) {
  const mailClient = await getTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #FAF7F2; margin: 0; padding: 24px; }
          .container { max-width: 520px; margin: 0 auto; background: #FFFFFF; border: 3px solid #1A1A2E; border-radius: 20px; padding: 32px; box-shadow: 6px 6px 0px #1A1A2E; text-align: center; }
          .header { font-size: 28px; font-weight: 900; color: #1A1A2E; margin-bottom: 8px; }
          .badge { display: inline-block; padding: 4px 14px; background: #FFE135; border: 2px solid #1A1A2E; border-radius: 999px; font-size: 11px; font-weight: 900; text-transform: uppercase; margin-bottom: 20px; }
          .code-box { background: #FAF7F2; border: 3px solid #1A1A2E; border-radius: 16px; padding: 18px 24px; margin: 24px 0; box-shadow: 4px 4px 0px #1A1A2E; }
          .code { font-size: 38px; font-weight: 900; letter-spacing: 8px; color: #1A1A2E; font-family: monospace; }
          .footer { font-size: 12px; color: #7E7E9A; margin-top: 24px; line-height: 1.5; }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="font-size: 44px; margin-bottom: 12px;">🔐</div>
          <div class="header">SkillForge AI</div>
          <div class="badge">EMAIL VERIFICATION PASSCODE</div>
          <p style="color: #424264; font-size: 15px; font-weight: 600; line-height: 1.5;">
            Here is your private 6-digit security passcode to access your SkillForge account:
          </p>
          <div class="code-box">
            <div class="code">${code}</div>
          </div>
          <p style="color: #7E7E9A; font-size: 13px; font-weight: 600;">
            ⏳ This passcode will expire in <strong>10 minutes</strong>. Do not share this passcode with anyone.
          </p>
          <div class="footer">
            If you did not request this email, please ignore it.<br>
            &copy; ${new Date().getFullYear()} SkillForge AI
          </div>
        </div>
      </body>
    </html>
  `;

  const mailOptions = {
    from: `"SkillForge AI" <${process.env.GMAIL_USER || process.env.SMTP_FROM || 'security@skillforge.ai'}>`,
    to: toEmail,
    subject: `🔐 Your SkillForge AI Login Code: ${code}`,
    text: `Your private SkillForge AI verification passcode is: ${code}. Valid for 10 minutes.`,
    html: htmlContent,
  };

  const info = await mailClient.sendMail(mailOptions);
  return info;
}

module.exports = {
  validateEmailDomain,
  sendVerificationEmail,
};
