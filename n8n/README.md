
# n8n - Automatización AI
Usaremos [n8n](https://n8n.io/) para automatización de flujos de trabajo.

## 🚀 Uso rápido

### Iniciar n8n

```sh
docker compose up -d
```

### Parar n8n

```sh
docker compose down
```

## 🐳 Usar Docker puro

Solo si no cuentas con Docker Compose:

```sh
docker run -d \
  --name n8n \
  --restart always \
  -p 5678:5678 \
  -e N8N_HOST=localhost \
  -e N8N_PORT=5678 \
  -e WEBHOOK_URL=http://localhost:5678/ \
  -v n8n_data:/home/node/.n8n \
  docker.n8n.io/n8nio/n8n
```

## 📚 Recursos útiles

- [Documentación oficial de n8n](https://docs.n8n.io/)
- [Comunidad n8n](https://community.n8n.io/)


## 📋 Clipboard

```
https://api.telegram.org/bot<TELEGRAM_API_KEY>/getUpdates
```