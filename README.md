# 🌐 SocialLinker - Gerador de Links e QR Codes Multiplataforma

Bem-vindo ao **SocialLinker**, uma solução completa de produtividade para geração de links diretos purificados e QR Codes para 12 das redes sociais mais populares do mundo. 

Este projeto possui uma arquitetura híbrida avançada e amigável:
1. **Cliente Web Interativo (React + Vite + Tailwind CSS)**: Um simulador estético de alta fidelidade que roda diretamente no navegador, permitindo a pré-visualização das interfaces, testes em tempo real de geração de links e download de QR Codes.
2. **Cliente Desktop Nativo (Python 3 + PySide6 / Qt6)**: Um aplicativo executável robusto e offline que roda nativamente no seu sistema operacional (Linux, Windows ou macOS), permitindo que você configure, gere links e exporte QR Codes diretamente do seu computador com performance nativa.

Este projeto é 100% open-source, gratuito e vitalício, licenciado sob a **Licença Apache 2.0**.

---

## 🚀 Método Ultra-Rápido: Instalar e Abrir no Linux (Pop!_OS / Ubuntu)
Se você quer clonar e rodar o aplicativo nativo imediatamente na sua pasta pessoal (`~/sociallinker`) com **apenas um clique**, copie e cole o comando abaixo no seu terminal:

```bash
sudo apt update && sudo apt install git python3 python3-pip python3-venv -y && git clone https://github.com/HonoravelMacho/sociallinker.git ~/sociallinker && cd ~/sociallinker/desktop && python3 -m venv venv && source venv/bin/activate && pip install -r requirements.txt && python3 sociallinker.py
```

---

## 📂 Estrutura do Repositório

```text
sociallinker/
├── desktop/                # 💻 Cliente Desktop nativo em Python e PySide6
│   ├── sociallinker.py     # Ponto de entrada que inicializa a aplicação Qt
│   ├── requirements.txt    # Lista de dependências Python necessárias
│   ├── README.md           # Guia de instalação específico do cliente desktop
│   ├── core/               # Módulo interno de tratamento de strings e URLs
│   ├── ui/                 # Telas, layouts e estilos visuais em QSS
│   └── modules/            # Geradores de links matemáticos purificados de cada rede
├── src/                    # 🌐 Código-fonte do Cliente Web (React + TS)
│   ├── App.tsx             # Componente React principal e simulador desktop
│   └── index.css           # Estilizações globais com Tailwind CSS
├── index.html              # Ponto de entrada HTML do cliente web
├── package.json            # Manifesto npm com scripts e dependências do web client
└── README.md               # Este arquivo de documentação geral
```

---

## 💻 Como Executar o Cliente Desktop (Python + PySide6)

O cliente desktop está localizado na pasta `/desktop`. Ele funciona de forma 100% offline, privada e nativa em **Linux**, **Windows** e **macOS**. Siga as instruções abaixo para o seu sistema operacional:

### 🐧 No Linux (Pop!_OS / Ubuntu / Debian) - Passo a Passo

1. **Instalar as ferramentas de sistema**:
   Abra o seu terminal e instale o Git, Python, gerenciador de pacotes (`pip`) e utilitário de ambientes virtuais (`venv`):
   ```bash
   sudo apt update
   sudo apt install git python3 python3-pip python3-venv -y
   ```

2. **Clonar o Repositório na sua Pasta Pessoal**:
   ```bash
   git clone https://github.com/HonoravelMacho/sociallinker.git ~/sociallinker
   cd ~/sociallinker/desktop
   ```

3. **Criar e ativar o ambiente virtual (venv)**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Instalar dependências**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Executar o SocialLinker**:
   ```bash
   python3 sociallinker.py
   ```

---

### 🪟 No Windows

1. **Instalar o Python**:
   - Acesse o site oficial [python.org](https://www.python.org/) e baixe a versão estável mais recente para Windows.
   - **IMPORTANTE**: No instalador, certifique-se de marcar a caixinha **"Add Python to PATH"** antes de prosseguir com a instalação.

2. **Abrir o Terminal e Clonar o Projeto**:
   Abra o PowerShell ou Prompt de Comando (cmd) e navegue até a pasta pessoal para clonar:
   ```cmd
   git clone https://github.com/HonoravelMacho/sociallinker.git
   cd sociallinker\desktop
   ```

3. **Criar e ativar o ambiente virtual (venv)**:
   ```cmd
   python -m venv venv
   .\venv\Scripts\activate
   ```

4. **Instalar dependências**:
   ```cmd
   pip install -r requirements.txt
   ```

5. **Executar o SocialLinker**:
   ```cmd
   python sociallinker.py
   ```

---

### 🍎 No macOS

1. **Instalar o Python**:
   - Se possuir o Homebrew instalado, execute no Terminal:
     ```bash
     brew install python git
     ```
   - Alternativamente, baixe e instale a versão para macOS diretamente do site oficial [python.org](https://www.python.org/).

2. **Abrir o Terminal e Clonar**:
   Navegue até a pasta pessoal e clone:
   ```bash
   git clone https://github.com/HonoravelMacho/sociallinker.git ~/sociallinker
   cd ~/sociallinker/desktop
   ```

3. **Criar e ativar o ambiente virtual (venv)**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   ```

4. **Instalar dependências**:
   ```bash
   pip install -r requirements.txt
   ```

5. **Executar o SocialLinker**:
   ```bash
   python3 sociallinker.py
   ```

---

## 🌐 Como Executar o Cliente Web (React + Vite)

Se você deseja rodar ou modificar o simulador web interativo que roda no navegador, utilize as instruções do ecossistema Node.js:

1. Certifique-se de ter o **Node.js** (v18+) instalado em sua máquina.
2. Na raiz do projeto, instale as dependências:
   ```bash
   npm install
   ```
3. Rode o servidor de desenvolvimento local:
   ```bash
   npm run dev
   ```
4. Abra o navegador no endereço indicado (geralmente `http://localhost:3000` ou `http://localhost:5173`).

---

## 🛠️ Tecnologias Utilizadas no Core Desktop
- **PySide6**: Bindings oficiais do projeto Qt para Python, garantindo uma interface gráfica nativa de altíssimo desempenho, hardware-accelerated e responsiva.
- **qrcode**: Motor matemático independente para geração de matrizes binárias de códigos QR localmente.
- **pillow (PIL)**: Biblioteca robusta de manipulação de imagens em Python usada para renderizar e formatar o QR Code para exportação em formatos de alta definição (PNG).

---

Feito com ❤️ por [Tiago Rabelo](https://github.com/HonoravelMacho). Sinta-se livre para abrir issues, enviar Pull Requests e contribuir para tornar o gerador de links mais rápido e seguro do Brasil!
