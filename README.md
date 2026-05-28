# Jakaroo Online

A professional web-based multiplayer Jackaroo game with real-time Firebase synchronization, implementing the **Obaida Classic** ruleset.

## Features

- **Real-time Multiplayer** — Firebase Realtime Database for live game state sync
- **Obaida Classic Rules** — Locked, authentic family ruleset with full automation
- **Custom Rules** — Create and save custom rule templates (logged-in users)
- **2/3/4 Player Modes** — Solo and team modes
- **Private Rooms** — Numeric room codes with password protection
- **Guest & Account Play** — Play as guest or register for persistent features
- **Arabic + English** — Full RTL Arabic support
- **Dark/Light/Balanced Themes** — Professional wooden-board inspired design
- **Bot Support** — Very Easy bot with architecture for higher difficulties
- **Mobile-Friendly** — Responsive design for all screen sizes

## Tech Stack

- React + Vite + TypeScript
- Tailwind CSS
- Firebase Auth + Realtime Database
- Netlify deployment

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- A Firebase project with:
  - Authentication (Anonymous + Email/Password enabled)
  - Realtime Database

### Installation

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase config:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description |
|----------|-------------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain (e.g., `project.firebaseapp.com`) |
| `VITE_FIREBASE_DATABASE_URL` | Firebase RTDB URL (e.g., `https://project-default-rtdb.firebaseio.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Check

```bash
npm run typecheck
```

## Firebase Setup

### Authentication

Enable these providers in Firebase Console → Authentication → Sign-in method:
1. **Anonymous** — For guest play
2. **Email/Password** — For registered accounts

### Realtime Database

1. Create a Realtime Database in Firebase Console
2. Deploy the security rules from `firebase.database.rules.json`:

```json
{
  "rules": {
    "rooms": {
      "$roomCode": {
        ".read": true,
        ".write": "auth != null",
        "privateHands": {
          "$playerId": {
            ".read": "auth != null && auth.uid === $playerId",
            ".write": "auth != null"
          }
        }
      }
    },
    "users": {
      "$uid": {
        ".read": "auth != null && auth.uid === $uid",
        ".write": "auth != null && auth.uid === $uid"
      }
    }
  }
}
```

Key security features:
- Private hands are only readable by the owning player
- Room data is readable by anyone (for joining)
- Write access requires authentication
- User data is private to the owner

## Netlify Deployment

The project is configured for Netlify with `netlify.toml`:
- Build command: `npm run build`
- Publish directory: `dist`
- SPA redirect rules included

### Environment Variables in Netlify

Add all `VITE_FIREBASE_*` variables in:
Netlify → Site settings → Environment variables

## Project Structure

```
src/
├── lib/
│   ├── game/           # Rule engine (pure TypeScript modules)
│   │   ├── board.ts    # Board model, positions, paths
│   │   ├── cards.ts    # Deck, shuffle, dealing
│   │   ├── legalMoves.ts  # Legal action generation
│   │   ├── applyAction.ts # State mutation
│   │   ├── dealing.ts  # Deal block management
│   │   ├── turns.ts    # Turn flow
│   │   ├── win.ts      # Win conditions
│   │   ├── validators.ts  # Action validation
│   │   ├── rulesets.ts # Ruleset definitions
│   │   └── bots.ts     # Bot AI
│   ├── firebase/       # Firebase integration
│   │   ├── config.ts   # Firebase initialization
│   │   ├── auth.ts     # Authentication
│   │   └── rooms.ts    # Room CRUD & game state
│   ├── i18n/           # Internationalization
│   └── theme/          # Theme management
├── context/            # React contexts
├── pages/              # Page components
├── components/
│   ├── board/          # Board visualization
│   ├── cards/          # Card components
│   ├── game/           # Game UI components
│   └── layout/         # Layout components
├── types/              # TypeScript types
└── styles/             # CSS
```

## Obaida Classic Rules Summary

- **Board**: 72 main track spots (18×4) + 4 start/gate + 16 home spots = 92 playable
- **Deck**: Standard 52 cards, no jokers
- **Cards**: A (out/1/11), K (out/13 path-eating), Q (12 or burn), J (swap), 10 (10 or burn), 7 (split), 5 (move anyone), 4 (backward), others normal
- **Start/Gate**: Owner's marble is locked — cannot be passed, eaten, swapped, or moved by 5
- **Home**: Private, no stacking, no eating inside, no Jack/5 inside
- **Teams (4p)**: Seats 1,3 = Team A; Seats 2,4 = Team B
- **Priority**: Own moves first → teammate → opponent (5 only) → burn all
- **Dealing (4p)**: 3-round blocks (two 4-card, one 5-card random) = 52 cards

## Known Limitations

1. **No server-side validation** — Firebase security rules provide basic protection, but a Cloud Functions layer would be needed for full anti-cheat
2. **Bot AI** — Only Very Easy (random legal move) is fully functional; higher difficulties are placeholders
3. **Disconnect handling** — Foundation is in place but vote-to-continue UI needs further polish
4. **Room expiry** — 10-minute expiry logic needs a Cloud Function or scheduled cleanup
5. **Match history** — Data structure exists but recording is not yet implemented
6. **Animations** — Board movements are instant; smooth animations can be added later
7. **Sound effects** — Not yet implemented

## License

Private project.
