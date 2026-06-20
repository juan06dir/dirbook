from fastapi import Request
from slowapi import Limiter
from slowapi.util import get_remote_address


def get_client_ip(request: Request) -> str:
    """IP real del cliente. En Render/proxies la IP viene en X-Forwarded-For;
    si no, usamos la IP directa de la conexión."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # El primer valor es el cliente original
        return forwarded.split(",")[0].strip()
    return get_remote_address(request)


# Limitador global compartido por la app y los routers.
limiter = Limiter(key_func=get_client_ip)
