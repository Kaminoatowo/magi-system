# MAGI System

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Custom OpenAI-compatible endpoints

Besides the built-in **ANTHROPIC** and **OPENAI** providers, you can point the app at **any** OpenAI-compatible API from the settings panel (⚙ CONFIG → **OPENAI-COMPAT**):

- Self-hosted **Ollama**, **llama.cpp**, **vLLM**, LM Studio, etc.
- Gateways using the OpenAI wire protocol (**OpenRouter**, one-api, LiteLLM…)

Configure three fields:

| Field | Example | Notes |
|-------|---------|-------|
| **BASE URL** | `http://localhost:11434/v1` | Required. The endpoint's `/v1` chat-completions root. |
| **MODEL NAME** | `llama3.1`, `qwen2.5`, `gpt-4o`… | Optional — falls back to the server default if empty. |
| **API KEY** | *(empty)* | Optional. Local servers (Ollama, llama.cpp) usually ignore auth and work with no key. |

Custom endpoints bypass the server free tier/quota entirely, since they use your own infrastructure.

**Note:** the client must be able to reach the endpoint. `localhost` works when the browser and AI server share a machine; self-hosted servers on another host should be exposed on the LAN as `http://<host-ip>:<port>/v1` (with CORS/origin enabled).

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.