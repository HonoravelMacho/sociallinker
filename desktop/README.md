# 💻 SocialLinker - Desktop Client

SocialLinker é um gerador de links e QR Codes multiplataforma escrito em **Python 3** e **PySide6 (Qt)**. Ele permite a criação rápida de atalhos e links diretos purificados para 12 redes sociais, além de gerar QR Codes em alta definição localmente de forma 100% offline.

Este projeto é open-source, distribuído sob a Licença Apache 2.0, gratuito e vitalício!

---

## 🚀 Instalação e Execução por Sistema Operacional

### 🐧 No Linux (Pop!_OS / Ubuntu / Debian)

Siga os passos abaixo no seu terminal para configurar o ambiente e rodar o aplicativo:

1. **Instalar as dependências do sistema**:
   Abra o seu terminal e certifique-se de que possui o Python 3 e o gerenciador de pacotes/ambientes virtuais instalados:
   ```bash
   sudo apt update
   sudo apt install python3 python3-pip python3-venv -y
   ```

2. **Navegar até a pasta do projeto**:
   ```bash
   cd desktop
   ```

3. **Criar e Ativar o Ambiente Virtual (Recomendado)**:
   Para evitar conflitos com pacotes globais do sistema operacional:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Instalar as dependências do Python**:
   Instale os pacotes necessários especificados no `requirements.txt`:
   ```bash
   pip install -r requirements.txt
   ```

5. **Executar o Aplicativo Desktop!**:
   Rode o script principal para abrir o SocialLinker na sua tela:
   ```bash
   python3 main.py
   ```

---

### 🪟 No Windows

Siga os passos abaixo para configurar e rodar no Windows:

1. **Instalar o Python**:
   - Acesse o site oficial [python.org](https://www.python.org/) e faça o download da versão mais recente.
   - **IMPORTANTE**: No instalador, marque a caixa **"Add Python to PATH"** antes de clicar em instalar.

2. **Abrir o Terminal/PowerShell**:
   Abra o PowerShell ou Prompt de Comando (cmd) e navegue até a pasta `desktop` do projeto:
   ```cmd
   cd caminho\para\sociallinker\desktop
   ```

3. **Criar e Ativar o Ambiente Virtual (venv)**:
   ```cmd
   python -m venv venv
   .\venv\Scripts\activate
   ```

4. **Instalar as dependências do Python**:
   ```cmd
   pip install -r requirements.txt
   ```

5. **Executar o Aplicativo Desktop!**:
   ```cmd
   python main.py
   ```

---

### 🍎 No macOS

Siga os passos abaixo para configurar e rodar no macOS:

1. **Instalar o Python**:
   - Caso use o Homebrew, execute:
     ```bash
     brew install python
     ```
   - Ou baixe e instale o pacote instalador oficial do Python para macOS diretamente de [python.org](https://www.python.org/).

2. **Abrir o Terminal**:
   Navegue até a pasta `desktop` do projeto:
   ```bash
   cd caminho/para/sociallinker/desktop
   ```

3. **Criar e Ativar o Ambiente Virtual (venv)**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Instalar as dependências do Python**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Executar o Aplicativo Desktop!**:
   ```bash
   python3 main.py
   ```

---

## ⚙️ Arquitetura do Projeto (Modular)

O projeto foi estritamente dividido em módulos separados conforme as melhores práticas de arquitetura de software:

- 📂 `desktop/`
  - 📄 `main.py` - Ponto de entrada que inicializa a aplicação Qt.
  - 📄 `requirements.txt` - Lista de dependências Python.
  - 📂 `core/`
    - 📄 `utils.py` - Funções de limpeza de strings e codificação URL.
  - 📂 `ui/`
    - 📄 `main_window.py` - Interface gráfica, carregamento dinâmico de formulários e gerenciamento de estilo (QSS).
  - 📂 `modules/` - Motores isolados de geração de links de cada rede social:
    - 📄 `whatsapp.py`
    - 📄 `telegram.py`
    - 📄 `instagram.py`
    - 📄 `messenger.py`
    - 📄 `sms.py`
    - 📄 `linkedin.py`
    - 📄 `twitter.py`
    - 📄 `signal.py`
    - 📄 `youtube.py`
    - 📄 `tiktok.py`
    - 📄 `pinterest.py`
    - 📄 `skype.py`

---

## 🛠️ Detalhes das Dependências Utilizadas
- **PySide6**: O conjunto oficial de bindings Python para a biblioteca Qt 6, fornecendo widgets de alto desempenho nativos.
- **qrcode**: Biblioteca Python nativa para gerar dados matriciais de código QR de forma rápida e 100% offline.
- **pillow (PIL)**: Biblioteca de processamento de imagens do Python para renderizar os dados do QR Code no formato rasterizado (PNG) de alta definição.

---

Feito por **Tiago Rabelo**. Distribuído gratuitamente de forma vitalícia sob os termos da **Licença Apache 2.0**.
