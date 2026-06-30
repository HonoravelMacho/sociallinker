import urllib.parse

def limpar_numero(texto: str) -> str:
    """Remove todos os caracteres não numéricos de uma string."""
    return "".join(filter(str.isdigit, texto))

def limpar_usuario(texto: str) -> str:
    """Remove o caractere '@' e espaços extras de um nome de usuário."""
    return texto.replace("@", "").strip()

def codificar_texto(texto: str) -> str:
    """Codifica o texto de forma segura para uso em URLs (percent-encoding)."""
    return urllib.parse.quote(texto)
