# Dockerfile

The server uses dotenv and expects env vars at runtime (e.g. DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, JWT_SECRET, PORT). Provide them via:
--env-file server/.env, or
-e VAR=value, or
your orchestrator’s env config.
Migrations are not run inside the image. Run them against the same DB before or after starting the container (e.g. npm run db:create and npm run db:migrate from the host or a one-off container).