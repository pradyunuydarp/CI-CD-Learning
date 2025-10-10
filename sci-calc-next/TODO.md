# TODO: Jenkins Webhook Secret Setup

1. Generate a strong webhook secret:
   - Run `openssl rand -hex 32` in a terminal and copy the output string.

2. Configure Jenkins:
   - Open **Manage Jenkins → Credentials → (global) → Add Credentials**.
   - Choose **Secret text**, paste the generated string, and set ID `github-webhook-secret`.
   - Save; then go to **Manage Jenkins → Configure System → GitHub → GitHub Servers**, edit the entry, and select the new secret credential for webhook verification.

3. Configure GitHub webhook:
   - In the GitHub repo, go to **Settings → Webhooks → Add webhook** (or edit an existing one).
   - Payload URL: `https://<current-ngrok-domain>/github-webhook/` (replace with the active tunnel URL).
   - Content type: `application/json`.
   - Secret: paste the same value from step 1.
   - Events: keep “Just the push event” unless more are required.
   - Save and verify the webhook reports a green check.

4. Update documentation/report after setup with screenshots (ngrok session, Jenkins credential, GitHub webhook) and mention the secret handling.
