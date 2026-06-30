from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    """Gera link direto para o perfil do LinkedIn."""
    user_clean = limpar_usuario(usuario)
    return f"https://www.linkedin.com/in/{user_clean}"
