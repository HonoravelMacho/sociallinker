from core.utils import limpar_numero, codificar_texto

def gerar_link(ddi: str, ddd: str, numero: str, mensagem: str) -> str:
    """Gera link de conversa direta no WhatsApp."""
    ddi_clean = limpar_numero(ddi) or "55"
    ddd_clean = limpar_numero(ddd)
    num_clean = limpar_numero(numero)
    msg_encoded = codificar_texto(mensagem)
    return f"https://wa.me/{ddi_clean}{ddd_clean}{num_clean}?text={msg_encoded}"
