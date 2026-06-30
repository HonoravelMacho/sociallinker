@echo off
:: Script para abrir o SocialLinker automaticamente no Windows
cd /d "%~dp0"
call venv\Scripts\activate.bat
python sociallinker.py
pause
