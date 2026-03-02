# Scenario × Persona Chat Collector

A conversational volunteer console that assigns a random scenario + persona pairing, shows the volunteer only their persona brief, and streams scripted user cards automatically (WhatsApp/WeChat style). Replies are captured into a schema-compliant JSON payload and synced to Firestore in the background.

## Features
- Auto-match on load (`Sxxx` scenario × `Pxxx` persona) with modal persona briefing before the chat starts.
- Scripted user bubbles arrive with a typing indicator ~1s after each assistant reply; volunteers just respond like a real chat (emoji supported).
- Chat UI mimics modern messengers (bubbles, typing dots, helper hints) plus a help drawer for persona reminders. Scenario scripts stay hidden unless an operator explicitly reveals them.
- Conversation log is exported as structured JSON (`schema_version=1.0`) and auto-saved to Firestore (if environment keys are configured).

## Getting Started
1. Install dependencies (Node 20.19+ recommended because Vite 7 warns on Node 18 runtimes):
   ```bash
   npm install
   ```
2. Configure Firebase in `.env` (see `src/firebase.ts` for keys). Without these the app still works but skips Firestore sync.
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Usage Flow
1. Open the app → persona briefing modal pops up. Read the tone/instructions and click “开始对话”.
2. The first user card appears with a typing animation. Reply directly in the input box (emoji OK). After you send, the system waits ~1s and streams the next card.
3. The help drawer (top-right) resurfaces the persona card and, if needed for operations, can reveal the hidden scenario script list.
4. JSON can be downloaded anytime, while Firestore writes happen automatically after each bubble (status badge in the header will confirm success/failure).
