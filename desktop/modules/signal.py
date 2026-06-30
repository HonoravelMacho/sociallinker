from core.utils import limpar_numero

def gerar_link(numero: str) -> str:
    """Gera link para iniciar conversas no Signal."""
    num_clean = limpar_numero(numero)
    return f"https://signal.me/#p/{num_clean}"
