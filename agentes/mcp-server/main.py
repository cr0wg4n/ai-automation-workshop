from fastmcp import FastMCP
import random

mcp = FastMCP("MCP demo server")

@mcp.tool
def temperature(city: str) -> str:
    temperature = random.randint(15, 30)
    return f'En {city} la temperatura es de {str(temperature)}°C'

if __name__ == "__main__":
    mcp.run(transport="http", host="127.0.0.1", port=8000)