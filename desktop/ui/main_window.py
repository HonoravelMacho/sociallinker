import sys
import io
import os
from PySide6.QtWidgets import (
    QMainWindow, QWidget, QHBoxLayout, QVBoxLayout, QPushButton, 
    QLabel, QLineEdit, QTextEdit, QFileDialog, QMessageBox,
    QFrame, QScrollArea, QGraphicsDropShadowEffect, QColorDialog,
    QCheckBox, QApplication, QComboBox
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
    },
    "qr_custom": {
        "name": "QR Code Personalizado",
        "color": "#0ea5e9",
        "hover": "#38bdf8",
        "desc": "Gere um QR Code avançado a partir de qualquer link de destino, customizando as cores dos módulos, cor de fundo (ou transparente) e inserindo o logotipo da sua marca no centro para um visual profissional e exclusivo.",
        "inputs": [
            {"id": "link", "label": "Link ou Texto de Destino (Ex: https://seusite.com)", "placeholder": "https://seu-link-ou-texto.com"}
        ],
        "generate_fn": None
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
        
        # Estado do QR Code Personalizado
        self.qr_color_hex = "#0ea5e9" # Inicializa com azul celeste moderno do tema
        self.qr_bg_hex = "#ffffff"
        self.qr_transparent = False
        self.qr_logo_path = ""
        self.qr_logo_transparent_bg = False
        self.qr_formato_mascara = "none"
        self.qr_estilo_modulo = "square"
        
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
            if platform_id == "qr_custom":
                continue
            btn = QPushButton(cfg["name"])
            btn.setProperty("class", "networkBtn")
            btn.setCursor(Qt.PointingHandCursor)
            # Conexão de clique dinâmica
            btn.clicked.connect(lambda checked=False, pid=platform_id: self.update_form(pid))
            scroll_layout.addWidget(btn)
            self.sidebar_buttons[platform_id] = btn
            
        # Divisor e Seção de Ferramentas
        tools_sep = QFrame()
        tools_sep.setFrameShape(QFrame.HLine)
        tools_sep.setStyleSheet("background-color: #27272a; max-height: 1px; margin: 15px 5px 8px 5px; border: none;")
        scroll_layout.addWidget(tools_sep)
        
        lbl_tools = QLabel("FERRAMENTAS")
        lbl_tools.setStyleSheet("color: #71717a; font-size: 10px; font-weight: bold; padding-left: 10px; margin-bottom: 4px; font-family: monospace; letter-spacing: 1px;")
        scroll_layout.addWidget(lbl_tools)
        
        qr_cfg = PLATFORMS_CONFIG["qr_custom"]
        qr_btn = QPushButton(qr_cfg["name"])
        qr_btn.setProperty("class", "networkBtn")
        qr_btn.setCursor(Qt.PointingHandCursor)
        qr_btn.clicked.connect(lambda: self.update_form("qr_custom"))
        scroll_layout.addWidget(qr_btn)
        self.sidebar_buttons["qr_custom"] = qr_btn
            
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
            
        if platform_id == "qr_custom":
            # 1. Seção de Cores (Lado a lado usando QHBoxLayout)
            colors_row = QWidget()
            colors_lay = QHBoxLayout(colors_row)
            colors_lay.setContentsMargins(0, 5, 0, 5)
            colors_lay.setSpacing(15)
            
            # Controle Cor do QR
            qr_col_box = QWidget()
            qr_col_lay = QVBoxLayout(qr_col_box)
            qr_col_lay.setContentsMargins(0, 0, 0, 0)
            qr_col_lay.setSpacing(4)
            qr_col_lbl = QLabel("COR DO QR (MÓDULOS)")
            qr_col_lbl.setProperty("class", "fieldLabel")
            qr_col_lbl.setStyleSheet("font-size: 11px; color: #a1a1aa;")
            
            qr_col_btn = QPushButton(self.qr_color_hex)
            qr_col_btn.setCursor(Qt.PointingHandCursor)
            qr_col_btn.setStyleSheet(f"background-color: {self.qr_color_hex}; color: #ffffff; border: 1px solid #3f3f46; font-weight: bold; border-radius: 4px; padding: 8px;")
            qr_col_btn.clicked.connect(lambda: self.on_choose_qr_color(qr_col_btn))
            
            qr_col_lay.addWidget(qr_col_lbl)
            qr_col_lay.addWidget(qr_col_btn)
            colors_lay.addWidget(qr_col_box)
            
            # Controle Cor de Fundo
            bg_col_box = QWidget()
            bg_col_lay = QVBoxLayout(bg_col_box)
            bg_col_lay.setContentsMargins(0, 0, 0, 0)
            bg_col_lay.setSpacing(4)
            bg_col_lbl = QLabel("COR DO FUNDO")
            bg_col_lbl.setProperty("class", "fieldLabel")
            bg_col_lbl.setStyleSheet("font-size: 11px; color: #a1a1aa;")
            
            bg_col_btn = QPushButton(self.qr_bg_hex)
            bg_col_btn.setCursor(Qt.PointingHandCursor)
            if self.qr_transparent:
                bg_col_btn.setEnabled(False)
                bg_col_btn.setText("Desativado (Transparente)")
                bg_col_btn.setStyleSheet("background-color: #27272a; color: #71717a; border: 1px dashed #3f3f46; border-radius: 4px; padding: 8px;")
            else:
                bg_col_btn.setStyleSheet(f"background-color: {self.qr_bg_hex}; color: #09090b; border: 1px solid #3f3f46; font-weight: bold; border-radius: 4px; padding: 8px;")
            bg_col_btn.clicked.connect(lambda: self.on_choose_bg_color(bg_col_btn))
            
            bg_col_lay.addWidget(bg_col_lbl)
            bg_col_lay.addWidget(bg_col_btn)
            colors_lay.addWidget(bg_col_box)
            
            self.form_layout.addWidget(colors_row)
            
            # Checkbox Transparente
            trans_box = QCheckBox("Tornar Fundo do QR Code Transparente")
            trans_box.setChecked(self.qr_transparent)
            trans_box.setStyleSheet("color: #e4e4e7; font-size: 11px; font-weight: bold; margin-top: 5px;")
            trans_box.toggled.connect(lambda checked: self.on_toggle_transparent(checked, bg_col_btn))
            self.form_layout.addWidget(trans_box)
            
            # 1.5 Seção de Formato e Estilo de Módulo (Lado a Lado usando QHBoxLayout)
            design_row = QWidget()
            design_lay = QHBoxLayout(design_row)
            design_lay.setContentsMargins(0, 5, 0, 5)
            design_lay.setSpacing(15)
            
            # Controle de Formato da Máscara (Silhueta)
            mask_box = QWidget()
            mask_lay = QVBoxLayout(mask_box)
            mask_lay.setContentsMargins(0, 0, 0, 0)
            mask_lay.setSpacing(4)
            mask_lbl = QLabel("FORMATO / MÁSCARA (SILHUETA)")
            mask_lbl.setProperty("class", "fieldLabel")
            mask_lbl.setStyleSheet("font-size: 11px; color: #a1a1aa;")
            
            mask_combo = QComboBox()
            mask_combo.addItems([
                "Padrão Quadrado",
                "Coração",
                "Gota de Sangue / Água",
                "Estrela de 4 Pontas",
                "Escudo de Proteção",
                "Círculo"
            ])
            mask_map = ["none", "coracao", "gota", "estrela", "escudo", "circulo"]
            mask_combo.setCurrentIndex(mask_map.index(self.qr_formato_mascara))
            mask_combo.setStyleSheet("background-color: #1e1e2e; color: #ffffff; border: 1px solid #3f3f46; border-radius: 4px; padding: 6px; font-weight: bold; font-size: 11px;")
            mask_combo.currentIndexChanged.connect(lambda idx: self.on_change_mask_format(mask_map[idx]))
            
            mask_lay.addWidget(mask_lbl)
            mask_lay.addWidget(mask_combo)
            design_lay.addWidget(mask_box)
            
            # Controle de Estilo de Pixel / Módulo
            style_box = QWidget()
            style_lay = QVBoxLayout(style_box)
            style_lay.setContentsMargins(0, 0, 0, 0)
            style_lay.setSpacing(4)
            style_lbl = QLabel("ESTILO DOS PIXELS (MÓDULOS)")
            style_lbl.setProperty("class", "fieldLabel")
            style_lbl.setStyleSheet("font-size: 11px; color: #a1a1aa;")
            
            style_combo = QComboBox()
            style_combo.addItems([
                "Quadrados Clássicos",
                "Círculos / Pontos",
                "Estrelas / Diamantes",
                "Corações Pequenos"
            ])
            style_map = ["square", "circle", "star", "heart"]
            style_combo.setCurrentIndex(style_map.index(self.qr_estilo_modulo))
            style_combo.setStyleSheet("background-color: #1e1e2e; color: #ffffff; border: 1px solid #3f3f46; border-radius: 4px; padding: 6px; font-weight: bold; font-size: 11px;")
            style_combo.currentIndexChanged.connect(lambda idx: self.on_change_module_style(style_map[idx]))
            
            style_lay.addWidget(style_lbl)
            style_lay.addWidget(style_combo)
            design_lay.addWidget(style_box)
            
            self.form_layout.addWidget(design_row)
            
            # 2. Seção de Logotipo/Ícone
            logo_group = QWidget()
            logo_lay = QVBoxLayout(logo_group)
            logo_lay.setContentsMargins(0, 5, 0, 5)
            logo_lay.setSpacing(6)
            
            logo_lbl = QLabel("LOGOTIPO CENTRAL (OPCIONAL)")
            logo_lbl.setProperty("class", "fieldLabel")
            logo_lbl.setStyleSheet("font-size: 11px; color: #a1a1aa;")
            logo_lay.addWidget(logo_lbl)
            
            logo_actions = QHBoxLayout()
            logo_actions.setSpacing(10)
            
            choose_logo_btn = QPushButton("Escolher Ícone (.png, .jpg)")
            choose_logo_btn.setProperty("class", "secondaryBtn")
            choose_logo_btn.setCursor(Qt.PointingHandCursor)
            choose_logo_btn.setStyleSheet("padding: 8px 12px; font-size: 11px;")
            
            clear_logo_btn = QPushButton("Remover")
            clear_logo_btn.setCursor(Qt.PointingHandCursor)
            clear_logo_btn.setStyleSheet("background-color: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; border-radius: 6px; padding: 8px 12px; font-size: 11px; font-weight: bold;")
            
            logo_desc = QLabel()
            if self.qr_logo_path:
                filename = os.path.basename(self.qr_logo_path)
                logo_desc.setText(f"✓ {filename}")
                logo_desc.setStyleSheet("color: #10b981; font-weight: bold; font-size: 11px;")
            else:
                logo_desc.setText("Nenhum ícone selecionado")
                logo_desc.setStyleSheet("color: #71717a; font-style: italic; font-size: 11px;")
                
            choose_logo_btn.clicked.connect(lambda: self.on_choose_logo(logo_desc))
            clear_logo_btn.clicked.connect(lambda: self.on_clear_logo(logo_desc))
            
            logo_actions.addWidget(choose_logo_btn)
            logo_actions.addWidget(clear_logo_btn)
            logo_actions.addWidget(logo_desc)
            logo_actions.addStretch()
            
            logo_lay.addLayout(logo_actions)
            
            # Checkbox para remover moldura branca do logo (fundo transparente)
            logo_bg_trans_box = QCheckBox("Remover moldura branca (Manter Logotipo Transparente)")
            logo_bg_trans_box.setChecked(self.qr_logo_transparent_bg)
            logo_bg_trans_box.setStyleSheet("color: #e4e4e7; font-size: 11px; font-weight: bold; margin-top: 5px;")
            logo_bg_trans_box.toggled.connect(self.on_toggle_logo_transparent)
            logo_lay.addWidget(logo_bg_trans_box)
            
            self.form_layout.addWidget(logo_group)
            
            self.generate_btn.setText("Gerar QR Code Personalizado")
        else:
            self.generate_btn.setText("Gerar Link")
            
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

    def on_choose_qr_color(self, btn):
        color = QColorDialog.getColor(self.qr_color_hex, self, "Escolher Cor dos Módulos")
        if color.isValid():
            self.qr_color_hex = color.name()
            btn.setText(self.qr_color_hex)
            btn.setStyleSheet(f"background-color: {self.qr_color_hex}; color: {'#ffffff' if color.lightness() < 128 else '#09090b'}; border: 1px solid #3f3f46; font-weight: bold; border-radius: 4px; padding: 8px;")

    def on_choose_bg_color(self, btn):
        color = QColorDialog.getColor(self.qr_bg_hex, self, "Escolher Cor do Fundo")
        if color.isValid():
            self.qr_bg_hex = color.name()
            btn.setText(self.qr_bg_hex)
            btn.setStyleSheet(f"background-color: {self.qr_bg_hex}; color: {'#ffffff' if color.lightness() < 128 else '#09090b'}; border: 1px solid #3f3f46; font-weight: bold; border-radius: 4px; padding: 8px;")

    def on_toggle_transparent(self, checked, btn_bg):
        self.qr_transparent = checked
        btn_bg.setEnabled(not checked)
        if checked:
            btn_bg.setText("Desativado (Transparente)")
            btn_bg.setStyleSheet("background-color: #27272a; color: #71717a; border: 1px dashed #3f3f46; border-radius: 4px; padding: 8px;")
        else:
            # Restaura a cor ativa
            btn_bg.setText(self.qr_bg_hex)
            btn_bg.setStyleSheet(f"background-color: {self.qr_bg_hex}; color: #09090b; border: 1px solid #3f3f46; font-weight: bold; border-radius: 4px; padding: 8px;")

    def on_toggle_logo_transparent(self, checked):
        self.qr_logo_transparent_bg = checked

    def on_change_mask_format(self, mask_val):
        self.qr_formato_mascara = mask_val

    def on_change_module_style(self, style_val):
        self.qr_estilo_modulo = style_val

    def on_choose_logo(self, label_desc):
        file_path, _ = QFileDialog.getOpenFileName(
            self,
            "Selecionar Logotipo Central",
            "",
            "Imagens (*.png *.jpg *.jpeg *.bmp *.webp)"
        )
        if file_path:
            self.qr_logo_path = file_path
            filename = os.path.basename(file_path)
            label_desc.setText(f"✓ {filename}")
            label_desc.setStyleSheet("color: #10b981; font-weight: bold; font-size: 11px;")

    def on_clear_logo(self, label_desc):
        self.qr_logo_path = ""
        label_desc.setText("Nenhum ícone selecionado")
        label_desc.setStyleSheet("color: #71717a; font-style: italic; font-size: 11px;")

    def generate_custom_qr_flow(self):
        text_widget = self.inputs["link"]
        texto = text_widget.text().strip()
        if not texto:
            QMessageBox.warning(self, "Campo Vazio", "Por favor, digite o link ou texto de destino do seu QR Code!")
            return

        from core.qr_custom import gerar_qr_personalizado
        try:
            # Invoca o gerador Pillow offline com todos os parâmetros customizados
            img = gerar_qr_personalizado(
                texto=texto,
                cor_qr=self.qr_color_hex,
                cor_fundo=self.qr_bg_hex,
                fundo_transparente=self.qr_transparent,
                logo_path=self.qr_logo_path,
                remover_fundo_logo=self.qr_logo_transparent_bg,
                formato_mascara=self.qr_formato_mascara,
                estilo_modulo=self.qr_estilo_modulo
            )

            # Transforma imagem PIL para exibição no Pixmap do Qt
            buffer = io.BytesIO()
            img.save(buffer, format="PNG")
            qr_bytes = buffer.getvalue()

            self.current_qr_image = img

            pixmap = QPixmap()
            pixmap.loadFromData(qr_bytes)
            scaled_pixmap = pixmap.scaled(150, 150, Qt.KeepAspectRatio, Qt.SmoothTransformation)

            self.qr_image_label.setPixmap(scaled_pixmap)
            self.result_link.setText(texto)

            # Exibe painéis de resultado
            self.result_card.setVisible(True)
            self.qr_card.setVisible(True)

        except Exception as e:
            QMessageBox.critical(self, "Erro no QR Code", f"Não foi possível gerar seu QR Code personalizado:\n{str(e)}")

    def on_generate_link(self):
        if self.current_platform == "qr_custom":
            self.generate_custom_qr_flow()
            return

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
                "A biblioteca 'qrcode' não está instalada.\nInstale rodando: pip install qrcode[pil]"
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
                QMessageBox.critical(self, "Erro de Escrita", f"Não foi possível salvar o arquivo:\n{str(e)}")
