import { getRabbitChannel } from "../../lib/rabbitmq";
import { EmailService } from "./email.service";
import { QUEUES } from "../../lib/queue_names/queues";

const emailService = new EmailService();

const formatTime12Hour = (time: string) => {
  const [hourStr, minute] = time.split(":");
  let hour = parseInt(hourStr, 10);

  const ampm = hour >= 12 ? "PM" : "AM";

  hour = hour % 12;
  hour = hour ? hour : 12;

  return `${hour}:${minute} ${ampm}`;
};

const formatDate = (date: string | Date) => {
  return new Date(date).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const startEmailConsumer = async () => {
  const channel = getRabbitChannel();

  await channel.assertQueue(QUEUES.EMAIL, { durable: true });

  console.log("📥 Email consumer running...");

  channel.consume(QUEUES.EMAIL, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    try {
      if (data.event === "BOOKING.SUCCESS") {
        const p = data.payload;

        const formattedDate = formatDate(p.bookingDate);
        const formattedTime = formatTime12Hour(p.startTime);

        await emailService.sendEmail({
          to: p.email,
          subject: "Booking Request Received – Awaiting Confirmation",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Request – Bookify</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

        <!-- Header -->
        <tr>
          <td style="background:#534AB7;padding:28px 32px;text-align:center;">
            <span style="font-size:22px;font-weight:600;color:#EEEDFE;letter-spacing:-0.3px;">
              Bookify<span style="color:#AFA9EC;">.</span>
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="padding:32px;">

            <!-- Pending banner -->
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAEEDA;border:1px solid #EF9F27;border-radius:8px;margin-bottom:24px;">
              <tr>
                <td style="padding:14px 16px;font-size:13px;color:#633806;line-height:1.6;">
                  <strong style="color:#412402;">Awaiting confirmation.</strong>
                  This is a copy of your booking request. Your appointment is not yet confirmed —
                  the business will review and reach out to finalize your booking.
                </td>
              </tr>
            </table>

            <!-- Greeting -->
            <p style="font-size:16px;color:#111;margin:0 0 24px;line-height:1.6;">
              Hi ${p.firstName},<br/>
              Thanks for submitting your booking request. Here's a summary of what you sent.
            </p>

            <!-- Details label -->
            <p style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin:0 0 10px;">
              Booking details
            </p>

            <!-- Details table -->
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;margin-bottom:24px;font-size:13px;">
              <tr>
                <td style="padding:10px 14px;color:#666;background:#f9f9f9;width:130px;">Service</td>
                <td style="padding:10px 14px;color:#111;font-weight:500;">${p.serviceName}</td>
              </tr>
              <tr style="border-top:1px solid #e4e4e7;">
                <td style="padding:10px 14px;color:#666;background:#f9f9f9;">Date</td>
                <td style="padding:10px 14px;color:#111;font-weight:500;">${formattedDate}</td>
              </tr>
              <tr style="border-top:1px solid #e4e4e7;">
                <td style="padding:10px 14px;color:#666;background:#f9f9f9;">Time</td>
                <td style="padding:10px 14px;color:#111;font-weight:500;">${formattedTime}</td>
              </tr>
              <tr style="border-top:1px solid #e4e4e7;">
                <td style="padding:10px 14px;color:#666;background:#f9f9f9;">Price</td>
                <td style="padding:10px 14px;color:#111;font-weight:500;">₱${Number(p.servicePrice).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
              </tr>
            </table>

            <!-- Note -->
            <p style="font-size:13px;color:#555;line-height:1.7;margin:0;">
              You'll receive a follow-up email once the business confirms your appointment.
              If you have any questions in the meantime, please contact them directly.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#f9f9f9;text-align:center;">
            <p style="font-size:12px;color:#aaa;margin:0;line-height:1.6;">
              Sent by <strong style="color:#888;">Bookify</strong> &middot;
              You're receiving this because you submitted a booking request.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
          `,
        });
      }

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Email failed:", err);
      channel.nack(msg, false, true);
    }
  });

  await channel.assertQueue(QUEUES.BOOKING, { durable: true });

  channel.consume(QUEUES.BOOKING, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    try {
      if (data.event === "BOOKING.CONFIRMED") {
        const p = data.payload;

        const formattedDate = formatDate(p.bookingDate);
        const formattedTime = formatTime12Hour(p.startTime);

        await emailService.sendEmail({
          to: p.email,
          subject: "Booking Confirmed – Bookify",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Confirmed – Bookify</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

        <tr>
          <td style="background:#534AB7;padding:24px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#EEEDFE;">
              Bookify<span style="color:#AFA9EC;">.</span>
            </div>
            <div style="font-size:12px;color:#AFA9EC;margin-top:4px;letter-spacing:0.04em;">
              Appointment Management
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px;">

            <div style="display:inline-flex;align-items:center;gap:6px;background:#EAF3DE;border:1px solid #97C459;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:#27500A;margin-bottom:24px;">
              <span style="width:7px;height:7px;border-radius:50%;background:#3B6D11;display:inline-block;"></span>
              Booking confirmed
            </div>

            <p style="font-size:15px;color:#111;margin:0 0 8px;line-height:1.6;">
              Hi ${p.firstName},
            </p>
            <p style="font-size:13px;color:#666;margin:0 0 24px;line-height:1.6;">
              Your appointment has been confirmed. See you then!
            </p>

            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 10px;">
              Appointment summary
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;font-size:13px;margin-bottom:20px;">
              <tr>
                <td style="padding:11px 14px;background:#f9f9f9;color:#777;width:120px;">Date</td>
                <td style="padding:11px 14px;color:#111;font-weight:500;">${formattedDate}</td>
              </tr>
              <tr style="border-top:1px solid #f0f0f0;">
                <td style="padding:11px 14px;background:#f9f9f9;color:#777;">Time</td>
                <td style="padding:11px 14px;color:#111;font-weight:500;">${formattedTime}</td>
              </tr>
            </table>

            

            <div style="background:#EAF3DE;border-left:3px solid #639922;border-radius:0 6px 6px 0;padding:12px 14px;">
              <p style="font-size:13px;color:#3B6D11;margin:0;line-height:1.6;">
                Please keep this email as your booking confirmation. If you need to reschedule or cancel, contact the business directly.
              </p>
            </div>

          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#f9f9f9;text-align:center;">
            <p style="font-size:12px;color:#bbb;margin:0;line-height:1.6;">
              Sent by <strong style="color:#888;">Bookify</strong> &middot; You're receiving this because you made a booking.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`,
        });
      }

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Email failed:", err);
      channel.nack(msg, false, true);
    }
  });

  await channel.assertQueue(QUEUES.CANCEL, { durable: true });

  channel.consume(QUEUES.CANCEL, async (msg) => {
    if (!msg) return;

    const data = JSON.parse(msg.content.toString());

    try {
      if (data.event === "BOOKING.CANCELLED") {
        const p = data.payload;

        const formattedDate = formatDate(p.bookingDate);
        const formattedTime = formatTime12Hour(p.startTime);

        await emailService.sendEmail({
          to: p.email,
          subject: "Booking Cancelled – Bookify",
          html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Booking Cancelled – Bookify</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">

        <tr>
          <td style="background:#534AB7;padding:24px 32px;text-align:center;">
            <div style="font-size:22px;font-weight:700;color:#EEEDFE;">
              Bookify<span style="color:#AFA9EC;">.</span>
            </div>
            <div style="font-size:12px;color:#AFA9EC;margin-top:4px;letter-spacing:0.04em;">
              Appointment Management
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:32px;">

            <div style="display:inline-flex;align-items:center;gap:6px;background:#FCEBEB;border:1px solid #F09595;border-radius:20px;padding:5px 14px;font-size:12px;font-weight:600;color:#501313;margin-bottom:24px;">
              <span style="width:7px;height:7px;border-radius:50%;background:#A32D2D;display:inline-block;"></span>
              Booking cancelled
            </div>

            <p style="font-size:15px;color:#111;margin:0 0 8px;line-height:1.6;">
              Hi ${p.firstName},
            </p>
            <p style="font-size:13px;color:#666;margin:0 0 24px;line-height:1.6;">
              Your booking has been cancelled. We're sorry for the inconvenience.
            </p>

            <p style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;color:#999;margin:0 0 10px;">
              Appointment summary
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e4e4e7;border-radius:8px;overflow:hidden;font-size:13px;margin-bottom:20px;">
              <tr>
                <td style="padding:11px 14px;background:#f9f9f9;color:#777;width:120px;">Date</td>
                <td style="padding:11px 14px;color:#111;font-weight:500;">${formattedDate}</td>
              </tr>
              <tr style="border-top:1px solid #f0f0f0;">
                <td style="padding:11px 14px;background:#f9f9f9;color:#777;">Time</td>
                <td style="padding:11px 14px;color:#111;font-weight:500;">${formattedTime}</td>
              </tr>
            </table>

            <div style="background:#FCEBEB;border-left:3px solid #E24B4A;border-radius:0 6px 6px 0;padding:12px 14px;">
              <p style="font-size:13px;color:#A32D2D;margin:0;line-height:1.6;">
                If you believe this was a mistake or would like to rebook, please contact the business directly.
              </p>
            </div>

          </td>
        </tr>

        <tr>
          <td style="padding:16px 32px;border-top:1px solid #e4e4e7;background:#f9f9f9;text-align:center;">
            <p style="font-size:12px;color:#bbb;margin:0;line-height:1.6;">
              Sent by <strong style="color:#888;">Bookify</strong> &middot; You're receiving this because you had a booking with us.
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
`,
        });
      }

      channel.ack(msg);
    } catch (err) {
      console.error("❌ Email failed:", err);
      channel.nack(msg, false, true);
    }
  });
};
