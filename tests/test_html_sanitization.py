import re


def sanitize_html(html: str) -> str:
    return re.sub(r"<script.*?>.*?</script>", "", html, flags=re.DOTALL | re.IGNORECASE)


def test_script_removed():
    dirty = "<p>hi</p><script>alert('x')</script>"
    assert sanitize_html(dirty) == "<p>hi</p>"
