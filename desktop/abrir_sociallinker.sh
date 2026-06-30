#!/bin/bash
# Script para abrir o SocialLinker automaticamente no Linux/macOS
cd "$(dirname "$0")"
source venv/bin/activate
python3 sociallinker.py
