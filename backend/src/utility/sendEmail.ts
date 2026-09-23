import nodemailer from "nodemailer";
import config from "../config";

type AttachmentOption = {
  filename: string;
  path?: string;
  content?: string | Buffer;
  cid?: string;
};

type EmailOptions = {
  to: string;
  subject: string;
  text: string;
  html?: string;
  senderName?: string;
  attachments?: AttachmentOption[];
};

const sendEmail = async (options: EmailOptions) => {
  const smtpUser = (config.smtp_user || config.smtp_from || "").trim();
  const smtpPassword = (config.smtp_password || "").replace(/\s+/g, "");
  const fromAddress = (config.smtp_from || "").trim();

  if (!config.smtp_host || !smtpUser || !smtpPassword || !fromAddress) {
    throw new Error("SMTP email configuration is incomplete");
  }

  const transporter = nodemailer.createTransport({
    host: config.smtp_host,
    port: Number(config.smtp_port) || 587,
    secure: Boolean(config.smtp_secure),
    auth: {
      user: smtpUser,
      pass: smtpPassword,
    },
  });

  const { senderName, ...mailOptions } = options;
  const displayName = senderName || config.company_name || "Support";

  await transporter.sendMail({
    from: `"${displayName}" <${fromAddress}>`,
    ...mailOptions,
  });
};

export default sendEmail;
