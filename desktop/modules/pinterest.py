from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    """Gera link direto para perfis do Pinterest."""
    user_clean = limpar_usuario(usuario)
    return f"https://www.pinterest.com/{user_clean}/"
