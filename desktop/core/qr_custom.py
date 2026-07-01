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
        # Centered teardrop (gota)
        adjusted_dy = dy + 0.1
        if adjusted_dy < 0.1:
            return (dx**2 + (adjusted_dy - 0.1)**2) <= 0.55
        else:
            return abs(dx) <= 0.74 * (1.0 - adjusted_dy)
    elif mask_type == "estrela":
        # 4-pointed star / diamond / astroid
        return (abs(dx)**0.5 + abs(dy)**0.5) <= 1.0
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
    estilo_modulo: str = "square"   # "square", "circle", "star", "heart"
) -> Image.Image:
    """
    Gera um QR Code artístico personalizado usando Pillow (PIL) de forma 100% offline.
    Suporta cor do QR, cor de fundo, fundo transparente, silhuetas criativas e estilos de pixel.
    """
    # Usamos correção de erro máxima (H - High) para garantir que a leitura funcione
    # perfeitamente mesmo com um logotipo ou máscara estilizada
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
                    # Desenha localizador clássico em formato quadrado para garantir 100% de scaneabilidade
                    draw.rectangle([x1, y1, x2, y2], fill=cor_qr_rgba)
                else:
                    # Coordenadas normalizadas de -1.0 a 1.0 para máscara de silhueta
                    dx = (col - cx) / (N / 2.0)
                    dy = -(row - cy) / (N / 2.0)
                    
                    if check_silhouette_mask(dx, dy, formato_mascara):
                        # Aplica estilos de desenho aos módulos individuais
                        if estilo_modulo == "circle":
                            r = (box_size // 2) - 0.5
                            mx = x1 + box_size / 2.0
                            my = y1 + box_size / 2.0
                            draw.ellipse([mx - r, my - r, mx + r, my + r], fill=cor_qr_rgba)
                        elif estilo_modulo == "star":
                            mx = x1 + box_size / 2.0
                            my = y1 + box_size / 2.0
                            half = box_size / 2.0
                            points = [(mx, y1 + 1), (x2 - 1, my), (mx, y2 - 1), (x1 + 1, my)]
                            draw.polygon(points, fill=cor_qr_rgba)
                        elif estilo_modulo == "heart":
                            mx = x1 + box_size / 2.0
                            my = y1 + box_size / 2.0
                            h = box_size * 0.4
                            points = [
                                (mx, my + h * 0.8),
                                (mx - h, my - h * 0.2),
                                (mx - h * 0.5, my - h * 0.8),
                                (mx, my - h * 0.3),
                                (mx + h * 0.5, my - h * 0.8),
                                (mx + h, my - h * 0.2),
                            ]
                            draw.polygon(points, fill=cor_qr_rgba)
                        else:  # "square" ou padrão
                            draw.rectangle([x1, y1, x2, y2], fill=cor_qr_rgba)
                            
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
