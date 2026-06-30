def gerar_link(usuario_ou_link: str) -> str:
    """Gera link direto para conversas no Facebook Messenger."""
    usuario = usuario_ou_link.split("/")[-1].strip()
    return f"https://m.me/{usuario}"
