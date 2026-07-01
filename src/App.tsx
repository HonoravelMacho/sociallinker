import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import JSZip from 'jszip';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, Send, Instagram, Smartphone, Linkedin, Twitter, 
  Lock, Youtube, Music, Pin, Video, Copy, Check, QrCode, Download, 
  FileCode, ChevronRight, Folder, Terminal, CheckCircle2, AlertCircle, ExternalLink, Heart, Globe, Menu, Play
} from 'lucide-react';

// ==========================================
// DESKTOP CLIENT PROJECT CODES FOR EXPORT & PREVIEW
// ==========================================
const PYTHON_PROJECT_FILES: Record<string, { path: string; code: string; label: string }> = {
  'sociallinker.py': {
    label: 'sociallinker.py',
    path: 'sociallinker.py',
    code: `import sys
from PySide6.QtWidgets import QApplication
from ui.main_window import MainWindow

def main():
    # Inicializa a aplicação Qt
    app = QApplication(sys.argv)
    
    # Define títulos globais do sistema
    app.setApplicationName("SocialLinker")
    app.setApplicationDisplayName("SocialLinker - Gerador de Links")
    
    # Instancia a janela principal de interface
    window = MainWindow()
    window.show()
    
    # Executa o loop principal de eventos e fecha de forma segura
    sys.exit(app.exec())

if __name__ == "__main__":
    main()`
  },
  'core/utils.py': {
    label: 'utils.py',
    path: 'core/utils.py',
    code: `import urllib.parse

def limpar_numero(texto: str) -> str:
    """Remove todos os caracteres não numéricos de uma string."""
    return "".join(filter(str.isdigit, texto))

def limpar_usuario(texto: str) -> str:
    """Remove o caractere '@' e espaços extras de um nome de usuário."""
    return texto.replace("@", "").strip()

def codificar_texto(texto: str) -> str:
    """Codifica o texto de forma segura para uso em URLs (percent-encoding)."""
    return urllib.parse.quote(texto)`
  },
  'core/__init__.py': {
    label: '__init__.py',
    path: 'core/__init__.py',
    code: `# Pacote Core`
  },
  'core/qr_custom.py': {
    label: 'qr_custom.py',
    path: 'core/qr_custom.py',
    code: `import os
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
            
    return img`
  },
  'ui/main_window.py': {
    label: 'main_window.py',
    path: 'ui/main_window.py',
    code: `import sys
import io
import os
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, QPushButton, 
    QLabel, QLineEdit, QTextEdit, QFileDialog, QMessageBox,
    QFrame, QScrollArea, QGraphicsDropShadowEffect
)
from PySide6.QtCore import Qt, QSize
from PySide6.QtGui import QFont, QPixmap

# Import utils
from core.utils import limpar_numero, limpar_usuario, codificar_texto

# Import modular platform generators
from modules import (
    whatsapp, telegram, instagram, messenger, sms, linkedin,
    twitter, signal, youtube, tiktok, pinterest, skype
)

# Optional QR Code Support
try:
    import qrcode
    QR_CODE_SUPPORT = True
except ImportError:
    QR_CODE_SUPPORT = False

# QSS Stylesheet Base
BASE_STYLE = """
QMainWindow {{
    background-color: #0f0f11;
}}
QWidget {{
    color: #e4e4e7;
    font-family: 'Segoe UI', 'Inter', -apple-system, sans-serif;
}}
/* Sidebar Frame */
QFrame#sidebar {{
    background-color: #18181b;
    border-right: 1px solid #27272a;
}}
QLabel#sidebarTitle {{
    font-size: 18px;
    font-weight: bold;
    color: #ffffff;
    padding: 10px;
}}
/* Social Network Buttons */
QPushButton.networkBtn {{
    background-color: transparent;
    border: none;
    border-radius: 6px;
    padding: 10px 15px;
    text-align: left;
    font-size: 13px;
    color: #a1a1aa;
}}
QPushButton.networkBtn:hover {{
    background-color: #27272a;
    color: #ffffff;
}}
QPushButton.networkBtn[selected="true"] {{
    background-color: {accent_color};
    color: #ffffff;
    font-weight: bold;
}}
/* Main Content Panel */
QFrame#contentArea {{
    background-color: #09090b;
}}
QLabel#platformHeader {{
    font-size: 24px;
    font-weight: bold;
    color: #ffffff;
}}
QLabel#platformDesc {{
    font-size: 13px;
    color: #a1a1aa;
}}
/* Form Elements */
QLabel.fieldLabel {{
    font-size: 13px;
    color: #e4e4e7;
    font-weight: bold;
}}
QLineEdit, QTextEdit {{
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 6px;
    padding: 8px 12px;
    font-size: 14px;
    color: #ffffff;
}}
QLineEdit:focus, QTextEdit:focus {{
    border: 1px solid {accent_color};
}}
/* Buttons */
QPushButton#generateBtn {{
    background-color: {accent_color};
    color: #ffffff;
    border: none;
    border-radius: 6px;
    padding: 12px;
    font-size: 14px;
    font-weight: bold;
}}
QPushButton#generateBtn:hover {{
    background-color: {accent_hover};
}}
QPushButton.secondaryBtn {{
    background-color: #27272a;
    border: 1px solid #3f3f46;
    border-radius: 6px;
    padding: 8px 15px;
    font-size: 13px;
    font-weight: bold;
    color: #e4e4e7;
}}
QPushButton.secondaryBtn:hover {{
    background-color: #3f3f46;
    color: #ffffff;
}}
/* Result Panel */
QFrame#resultCard {{
    background-color: #18181b;
    border: 1px solid #27272a;
    border-radius: 8px;
    padding: 15px;
}}
QLineEdit#resultLink {{
    background-color: #09090b;
    border: 1px solid #27272a;
    font-family: 'Courier New', monospace;
    font-size: 13px;
    color: #10b981;
}}
/* Footer */
QLabel#footerLabel {{
    font-size: 11px;
    color: #52525b;
}}
"""

PLATFORMS_CONFIG = {
    "whatsapp": {
        "name": "WhatsApp",
        "color": "#25D366",
        "hover": "#1ebc5a",
        "desc": "Gerador de links diretos para conversa no WhatsApp com mensagens personalizadas.",
        "inputs": [
            {"id": "ddi", "label": "DDI (Dígito do País - ex: 55)", "placeholder": "55"},
            {"id": "ddd", "label": "DDD (ex: 51)", "placeholder": "51"},
            {"id": "numero", "label": "Número de Telefone (Apenas dígitos)", "placeholder": "999999999"},
            {"id": "mensagem", "label": "Mensagem (Opcional)", "placeholder": "Olá, tudo bem?", "large": True}
        ],
        "generate_fn": whatsapp.gerar_link
    },
    "telegram": {
        "name": "Telegram",
        "color": "#0088cc",
        "hover": "#0077b3",
        "desc": "Crie um link direto para iniciar conversas com o seu @nome_de_usuario.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário (Ex: @tiagorabelo)", "placeholder": "tiagorabelo"}
        ],
        "generate_fn": telegram.gerar_link
    },
    "instagram": {
        "name": "Instagram Direct",
        "color": "#E1306C",
        "hover": "#ca225b",
        "desc": "Direcione as pessoas diretamente para o envio de mensagens no seu Direct do Instagram.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário (Ex: @tiagorabelo)", "placeholder": "tiagorabelo"}
        ],
        "generate_fn": instagram.gerar_link
    },
    "messenger": {
        "name": "Facebook Messenger",
        "color": "#006AFF",
        "hover": "#005ce6",
        "desc": "Crie links m.me para que seus clientes entrem em contato direto com sua página ou perfil.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário ou link completo da Página", "placeholder": "tiagorabelo"}
        ],
        "generate_fn": messenger.gerar_link
    },
    "sms": {
        "name": "SMS Universal",
        "color": "#6366F1",
        "hover": "#4f46e5",
        "desc": "Crie um link especial que abre o aplicativo de SMS com o número e mensagem pré-preenchidos.",
        "inputs": [
            {"id": "numero", "label": "Número com DDD (Apenas números)", "placeholder": "51999999999"},
            {"id": "mensagem", "label": "Mensagem SMS (Opcional)", "placeholder": "Olá, gostaria de agendar uma consulta.", "large": True}
        ],
        "generate_fn": sms.gerar_link
    },
    "linkedin": {
        "name": "LinkedIn",
        "color": "#0077B5",
        "hover": "#00669c",
        "desc": "Crie um link direto para o seu perfil profissional no LinkedIn.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário do Perfil (Ex: tiago-rabelo)", "placeholder": "tiago-rabelo"}
        ],
        "generate_fn": linkedin.gerar_link
    },
    "twitter": {
        "name": "X (Twitter)",
        "color": "#e2e2e5",
        "hover": "#c4c4c7",
        "desc": "Crie um link para redirecionar para seu perfil ou para abrir uma janela de Tweet pré-preenchida.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário @ (Ex: @tiago)", "placeholder": "tiago"},
            {"id": "mensagem", "label": "Texto do Tweet (Opcional)", "placeholder": "Confira este site fantástico!", "large": True}
        ],
        "generate_fn": twitter.gerar_link
    },
    "signal": {
        "name": "Signal",
        "color": "#3A76F0",
        "hover": "#215fd1",
        "desc": "Crie um link para que outras pessoas iniciem um chat criptografado com você no Signal.",
        "inputs": [
            {"id": "numero", "label": "Número de Telefone (DDI + DDD + Número)", "placeholder": "+5551999999999"}
        ],
        "generate_fn": signal.gerar_link
    },
    "youtube": {
        "name": "YouTube (Inscrição)",
        "color": "#FF0000",
        "hover": "#cc0000",
        "desc": "Crie um link de inscrição automática para engajar a audiência do seu canal.",
        "inputs": [
            {"id": "canal", "label": "Nome do Canal ou ID do Canal", "placeholder": "@TiagoRabelo"}
        ],
        "generate_fn": youtube.gerar_link
    },
    "tiktok": {
        "name": "TikTok",
        "color": "#EE1D52",
        "hover": "#c9103e",
        "desc": "Crie links que abrem o seu perfil de criador de conteúdo no TikTok.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário do TikTok (Ex: @tiago)", "placeholder": "tiago"}
        ],
        "generate_fn": tiktok.gerar_link
    },
    "pinterest": {
        "name": "Pinterest",
        "color": "#BD081C",
        "hover": "#9b0513",
        "desc": "Crie um link de atalho direto para o seu perfil ou painel no Pinterest.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário do Pinterest", "placeholder": "tiagorabelo"}
        ],
        "generate_fn": pinterest.gerar_link
    },
    "skype": {
        "name": "Skype",
        "color": "#00AFF0",
        "hover": "#008cc0",
        "desc": "Crie um link direto para abrir uma conversa por chat com você no Skype.",
        "inputs": [
            {"id": "usuario", "label": "Nome de Usuário ou ID Skype", "placeholder": "live:tiago_rabelo"}
        ],
        "generate_fn": skype.gerar_link
    }
}


class MainWindow(QMainWindow):
    def __init__(self):
        super().__init__()
        
        # Estado Inicial
        self.current_platform = "whatsapp"
        self.inputs = {}
        self.sidebar_buttons = {}
        self.current_qr_image = None
        
        # Configuração da Janela
        self.setWindowTitle("SocialLinker")
        self.resize(880, 620)
        self.setMinimumSize(780, 500)
        
        # Layout Principal (Dividido em Sidebar e Conteúdo)
        main_widget = QWidget()
        self.setCentralWidget(main_widget)
        main_layout = QHBoxLayout(main_widget)
        main_layout.setContentsMargins(0, 0, 0, 0)
        main_layout.setSpacing(0)
        
        # 1. SIDEBAR (Menu Esquerdo)
        sidebar_frame = QFrame()
        sidebar_frame.setObjectName("sidebar")
        sidebar_frame.setFixedWidth(240)
        sidebar_layout = QVBoxLayout(sidebar_frame)
        sidebar_layout.setContentsMargins(15, 20, 15, 15)
        sidebar_layout.setSpacing(10)
        
        # Título da Sidebar
        title_label = QLabel("SocialLinker")
        title_label.setObjectName("sidebarTitle")
        title_label.setFont(QFont("Segoe UI", 16, QFont.Bold))
        sidebar_layout.addWidget(title_label)
        
        desc_app = QLabel("v2.5 • Open-Source")
        desc_app.setStyleSheet("color: #71717a; font-size: 11px; padding-left: 10px; margin-bottom: 10px;")
        sidebar_layout.addWidget(desc_app)
        
        # Scroll para os botões do menu lateral
        scroll_area = QScrollArea()
        scroll_area.setWidgetResizable(True)
        scroll_area.setStyleSheet("background-color: transparent; border: none;")
        scroll_content = QWidget()
        scroll_content.setStyleSheet("background-color: transparent;")
        scroll_layout = QVBoxLayout(scroll_content)
        scroll_layout.setContentsMargins(0, 0, 0, 0)
        scroll_layout.setSpacing(6)
        
        # Adicionar botões das redes
        for platform_id, cfg in PLATFORMS_CONFIG.items():
            btn = QPushButton(cfg["name"])
            btn.setProperty("class", "networkBtn")
            btn.setCursor(Qt.PointingHandCursor)
            # Conexão de clique dinâmica
            btn.clicked.connect(lambda checked=False, pid=platform_id: self.update_form(pid))
            scroll_layout.addWidget(btn)
            self.sidebar_buttons[platform_id] = btn
            
        scroll_layout.addStretch()
        scroll_area.setWidget(scroll_content)
        sidebar_layout.addWidget(scroll_area)
        
        # Rodapé obrigatório de Créditos
        sidebar_layout.addSpacing(15)
        footer_label = QLabel("Feito por Tiago Rabelo")
        footer_label.setObjectName("footerLabel")
        footer_label.setAlignment(Qt.AlignCenter)
        footer_label.setFont(QFont("Segoe UI", 10, QFont.Medium))
        sidebar_layout.addWidget(footer_label)
        
        main_layout.addWidget(sidebar_frame)
        
        # 2. ESPAÇO DE TRABALHO (Direita)
        self.content_frame = QFrame()
        self.content_frame.setObjectName("contentArea")
        content_layout = QVBoxLayout(self.content_frame)
        content_layout.setContentsMargins(30, 25, 30, 25)
        content_layout.setSpacing(15)
        
        # Header Dinâmico
        self.platform_title = QLabel("WhatsApp")
        self.platform_title.setObjectName("platformHeader")
        content_layout.addWidget(self.platform_title)
        
        self.platform_desc = QLabel()
        self.platform_desc.setObjectName("platformDesc")
        self.platform_desc.setWordWrap(True)
        content_layout.addWidget(self.platform_desc)
        
        # Linha de Divisão
        separator = QFrame()
        separator.setFrameShape(QFrame.HLine)
        separator.setStyleSheet("background-color: #27272a; max-height: 1px; border: none;")
        content_layout.addWidget(separator)
        
        # Scroll para os Campos do Formulário
        form_scroll = QScrollArea()
        form_scroll.setWidgetResizable(True)
        form_scroll.setStyleSheet("background-color: transparent; border: none;")
        form_widget = QWidget()
        form_widget.setStyleSheet("background-color: transparent;")
        self.form_layout = QVBoxLayout(form_widget)
        self.form_layout.setContentsMargins(0, 0, 10, 0)
        self.form_layout.setSpacing(12)
        form_scroll.setWidget(form_widget)
        content_layout.addWidget(form_scroll)
        
        # Botão Gerar Link
        self.generate_btn = QPushButton("Gerar Link")
        self.generate_btn.setObjectName("generateBtn")
        self.generate_btn.setCursor(Qt.PointingHandCursor)
        self.generate_btn.clicked.connect(self.on_generate_link)
        content_layout.addWidget(self.generate_btn)
        
        # CARD DE RESULTADOS (Invisível no início)
        self.result_card = QFrame()
        self.result_card.setObjectName("resultCard")
        result_layout = QVBoxLayout(self.result_card)
        result_layout.setContentsMargins(15, 15, 15, 15)
        result_layout.setSpacing(10)
        
        res_label = QLabel("LINK GERADO:")
        res_label.setStyleSheet("font-size: 11px; font-weight: bold; color: #10b981;")
        result_layout.addWidget(res_label)
        
        self.result_link = QLineEdit()
        self.result_link.setObjectName("resultLink")
        self.result_link.setReadOnly(True)
        result_layout.addWidget(self.result_link)
        
        # Botões de Ação para o Resultado
        result_actions = QHBoxLayout()
        result_actions.setSpacing(10)
        
        self.copy_btn = QPushButton("Copiar Link")
        self.copy_btn.setProperty("class", "secondaryBtn")
        self.copy_btn.setCursor(Qt.PointingHandCursor)
        self.copy_btn.clicked.connect(self.on_copy_link)
        result_actions.addWidget(self.copy_btn)
        
        self.qr_btn = QPushButton("Gerar QR Code")
        self.qr_btn.setProperty("class", "secondaryBtn")
        self.qr_btn.setCursor(Qt.PointingHandCursor)
        self.qr_btn.clicked.connect(self.on_generate_qr)
        result_actions.addWidget(self.qr_btn)
        
        result_layout.addLayout(result_actions)
        content_layout.addWidget(self.result_card)
        self.result_card.setVisible(False)
        
        # CARD DE QR CODE (Invisível no início)
        self.qr_card = QFrame()
        self.qr_card.setObjectName("resultCard")
        self.qr_card.setStyleSheet("margin-top: 5px;")
        qr_layout = QVBoxLayout(self.qr_card)
        qr_layout.setAlignment(Qt.AlignCenter)
        qr_layout.setSpacing(12)
        
        self.qr_image_label = QLabel()
        self.qr_image_label.setFixedSize(160, 160)
        self.qr_image_label.setStyleSheet("border: 1px solid #27272a; background-color: white; border-radius: 4px;")
        self.qr_image_label.setAlignment(Qt.AlignCenter)
        qr_layout.addWidget(self.qr_image_label)
        
        self.save_qr_btn = QPushButton("Salvar QR Code (.png)")
        self.save_qr_btn.setProperty("class", "secondaryBtn")
        self.save_qr_btn.setCursor(Qt.PointingHandCursor)
        self.save_qr_btn.clicked.connect(self.on_save_qr)
        qr_layout.addWidget(self.save_qr_btn)
        
        content_layout.addWidget(self.qr_card)
        self.qr_card.setVisible(False)
        
        main_layout.addWidget(self.content_frame)
        
        # Carrega o primeiro formulário
        self.update_form("whatsapp")

    def update_form(self, platform_id):
        self.current_platform = platform_id
        config = PLATFORMS_CONFIG[platform_id]
        
        # 1. Atualiza Títulos
        self.platform_title.setText(config["name"])
        self.platform_desc.setText(config["desc"])
        
        # 2. Limpa Campos Anteriores do Formulário
        while self.form_layout.count():
            item = self.form_layout.takeAt(0)
            widget = item.widget()
            if widget:
                widget.deleteLater()
                
        # 3. Reconstrói os Campos Dinamicamente
        self.inputs = {}
        for field in config["inputs"]:
            row = QWidget()
            row_lay = QVBoxLayout(row)
            row_lay.setContentsMargins(0, 0, 0, 5)
            row_lay.setSpacing(5)
            
            lbl = QLabel(field["label"])
            lbl.setProperty("class", "fieldLabel")
            row_lay.addWidget(lbl)
            
            if field.get("large", False):
                inp = QTextEdit()
                inp.setPlaceholderText(field["placeholder"])
                inp.setMinimumHeight(70)
            else:
                inp = QLineEdit()
                inp.setPlaceholderText(field["placeholder"])
                # Define padrão para WhatsApp DDI
                if platform_id == "whatsapp" and field["id"] == "ddi":
                    inp.setText("55")
                    
            row_lay.addWidget(inp)
            self.form_layout.addWidget(row)
            self.inputs[field["id"]] = inp
            
        # 4. Reseta os Painéis de Resultados
        self.result_card.setVisible(False)
        self.qr_card.setVisible(False)
        self.current_qr_image = None
        
        # 5. Aplica Folha de Estilos e Marcação de Selecionado
        self.apply_theme(config["color"], config["hover"])

    def apply_theme(self, color, hover):
        # Atualiza o estado visual das marcações na Sidebar
        for pid, btn in self.sidebar_buttons.items():
            is_selected = (pid == self.current_platform)
            btn.setProperty("selected", is_selected)
            # Atualiza polimento para garantir que o QSS re-avalie propriedades customizadas
            btn.style().unpolish(btn)
            btn.style().polish(btn)
            
        # Gera e injeta o QSS customizado com as cores do tema selecionado
        style = BASE_STYLE.format(accent_color=color, accent_hover=hover)
        self.setStyleSheet(style)

    def on_generate_link(self):
        platform_cfg = PLATFORMS_CONFIG[self.current_platform]
        
        # Junta os dados dos inputs criados
        args = []
        for field in platform_cfg["inputs"]:
            field_widget = self.inputs[field["id"]]
            if isinstance(field_widget, QTextEdit):
                val = field_widget.toPlainText()
            else:
                val = field_widget.text()
            args.append(val)
            
        try:
            # Invoca o módulo correspondente via desempacotamento de parâmetros (*args)
            link = platform_cfg["generate_fn"](*args)
            
            # Exibe os resultados
            self.result_link.setText(link)
            self.result_card.setVisible(True)
            self.qr_card.setVisible(False) # Esconde QR anterior até clicar em gerar QR
            self.current_qr_image = None
        except Exception as e:
            QMessageBox.critical(self, "Erro de Geração", f"Não foi possível gerar o link: {str(e)}")

    def on_copy_link(self):
        link = self.result_link.text()
        if link:
            # Copia nativa para a Área de Transferência
            QApplication.clipboard().setText(link)
            QMessageBox.information(self, "Copiado", "O link foi copiado para sua área de transferência!")

    def on_generate_qr(self):
        link = self.result_link.text()
        if not link:
            return
            
        if not QR_CODE_SUPPORT:
            QMessageBox.warning(
                self, 
                "Dependência Faltando", 
                "A biblioteca 'qrcode' não está instalada.\\nInstale rodando: pip install qrcode[pil]"
            )
            return
            
        try:
            # Instancia o qrcode localmente
            qr = qrcode.QRCode(version=1, box_size=10, border=4)
            qr.add_data(link)
            qr.make(fit=True)
            img = qr.make_image(fill_color="black", back_color="white")
            
            # Conversão direta de imagem PIL para dados de bytes aceitáveis pelo QPixmap do Qt
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            qr_bytes = buffer.getvalue()
            
            # Armazena objeto de imagem para salvar futuramente
            self.current_qr_image = img
            
            # Carrega e escala a Pixmap na tela
            pixmap = QPixmap()
            pixmap.loadFromData(qr_bytes)
            scaled_pixmap = pixmap.scaled(150, 150, Qt.KeepAspectRatio, Qt.SmoothTransformation)
            
            self.qr_image_label.setPixmap(scaled_pixmap)
            self.qr_card.setVisible(True)
        except Exception as e:
            QMessageBox.critical(self, "Erro no QR Code", f"Ocorreu um erro ao gerar o QR Code: {str(e)}")

    def on_save_qr(self):
        if not self.current_qr_image:
            return
            
        # Abre gerenciador de arquivos nativo do sistema
        file_path, _ = QFileDialog.getSaveFileName(
            self,
            "Salvar QR Code",
            f"qrcode_{self.current_platform}.png",
            "Imagens PNG (*.png)"
        )
        
        if file_path:
            try:
                # Salva o arquivo PNG localmente de forma totalmente gratuita e offline
                self.current_qr_image.save(file_path)
                QMessageBox.information(self, "Sucesso", "O QR Code foi salvo com sucesso!")
            except Exception as e:
                QMessageBox.critical(self, "Erro de Escrita", f"Não foi possível salvar o arquivo:\\n{str(e)}")`
  },
  'ui/__init__.py': {
    label: '__init__.py',
    path: 'ui/__init__.py',
    code: `# Pacote UI`
  },
  'modules/__init__.py': {
    label: '__init__.py',
    path: 'modules/__init__.py',
    code: `# Pacote de Módulos das Redes Sociais`
  },
  'modules/whatsapp.py': {
    label: 'whatsapp.py',
    path: 'modules/whatsapp.py',
    code: `from core.utils import limpar_numero, codificar_texto

def gerar_link(ddi: str, ddd: str, numero: str, mensagem: str) -> str:
    \"\"\"Gera link de conversa direta no WhatsApp.\"\"\"
    ddi_clean = limpar_numero(ddi) or "55"
    ddd_clean = limpar_numero(ddd)
    num_clean = limpar_numero(numero)
    msg_encoded = codificar_texto(mensagem)
    return f"https://wa.me/{ddi_clean}{ddd_clean}{num_clean}?text={msg_encoded}"`
  },
  'modules/telegram.py': {
    label: 'telegram.py',
    path: 'modules/telegram.py',
    code: `from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    \"\"\"Gera link para conversa direta no Telegram.\"\"\"
    user_clean = limpar_usuario(usuario)
    return f"https://t.me/{user_clean}"`
  },
  'modules/instagram.py': {
    label: 'instagram.py',
    path: 'modules/instagram.py',
    code: `from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    \"\"\"Gera link de redirecionamento para o Direct do Instagram.\"\"\"
    user_clean = limpar_usuario(usuario)
    return f"https://ig.me/m/{user_clean}"`
  },
  'modules/messenger.py': {
    label: 'messenger.py',
    path: 'modules/messenger.py',
    code: `def gerar_link(usuario_ou_link: str) -> str:
    \"\"\"Gera link direto para conversas no Facebook Messenger.\"\"\"
    usuario = usuario_ou_link.split("/")[-1].strip()
    return f"https://m.me/{usuario}"`
  },
  'modules/sms.py': {
    label: 'sms.py',
    path: 'modules/sms.py',
    code: `from core.utils import limpar_numero, codificar_texto

def gerar_link(numero: str, mensagem: str) -> str:
    \"\"\"Gera link para envio de SMS com conteúdo pré-preenchido.\"\"\"
    num_clean = limpar_numero(numero)
    msg_encoded = codificar_texto(mensagem)
    return f"sms:{num_clean}?body={msg_encoded}"`
  },
  'modules/linkedin.py': {
    label: 'linkedin.py',
    path: 'modules/linkedin.py',
    code: `from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    \"\"\"Gera link direto para o perfil do LinkedIn.\"\"\"
    user_clean = limpar_usuario(usuario)
    return f"https://www.linkedin.com/in/{user_clean}"`
  },
  'modules/twitter.py': {
    label: 'twitter.py',
    path: 'modules/twitter.py',
    code: `from core.utils import limpar_usuario, codificar_texto

def gerar_link(usuario: str, mensagem: str = "") -> str:
    \"\"\"Gera link para tweet pré-preenchido ou perfil no X (Twitter).\"\"\"
    user_clean = limpar_usuario(usuario)
    if mensagem.strip():
        msg_encoded = codificar_texto(mensagem)
        return f"https://twitter.com/intent/tweet?text=@{user_clean}%20{msg_encoded}"
    return f"https://twitter.com/{user_clean}"`
  },
  'modules/signal.py': {
    label: 'signal.py',
    path: 'modules/signal.py',
    code: `from core.utils import limpar_numero

def gerar_link(numero: str) -> str:
    \"\"\"Gera link para iniciar conversas no Signal.\"\"\"
    num_clean = limpar_numero(numero)
    return f"https://signal.me/#p/{num_clean}"`
  },
  'modules/youtube.py': {
    label: 'youtube.py',
    path: 'modules/youtube.py',
    code: `def gerar_link(canal: str) -> str:
    \"\"\"Gera link de inscrição direta para canais do YouTube.\"\"\"
    canal_clean = canal.strip()
    return f"https://www.youtube.com/{canal_clean}?sub_confirmation=1"`
  },
  'modules/tiktok.py': {
    label: 'tiktok.py',
    path: 'modules/tiktok.py',
    code: `from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    \"\"\"Gera link direto para perfis do TikTok.\"\"\"
    user_clean = limpar_usuario(usuario)
    return f"https://www.tiktok.com/@{user_clean}"`
  },
  'modules/pinterest.py': {
    label: 'pinterest.py',
    path: 'modules/pinterest.py',
    code: `from core.utils import limpar_usuario

def gerar_link(usuario: str) -> str:
    \"\"\"Gera link direto para perfis do Pinterest.\"\"\"
    user_clean = limpar_usuario(usuario)
    return f"https://www.pinterest.com/{user_clean}/"`
  },
  'modules/skype.py': {
    label: 'skype.py',
    path: 'modules/skype.py',
    code: `def gerar_link(usuario: str) -> str:
    \"\"\"Gera link para iniciar conversas direta no Skype.\"\"\"
    user_clean = usuario.strip()
    return f"skype:{user_clean}?chat"`
  },
  'abrir_sociallinker.sh': {
    label: 'abrir_sociallinker.sh',
    path: 'abrir_sociallinker.sh',
    code: `#!/bin/bash
# Script para abrir o SocialLinker automaticamente no Linux/macOS
cd "$(dirname "$0")"
source venv/bin/activate
python3 sociallinker.py`
  },
  'abrir_sociallinker.bat': {
    label: 'abrir_sociallinker.bat',
    path: 'abrir_sociallinker.bat',
    code: `@echo off
:: Script para abrir o SocialLinker automaticamente no Windows
cd /d "%~dp0"
call venv\\Scripts\\activate.bat
python sociallinker.py
pause`
  }
};

// ==========================================
// THEMES & LOGIC FOR EACH PLATFORM (REACT APP)
// ==========================================
interface PlatformTheme {
  name: string;
  color: string;
  hoverColor: string;
  textColor: string;
  accentBorder: string;
  accentText: string;
  ringColor: string;
  bgGradient: string;
  icon: any;
  desc: string;
  inputs: { id: string; label: string; placeholder: string; large?: boolean; default?: string }[];
}

const PLATFORM_THEMES: Record<string, PlatformTheme> = {
  whatsapp: {
    name: 'WhatsApp',
    color: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500/20 text-white',
    hoverColor: 'bg-emerald-600',
    textColor: '#10b981',
    accentBorder: 'border-emerald-500/30 focus-within:border-emerald-500',
    accentText: 'text-emerald-400',
    ringColor: 'focus:ring-emerald-500/20',
    bgGradient: 'from-emerald-950/20 to-zinc-950',
    icon: MessageSquare,
    desc: 'Gerador de links diretos para conversa no WhatsApp com mensagens personalizadas.',
    inputs: [
      { id: 'ddi', label: 'DDI (Código do País)', placeholder: '55' },
      { id: 'ddd', label: 'DDD (Código de Área)', placeholder: '51' },
      { id: 'numero', label: 'Número de Telefone', placeholder: '999999999' },
      { id: 'mensagem', label: 'Mensagem (Opcional)', placeholder: 'Olá, tudo bem?', large: true }
    ]
  },
  telegram: {
    name: 'Telegram',
    color: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500/20 text-white',
    hoverColor: 'bg-sky-600',
    textColor: '#0ea5e9',
    accentBorder: 'border-sky-500/30 focus-within:border-sky-500',
    accentText: 'text-sky-400',
    ringColor: 'focus:ring-sky-500/20',
    bgGradient: 'from-sky-950/20 to-zinc-950',
    icon: Send,
    desc: 'Crie um link direto para iniciar conversas com o seu @nome_de_usuario.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário (Ex: @tiagorabelo)', placeholder: 'tiagorabelo' }
    ]
  },
  instagram: {
    name: 'Instagram Direct',
    color: 'bg-pink-500 hover:bg-pink-600 focus:ring-pink-500/20 text-white',
    hoverColor: 'bg-pink-600',
    textColor: '#ec4899',
    accentBorder: 'border-pink-500/30 focus-within:border-pink-500',
    accentText: 'text-pink-400',
    ringColor: 'focus:ring-pink-500/20',
    bgGradient: 'from-pink-950/20 to-zinc-950',
    icon: Instagram,
    desc: 'Direcione as pessoas diretamente para o envio de mensagens no seu Direct do Instagram.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário (Ex: @tiagorabelo)', placeholder: 'tiagorabelo' }
    ]
  },
  messenger: {
    name: 'Facebook Messenger',
    color: 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500/20 text-white',
    hoverColor: 'bg-blue-600',
    textColor: '#3b82f6',
    accentBorder: 'border-blue-500/30 focus-within:border-blue-500',
    accentText: 'text-blue-400',
    ringColor: 'focus:ring-blue-500/20',
    bgGradient: 'from-blue-950/20 to-zinc-950',
    icon: MessageSquare,
    desc: 'Crie links m.me para que seus clientes entrem em contato direto com sua página ou perfil.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário ou Link completo', placeholder: 'tiagorabelo' }
    ]
  },
  sms: {
    name: 'SMS Universal',
    color: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500/20 text-white',
    hoverColor: 'bg-indigo-600',
    textColor: '#6366f1',
    accentBorder: 'border-indigo-500/30 focus-within:border-indigo-500',
    accentText: 'text-indigo-400',
    ringColor: 'focus:ring-indigo-500/20',
    bgGradient: 'from-indigo-950/20 to-zinc-950',
    icon: Smartphone,
    desc: 'Crie um link especial que abre o aplicativo de SMS com o número e mensagem pré-preenchidos.',
    inputs: [
      { id: 'numero', label: 'Número de Celular com DDD', placeholder: '51999999999' },
      { id: 'mensagem', label: 'Mensagem SMS (Opcional)', placeholder: 'Olá, gostaria de mais detalhes.', large: true }
    ]
  },
  linkedin: {
    name: 'LinkedIn',
    color: 'bg-cyan-600 hover:bg-cyan-700 focus:ring-cyan-500/20 text-white',
    hoverColor: 'bg-cyan-700',
    textColor: '#0891b2',
    accentBorder: 'border-cyan-500/30 focus-within:border-cyan-500',
    accentText: 'text-cyan-400',
    ringColor: 'focus:ring-cyan-500/20',
    bgGradient: 'from-cyan-950/20 to-zinc-950',
    icon: Linkedin,
    desc: 'Crie um link direto para o seu perfil profissional no LinkedIn.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário do Perfil', placeholder: 'tiago-rabelo' }
    ]
  },
  twitter: {
    name: 'X (Twitter)',
    color: 'bg-zinc-100 hover:bg-zinc-200 focus:ring-zinc-500/20 text-zinc-950',
    hoverColor: 'bg-zinc-200',
    textColor: '#ffffff',
    accentBorder: 'border-zinc-500/30 focus-within:border-zinc-400',
    accentText: 'text-zinc-300',
    ringColor: 'focus:ring-zinc-500/20',
    bgGradient: 'from-zinc-900/30 to-zinc-950',
    icon: Twitter,
    desc: 'Crie um link para redirecionar para seu perfil ou para abrir uma janela de Tweet pré-preenchida.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário @', placeholder: 'tiago' },
      { id: 'mensagem', label: 'Mensagem do Tweet (Opcional)', placeholder: 'Confira esse aplicativo!', large: true }
    ]
  },
  signal: {
    name: 'Signal',
    color: 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-600/20 text-white',
    hoverColor: 'bg-indigo-700',
    textColor: '#4f46e5',
    accentBorder: 'border-indigo-500/30 focus-within:border-indigo-500',
    accentText: 'text-indigo-400',
    ringColor: 'focus:ring-indigo-500/20',
    bgGradient: 'from-indigo-950/20 to-zinc-950',
    icon: Lock,
    desc: 'Crie um link para que outras pessoas iniciem um chat criptografado com você no Signal.',
    inputs: [
      { id: 'numero', label: 'Número (DDI+DDD+Número)', placeholder: '+5551999999999' }
    ]
  },
  youtube: {
    name: 'YouTube',
    color: 'bg-red-600 hover:bg-red-700 focus:ring-red-500/20 text-white',
    hoverColor: 'bg-red-700',
    textColor: '#ef4444',
    accentBorder: 'border-red-500/30 focus-within:border-red-500',
    accentText: 'text-red-400',
    ringColor: 'focus:ring-red-500/20',
    bgGradient: 'from-red-950/20 to-zinc-950',
    icon: Youtube,
    desc: 'Crie um link de inscrição automática para engajar a audiência do seu canal.',
    inputs: [
      { id: 'canal', label: 'ID ou Nome do Canal', placeholder: '@TiagoRabelo' }
    ]
  },
  tiktok: {
    name: 'TikTok',
    color: 'bg-rose-500 hover:bg-rose-600 focus:ring-rose-500/20 text-white',
    hoverColor: 'bg-rose-600',
    textColor: '#f43f5e',
    accentBorder: 'border-rose-500/30 focus-within:border-rose-500',
    accentText: 'text-rose-400',
    ringColor: 'focus:ring-rose-500/20',
    bgGradient: 'from-rose-950/20 to-zinc-950',
    icon: Music,
    desc: 'Crie links que abrem o seu perfil de criador de conteúdo no TikTok.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário @', placeholder: 'tiago' }
    ]
  },
  pinterest: {
    name: 'Pinterest',
    color: 'bg-red-500 hover:bg-red-600 focus:ring-red-500/20 text-white',
    hoverColor: 'bg-red-600',
    textColor: '#ef4444',
    accentBorder: 'border-red-500/30 focus-within:border-red-500',
    accentText: 'text-red-400',
    ringColor: 'focus:ring-red-500/20',
    bgGradient: 'from-red-950/20 to-zinc-950',
    icon: Pin,
    desc: 'Crie um link de atalho direto para o seu perfil ou painel no Pinterest.',
    inputs: [
      { id: 'usuario', label: 'Nome de Usuário', placeholder: 'tiagorabelo' }
    ]
  },
  skype: {
    name: 'Skype',
    color: 'bg-sky-400 hover:bg-sky-500 focus:ring-sky-400/20 text-white',
    hoverColor: 'bg-sky-500',
    textColor: '#38bdf8',
    accentBorder: 'border-sky-400/30 focus-within:border-sky-400',
    accentText: 'text-sky-400',
    ringColor: 'focus:ring-sky-400/20',
    bgGradient: 'from-sky-950/20 to-zinc-950',
    icon: Video,
    desc: 'Crie um link direto para abrir uma conversa por chat com você no Skype.',
    inputs: [
      { id: 'usuario', label: 'ID ou Usuário do Skype', placeholder: 'live:tiago_rabelo' }
    ]
  },
  qr_custom: {
    name: 'QR Code Personalizado',
    color: 'bg-sky-500 hover:bg-sky-600 focus:ring-sky-500/20 text-white',
    hoverColor: 'bg-sky-600',
    textColor: '#0ea5e9',
    accentBorder: 'border-sky-500/30 focus-within:border-sky-500',
    accentText: 'text-sky-400',
    ringColor: 'focus:ring-sky-500/20',
    bgGradient: 'from-sky-950/20 to-zinc-950',
    icon: QrCode,
    desc: 'Gere um QR Code avançado a partir de qualquer link de destino, customizando as cores dos módulos, cor de fundo (ou transparente) e inserindo o logotipo da sua marca no centro para um visual profissional e exclusivo.',
    inputs: [
      { id: 'link', label: 'Link ou Texto de Destino (Ex: https://seusite.com)', placeholder: 'https://seu-link-ou-texto.com' }
    ]
  }
};

// ==========================================
// DYNAMIC PYTHON SYNTAX HIGHLIGHTER HELPER
// ==========================================
function highlightPython(code: string) {
  let escaped = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // Highlight comments
  escaped = escaped.replace(/(#[^\n]*)/g, '<span class="text-zinc-500 italic">$1</span>');

  // Highlight triple quotes docstrings
  escaped = escaped.replace(/(""".*?""")/gs, '<span class="text-zinc-400 font-normal">$1</span>');

  // Highlight normal strings
  escaped = escaped.replace(/(".*?")/g, '<span class="text-emerald-400">$1</span>');
  escaped = escaped.replace(/('.*?')/g, '<span class="text-emerald-400">$1</span>');

  // Highlight keywords
  const keywords = [
    'def', 'class', 'import', 'from', 'if', 'else', 'elif', 'return', 'try', 'except', 
    'pass', 'and', 'or', 'not', 'in', 'is', 'for', 'while', 'as', 'with', 'lambda', 'True', 'False', 'None'
  ];
  const kwRegex = new RegExp(`\\b(${keywords.join('|')})\\b`, 'g');
  escaped = escaped.replace(kwRegex, '<span class="text-amber-500 font-medium">$1</span>');

  // Highlight built-ins and specific Qt classes
  escaped = escaped.replace(/\b(self|MainWindow|QApplication|QMainWindow|QWidget|QPushButton|QLabel|QLineEdit|QTextEdit|QStackedWidget|QFileDialog|QMessageBox|QFrame|QScrollArea|QPixmap|QFont|QColor|Qt|QSize|io|sys|os|qrcode|whatsapp|telegram|instagram|messenger|sms|linkedin|twitter|signal|youtube|tiktok|pinterest|skype)\b/g, '<span class="text-sky-400">$1</span>');

  return escaped;
}

const getPlatformHex = (pid: string) => {
  const hexMap: Record<string, string> = {
    whatsapp: '#25D366',
    telegram: '#0088cc',
    instagram: '#E1306C',
    messenger: '#006AFF',
    sms: '#6366F1',
    linkedin: '#0077B5',
    twitter: '#e2e2e5',
    signal: '#3A76F0',
    youtube: '#FF0000',
    tiktok: '#EE1D52',
    pinterest: '#BD081C',
    skype: '#00AFF0',
    qr_custom: '#0ea5e9'
  };
  return hexMap[pid] || '#25D366';
};

const isColorLight = (hex: string) => {
  const cleanHex = hex.replace('#', '');
  if (cleanHex.length !== 6) return false;
  const r = parseInt(cleanHex.substring(0, 2), 16);
  const g = parseInt(cleanHex.substring(2, 4), 16);
  const b = parseInt(cleanHex.substring(4, 6), 16);
  const luminance = 0.299 * r + 0.587 * g + 0.114 * b;
  return luminance > 165; // Limiar de segurança para leitura de QR Code
};

export default function App() {
  // --- STATES FOR LIVE APP MOCKUP ---
  const [activePlatform, setActivePlatform] = useState<string>('whatsapp');
  const [formInputs, setFormInputs] = useState<Record<string, string>>({
    ddi: '55',
    ddd: '',
    numero: '',
    mensagem: '',
    usuario: '',
    canal: '',
  });
  const [generatedLink, setGeneratedLink] = useState<string>('');
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedFile, setCopiedFile] = useState<boolean>(false);
  const [showQr, setShowQr] = useState<boolean>(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

  // --- ESTADOS DO QR CODE PERSONALIZADO ---
  const [customQrColor, setCustomQrColor] = useState<string>('#0ea5e9');
  const [customQrBgColor, setCustomQrBgColor] = useState<string>('#ffffff');
  const [customQrTransparent, setCustomQrTransparent] = useState<boolean>(false);
  const [customQrLogo, setCustomQrLogo] = useState<string>(''); // base64 DataURL
  const [customQrLogoName, setCustomQrLogoName] = useState<string>('');
  const [customQrLogoTransparent, setCustomQrLogoTransparent] = useState<boolean>(false);

  // --- STATES FOR DEVELOPER HUB / PYTHON FILES ---
  const [activeTab, setActiveTab] = useState<'code' | 'guide'>('code');
  const [selectedFile, setSelectedFile] = useState<string>('sociallinker.py');
  const [fileSearchQuery, setFileSearchQuery] = useState<string>('');
  const [isZipping, setIsZipping] = useState<boolean>(false);
  const [zipSuccess, setZipSuccess] = useState<boolean>(false);

  // References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const theme = PLATFORM_THEMES[activePlatform];

  // Reset results when changing social network
  useEffect(() => {
    setGeneratedLink('');
    setQrCodeUrl('');
    setShowQr(false);
    
    // Set WhatsApp default DDI if switched to whatsapp
    if (activePlatform === 'whatsapp') {
      setFormInputs(prev => ({ ...prev, ddi: prev.ddi || '55' }));
    }
  }, [activePlatform]);

  const handleInputChange = (fieldId: string, val: string) => {
    setFormInputs(prev => ({
      ...prev,
      [fieldId]: val
    }));
  };

  const handleLogoChange = (e: any) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomQrLogoName(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        setCustomQrLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setCustomQrLogo('');
    setCustomQrLogoName('');
  };

  // --- LOGIC OF LINK GENERATION (SAMES AS PYTHON ENGINE) ---
  const handleGenerateLink = () => {
    const cleanNumber = (text: string) => text.replace(/\D/g, '');
    const cleanUser = (text: string) => text.replace('@', '').trim();
    const encodeText = (text: string) => encodeURIComponent(text);

    let link = '';
    const { ddi, ddd, numero, mensagem, usuario, canal } = formInputs;

    switch (activePlatform) {
      case 'whatsapp': {
        const ddiClean = cleanNumber(ddi) || '55';
        const dddClean = cleanNumber(ddd);
        const numClean = cleanNumber(numero);
        const msgEncoded = encodeText(mensagem || '');
        link = `https://wa.me/${ddiClean}${dddClean}${numClean}?text=${msgEncoded}`;
        break;
      }
      case 'telegram': {
        const userClean = cleanUser(usuario || '');
        link = `https://t.me/${userClean}`;
        break;
      }
      case 'instagram': {
        const userClean = cleanUser(usuario || '');
        link = `https://ig.me/m/${userClean}`;
        break;
      }
      case 'messenger': {
        const user = (usuario || '').split('/').pop()?.trim() || '';
        link = `https://m.me/${user}`;
        break;
      }
      case 'sms': {
        const numClean = cleanNumber(numero || '');
        const msgEncoded = encodeText(mensagem || '');
        link = `sms:${numClean}?body=${msgEncoded}`;
        break;
      }
      case 'linkedin': {
        const userClean = cleanUser(usuario || '');
        link = `https://www.linkedin.com/in/${userClean}`;
        break;
      }
      case 'twitter': {
        const userClean = cleanUser(usuario || '');
        const msg = (mensagem || '').trim();
        if (msg) {
          link = `https://twitter.com/intent/tweet?text=@${userClean}%20${encodeText(msg)}`;
        } else {
          link = `https://twitter.com/${userClean}`;
        }
        break;
      }
      case 'signal': {
        const numClean = cleanNumber(numero || '');
        link = `https://signal.me/#p/${numClean}`;
        break;
      }
      case 'youtube': {
        const canalClean = (canal || '').trim();
        link = `https://www.youtube.com/${canalClean}?sub_confirmation=1`;
        break;
      }
      case 'tiktok': {
        const userClean = cleanUser(usuario || '');
        link = `https://www.tiktok.com/@${userClean}`;
        break;
      }
      case 'pinterest': {
        const userClean = cleanUser(usuario || '');
        link = `https://www.pinterest.com/${userClean}/`;
        break;
      }
      case 'skype': {
        const userClean = (usuario || '').trim();
        link = `skype:${userClean}?chat`;
        break;
      }
      case 'qr_custom': {
        const destLink = (formInputs.link || '').trim();
        if (!destLink) {
          alert("Por favor, digite o link de destino!");
          return;
        }
        link = destLink;
        break;
      }
      default:
        break;
    }

    setGeneratedLink(link);
    setQrCodeUrl('');
    setShowQr(false);

    // Se for QR Code customizado, já inicia a renderização imediata do QR com Canvas
    if (activePlatform === 'qr_custom') {
      setTimeout(async () => {
        try {
          const canvas = document.createElement('canvas');
          await QRCode.toCanvas(canvas, link, {
            width: 400,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: {
              dark: customQrColor,
              light: customQrTransparent ? '#00000000' : customQrBgColor
            }
          });

          const ctx = canvas.getContext('2d');
          if (ctx && customQrLogo) {
            const img = new Image();
            img.src = customQrLogo;
            await new Promise((resolve) => {
              img.onload = resolve;
              img.onerror = resolve; // impede travamento caso o base64 esteja corrompido
            });

            if (img.complete && img.naturalWidth > 0) {
              const qrSize = canvas.width;
              const logoSize = qrSize * 0.22;
              const center = qrSize / 2;

              if (customQrLogoTransparent) {
                // Caso queira remover a moldura branca do logotipo (Manter transparente)
                const paddingLimpeza = logoSize * 0.10;
                const clearSize = logoSize + paddingLimpeza * 2;
                const clearX = center - clearSize / 2;
                const clearY = center - clearSize / 2;

                if (customQrTransparent) {
                  // Fundo geral do QR é transparente, então limpamos a área central de forma 100% transparente
                  ctx.clearRect(clearX, clearY, clearSize, clearSize);
                } else {
                  // Fundo geral do QR tem cor, então desenhamos um retângulo plano com a cor do fundo do QR para esconder os módulos de trás
                  ctx.fillStyle = customQrBgColor;
                  ctx.fillRect(clearX, clearY, clearSize, clearSize);
                }

                ctx.drawImage(
                  img,
                  center - logoSize / 2,
                  center - logoSize / 2,
                  logoSize,
                  logoSize
                );
              } else {
                // Comportamento padrão: Desenha um card branco protetor com bordas arredondadas (moldura)
                const padding = logoSize * 0.12;
                const cardSize = logoSize + padding * 2;
                const cardX = center - cardSize / 2;
                const cardY = center - cardSize / 2;
                const radius = cardSize * 0.15;

                ctx.fillStyle = customQrTransparent ? 'rgba(255, 255, 255, 0.95)' : 'white';
                ctx.beginPath();
                ctx.moveTo(cardX + radius, cardY);
                ctx.lineTo(cardX + cardSize - radius, cardY);
                ctx.quadraticCurveTo(cardX + cardSize, cardY, cardX + cardSize, cardY + radius);
                ctx.lineTo(cardX + cardSize, cardY + cardSize - radius);
                ctx.quadraticCurveTo(cardX + cardSize, cardY + cardSize, cardX + cardSize - radius, cardY + cardSize);
                ctx.lineTo(cardX + radius, cardY + cardSize);
                ctx.quadraticCurveTo(cardX, cardY + cardSize, cardX, cardY + cardSize - radius);
                ctx.lineTo(cardX, cardY + radius);
                ctx.quadraticCurveTo(cardX, cardY, cardX + radius, cardY);
                ctx.closePath();
                ctx.fill();

                ctx.drawImage(
                  img,
                  center - logoSize / 2,
                  center - logoSize / 2,
                  logoSize,
                  logoSize
                );
              }
            }
          }

          const dataUrl = canvas.toDataURL('image/png');
          setQrCodeUrl(dataUrl);
          setShowQr(true);
        } catch (err) {
          console.error(err);
        }
      }, 50);
    }
  };

  // --- LOCAL QR CODE GENERATION ---
  const handleGenerateQr = async () => {
    if (!generatedLink) return;
    try {
      const url = await QRCode.toDataURL(generatedLink, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
      setShowQr(true);
    } catch (err) {
      console.error(err);
    }
  };

  // --- SAVE QR CODE LOCAL FILE DOWNLOAD ---
  const handleSaveQrFile = () => {
    if (!qrCodeUrl) return;
    const a = document.createElement('a');
    a.href = qrCodeUrl;
    a.download = `qrcode_${activePlatform}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // --- COPY LINK ACTION ---
  const handleCopyLink = () => {
    if (!generatedLink) return;
    navigator.clipboard.writeText(generatedLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- COPY PYTHON FILE CODE ---
  const handleCopyFileCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedFile(true);
    setTimeout(() => setCopiedFile(false), 2000);
  };

  // --- EXPORT DESKTOP PROJECT ZIP USING JSZIP ---
  const handleDownloadZip = async () => {
    setIsZipping(true);
    try {
      const zip = new JSZip();

      // Main Files
      zip.file('sociallinker.py', PYTHON_PROJECT_FILES['sociallinker.py'].code);
      zip.file('requirements.txt', PYTHON_PROJECT_FILES['requirements.txt'].code);
      zip.file('abrir_sociallinker.sh', PYTHON_PROJECT_FILES['abrir_sociallinker.sh'].code);
      zip.file('abrir_sociallinker.bat', PYTHON_PROJECT_FILES['abrir_sociallinker.bat'].code);

      // Core package
      const coreFolder = zip.folder('core');
      if (coreFolder) {
        coreFolder.file('__init__.py', PYTHON_PROJECT_FILES['core/__init__.py'].code);
        coreFolder.file('utils.py', PYTHON_PROJECT_FILES['core/utils.py'].code);
        coreFolder.file('qr_custom.py', PYTHON_PROJECT_FILES['core/qr_custom.py'].code);
      }

      // UI package
      const uiFolder = zip.folder('ui');
      if (uiFolder) {
        uiFolder.file('__init__.py', PYTHON_PROJECT_FILES['ui/__init__.py'].code);
        uiFolder.file('main_window.py', PYTHON_PROJECT_FILES['ui/main_window.py'].code);
      }

      // Modules package
      const modulesFolder = zip.folder('modules');
      if (modulesFolder) {
        modulesFolder.file('__init__.py', PYTHON_PROJECT_FILES['modules/__init__.py'].code);
        modulesFolder.file('whatsapp.py', PYTHON_PROJECT_FILES['modules/whatsapp.py'].code);
        modulesFolder.file('telegram.py', PYTHON_PROJECT_FILES['modules/telegram.py'].code);
        modulesFolder.file('instagram.py', PYTHON_PROJECT_FILES['modules/instagram.py'].code);
        modulesFolder.file('messenger.py', PYTHON_PROJECT_FILES['modules/messenger.py'].code);
        modulesFolder.file('sms.py', PYTHON_PROJECT_FILES['modules/sms.py'].code);
        modulesFolder.file('linkedin.py', PYTHON_PROJECT_FILES['modules/linkedin.py'].code);
        modulesFolder.file('twitter.py', PYTHON_PROJECT_FILES['modules/twitter.py'].code);
        modulesFolder.file('signal.py', PYTHON_PROJECT_FILES['modules/signal.py'].code);
        modulesFolder.file('youtube.py', PYTHON_PROJECT_FILES['modules/youtube.py'].code);
        modulesFolder.file('tiktok.py', PYTHON_PROJECT_FILES['modules/tiktok.py'].code);
        modulesFolder.file('pinterest.py', PYTHON_PROJECT_FILES['modules/pinterest.py'].code);
        modulesFolder.file('skype.py', PYTHON_PROJECT_FILES['modules/skype.py'].code);
      }

      // README
      zip.file('README.md', `
# 💻 SocialLinker - Desktop Client

SocialLinker é um gerador de links e QR Codes multiplataforma escrito em **Python 3** e **PySide6 (Qt)**.

Este projeto é open-source, distribuído sob a Licença Apache 2.0, gratuito e vitalício!

---

## 🚀 Instalação no Linux (Pop!_OS / Ubuntu / Debian)

\`\`\`bash
sudo apt update
sudo apt install python3 python3-pip python3-venv -y

# Ative o ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instale os requerimentos
pip install -r requirements.txt

# Execute!
python sociallinker.py
\`\`\`

Feito com ❤️ por Tiago Rabelo.
      `);

      const content = await zip.generateAsync({ type: 'blob' });
      const element = document.createElement('a');
      element.href = URL.createObjectURL(content);
      element.download = 'SocialLinker-Desktop-Python.zip';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsZipping(false);
    }
  };

  // Files list for the explorer (flattened categorized path representation)
  const filesTree = Object.keys(PYTHON_PROJECT_FILES).filter(f => f !== 'requirements.txt');

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-slate-100 flex flex-col font-sans antialiased overflow-x-hidden selection:bg-slate-800 selection:text-slate-200">
      
      {/* HEADER DE COMANDO SUPERIOR */}
      <header className="border-b border-[#333] bg-[#141414]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="h-9 w-9 rounded-lg flex items-center justify-center shadow-lg transition-all"
              style={{
                backgroundColor: `${getPlatformHex(activePlatform)}1a`,
                boxShadow: `0 4px 12px ${getPlatformHex(activePlatform)}1a`
              }}
            >
              <Globe className="h-5 w-5 text-white" style={{ color: getPlatformHex(activePlatform) }} />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                SocialLinker <span className="text-[10px] px-2 py-0.5 rounded bg-[#252525] text-slate-400 border border-[#333] font-normal">v2.5</span>
              </h1>
              <p className="text-xs text-slate-400 font-sans">Conversor Modular Multiplataforma • PySide6 Desktop & Web Client</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadZip}
              disabled={isZipping}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                zipSuccess 
                  ? 'bg-white text-slate-900' 
                  : 'bg-[#252525] hover:bg-zinc-800 text-slate-200 border border-[#333]'
              }`}
            >
              {zipSuccess ? (
                <>
                  <Check className="h-4 w-4" />
                  Projeto Baixado (.ZIP)
                </>
              ) : (
                <>
                  <Download className={`h-4 w-4 ${isZipping ? 'animate-bounce' : ''}`} />
                  {isZipping ? 'Compactando...' : 'Baixar Projeto PySide6 (.ZIP)'}
                </>
              )}
            </button>
            <a 
              href="#installation-guide"
              onClick={() => setActiveTab('guide')}
              className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white bg-[#252525] border border-[#333] hover:border-zinc-700 transition"
            >
              Guia Pop!_OS
            </a>
          </div>
        </div>
      </header>

      {/* PAINEL CENTRAL DUPLO (WORKSPACE) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* COLUNA ESQUERDA: CLIENTE EM TEMPO REAL MOCKUP */}
        <section className="lg:col-span-7 flex flex-col bg-[#1A1A1A] border border-[#333] rounded-2xl overflow-hidden shadow-2xl relative">
          
          {/* BARRA DE TÍTULO DA JANELA */}
          <div className="flex items-center justify-between px-4 h-11 bg-[#141414] border-b border-[#333]">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56]"></div>
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]"></div>
                <div className="w-3 h-3 rounded-full bg-[#27C93F]"></div>
              </div>
              <span className="ml-4 text-[11px] font-bold tracking-wider text-slate-400 uppercase font-mono">SOCIALLINKER v2.5 — PRODUCTION</span>
            </div>
            <div className="text-[10px] text-slate-500 italic font-mono hidden sm:block">modular architecture active</div>
          </div>

          <div className="flex flex-1 flex-col sm:flex-row items-stretch min-h-[500px]">
            
            {/* SIDEBAR DO EMULADOR */}
            <div className={`w-full sm:w-56 bg-[#141414] border-b sm:border-b-0 sm:border-r border-[#333] flex flex-col flex-shrink-0 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden sm:flex'}`}>
              <div className="p-4 border-b border-[#333]/50">
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Platforms</span>
              </div>
              
              <nav className="flex-1 overflow-y-auto p-2 space-y-1 max-h-[280px] sm:max-h-[380px]">
                {Object.entries(PLATFORM_THEMES).filter(([pid]) => pid !== 'qr_custom').map(([pid, cfg]) => {
                  const IconComponent = cfg.icon;
                  const isSelected = activePlatform === pid;
                  const hex = getPlatformHex(pid);
                  return (
                    <button
                      key={pid}
                      onClick={() => setActivePlatform(pid)}
                      style={
                        isSelected 
                          ? {
                              backgroundColor: `${hex}1a`, // 10% opacity
                              color: hex,
                              borderColor: `${hex}33`, // 20% opacity
                            }
                          : undefined
                      }
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-3 border ${
                        isSelected 
                          ? 'border-solid font-semibold shadow-sm' 
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 shrink-0 transition-colors" style={{ color: isSelected ? hex : '#94a3b8' }} />
                      {cfg.name}
                    </button>
                  );
                })}

                <div className="h-[1px] bg-[#333]/55 my-3.5 mx-1" />
                <div className="px-2 pb-1 text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase">
                  Ferramentas
                </div>

                {(() => {
                  const cfg = PLATFORM_THEMES['qr_custom'];
                  if (!cfg) return null;
                  const IconComponent = cfg.icon;
                  const isSelected = activePlatform === 'qr_custom';
                  const hex = getPlatformHex('qr_custom');
                  return (
                    <button
                      onClick={() => setActivePlatform('qr_custom')}
                      style={
                        isSelected 
                          ? {
                              backgroundColor: `${hex}1a`,
                              color: hex,
                              borderColor: `${hex}33`,
                            }
                          : undefined
                      }
                      className={`w-full text-left px-3.5 py-2.5 rounded-lg text-xs transition-all cursor-pointer flex items-center gap-3 border ${
                        isSelected 
                          ? 'border-solid font-semibold shadow-sm' 
                          : 'border-transparent text-slate-400 hover:text-white hover:bg-[#1f1f1f]'
                      }`}
                    >
                      <IconComponent className="h-4 w-4 shrink-0 transition-colors" style={{ color: isSelected ? hex : '#94a3b8' }} />
                      {cfg.name}
                    </button>
                  );
                })()}
              </nav>

              {/* FOOTER OBRIGATÓRIO (CRÉDITOS) */}
              <div className="p-4 border-t border-[#333]/60 bg-[#141414]/50 flex flex-col items-center justify-center text-center">
                <p className="text-[11px] text-slate-500 font-medium">Feito por</p>
                <p className="text-xs font-semibold text-slate-200 tracking-tight flex items-center gap-1">
                  Tiago Rabelo <Heart className="h-3 w-3 text-red-500 fill-red-500 inline" />
                </p>
              </div>
            </div>

            {/* CONTEÚDO DO FORMULÁRIO DO EMULADOR */}
            <div className="flex-1 flex flex-col bg-[#1A1A1A] relative overflow-hidden">
              
              {/* GRADIENTE DINÂMICO DE FUNDO */}
              <div 
                className="absolute top-0 left-0 right-0 h-48 bg-gradient-to-b pointer-events-none transition-all duration-500 border-b"
                style={{ 
                  backgroundImage: `linear-gradient(to right, ${getPlatformHex(activePlatform)}1a, transparent)`,
                  borderColor: `${getPlatformHex(activePlatform)}12`
                }} 
              />
              
              <div className="p-6 flex-1 flex flex-col relative z-10">
                
                {/* CABEÇALHO DA PLATAFORMA */}
                <div className="shrink-0 mb-4">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <div className="p-2 rounded-lg bg-[#141414] border border-[#333]">
                      <theme.icon className="h-5 w-5" style={{ color: getPlatformHex(activePlatform) }} />
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight">{theme.name}</h2>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">{theme.desc}</p>
                  <div className="h-[1px] bg-[#333]/40 mt-3" />
                </div>

                {/* GRID BIPARTIDO (LADO A LADO EM TELAS MEDIAS/GRANDES) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 items-stretch min-h-0">
                  
                  {/* PAINEL ESQUERDO: CONFIGURAÇÃO DOS CAMPOS */}
                  <div className="flex flex-col justify-between bg-[#141414]/40 border border-[#333]/50 rounded-xl p-5 space-y-5">
                    <div className="space-y-4 overflow-y-auto pr-1">
                      <div className="flex items-center gap-2 pb-1 border-b border-[#333]/30">
                        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">1. Configurar Link</span>
                      </div>
                      
                      {theme.inputs.map((field) => {
                        const hex = getPlatformHex(activePlatform);
                        return (
                          <div key={field.id} className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{field.label}</label>
                            {field.large ? (
                              <textarea
                                value={formInputs[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full bg-[#1e1e1e] border border-[#333] text-xs text-white rounded-lg p-2.5 outline-none resize-none min-h-[75px] transition focus:border-zinc-700"
                                onFocus={(e) => e.target.style.borderColor = hex}
                                onBlur={(e) => e.target.style.borderColor = '#333'}
                              />
                            ) : (
                              <input
                                type="text"
                                value={formInputs[field.id] || ''}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                placeholder={field.placeholder}
                                className="w-full bg-[#1e1e1e] border border-[#333] text-xs text-white rounded-lg p-2.5 outline-none transition focus:border-zinc-700"
                                onFocus={(e) => e.target.style.borderColor = hex}
                                onBlur={(e) => e.target.style.borderColor = '#333'}
                              />
                            )}
                          </div>
                        );
                      })}

                      {activePlatform === 'qr_custom' && (
                        <div className="space-y-4 pt-2 border-t border-[#333]/30">
                          {/* Seção Cores */}
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do QR (Módulos)</label>
                              <div className="flex items-center gap-2 bg-[#1e1e1e] border border-[#333] rounded-lg p-1.5">
                                <input
                                  type="color"
                                  value={customQrColor}
                                  onChange={(e) => setCustomQrColor(e.target.value)}
                                  className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent"
                                />
                                <span className="text-xs font-mono font-bold text-slate-200">{customQrColor.toUpperCase()}</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cor do Fundo</label>
                              <div className={`flex items-center gap-2 bg-[#1e1e1e] border rounded-lg p-1.5 ${customQrTransparent ? 'opacity-50 border-dashed border-[#333]' : 'border-[#333]'}`}>
                                <input
                                  type="color"
                                  value={customQrBgColor}
                                  disabled={customQrTransparent}
                                  onChange={(e) => setCustomQrBgColor(e.target.value)}
                                  className="w-8 h-8 rounded border border-[#333] cursor-pointer bg-transparent disabled:cursor-not-allowed"
                                />
                                <span className="text-xs font-mono font-bold text-slate-200">
                                  {customQrTransparent ? 'TRANSPARENTE' : customQrBgColor.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Alerta de Contraste para Cores Claras */}
                          {isColorLight(customQrColor) && (
                            <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-900/40 text-[11px] text-amber-300 leading-normal">
                              ⚠️ <strong>Dica de Leitura:</strong> A cor escolhida é muito clara. Leitores de QR Code e câmeras dependem de contraste alto para escanear com facilidade. Recomendamos escolher tons mais escuros (azul escuro, vermelho escuro, verde escuro, etc) caso note falhas na leitura.
                            </div>
                          )}

                          {/* Checkbox Transparência */}
                          <label className="flex items-center gap-2 cursor-pointer select-none py-1 group">
                            <input
                              type="checkbox"
                              checked={customQrTransparent}
                              onChange={(e) => setCustomQrTransparent(e.target.checked)}
                              className="accent-sky-500 rounded border-[#333]"
                            />
                            <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">Tornar Fundo do QR Code Transparente</span>
                          </label>

                          {/* Logotipo Central */}
                          <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Logotipo Central (Opcional)</label>
                            <div className="flex items-center gap-3">
                              <label className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-slate-200 border border-zinc-700 hover:border-zinc-600 rounded-lg text-xs font-bold cursor-pointer transition flex items-center gap-2">
                                <FileCode className="h-3.5 w-3.5" />
                                Escolher Ícone
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleLogoChange}
                                  className="hidden"
                                />
                              </label>

                              {customQrLogo && (
                                <button
                                  onClick={handleRemoveLogo}
                                  className="px-3 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 border border-red-900 rounded-lg text-xs font-bold cursor-pointer transition"
                                >
                                  Remover
                                </button>
                              )}

                              <span className="text-xs text-slate-400 italic truncate max-w-[150px]">
                                {customQrLogoName || 'Nenhum ícone selecionado'}
                              </span>
                            </div>

                            {/* Checkbox para Remover Moldura Branca do Logo */}
                            {customQrLogo && (
                              <label className="flex items-center gap-2 cursor-pointer select-none py-1 group mt-1">
                                <input
                                  type="checkbox"
                                  checked={customQrLogoTransparent}
                                  onChange={(e) => setCustomQrLogoTransparent(e.target.checked)}
                                  className="accent-sky-500 rounded border-[#333]"
                                />
                                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition">
                                  Remover moldura branca (Manter Logotipo Transparente)
                                </span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={handleGenerateLink}
                      style={{
                        backgroundColor: getPlatformHex(activePlatform),
                        color: (activePlatform === 'twitter' || activePlatform === 'skype' || activePlatform === 'whatsapp' || activePlatform === 'qr_custom') ? '#09090b' : '#ffffff',
                        boxShadow: `0 8px 20px ${getPlatformHex(activePlatform)}26`
                      }}
                      className="w-full py-3 px-4 rounded-lg font-bold text-xs tracking-wide transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-auto"
                    >
                      <Play className="h-3.5 w-3.5" />
                      {activePlatform === 'qr_custom' ? 'Gerar QR Code Personalizado' : 'Gerar Link Direto'}
                    </button>
                  </div>

                  {/* PAINEL DIREITO: OUTPUT E QR CODE (SEMPRE OCUPADO) */}
                  <div className="flex flex-col bg-[#141414]/70 border border-[#333]/80 rounded-xl p-5 relative overflow-hidden min-h-[280px]">
                    
                    {!generatedLink ? (
                      /* ESTADO INICIAL / AGUARDANDO */
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-4 space-y-4">
                        <div className="relative">
                          {/* Moldura animada estilo scanner */}
                          <div className="absolute -inset-2 border border-dashed border-slate-700 rounded-xl animate-[pulse_2s_infinite]"></div>
                          <div className="h-28 w-28 rounded-lg bg-zinc-950 flex items-center justify-center text-slate-600 border border-[#333]">
                            <QrCode className="h-16 w-16 stroke-[1.2] opacity-40" />
                          </div>
                          {/* Linha laser de scan decorativa */}
                          <div className="absolute left-0 right-0 h-0.5 bg-sky-500/30 blur-[1px] animate-[bounce_3s_infinite]" style={{ backgroundColor: `${getPlatformHex(activePlatform)}40` }}></div>
                        </div>
                        
                        <div className="space-y-1.5">
                          <h4 className="text-xs font-bold text-slate-300">Aguardando Parâmetros</h4>
                          <p className="text-[10px] text-slate-500 max-w-[200px] leading-relaxed">
                            Preencha os campos de formulário e clique em <b>Gerar Link Direto</b> para visualizar o resultado e o QR Code.
                          </p>
                        </div>

                        <div className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest pt-4">
                          Status: Ready • Offline Engine
                        </div>
                      </div>
                    ) : (
                      /* ESTADO DE SUCESSO / LINK GERADO */
                      <div className="flex-1 flex flex-col justify-between space-y-4">
                        
                        {/* LINK COPIÁVEL */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between pb-1 border-b border-[#333]/30">
                            <span 
                              className="text-[10px] font-bold uppercase tracking-widest font-mono flex items-center gap-1.5"
                              style={{ color: getPlatformHex(activePlatform) }}
                            >
                              <span className="w-1.5 h-1.5 rounded-full inline-block animate-pulse" style={{ backgroundColor: getPlatformHex(activePlatform) }}></span>
                              Link Gerado com Sucesso
                            </span>
                          </div>

                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={generatedLink}
                              readOnly
                              className="flex-1 bg-[#1e1e1e] border border-[#333] text-xs font-mono px-3 py-2.5 rounded-lg outline-none select-all"
                              style={{ color: getPlatformHex(activePlatform) }}
                            />
                            <button
                              onClick={handleCopyLink}
                              className="bg-[#1e1e1e] hover:bg-zinc-800 text-slate-300 p-2.5 rounded-lg transition border border-[#333] cursor-pointer flex items-center justify-center relative group"
                              title="Copiar Link"
                            >
                              {copied ? <Check className="h-4 w-4" style={{ color: getPlatformHex(activePlatform) }} /> : <Copy className="h-4 w-4" />}
                              {copied && (
                                <span className="absolute -top-8 bg-[#141414] border border-[#333] text-[10px] px-2 py-0.5 rounded text-emerald-400 whitespace-nowrap">
                                  Copiado!
                                </span>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* QR CODE SEÇÃO */}
                        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-[#333] rounded-lg p-3 bg-zinc-950/50">
                          {!showQr ? (
                            <button
                              onClick={handleGenerateQr}
                              className="text-xs bg-[#1e1e1e] hover:bg-[#252525] text-slate-300 hover:text-white font-bold px-4 py-2.5 rounded-lg border border-[#333] transition-all cursor-pointer flex items-center justify-center gap-2"
                            >
                              <QrCode className="h-4 w-4" />
                              Gerar QR Code Offline
                            </button>
                          ) : (
                            <motion.div 
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className="w-full flex flex-col items-center space-y-3"
                            >
                              <div className="bg-white p-1.5 rounded-lg shadow-xl">
                                <img 
                                  src={qrCodeUrl} 
                                  alt="QR Code" 
                                  className="w-28 h-28 object-contain"
                                />
                              </div>
                              <div className="text-center">
                                <p className="text-[10px] text-slate-500 font-mono">Renderizado 100% offline</p>
                              </div>
                              <button
                                onClick={handleSaveQrFile}
                                className="w-full bg-slate-100 hover:bg-white text-slate-900 text-[10px] font-bold py-1.5 rounded-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5" />
                                Salvar QR Code (.png)
                              </button>
                            </motion.div>
                          )}
                        </div>

                      </div>
                    )}

                  </div>

                </div>

              </div>
            </div>

          </div>
        </section>

        {/* COLUNA DIREITA: CONSOLE DO DESENVOLVEDOR & CODIGO FONTE */}
        <section className="lg:col-span-5 flex flex-col bg-[#141414] border border-[#333] rounded-2xl overflow-hidden shadow-2xl">
          
          {/* BARRA DE NAVEGAÇÃO DE TABS */}
          <div className="bg-[#141414] border-b border-[#333] flex justify-between items-center px-4">
            <div className="flex">
              <button
                onClick={() => setActiveTab('code')}
                style={activeTab === 'code' ? { borderBottomColor: getPlatformHex(activePlatform), color: getPlatformHex(activePlatform) } : undefined}
                className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'code' 
                    ? 'font-bold bg-[#1E1E1E]/40' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileCode className="h-4 w-4" />
                Estrutura de Arquivos PySide6
              </button>
              <button
                onClick={() => setActiveTab('guide')}
                style={activeTab === 'guide' ? { borderBottomColor: getPlatformHex(activePlatform), color: getPlatformHex(activePlatform) } : undefined}
                className={`py-3.5 px-4 text-xs font-semibold border-b-2 flex items-center gap-2 transition cursor-pointer ${
                  activeTab === 'guide' 
                    ? 'font-bold bg-[#1E1E1E]/40' 
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
                id="installation-guide"
              >
                <Terminal className="h-4 w-4" />
                Guia Pop!_OS
              </button>
            </div>
            
            <div className="hidden sm:flex items-center gap-1.5 text-[10px] font-mono text-slate-500">
              Apache-2.0
            </div>
          </div>

          <div className="flex-1 flex flex-col bg-[#141414] overflow-hidden">
            {activeTab === 'code' ? (
              <div className="flex-1 flex flex-col min-h-0">
                
                {/* EXPLORER LATERAL DE ARQUIVOS */}
                <div className="p-3 bg-[#141414] border-b border-[#333]/60 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-500">Explorador de Projeto</span>
                  </div>
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Filtrar arquivos..."
                    className="w-full sm:w-44 bg-[#252525] border border-[#333] text-[10px] rounded px-2 py-1 text-zinc-300 outline-none placeholder:text-zinc-600 transition-all"
                    onFocus={(e) => e.target.style.borderColor = getPlatformHex(activePlatform)}
                    onBlur={(e) => e.target.style.borderColor = '#333'}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-12 flex-1 overflow-hidden">
                  
                  {/* TREEVIEW */}
                  <div className="sm:col-span-4 bg-[#141414]/40 border-b sm:border-b-0 sm:border-r border-[#333]/80 p-2 space-y-1 overflow-y-auto max-h-[150px] sm:max-h-none">
                    
                    {/* ROOT DIR MOCK */}
                    <div className="flex items-center gap-1 text-[11px] text-slate-400 font-mono font-bold px-1 py-1">
                      <Folder className="h-3.5 w-3.5 text-slate-500 fill-slate-500/10" />
                      SocialLinker/
                    </div>

                    <div className="space-y-0.5 pl-3">
                      {filesTree
                        .filter(filename => filename.toLowerCase().includes(fileSearchQuery.toLowerCase()))
                        .map((filename) => {
                          const isSelected = selectedFile === filename;
                          const isModule = filename.startsWith('modules/');
                          const isCore = filename.startsWith('core/');
                          const isUi = filename.startsWith('ui/');

                          let displayName = filename;
                          if (isModule) displayName = 'modules/ ' + filename.replace('modules/', '');
                          if (isCore) displayName = 'core/ ' + filename.replace('core/', '');
                          if (isUi) displayName = 'ui/ ' + filename.replace('ui/', '');

                          return (
                            <button
                              key={filename}
                              onClick={() => setSelectedFile(filename)}
                              style={isSelected ? { color: getPlatformHex(activePlatform), borderLeftColor: getPlatformHex(activePlatform) } : undefined}
                              className={`w-full text-left px-2 py-1 rounded text-[11px] font-mono flex items-center justify-between transition cursor-pointer ${
                                isSelected 
                                  ? 'bg-[#252525] font-medium border-l pl-1.5' 
                                  : 'text-slate-400 hover:text-white hover:bg-[#252525]/30'
                              }`}
                            >
                              <span className="flex items-center gap-1.5 truncate">
                                <FileCode className="h-3 w-3 shrink-0" style={{ color: isSelected ? getPlatformHex(activePlatform) : '#64748b' }} />
                                <span className="truncate">{PYTHON_PROJECT_FILES[filename].label}</span>
                              </span>
                              <span className="text-[8px] opacity-40 px-1 rounded bg-[#252525] uppercase">
                                {isModule ? 'mod' : isCore ? 'core' : isUi ? 'ui' : 'root'}
                              </span>
                            </button>
                          );
                        })}
                    </div>
                  </div>

                  {/* VISUALIZADOR DE CÓDIGO */}
                  <div className="sm:col-span-8 flex flex-col overflow-hidden min-h-[350px] sm:min-h-0 bg-zinc-950">
                    
                    <div className="bg-[#141414] px-4 py-2 border-b border-[#333]/80 flex items-center justify-between shrink-0">
                      <span className="text-[11px] font-mono text-slate-400 flex items-center gap-2 truncate">
                        <FileCode className="h-3.5 w-3.5 text-slate-500" />
                        {PYTHON_PROJECT_FILES[selectedFile].path}
                      </span>
                      <button
                        onClick={() => handleCopyFileCode(PYTHON_PROJECT_FILES[selectedFile].code)}
                        className="text-[10px] bg-[#252525] hover:bg-[#1E1E1E] text-slate-300 px-2.5 py-1 rounded border border-[#333] transition flex items-center gap-1 cursor-pointer"
                      >
                        {copiedFile ? (
                          <>
                            <Check className="h-3 w-3 text-emerald-400" />
                            Copiado!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copiar Código
                          </>
                        )}
                      </button>
                    </div>

                    <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed max-h-[400px] sm:max-h-none select-text">
                      <pre className="text-zinc-300">
                        <code 
                          dangerouslySetInnerHTML={{ 
                            __html: highlightPython(PYTHON_PROJECT_FILES[selectedFile].code) 
                          }} 
                        />
                      </pre>
                    </div>

                  </div>

                </div>

              </div>
            ) : (
              
              /* GUIA DE INSTALAÇÃO NO TERMINAL */
              <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#1A1A1A]">
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Terminal className="h-4 w-4" style={{ color: getPlatformHex(activePlatform) }} />
                    Como rodar o SocialLinker no Linux Pop!_OS
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Você pode instalar e executar o SocialLinker na sua máquina de forma extremamente rápida. Escolha a opção de comando único automático ou faça o passo a passo manual.
                  </p>
                </div>

                {/* PASSO ULTRA-RÁPIDO */}
                <div className="space-y-3 bg-[#1E1E1E] border-2 border-dashed p-5 rounded-xl" style={{ borderColor: getPlatformHex(activePlatform) + '33' }}>
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-5 w-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border animate-pulse"
                      style={{ 
                        backgroundColor: getPlatformHex(activePlatform) + '1a', 
                        borderColor: getPlatformHex(activePlatform) + '4d', 
                        color: getPlatformHex(activePlatform) 
                      }}
                    >
                      ★
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Método Mágico de Linha Única</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Copie e cole este comando único no terminal do seu Pop!_OS. Ele fará <strong>tudo por você</strong>: instalará o git/python, clonará o repositório para a sua pasta pessoal (<code className="bg-[#141414] px-1 py-0.5 rounded text-white">~/sociallinker</code>), criará o ambiente virtual isolado, instalará as dependências e abrirá o aplicativo desktop na hora:
                  </p>
                  <div className="bg-[#141414] border border-[#333] p-3 rounded-lg flex flex-col gap-2">
                    <code className="text-[11px] font-mono text-emerald-400 select-all leading-normal whitespace-pre-wrap break-all">
                      sudo apt update && sudo apt install git python3 python3-pip python3-venv -y && git clone https://github.com/HonoravelMacho/sociallinker.git ~/sociallinker && cd ~/sociallinker/desktop && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 sociallinker.py
                    </code>
                  </div>
                </div>

                <div className="h-[1px] bg-[#333] my-2" />

                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alternativa: Passo a Passo Detalhado</div>

                {/* PASSO 1 */}
                <div className="space-y-2 bg-[#141414] border border-[#333] p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-5 w-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border"
                      style={{ 
                        backgroundColor: `${getPlatformHex(activePlatform)}1a`, 
                        borderColor: `${getPlatformHex(activePlatform)}33`, 
                        color: getPlatformHex(activePlatform) 
                      }}
                    >
                      1
                    </span>
                    <h4 className="text-xs font-bold text-white">Clonar o repositório do seu GitHub</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">Abra o terminal e faça o clone do repositório para a sua pasta pessoal:</p>
                  <div className="bg-[#252525] border border-[#333] p-2.5 rounded-lg flex flex-col gap-1">
                    <code className="text-xs font-mono text-slate-300 select-all">git clone https://github.com/HonoravelMacho/sociallinker.git ~/sociallinker</code>
                    <code className="text-xs font-mono text-slate-400 select-all">cd ~/sociallinker/desktop</code>
                  </div>
                </div>

                {/* PASSO 2 */}
                <div className="space-y-2 bg-[#141414] border border-[#333] p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-5 w-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border"
                      style={{ 
                        backgroundColor: `${getPlatformHex(activePlatform)}1a`, 
                        borderColor: `${getPlatformHex(activePlatform)}33`, 
                        color: getPlatformHex(activePlatform) 
                      }}
                    >
                      2
                    </span>
                    <h4 className="text-xs font-bold text-white">Criar ambiente virtual isolado (venv)</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">Entre na pasta desktop e ative o ambiente virtual para isolar as dependências:</p>
                  <div className="bg-[#252525] border border-[#333] p-2.5 rounded-lg flex flex-col gap-1.5">
                    <code className="text-xs font-mono text-slate-300 select-all">python3 -m venv venv</code>
                    <code className="text-xs font-mono text-slate-400 select-all">source venv/bin/activate</code>
                  </div>
                </div>

                {/* PASSO 3 */}
                <div className="space-y-2 bg-[#141414] border border-[#333] p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-5 w-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border"
                      style={{ 
                        backgroundColor: `${getPlatformHex(activePlatform)}1a`, 
                        borderColor: `${getPlatformHex(activePlatform)}33`, 
                        color: getPlatformHex(activePlatform) 
                      }}
                    >
                      3
                    </span>
                    <h4 className="text-xs font-bold text-white">Instalar as dependências e dependências de imagem</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">A biblioteca <code className="text-[11px] text-slate-200 bg-[#252525] px-1 py-0.5 rounded">qrcode</code> usa por baixo dos panos a biblioteca <code className="text-[11px] text-slate-200 bg-[#252525] px-1 py-0.5 rounded">pillow</code> (PIL) para rasterizar em PNG:</p>
                  <div className="bg-[#252525] border border-[#333] p-2.5 rounded-lg">
                    <code className="text-xs font-mono text-slate-300 select-all">pip install PySide6 qrcode[pil]</code>
                  </div>
                </div>

                {/* PASSO 4 */}
                <div className="space-y-2 bg-[#141414] border border-[#333] p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span 
                      className="h-5 w-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center border"
                      style={{ 
                        backgroundColor: `${getPlatformHex(activePlatform)}1a`, 
                        borderColor: `${getPlatformHex(activePlatform)}33`, 
                        color: getPlatformHex(activePlatform) 
                      }}
                    >
                      4
                    </span>
                    <h4 className="text-xs font-bold text-white">Executar o aplicativo de links</h4>
                  </div>
                  <p className="text-[11px] text-slate-400">Inicie o loop Qt nativo rodando o script de ponto de entrada:</p>
                  <div className="bg-[#252525] border border-[#333] p-2.5 rounded-lg">
                    <code className="text-xs font-mono text-slate-300 select-all">python sociallinker.py</code>
                  </div>
                </div>

                {/* COMO ABRIR NOVAMENTE APÓS FECHAR */}
                <div className="space-y-3 bg-[#1e1e1e] border-2 border-dashed p-5 rounded-xl border-sky-500/30">
                  <div className="flex items-center gap-2">
                    <span className="h-5 w-5 rounded-full text-[10px] font-mono font-bold flex items-center justify-center bg-sky-500/10 border border-sky-500/30 text-sky-400">
                      ⚡
                    </span>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider">Como abrir novamente após fechar</h4>
                  </div>
                  <p className="text-[11px] text-slate-400 font-sans leading-relaxed">
                    Sempre que você fechar a janela e quiser abrir o SocialLinker novamente, não é preciso instalar nada de novo! Basta abrir o terminal e digitar este comando simples de linha única (que entra na pasta e ativa o ambiente virtual na hora):
                  </p>
                  <div className="bg-[#141414] border border-[#333] p-3 rounded-lg flex flex-col gap-2">
                    <code className="text-[11px] font-mono text-sky-400 select-all leading-normal">
                      cd ~/sociallinker/desktop && source venv/bin/activate && python3 sociallinker.py
                    </code>
                  </div>
                  <p className="text-[10px] text-slate-500 font-sans">
                    <strong>Atalho Rápido (Pop!_OS / Linux / macOS):</strong> Nós criamos o script <code className="bg-[#141414] px-1 rounded text-white">abrir_sociallinker.sh</code> na pasta. Você pode executá-lo diretamente com <code className="bg-[#141414] px-1 rounded text-slate-300">./abrir_sociallinker.sh</code> para abrir o programa num piscar de olhos!
                  </p>
                </div>

                {/* SEGURANÇA E PORTABILIDADE */}
                <div className="bg-[#141414] border border-[#333] rounded-xl p-4 flex gap-3">
                  <AlertCircle className="h-5 w-5 text-sky-400 shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Portabilidade de Plataforma</p>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Por utilizar PySide6 e bibliotecas Python puras, este exato código funcionará perfeitamente e sem alteração em máquinas Windows e macOS. Basta repetir os passos de instalação de pacotes em cada respectiva plataforma.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </section>

      </main>

      {/* FOOTER DO SISTEMA */}
      <footer className="border-t border-[#333] bg-[#141414] py-4 mt-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#252525] text-slate-400 border border-[#333]">PySide6 v6.5</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-[#252525] text-slate-400 border border-[#333]">Apache 2.0</span>
            <span className="text-[10px] text-slate-500 hidden md:inline">© 2026 SocialLinker • Código 100% livre</span>
          </div>
          <div className="text-xs text-slate-400 font-medium">
            Feito por <span className="text-white font-semibold">Tiago Rabelo</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
