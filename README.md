# Trakt Calendar Server

A simple serverless API that syncs your upcoming Trakt.tv shows and movies to any iCal-supported calendar — Google Calendar, Outlook, iPhone, and more.

> **Note:** V1 uses manual Trakt tokens. OAuth authentication is coming in V2.

## Features

- Fetch upcoming **shows** and **movies** from your Trakt account.
- Generate **iCal calendars** with a default or custom number of days.
- Ready for **Vercel serverless deployment**.
- Built with TypeScript + Node.js.

## Usage

Visit **[here](https://achiranadeeshan.github.io/trakt-calendar-server/)** to generate your iCal import URL.

Or manually add the following URL to your calendar app using the "Add calendar from URL" option (e.g., in Google Calendar, go to **Other calendars → Subscribe to calendar**):

```bash
https://trakt-calendar-server.vercel.app/api/v1/ical?token=YOUR_MANUAL_TOKEN
```

To specify a custom number of days (default: 30, max: 33):

```bash
https://trakt-calendar-server.vercel.app/api/v1/ical?token=YOUR_MANUAL_TOKEN&days=14
```

### How to Get YOUR_MANUAL_TOKEN

1. If you don't have one already, create a [Trakt account](https://trakt.tv).
2. Go to [https://app.trakt.tv/settings/advanced](https://app.trakt.tv/settings/advanced).
3. Under **Your API Apps**, create a new app with these details:
   - **Name:** `Trakt Calendar`
   - **Redirect URI:** `urn:ietf:wg:oauth:2.0:oob`
   - Leave everything else blank or at default, then save.
4. Open the newly created app and click **Authorize** next to the Redirect URI. You'll be shown a **one-time code**.
5. Exchange that code for a bearer token (valid for ~30 days) using one of the methods below.

**Using Postman:** Send a `POST` request to `https://api.trakt.tv/oauth/token` with this JSON body:

```json
{
  "code": "one_time_code",
  "client_id": "client_id",
  "client_secret": "client_secret",
  "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
  "grant_type": "authorization_code"
}
```

**Using cURL:**

```bash
curl -X POST "https://api.trakt.tv/oauth/token" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "one_time_code",
    "client_id": "client_id",
    "client_secret": "client_secret",
    "redirect_uri": "urn:ietf:wg:oauth:2.0:oob",
    "grant_type": "authorization_code"
  }'
```

The `access_token` in the response is your `YOUR_MANUAL_TOKEN`.

## Development

### Folder Structure

```
trakt-calendar-server/
├─ api/
│  ├─ v1/
│  │  └─ ical.ts            # Manual token endpoint
│  └─ v2/
│     └─ ical.ts            # OAuth flow (under development)
├─ src/
│  ├─ services/
│  │  └─ trakt.ts           # Trakt API client
│  └─ utils/
│     └─ ical.ts            # iCal generator
├─ .env.local               # Environment variables
├─ package.json
├─ tsconfig.json
└─ README.md
```

### Setup

1. Clone the repository:

```bash
git clone https://github.com/AchiraNadeeshan/trakt-calendar-server.git
cd trakt-calendar-server
```

2. Install dependencies:

```bash
npm install
```

3. Install the Vercel CLI (if you haven't already):

```bash
npm install -g vercel
```

### Environment Variables

Create a `.env.local` file at the project root:

```bash
TRAKT_CLIENT_ID=YOUR_TRAKT_CLIENT_ID
```

This is used to authenticate requests to the Trakt API. It's optional if you're testing with manual tokens.

### Run Locally

```bash
npm run dev:server
```

The server will be available at [http://localhost:3000](http://localhost:3000).

## Future Plans

- OAuth2 authentication flow (v2)
- Server-side caching for better performance

## Contributing

Contributions are welcome! Feel free to open an issue or submit a pull request.

## License

[MIT](https://opensource.org/licenses/MIT)
