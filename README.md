# Arjun AI Chatbot

A responsive ChatGPT-style web interface powered by the OpenAI API, with a Cloudflare Worker backend so your API key is never exposed in browser code.

## Project structure

- `index.html`, `styles.css`, `app.js`: GitHub Pages frontend
- `config.js`: public API endpoint configuration (no secrets)
- `worker/index.js`: Cloudflare Worker API proxy
- `worker/wrangler.toml`: Worker deployment configuration

## 1. Publish the website with GitHub Pages

1. Open **Settings → Pages** in this repository.
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Select branch **main** and folder **/(root)**, then Save.
4. Your website URL will be: https://arjunyam.github.io/Arjun-AI-Chatbot/

## 2. Deploy the secure AI backend

GitHub Pages cannot run server-side code. Deploy the Worker separately on Cloudflare:

1. Create a Cloudflare account and install Wrangler, or use the Cloudflare dashboard to create a Worker.
2. Deploy the contents of the `worker` folder as a Worker named `arjun-ai-api`.
3. In the Worker settings, add the secret **OPENAI_API_KEY** with your OpenAI API key. Never put this key in `config.js` or any frontend file.
4. Add the variable **ALLOWED_ORIGINS** with this exact value: `https://arjunyam.github.io`.
5. Optionally set **OPENAI_MODEL** to a model available to your API account (default: `gpt-4.1-mini`).

You can also deploy from a terminal using Wrangler:
```bash
cd worker
npx wrangler secret put OPENAI_API_KEY
npx wrangler deploy
```
Set `ALLOWED_ORIGINS` in the Cloudflare Worker dashboard before using the site.

## 3. Connect the frontend to the Worker

After deployment, copy your Worker URL (for example, `https://arjun-ai-api.YOUR-SUBDOMAIN.workers.dev`) into `config.js`:

```js
window.ARJUN_AI_API_URL = "https://YOUR-WORKER-URL";
```

Commit the change. Wait for GitHub Pages to publish, then open your site and test a message.

## Security notes

- Never commit API keys, tokens, or `.dev.vars`.
- Keep the Worker origin allow-list restricted to your website.
- Add Cloudflare rate limiting and usage limits before sharing the site publicly. API usage may incur charges.

## License

MIT
