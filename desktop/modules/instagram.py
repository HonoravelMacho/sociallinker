from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    """Gera link de redirecionamento para o Direct do Instagram."""
    user_clean = limpar_usuario(usuario)
    return f"https://ig.me/m/{user_clean}"
