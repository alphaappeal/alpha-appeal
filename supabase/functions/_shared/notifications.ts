import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Send delivery-related notifications to customers
 * Supports multiple channels: email, SMS, push, in-app
 */

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

export type NotificationType = 
  | "driver_assigned"
  | "out_for_delivery"
  | "delivered"
  | "delivery_failed"
  | "delivery_delayed";

export type NotificationChannel = "email" | "sms" | "push" | "in_app";

interface NotificationOptions {
  userId: string;
  deliveryId?: string;
  type: NotificationType;
  channel?: NotificationChannel;
  customData?: Record<string, any>;
}

/**
 * Send delivery notification via specified channel(s)
 */
export async function sendDeliveryNotification(options: NotificationOptions) {
  const { userId, deliveryId, type, channel = "in_app", customData } = options;
  
  try {
    // Get user contact information
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, phone, full_name")
      .eq("id", userId)
      .single();
    
    if (!profile) {
      console.error(`Profile not found for user ${userId}`);
      return { success: false, error: "User profile not found" };
    }

    // Get delivery details if provided
    let deliveryData: any = null;
    if (deliveryId) {
      const { data } = await supabase
        .from("user_deliveries")
        .select("*, orders(order_number, product_name)")
        .eq("id", deliveryId)
        .single();
      deliveryData = data;
    }

    // Prepare notification content
    const notification = {
      user_id: userId,
      delivery_id: deliveryId,
      notification_type: type,
      channel,
      subject: getNotificationSubject(type),
      message_body: getNotificationMessage(type, profile.full_name, deliveryData, customData),
      metadata: {
        delivery: deliveryData,
        ...customData,
      },
      status: "pending" as const,
      created_at: new Date().toISOString(),
    };

    // Insert notification record
    const { data: inserted, error: insertError } = await supabase
      .from("delivery_notifications")
      .insert(notification)
      .select()
      .single();

    if (insertError) {
      console.error("Failed to insert notification:", insertError);
      return { success: false, error: insertError.message };
    }

    // Send via appropriate channel
    switch (channel) {
      case "email":
        if (profile.email) {
          await sendEmail({
            to: profile.email,
            subject: notification.subject,
            html: renderEmailTemplate(type, profile.full_name, deliveryData, customData),
          });
          
          // Update status
          await supabase
            .from("delivery_notifications")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", inserted.id);
        }
        break;
      
      case "sms":
        if (profile.phone) {
          await sendSMS({
            to: profile.phone,
            body: formatSMSMessage(type, profile.full_name, deliveryData, customData),
          });
          
          await supabase
            .from("delivery_notifications")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", inserted.id);
        }
        break;
      
      case "push":
        await sendPushNotification({
          userId,
          title: notification.subject,
          body: notification.message_body,
          data: { type, deliveryId, ...customData },
        });
        
        await supabase
          .from("delivery_notifications")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", inserted.id);
        break;
      
      case "in_app":
        // Create in-app notification
        await supabase.from("user_notifications").insert({
          user_id: userId,
          type: "delivery_update",
          title: notification.subject,
          message: notification.message_body,
          metadata: notification.metadata,
        });
        
        await supabase
          .from("delivery_notifications")
          .update({ status: "delivered", delivered_at: new Date().toISOString() })
          .eq("id", inserted.id);
        break;
    }

    console.log(`Notification sent: ${type} to ${channel} for user ${userId}`);
    return { success: true, notificationId: inserted.id };
  } catch (error: any) {
    console.error("Send notification error:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}

/**
 * Send notifications for all active delivery stages
 */
export async function handleDeliveryStatusChange(
  deliveryId: string,
  newStatus: string,
  deliveryData: any
) {
  const notifications: Array<{ type: NotificationType; channels: NotificationChannel[] }> = [];

  switch (newStatus) {
    case "assigned":
      notifications.push({
        type: "driver_assigned",
        channels: ["in_app", "email"],
      });
      break;
    
    case "in_transit":
    case "picked_up":
      notifications.push({
        type: "out_for_delivery",
        channels: ["in_app", "sms"],
      });
      break;
    
    case "delivered":
      notifications.push({
        type: "delivered",
        channels: ["in_app", "email"],
      });
      break;
    
    case "failed":
      notifications.push({
        type: "delivery_failed",
        channels: ["in_app", "sms", "email"],
      });
      break;
  }

  // Send each notification
  const results = [];
  for (const notification of notifications) {
    for (const channel of notification.channels) {
      const result = await sendDeliveryNotification({
        userId: deliveryData.user_id,
        deliveryId,
        type: notification.type,
        channel,
        customData: deliveryData,
      });
      results.push(result);
    }
  }

  return results;
}

// ─── Helper Functions ──────────────────────────────────────────────────

function getNotificationSubject(type: NotificationType): string {
  const subjects = {
    driver_assigned: "🚗 Your Driver Has Been Assigned!",
    out_for_delivery: "📦 Your Order is On the Way!",
    delivered: "✅ Delivery Complete - Enjoy Your Order!",
    delivery_failed: "⚠️ Delivery Attempt Failed",
    delivery_delayed: "⏰ Delivery Update - Slight Delay",
  };
  return subjects[type];
}

function getNotificationMessage(
  type: NotificationType,
  customerName: string,
  deliveryData: any,
  customData?: any
): string {
  const orderName = deliveryData?.orders?.product_name || `Order #${deliveryData?.orders?.order_number || "N/A"}`;
  
  switch (type) {
    case "driver_assigned":
      return `Hi ${customerName}! Great news - your driver ${deliveryData?.driver_name || ""} has been assigned for ${orderName}. You can track your delivery in real-time.`;
    
    case "out_for_delivery":
      return `${orderName} is on its way! ETA: ${deliveryData?.eta_minutes || "15-30"} minutes. Track your driver's location in the app.`;
    
    case "delivered":
      return `Thanks for ordering with Alpha! Your ${orderName} has been delivered. We hope you enjoy it! 🎉`;
    
    case "delivery_failed":
      return `We're sorry, but there was an issue delivering ${orderName}. Our team will contact you shortly to reschedule.`;
    
    case "delivery_delayed":
      return `Update on ${orderName}: Your delivery is running slightly behind schedule. New ETA: ${customData?.new_eta || "soon"}. Thank you for your patience!`;
    
    default:
      return "Your delivery status has been updated.";
  }
}

function formatSMSMessage(
  type: NotificationType,
  customerName: string,
  deliveryData: any,
  customData?: any
): string {
  const messages = {
    driver_assigned: `Alpha: Your driver ${deliveryData?.driver_name || ""} is ready! Track: ${deliveryData?.tracking_url || "app"}`,
    out_for_delivery: `Alpha: Out for delivery! ETA ${deliveryData?.eta_minutes || "15-30"} min. Track live in app.`,
    delivered: `Alpha: Delivered! Enjoy your order. Thanks for choosing Alpha! 🎉`,
    delivery_failed: `Alpha: Delivery attempt failed for your order. We'll contact you soon to reschedule.`,
    delivery_delayed: `Alpha: Running slightly behind. New ETA: ${customData?.new_eta || "soon"}. Thanks for patience!`,
  };
  return messages[type];
}

async function sendEmail(options: { to: string; subject: string; html: string }) {
  // Use Supabase Edge Function or third-party service (SendGrid, Postmark, etc.)
  const MAILERLITE_API_KEY = Deno.env.get("MAILERLITE_API_KEY");
  
  if (MAILERLITE_API_KEY) {
    // Simple implementation using MailerLite
    await fetch("https://api.mailerlite.com/api/v2/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${MAILERLITE_API_KEY}`,
      },
      body: JSON.stringify({
        email: options.to,
        fields: {
          name: options.subject,
        },
      }),
    });
  } else {
    console.warn("Email service not configured");
  }
}

async function sendSMS(options: { to: string; body: string }) {
  // Use Twilio, AWS SNS, or other SMS provider
  const TWILIO_ACCOUNT_SID = Deno.env.get("TWILIO_ACCOUNT_SID");
  const TWILIO_AUTH_TOKEN = Deno.env.get("TWILIO_AUTH_TOKEN");
  
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: options.to,
        From: "+27123456789", // Your Twilio number
        Body: options.body,
      }),
    });
  } else {
    console.warn("SMS service not configured");
  }
}

async function sendPushNotification(options: { userId: string; title: string; body: string; data?: any }) {
  // Use Firebase Cloud Messaging or OneSignal
  const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY");
  
  if (FCM_SERVER_KEY) {
    await fetch("https://fcm.googleapis.com/fcm/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `key=${FCM_SERVER_KEY}`,
      },
      body: JSON.stringify({
        to: `/topics/user_${options.userId}`,
        notification: {
          title: options.title,
          body: options.body,
        },
        data: options.data,
      }),
    });
  } else {
    console.warn("Push notification service not configured");
  }
}

function renderEmailTemplate(
  type: NotificationType,
  customerName: string,
  deliveryData: any,
  customData?: any
): string {
  // Simple HTML template - replace with proper templates in production
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 12px 12px; }
          .button { display: inline-block; padding: 12px 24px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${getNotificationSubject(type)}</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>${getNotificationMessage(type, customerName, deliveryData, customData)}</p>
            ${deliveryData?.tracking_url ? `
              <a href="${deliveryData.tracking_url}" class="button">Track Your Delivery</a>
            ` : ""}
          </div>
          <div class="footer">
            <p>Thank you for choosing Alpha!</p>
            <p>Questions? Reply to this email or contact support.</p>
          </div>
        </div>
      </body>
    </html>
  `;
}
