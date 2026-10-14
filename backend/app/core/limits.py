"""Rate limiting using SlowAPI in installed environments.

A small fail-safe limiter runs only in non-production test environments where
optional dependencies are unavailable; production requires SlowAPI itself.
"""

import threading
import time
import inspect
from collections import defaultdict, deque
from fastapi import HTTPException, Request
from app.core.config import settings

try:
    from slowapi import Limiter
    from slowapi.util import get_remote_address
    from slowapi.errors import RateLimitExceeded
    from slowapi import _rate_limit_exceeded_handler
    limiter = Limiter(key_func=get_remote_address, headers_enabled=False)
except ImportError:
    if settings.is_production:
        raise RuntimeError("SlowAPI is required in production")
    RateLimitExceeded = None
    _rate_limit_exceeded_handler = None
    _seen = defaultdict(deque)
    _lock = threading.Lock()

    class _LocalLimiter:
        def limit(self, rate: str):
            count, unit = rate.split("/")
            max_count = int(count)
            seconds = {"second": 1, "minute": 60, "hour": 3600}[unit]

            def decorate(func):
                from functools import wraps
                from inspect import signature

                def enforce(args, kwargs):
                    bound = signature(func).bind_partial(*args, **kwargs)
                    request = bound.arguments.get("request")
                    if isinstance(request, Request):
                        key = (request.client.host if request.client else "unknown", request.url.path)
                        with _lock:
                            now = time.monotonic()
                            hits = _seen[key]
                            while hits and now - hits[0] > seconds:
                                hits.popleft()
                            if len(hits) >= max_count:
                                raise HTTPException(429, "Too many requests")
                            hits.append(now)

                if inspect.iscoroutinefunction(func):
                    @wraps(func)
                    async def wrapped(*args, **kwargs):
                        enforce(args, kwargs)
                        return await func(*args, **kwargs)
                else:
                    @wraps(func)
                    def wrapped(*args, **kwargs):
                        enforce(args, kwargs)
                        return func(*args, **kwargs)
                return wrapped
            return decorate

    limiter = _LocalLimiter()
