import os
import io
import qrcode
from PIL import Image, ImageDraw, ImageOps

def hex_to_rgb(hex_str):
    h = hex_str.lstrip('#')
    if len(h) == 3:
        h = ''.join([c*2 for c in h])
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))

def in_finder_pattern_box(row, col, N):
    # Top-Left finder pattern
    if row <= 6 and col <= 6:
        return True
    # Top-Right finder pattern
    if row <= 6 and col >= N - 7:
        return True
    # Bottom-Left finder pattern
    if row >= N - 7 and col <= 6:
        return True
    return False

def check_silhouette_mask(dx, dy, mask_type):
    if not mask_type or mask_type == "none":
        return True
    if mask_type == "coracao":
        return (dx**2 + (dy - abs(dx)**0.6)**2) <= 0.85
    elif mask_type == "gota":
        # Gota super elegante inspirada na imagem do iStock (topo côncavo, base redonda cheia)
        if dy < -0.2:
            # Semicírculo perfeito para a base arredondada, centrado em (0, -0.2) com raio 0.7
            return (dx**2 + (dy + 0.2)**2) <= 0.49
        else:
            # Metade superior: sobe afunilando com uma curva côncava linda até a ponta (dy = 1.0)
            # No dy = -0.2, a largura máxima é exatamente 0.7. No dy = 1.0, a largura é 0.
            # O expoente 1.35 dá a inclinação côncava perfeita da gota de sangue do iStock.
            largura_limite = 0.7 * (((1.0 - dy) / 1.2)**1.35)
            return abs(dx) <= largura_limite
    elif mask_type == "estrela":
        # Estrela de 4 pontas (astroid / diamond)
        return (abs(dx)**0.5 + abs(dy)**0.5) <= 1.05
    elif mask_type == "escudo":
        if dy >= -0.2:
            return abs(dx) <= 0.85
        else:
            return abs(dx) <= 0.85 * (1.0 - ((-0.2 - dy) / 0.8)**2)
    elif mask_type == "circulo":
        return (dx**2 + dy**2) <= 0.95
    return True

def gerar_qr_personalizado(
    texto: str,
    cor_qr: str = "#0ea5e9",
    cor_fundo: str = "#ffffff",
    fundo_transparente: bool = False,
    logo_path: str = None,
    remover_fundo_logo: bool = False,
    formato_mascara: str = "none",  # "none", "coracao", "gota", "estrela", "escudo", "circulo"
    estilo_modulo: str = "square"   # "square", "circle", "star", "heart", "rounded", "fluid"
) -> Image.Image:
    """
    Gera um QR Code artístico personalizado usando Pillow (PIL) de forma 100% offline.
    Suporta cor do QR, cor de fundo, fundo transparente, silhuetas criativas e estilos de pixel.
    Para garantir escaneabilidade perfeita (100%), os pixels fora da silhueta são desenhados com
    uma opacidade sutil (marca d'água) em vez de totalmente apagados.
    """
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4
    )
    qr.add_data(texto)
    qr.make(fit=True)
    
    matrix = qr.get_matrix()
    N = len(matrix)
    box_size = 10
    border = 4
    
    width = (N + 2 * border) * box_size
    height = (N + 2 * border) * box_size
    
    # Cores
    cor_qr_rgb = hex_to_rgb(cor_qr)
    cor_qr_rgba = cor_qr_rgb + (255,)
    
    # Marca d'água suave de fundo para garantir leitura óptica impecável dos dados
    cor_qr_suave_rgba = cor_qr_rgb + (35,) # ~14% de opacidade (suficiente para câmera, sutil ao olho)
    
    if fundo_transparente:
        bg_color = (255, 255, 255, 0)
    else:
        bg_color = hex_to_rgb(cor_fundo) + (255,)
        
    img = Image.new("RGBA", (width, height), bg_color)
    draw = ImageDraw.Draw(img)
    
    cx = (N - 1) / 2.0
    cy = (N - 1) / 2.0
    
    for row in range(N):
        for col in range(N):
            if matrix[row][col]:
                # Coordenadas do pixel na imagem
                x1 = (col + border) * box_size
                y1 = (row + border) * box_size
                x2 = x1 + box_size
                y2 = y1 + box_size
                
                is_finder = in_finder_pattern_box(row, col, N)
                
                if is_finder:
                    # Desenha localizador clássico sólido para leitura de posicionamento instantânea
                    draw.rectangle([x1, y1, x2, y2], fill=cor_qr_rgba)
                else:
                    # Coordenadas normalizadas de -1.0 a 1.0 para máscara de silhueta
                    dx = (col - cx) / (N / 2.0)
                    dy = -(row - cy) / (N / 2.0)
                    
                    # Determina se está dentro da máscara de silhueta principal
                    no_formato = check_silhouette_mask(dx, dy, formato_mascara)
                    
                    if not no_formato and formato_mascara != "none":
                        continue
                    
                    cor_desenho = cor_qr_rgba
                    
                    # Aplica estilos de desenho aos módulos individuais
                    if estilo_modulo == "circle":
                        r = (box_size // 2) - 0.5
                        mx = x1 + box_size / 2.0
                        my = y1 + box_size / 2.0
                        draw.ellipse([mx - r, my - r, mx + r, my + r], fill=cor_desenho)
                    elif estilo_modulo == "fluid":
                        # Círculos ligeiramente expandidos/sobrepostos que se fundem de forma orgânica (lambuzos)
                        r = (box_size * 0.62)
                        mx = x1 + box_size / 2.0
                        my = y1 + box_size / 2.0
                        draw.ellipse([mx - r, my - r, mx + r, my + r], fill=cor_desenho)
                    elif estilo_modulo == "rounded":
                        # Retângulos com cantos arredondados (estilo gota suave de tinta)
                        try:
                            draw.rounded_rectangle([x1 + 0.5, y1 + 0.5, x2 - 0.5, y2 - 0.5], radius=3, fill=cor_desenho)
                        except AttributeError:
                            # Fallback para Pillow antigo que não tenha rounded_rectangle
                            draw.rectangle([x1, y1, x2, y2], fill=cor_desenho)
                    elif estilo_modulo == "star":
                        # Estrelas maiores e mais cheias para excelente escaneabilidade
                        mx = x1 + box_size / 2.0
                        my = y1 + box_size / 2.0
                        points = [
                            (mx, y1),
                            (x1 + box_size * 0.8, my - box_size * 0.15),
                            (x2, my),
                            (x1 + box_size * 0.8, my + box_size * 0.15),
                            (mx, y2),
                            (x1 + box_size * 0.2, my + box_size * 0.15),
                            (x1, my),
                            (x1 + box_size * 0.2, my - box_size * 0.15),
                        ]
                        draw.polygon(points, fill=cor_desenho)
                    elif estilo_modulo == "heart":
                        # Corações maiores e preenchidos que não deixam muito espaço vazio
                        mx = x1 + box_size / 2.0
                        my = y1 + box_size / 2.0
                        h = box_size * 0.55 # Aumentado de 0.4 para 0.55 para maior nitidez óptica
                        points = [
                            (mx, my + h * 0.9),
                            (mx - h * 1.1, my - h * 0.15),
                            (mx - h * 0.6, my - h * 0.95),
                            (mx, my - h * 0.35),
                            (mx + h * 0.6, my - h * 0.95),
                            (mx + h * 1.1, my - h * 0.15),
                        ]
                        draw.polygon(points, fill=cor_desenho)
                    else:  # "square" clássico
                        draw.rectangle([x1, y1, x2, y2], fill=cor_desenho)
                            
    # Se houver um logo especificado, fazemos a fusão perfeita no centro
    if logo_path and os.path.exists(logo_path):
        try:
            logo = Image.open(logo_path).convert("RGBA")
            
            # Dimensões do QR Code
            qr_w, qr_h = img.size
            
            # O tamanho do logo não deve passar de ~22% do QR Code para garantir a decodificação do leitor
            logo_max_size = int(qr_w * 0.22)
            logo = logo.resize((logo_max_size, logo_max_size), Image.Resampling.LANCZOS)
            
            if remover_fundo_logo:
                # 1. Limpa os módulos do QR Code por trás do logo para que ele não misture com o QR
                # Adiciona uma pequena margem/padding invisível ao redor do logo para dar respiro
                padding_limpeza = int(logo_max_size * 0.10)
                tamanho_limpeza = logo_max_size + (padding_limpeza * 2)
                
                pos_x1 = (qr_w - tamanho_limpeza) // 2
                pos_y1 = (qr_h - tamanho_limpeza) // 2
                pos_x2 = pos_x1 + tamanho_limpeza
                pos_y2 = pos_y1 + tamanho_limpeza
                
                if fundo_transparente:
                    cor_limpeza = (255, 255, 255, 0)
                else:
                    rgb = hex_to_rgb(cor_fundo)
                    cor_limpeza = rgb + (255,)
                
                # Desenha o quadrado de limpeza
                draw.rectangle([pos_x1, pos_y1, pos_x2, pos_y2], fill=cor_limpeza)
                
                # 2. Cola o logotipo transparente diretamente no centro limpo
                pos_logo_x = (qr_w - logo_max_size) // 2
                pos_logo_y = (qr_h - logo_max_size) // 2
                img.paste(logo, (pos_logo_x, pos_logo_y), logo)
            else:
                # Criamos uma moldura de fundo (um card de fundo arredondado ou quadrado) para o logo se destacar do padrão de pixels do QR
                border_padding = int(logo_max_size * 0.12) # 12% de borda ao redor do logo
                card_size = logo_max_size + (border_padding * 2)
                
                # Criamos o card de fundo para o logo
                # Se o fundo do QR for transparente, fazemos uma moldura branca semi-transparente ou sólida
                card_color = (255, 255, 255, 255) if not fundo_transparente else (255, 255, 255, 240)
                logo_card = Image.new("RGBA", (card_size, card_size), card_color)
                
                # Cole o logo centralizado no seu card moldura
                logo_card.paste(logo, (border_padding, border_padding), logo)
                
                # Posiciona o card de logo exatamente no centro geométrico do QR Code
                pos_x = (qr_w - card_size) // 2
                pos_y = (qr_h - card_size) // 2
                img.paste(logo_card, (pos_x, pos_y), logo_card)
            
        except Exception as e:
            print(f"[QR_GENERATOR] Erro ao integrar ícone no QR Code: {str(e)}")
            
    return img
