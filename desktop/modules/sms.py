from core.utils import limpar_numero, codificar_texto

def gerar_link(numero: str, mensagem: str) -> str:
    """Gera link para envio de SMS com conteúdo pré-preenchido."""
    num_clean = limpar_numero(numero)
    msg_encoded = codificar_texto(mensagem)
    return f"sms:{num_clean}?body={msg_encoded}"
