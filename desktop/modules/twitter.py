from core.utils import limpar_usuario, codificar_texto

def gerar_link(usuario: str, mensagem: str = "") -> str:
    """Gera link para tweet pré-preenchido ou perfil no X (Twitter)."""
    user_clean = limpar_usuario(usuario)
    if mensagem.strip():
        msg_encoded = codificar_texto(mensagem)
        return f"https://twitter.com/intent/tweet?text=@{user_clean}%20{msg_encoded}"
    return f"https://twitter.com/{user_clean}"
