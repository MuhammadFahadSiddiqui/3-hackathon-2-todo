import json
import time
from typing import Any

import httpx
import jwt
from jwt.algorithms import OKPAlgorithm

from app.config import get_settings


class JWKSCache:
    """Cache for JWKS public keys with 1-hour TTL."""

    def __init__(self, jwks_url: str | None = None):
        settings = get_settings()
        self.jwks_url = jwks_url or settings.better_auth_jwks_url
        self._cache: dict[str, Any] | None = None
        self._public_keys: dict[str, Any] = {}
        self._cache_time: float = 0
        self._ttl: int = 3600  # 1 hour TTL

    def _is_cache_valid(self) -> bool:
        """Check if the cache is still valid."""
        return (
            self._cache is not None and (time.time() - self._cache_time) < self._ttl
        )

    async def _fetch_jwks(self) -> dict[str, Any]:
        """Fetch JWKS from the configured URL."""
        async with httpx.AsyncClient() as client:
            response = await client.get(self.jwks_url)
            response.raise_for_status()
            return response.json()

    def _parse_jwks(self, jwks: dict[str, Any]) -> None:
        """Parse JWKS and extract public keys."""
        self._public_keys = {}
        for key in jwks.get("keys", []):
            key_id = key.get("kid")
            if not key_id:
                continue

            # Handle EdDSA (Ed25519) keys - Better Auth default
            if key.get("kty") == "OKP" and key.get("crv") == "Ed25519":
                try:
                    public_key = OKPAlgorithm.from_jwk(json.dumps(key))
                    self._public_keys[key_id] = public_key
                except Exception:
                    continue

            # Handle RSA keys as fallback
            elif key.get("kty") == "RSA":
                try:
                    public_key = jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key))
                    self._public_keys[key_id] = public_key
                except Exception:
                    continue

    async def get_public_key(self, kid: str, force_refresh: bool = False) -> Any | None:
        """
        Get public key by key ID.

        Args:
            kid: Key ID from JWT header
            force_refresh: Force refresh of JWKS cache

        Returns:
            Public key object or None if not found
        """
        # Check if we need to refresh the cache
        if force_refresh or not self._is_cache_valid():
            try:
                jwks = await self._fetch_jwks()
                self._cache = jwks
                self._cache_time = time.time()
                self._parse_jwks(jwks)
            except Exception:
                # If refresh fails and we have stale cache, use it
                if self._cache is not None:
                    pass
                else:
                    return None

        return self._public_keys.get(kid)

    async def refresh_and_get_key(self, kid: str) -> Any | None:
        """Force refresh JWKS and get key - used for unknown key IDs."""
        return await self.get_public_key(kid, force_refresh=True)


# Global JWKS cache instance
_jwks_cache: JWKSCache | None = None


def get_jwks_cache() -> JWKSCache:
    """Get or create the global JWKS cache instance."""
    global _jwks_cache
    if _jwks_cache is None:
        _jwks_cache = JWKSCache()
    return _jwks_cache
