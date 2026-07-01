import os
import io
import qrcode
from PIL import Image, ImageDraw, ImageOps

def gerar_qr_personalizado(
    texto: str,
    cor_qr: str = "#0ea5e9",
    cor_fundo: str = "#ffffff",
    fundo_transparente: bool = False,
    logo_path: str = None,
    remover_fundo_logo: bool = False
) -> Image.Image:
    """
    Gera um QR Code personalizado usando Pillow (PIL) de forma 100% offline.
    Suporta cor do QR, cor de fundo, fundo transparente e inserção de logo centralizado.
    """
    # Usamos correção de erro máxima (H - High) para garantir que a leitura funcione
    # perfeitamente mesmo com um logotipo cobrindo até 30% do centro do QR code.
    qr = qrcode.QRCode(
        version=None,
        error_correction=qrcode.constants.ERROR_CORRECT_H,
        box_size=10,
        border=4
    )
    qr.add_data(texto)
    qr.make(fit=True)
    
    # Se for transparente, criamos com fundo branco primeiro para podermos substituir por transparente de forma limpa,
    # caso contrário usamos a cor de fundo escolhida.
    bg_color_temp = "#ffffff" if fundo_transparente else cor_fundo
    
    # Gera a imagem base do QR Code
    img = qr.make_image(fill_color=cor_qr, back_color=bg_color_temp).convert("RGBA")
    
    # Se o fundo for transparente, substitui os pixels brancos por transparentes
    if fundo_transparente:
        datas = img.getdata()
        newData = []
        for item in datas:
            # Detecta pixels brancos ou extremamente claros para aplicar canal alpha zero
            if item[0] > 240 and item[1] > 240 and item[2] > 240:
                newData.append((255, 255, 255, 0)) # Transparente
            else:
                newData.append(item)
        img.putdata(newData)
        
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
                draw = ImageDraw.Draw(img)
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
                    h = cor_fundo.lstrip('#')
                    rgb = tuple(int(h[i:i+2], 16) for i in (0, 2, 4))
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
