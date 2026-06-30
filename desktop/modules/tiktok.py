from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    """Gera link direto para perfis do TikTok."""
    user_clean = limpar_usuario(usuario)
    return f"https://www.tiktok.com/@{user_clean}"
