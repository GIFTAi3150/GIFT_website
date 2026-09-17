# Website security controls

The contact endpoint accepts same-origin JSON submissions only. It validates field
types, email addresses, inquiry categories, explicit privacy consent, field lengths,
and a 32 KiB request-body limit. A hidden website field drops simple bot submissions
without sending mail. Delivery errors are returned as failures instead of success.

The contact handler permits five attempts per client and fifty attempts in total
per ten-minute window **per running server instance**. Reservations happen before
asynchronous work, and the fixed window bounds memory usage. These in-memory limits
reset on restart and are not shared between serverless instances; they are a basic
abuse control, not a deployment-wide quota. Use an edge or shared-store rate limit
if a deployment requires a global quota.

On Vercel, client addresses use the platform-overwritten forwarded header. Other
hosts share a conservative anonymous bucket by default. Set
CONTACT_TRUST_PROXY_HEADERS=true only behind a reverse proxy that removes
visitor-supplied forwarded headers and supplies the real client address.

The Content Security Policy restricts script hosts, object embedding, base URLs,
form destinations, and framing. Inline scripts and styles remain permitted because
the static Next.js pages and animations use them. Production does not permit
general JavaScript eval; WebAssembly remains available for visual components.
HSTS is enabled for production builds without opting other subdomains into HTTPS.

Run npm run test:security, npm run build, and npm audit when changing these
controls. The tests use a fake email sender and never send email or Slack messages.

Repository visibility and owner-only GitHub settings are outside the code changes.
