import json
from types import SimpleNamespace
from unittest.mock import patch

from fastapi.testclient import TestClient

from backend.api.assistant_api import app

client = TestClient(app)


class DummyResp:
    def __init__(self, payload: str):
        self._payload = payload

    def read(self) -> bytes:
        return self._payload.encode()

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        return False


def fake_urlopen(req, timeout=10):
    data = json.dumps({"choices": [{"message": {"content": "ok"}}]})
    return DummyResp(data)


def fake_urlopen_anthropic(req, timeout=10):
    data = json.dumps({"content": [{"text": "a-ok"}]})
    return DummyResp(data)


@patch("backend.api.assistant_api.request.urlopen", side_effect=fake_urlopen)
def test_proxy_openai(mock_urlopen):
    resp = client.post("/proxy/ai", json={"prompt": "hi", "openai_key": "k"})
    assert resp.status_code == 200
    assert resp.json() == {"response": "ok"}


@patch("backend.api.assistant_api.request.urlopen", side_effect=fake_urlopen_anthropic)
def test_proxy_anthropic(mock_urlopen):
    resp = client.post(
        "/proxy/ai",
        json={"prompt": "hi", "anthropic_key": "k", "model": "claude"},
    )
    assert resp.status_code == 200
    assert resp.json() == {"response": "a-ok"}
