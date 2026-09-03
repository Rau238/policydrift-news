import nodemailer from 'nodemailer';
import * as newsletterModel from '../models/newsletter.model.js';
import { env } from '../config/env.js';

function getTransporter() {
  const host = (process.env.SMTP_HOST || env.SMTP_HOST || '').trim();
  const port = Number(process.env.SMTP_PORT || env.SMTP_PORT || 587);
  const user = (process.env.SMTP_USER || env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || env.SMTP_PASS || '').trim();
  const secure = port === 465;

  if (!host || !user || !pass) {
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass },
    tls: { rejectUnauthorized: false },
  });
}

function getFromAddress() {
  const name = process.env.NEXT_PUBLIC_CURATOR_NAME || 'NewsFree365 Digest';
  const email = process.env.SMTP_FROM || process.env.SMTP_USER || 'newsletter@newsfree365.live';
  return `"${name}" <${email}>`;
}

/**
 * Generate a responsive, dark-mode compatible HTML newsletter email.
 */
export function renderNewsletterHtml({
  subject,
  headline,
  intro,
  stories = [],
  unsubscribeUrl,
}) {
  const siteUrl = (env.SITE_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');

  const storiesHtml = stories
    .map(
      (s, idx) => `
      <div style="margin-bottom: 24px; padding: 18px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
        ${
          s.image_url
            ? `<a href="${siteUrl}/news/${s.slug}" style="text-decoration: none;">
                 <img src="${s.image_url}" alt="${s.title}" style="width: 100%; max-height: 240px; object-fit: cover; border-radius: 8px; margin-bottom: 12px; display: block;" />
               </a>`
            : ''
        }
        <div style="margin-bottom: 6px;">
          <span style="display: inline-block; background-color: #0f766e; color: #ffffff; font-size: 11px; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase;">
            ${s.category || 'Top Story'}
          </span>
        </div>
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: bold; line-height: 1.3;">
          <a href="${siteUrl}/news/${s.slug}" style="color: #0f172a; text-decoration: none;">${s.title}</a>
        </h3>
        <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.5;">
          ${s.excerpt || s.title}
        </p>
        <a href="${siteUrl}/news/${s.slug}" style="display: inline-block; background-color: #0f766e; color: #ffffff; font-size: 12px; font-weight: 600; padding: 6px 14px; border-radius: 6px; text-decoration: none;">
          Read Full Report &rarr;
        </a>
      </div>
    `
    )
    .join('');

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${subject}</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a;">
      <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed;">
        <tr>
          <td align="center" style="padding: 24px 12px;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #042f2e; padding: 24px; text-align: center; border-bottom: 3px solid #0d9488;">
                  <a href="${siteUrl}" style="text-decoration: none;">
                    <span style="font-size: 24px; font-weight: 800; letter-spacing: -0.5px; color: #ffffff;">
                      News<span style="color: #2dd4bf;">Free</span>365
                    </span>
                  </a>
                  <p style="margin: 6px 0 0 0; font-size: 12px; color: #99f6e4; text-transform: uppercase; letter-spacing: 1px;">
                    Daily Intelligence & Verified News Briefing
                  </p>
                </td>
              </tr>

              <!-- Lead Intro -->
              <tr>
                <td style="padding: 24px;">
                  <h1 style="margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #0f172a;">
                    ${headline || subject}
                  </h1>
                  ${
                    intro
                      ? `<p style="margin: 0 0 20px 0; font-size: 14px; color: #334155; line-height: 1.6;">${intro}</p>`
                      : ''
                  }
                  
                  <!-- Story Listings -->
                  ${storiesHtml}
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 24px; text-align: center; border-top: 1px solid #e2e8f0; font-size: 12px; color: #64748b; line-height: 1.5;">
                  <p style="margin: 0 0 8px 0;">
                    You are receiving this digest because you subscribed to NewsFree365.
                  </p>
                  <p style="margin: 0;">
                    <a href="${siteUrl}" style="color: #0f766e; text-decoration: none; font-weight: 600;">NewsFree365.live</a> &bull;
                    <a href="${unsubscribeUrl}" style="color: #e11d48; text-decoration: underline; margin-left: 6px;">Unsubscribe</a>
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
}

/**
 * Send welcome email to a new subscriber.
 */
export async function sendWelcomeEmail({ email, name = null, token }) {
  const transporter = getTransporter();
  const siteUrl = (env.SITE_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');
  const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${token}`;

  const html = `
    <div style="font-family: sans-serif; max-width: 580px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
      <h2 style="color: #0f766e; margin-top: 0;">Welcome to NewsFree365!</h2>
      <p>Hi ${name || 'there'},</p>
      <p>Thank you for subscribing to the <strong>NewsFree365 Daily Briefing</strong>. You'll now receive our curated intelligence briefings covering politics, markets, tech, and breaking global updates directly in your inbox.</p>
      <p><a href="${siteUrl}" style="display: inline-block; background-color: #0f766e; color: #ffffff; padding: 8px 16px; border-radius: 6px; text-decoration: none; font-weight: bold;">Explore Today's Top Stories &rarr;</a></p>
      <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 24px 0;" />
      <p style="font-size: 11px; color: #94a3b8;">
        Don't want to receive these emails? <a href="${unsubscribeUrl}" style="color: #ef4444;">Unsubscribe here</a>.
      </p>
    </div>
  `;

  if (!transporter) {
    console.log(`[email.service] Welcome email prepared for ${email} (SMTP not configured, skipped delivery).`);
    return { ok: true, mocked: true };
  }

  try {
    await transporter.sendMail({
      from: getFromAddress(),
      to: email,
      subject: 'Welcome to NewsFree365 Daily Briefing',
      html,
    });
    return { ok: true };
  } catch (err) {
    console.error('[email.service] Failed to send welcome email:', err.message);
    return { ok: false, error: err.message };
  }
}

/**
 * Broadcast newsletter digest to all active subscribers.
 */
export async function broadcastNewsletter({
  subject,
  headline,
  intro,
  stories = [],
  frequency = 'all',
}) {
  const subscribers = await newsletterModel.getActiveSubscribers({ frequency });

  if (!subscribers || subscribers.length === 0) {
    return {
      ok: true,
      sent: 0,
      failed: 0,
      total: 0,
      message: 'No active subscribers found in database.',
    };
  }

  const transporter = getTransporter();
  const siteUrl = (env.SITE_PUBLIC_URL || env.NEXT_PUBLIC_SITE_URL || 'https://www.newsfree365.live').replace(/\/$/, '');

  let sent = 0;
  let failed = 0;

  for (const sub of subscribers) {
    const unsubscribeUrl = `${siteUrl}/newsletter/unsubscribe?token=${sub.unsubscribe_token}`;
    const html = renderNewsletterHtml({
      subject,
      headline,
      intro,
      stories,
      unsubscribeUrl,
    });

    if (!transporter) {
      // SMTP simulated/mocked mode
      sent++;
      continue;
    }

    try {
      await transporter.sendMail({
        from: getFromAddress(),
        to: sub.email,
        subject,
        html,
      });
      sent++;
    } catch (err) {
      console.warn(`[email.service] Error sending newsletter to ${sub.email}:`, err.message);
      failed++;
    }
  }

  console.log(`[email.service] Newsletter broadcast finished: ${sent} sent, ${failed} failed across ${subscribers.length} total subscribers.`);

  return {
    ok: true,
    sent,
    failed,
    total: subscribers.length,
    message: `Newsletter broadcasted to ${sent} subscriber(s).`,
  };
}
