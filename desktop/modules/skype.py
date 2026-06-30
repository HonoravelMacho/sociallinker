def gerar_link(usuario: str) -> str:
    """Gera link para iniciar conversas direta no Skype."""
    user_clean = usuario.strip()
    return f"skype:{user_clean}?chat"
