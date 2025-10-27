#!/bin/bash

echo "🎓 Gemma AI Eğitim Koçu - Web Sunucusu Başlatılıyor..."
echo ""
echo "✅ Ollama zaten çalışıyor!"
echo "🌐 Web sunucusu port 8000'de başlatılıyor..."
echo ""
echo "📝 Tarayıcınızda şu adresi açın: http://localhost:8000"
echo ""
echo "⚠️  Durdurmak için: Ctrl+C"
echo "================================================"
echo ""

python3 -m http.server 8000
