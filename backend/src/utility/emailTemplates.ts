import fs from "fs";
import path from "path";

// undefined হ্যান্ডেল করার জন্য value?: string টাইপ দেওয়া হলো
const escapeHtml = (value: string | undefined = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export type PasswordResetEmailData = {
  recipientName?: string;
  companyName: string;
  companyShortName?: string;
  resetLink: string;
  expiresIn?: string;
  supportEmail?: string;
  websiteUrl?: string;
  logoUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  footerText?: string;
};

export const passwordResetEmailTemplate = (data: PasswordResetEmailData) => {
  const {
    recipientName,
    companyName,
    companyShortName = "",
    resetLink,
    expiresIn = "15 minutes",
    supportEmail,
    websiteUrl,
    logoUrl,
    primaryColor = "#234279",
    secondaryColor = "#FB731F",
    footerText,
  } = data;

  const year = new Date().getFullYear();

  const logoCandidates = [
    path.join(__dirname, "../assets/Am_logo.png"),
    path.join(__dirname, "Am_logo.png"),
    path.join(process.cwd(), "src/assets/Am_logo.png"),
  ];
  const logoPath = logoCandidates.find((candidate) => fs.existsSync(candidate));
  const hasLocalLogo = !logoUrl && Boolean(logoPath);
  const finalLogoSrc = logoUrl || (hasLocalLogo ? "cid:company-logo" : "");

  const attachments =
    logoUrl || !hasLocalLogo
      ? []
      : [
          {
            filename: "Am_logo.png",
            path: logoPath,
            cid: "company-logo",
          },
        ];

  const safeCompanyName = escapeHtml(companyName);
  const safeCompanyShortName = escapeHtml(companyShortName);
  const safeRecipientName = escapeHtml(recipientName);
  const safeResetLink = escapeHtml(resetLink);
  const safeSupportEmail = escapeHtml(supportEmail);
  const safeWebsiteUrl = escapeHtml(websiteUrl);
  const safeFooterText = escapeHtml(footerText);

  const greeting = recipientName ? `Hi ${safeRecipientName},` : "Hi there,";

  const companyDisplayName = safeCompanyShortName
    ? `${safeCompanyName} ${safeCompanyShortName}`
    : safeCompanyName;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Password Reset Request</title>
</head>
<body style="margin:0; padding:0; width:100%; background-color:#f8f9fb; font-family: Arial, Helvetica, sans-serif; color:#334155;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; margin:0; padding:0; background-color:#f8f9fb;">
        <tr>
            <td align="center" style="padding:32px 16px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; max-width:600px; background-color:#ffffff; border:1px solid #e7eaf0; border-radius:14px; overflow:hidden;">
                    <tr>
                        <td align="center" style="padding:34px 24px 28px; background-color:#f6f9fd; border-bottom:1px solid #edf1f6;">
                                                        ${
                                                          finalLogoSrc
                                                            ? `<img src="${finalLogoSrc}" alt="${safeCompanyName}" width="120" style="display:block; width:120px; max-width:120px; height:auto; margin:0 auto; border:0; outline:none; text-decoration:none;" />`
                                                            : ""
                                                        }
                            <div style="margin-top:18px; font-size:21px; line-height:29px; font-weight:700; color:${primaryColor};">
                                Password Reset Request
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding:34px 40px 30px;">
                            <p style="margin:0 0 18px; font-size:15px; line-height:24px; color:#334155;">${greeting}</p>
                            <p style="margin:0 0 24px; font-size:14px; line-height:23px; color:#475569;">
                                We received a request to reset the password for your ${companyDisplayName} account. Click the button below to create a new password.
                            </p>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:26px auto 28px;">
                                <tr>
                                    <td align="center" style="border-radius:7px; background-color:${primaryColor};">
                                        <a href="${safeResetLink}" target="_blank" style="display:inline-block; padding:13px 25px; background-color:${primaryColor}; border:1px solid ${primaryColor}; border-radius:7px; color:#ffffff; font-size:14px; line-height:20px; font-weight:700; text-decoration:none;">
                                            Reset Password
                                        </a>
                                    </td>
                                </tr>
                            </table>
                            <p style="margin:0 0 22px; font-size:13px; line-height:21px; color:#64748b;">
                                This link will expire in <strong style="color:${primaryColor};">${escapeHtml(expiresIn)}</strong> and can be used only once.
                            </p>
                            <p style="margin:0 0 10px; font-size:13px; line-height:21px; color:#64748b;">
                                If the button does not work, copy and paste this link into your browser:
                            </p>
                            <p style="margin:0 0 24px; font-size:11px; line-height:18px; word-break:break-all;">
                                <a href="${safeResetLink}" target="_blank" style="color:${secondaryColor}; text-decoration:underline;">${safeResetLink}</a>
                            </p>
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width:100%; background-color:#f8fafc; border:1px solid #e7edf4; border-radius:8px;">
                                <tr>
                                    <td style="padding:14px 16px;">
                                        <p style="margin:0; font-size:13px; line-height:21px; color:#64748b;">
                                            <strong style="color:${primaryColor};">Didn't request this?</strong><br />
                                            You can safely ignore this email. Your password will remain unchanged.
                                        </p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:24px 30px; background-color:#fafbfc; border-top:1px solid #edf0f4;">
                            <p style="margin:0; font-size:13px; line-height:20px; color:#64748b;">With care,</p>
                            <p style="margin:3px 0 0; font-size:14px; line-height:21px; font-weight:700; color:${primaryColor};">
                                ${safeCompanyName}${companyShortName ? ` ${safeCompanyShortName}` : ""}
                            </p>
                            ${
                              supportEmail
                                ? `<p style="margin:14px 0 0; font-size:11px; line-height:18px; color:#94a3b8;">Need help? Contact our support team at <a href="mailto:${safeSupportEmail}" style="color:${primaryColor}; text-decoration:underline;">${safeSupportEmail}</a></p>`
                                : ""
                            }
                            ${
                              websiteUrl
                                ? `<p style="margin:6px 0 0; font-size:11px; line-height:18px;"><a href="${safeWebsiteUrl}" target="_blank" style="color:${secondaryColor}; text-decoration:none;">${safeWebsiteUrl}</a></p>`
                                : ""
                            }
                        </td>
                    </tr>
                    <tr>
                        <td align="center" style="padding:14px 20px; background-color:#f4f4f6;">
                            <p style="margin:0; font-size:10px; line-height:17px; color:#94a3b8;">
                                ${safeFooterText || `© ${year} ${safeCompanyName}. All rights reserved.`}
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>
`;

  const text = `
${companyName}

Password Reset Request

${recipientName ? `Hi ${recipientName},` : "Hi there,"}

We received a request to reset the password for your ${companyName} account.

Reset your password:
${resetLink}

This link will expire in ${expiresIn} and can be used only once.

If the button does not work, copy and paste this link into your browser:
${resetLink}

Didn't request this?
You can safely ignore this email. Your password will remain unchanged.

With care,
${companyName}

${supportEmail ? `Need help? Contact our support team at ${supportEmail}` : ""}
${websiteUrl ? websiteUrl : ""}

© ${year} ${companyName}. All rights reserved.
`;

  return {
    html,
    text,
    attachments,
  };
};
