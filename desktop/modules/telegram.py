from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    """Gera link para conversa direta no Telegram."""
    user_clean = limpar_usuario(usuario)
    return f"https://t.me/{user_clean}"
