def gerar_link(canal: str) -> str:
    """Gera link de inscrição direta para canais do YouTube."""
    canal_clean = canal.strip()
    return f"https://www.youtube.com/{canal_clean}?sub_confirmation=1"
