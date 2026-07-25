// Supabase Edge Function: send-email
// Deploy with: supabase functions deploy send-email
// Requires the RESEND_API_KEY secret to be set:
//   supabase secrets set RESEND_API_KEY=your_key_here
//
// Called from both the mobile app and admin dashboard whenever a real
// booking-related email needs to go out - this is the one place that
// actually knows the Resend API key, since it must never be exposed
// to either client app.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
// Update this once you've verified your own sending domain in Resend -
// until then, Resend's shared onboarding address works for testing.
const FROM_ADDRESS = "Bookam <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const BRAND_PURPLE = "#6B2D82";
const BRAND_GOLD = "#C9A84C";

function wrapEmail(bodyHtml: string): string {
  return `
  <div style="font-family: -apple-system, Helvetica, Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #FAFAFC;">
    <div style="background: ${BRAND_PURPLE}; padding: 32px 24px; text-align: center;">
      <span style="color: white; font-size: 22px; font-weight: 700;">Book<span style="color: ${BRAND_GOLD};">am</span></span>
    </div>
    <div style="background: white; padding: 32px 24px; border-radius: 0 0 16px 16px;">
      ${bodyHtml}
    </div>
    <p style="text-align: center; color: #9E96A8; font-size: 12px; padding: 20px;">
      Bookam · Lagos, Nigeria
    </p>
  </div>`;
}

type EmailPayload = {
  to: string;
  type: "booking_confirmed" | "checkin_reminder" | "cancellation" | "refund_processed";
  firstName?: string;
  propertyName?: string;
  checkIn?: string;
  checkOut?: string;
  total?: number;
  refundAmount?: number;
  bookingRef?: string;
};

function buildEmail(payload: EmailPayload): { subject: string; html: string } {
  const name = payload.firstName || "there";
  const property = payload.propertyName || "your property";

  switch (payload.type) {
    case "booking_confirmed":
      return {
        subject: `You're all set, ${name}! Booking confirmed`,
        html: wrapEmail(`
          <h2 style="color: #1E1E1E; margin-bottom: 4px;">Booking confirmed 🎉</h2>
          <p style="color: #6B6478; line-height: 1.5;">Hi ${name}, your stay at <strong>${property}</strong> is booked.</p>
          <table style="width: 100%; margin: 20px 0; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #9E96A8;">Check-in</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${payload.checkIn || ""}</td></tr>
            <tr><td style="padding: 8px 0; color: #9E96A8;">Check-out</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${payload.checkOut || ""}</td></tr>
            <tr><td style="padding: 8px 0; color: #9E96A8;">Total paid</td><td style="padding: 8px 0; text-align: right; font-weight: 600; color: ${BRAND_PURPLE};">₦${(payload.total || 0).toLocaleString()}</td></tr>
            ${payload.bookingRef ? `<tr><td style="padding: 8px 0; color: #9E96A8;">Reference</td><td style="padding: 8px 0; text-align: right; font-weight: 600;">${payload.bookingRef}</td></tr>` : ""}
          </table>
          <p style="color: #6B6478; line-height: 1.5;">You can view or manage this booking anytime in the Bookam app.</p>
        `),
      };
    case "checkin_reminder":
      return {
        subject: `See you tomorrow, ${name}!`,
        html: wrapEmail(`
          <h2 style="color: #1E1E1E; margin-bottom: 4px;">Check-in is tomorrow 🔑</h2>
          <p style="color: #6B6478; line-height: 1.5;">Hi ${name}, your stay at <strong>${property}</strong> begins tomorrow. Safe travels!</p>
        `),
      };
    case "cancellation":
      return {
        subject: `Booking cancelled — ${property}`,
        html: wrapEmail(`
          <h2 style="color: #1E1E1E; margin-bottom: 4px;">Booking cancelled</h2>
          <p style="color: #6B6478; line-height: 1.5;">Hi ${name}, your booking at <strong>${property}</strong> has been cancelled.</p>
          <p style="color: #6B6478; line-height: 1.5;">Any applicable refund is being processed and will reflect in your account shortly.</p>
        `),
      };
    case "refund_processed":
      return {
        subject: `Refund processed — ₦${(payload.refundAmount || 0).toLocaleString()}`,
        html: wrapEmail(`
          <h2 style="color: #1E1E1E; margin-bottom: 4px;">Refund processed ✅</h2>
          <p style="color: #6B6478; line-height: 1.5;">Hi ${name}, a refund of <strong style="color: ${BRAND_PURPLE};">₦${(payload.refundAmount || 0).toLocaleString()}</strong> for your booking at ${property} has been processed to your original payment method.</p>
        `),
      };
    default:
      throw new Error(`Unknown email type: ${payload.type}`);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not configured. Run: supabase secrets set RESEND_API_KEY=your_key");
    }

    const payload: EmailPayload = await req.json();
    if (!payload.to || !payload.type) {
      throw new Error("Missing required fields: to, type");
    }

    const { subject, html } = buildEmail(payload);

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_ADDRESS,
        to: payload.to,
        subject,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorBody = await resendResponse.text();
      throw new Error(`Resend API error: ${errorBody}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("send-email error:", error);
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});