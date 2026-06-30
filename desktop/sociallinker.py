import sys
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
    main()
