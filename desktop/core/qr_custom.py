import os
import io
import qrcode
from PIL import Image, ImageDraw, ImageOps

def gerar_qr_personalizado(
    texto: str,
    cor_qr: str = "#000000",
    cor_fundo: str = "#ffffff",
    fundo_transparente: bool = False,
    logo_path: str = None
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
