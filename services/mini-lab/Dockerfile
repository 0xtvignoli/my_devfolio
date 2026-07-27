FROM node:22-slim

# aws-cli v2 — the mini-lab spawns it against floci. (Terraform can be added
# here when/if terraform-backed actions land; the current allowlist is aws-only.)
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl unzip ca-certificates \
 && curl -fsSL "https://awscli.amazonaws.com/awscli-exe-linux-$(uname -m).zip" -o /tmp/awscli.zip \
 && unzip -q /tmp/awscli.zip -d /tmp \
 && /tmp/aws/install \
 && rm -rf /tmp/* /var/lib/apt/lists/*

WORKDIR /app
COPY server.mjs actions.mjs deploy-eks.sh ./

ENV PORT=8080
EXPOSE 8080
CMD ["node", "server.mjs"]
