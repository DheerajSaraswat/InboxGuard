# Mailgun Setup for InboxGuard

## Backend URL
Your ngrok backend URL: `https://f64ca56d68da.ngrok-free.app`

## Mailgun Configuration

### 1. Domain Setup
- Using Mailgun sandbox domain: `sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org`
- No DNS verification needed for sandbox domains
- Base API URL: `https://api.mailgun.net`

### 2. Webhook Configuration
In Mailgun dashboard → Routes:

**Create Route:**
- **Expression:** `match_recipient(".*@sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org")`
- **Action:** Forward to `https://f64ca56d68da.ngrok-free.app/api/emails/mailgun/inbound`
- **Priority:** 0

### 3. Environment Variables
Add to your `.env` file:

```env
# Mailgun
MAILGUN_API_KEY=your_mailgun_api_key_here
MAILGUN_DOMAIN=sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org
MAILGUN_FROM_EMAIL=noreply@sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org

# Optional: restrict to internal emails only
INTERNAL_ONLY=true

# Encryption
APP_ENCRYPTION_KEY_B64=your_32_byte_base64_key_here
```

### 4. Test Email Flow

**Send test email via Mailgun:**
```bash
curl -s --user 'api:YOUR_MAILGUN_API_KEY' \
  https://api.mailgun.net/v3/sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org/messages \
  -F from='test@sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org' \
  -F to='recipient@sandboxda5f5deb620e44a39395c1691901c0d3.mailgun.org' \
  -F subject='Test Email' \
  -F text='This is a test email'
```

**Expected behavior:**
1. Email gets delivered to recipient
2. Webhook fires to your ngrok URL
3. Email stored in MongoDB with `mailbox: "inbox"`
4. FCM notification sent if recipient has FCM token

### 5. FCM Token Registration
From your client, register FCM token:

```javascript
// After getting FCM token from Firebase
const response = await fetch('https://f64ca56d68da.ngrok-free.app/api/users/fcm-token', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${firebaseIdToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ token: fcmToken })
});
```

## Testing Checklist
- [ ] Mailgun sandbox domain ready (no DNS setup needed)
- [ ] Route created and pointing to ngrok URL
- [ ] Backend running and accessible via ngrok
- [ ] Test email sent and webhook received
- [ ] Email stored in MongoDB
- [ ] FCM notification received (if token registered)

## Important Notes
- Sandbox domains can only send emails to authorized recipients
- Add recipient emails to Mailgun's authorized recipients list for testing
- For production, you'll need to verify your custom domain `inboxguard.live`
