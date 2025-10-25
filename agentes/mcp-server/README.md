Instala UV previamente si no lo tienes

```sh
pip install uv
```


## Instala dependencias

Primero crea el entorno
```
uv venv
```

luego activalo en windows 

```
.venv\Scripts\activate
```

o en linux

```
source .venv/bin/activate
```

y finalmente instala las dependencias

```
uv pip install -r pyproject.toml  
```
## Inicia el servidor

```
python main.py
```

Estara disponible en http://127.0.0.1:8000/mcp


si quisieras integrarlo con opencode, debes agregarlo al `opencode.json` como un agente mas

```json
{
  "$schema": "https://opencode.ai/config.json",
  "mcp": {
    "weather": {
      "type": "remote",
      "enabled": true,
      "url": "http://localhost:8000/mcp"
    }
  }
}
```