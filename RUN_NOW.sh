#!/bin/bash

# ============================================
# Tacitus Quant Terminal - Быстрый Запуск
# ============================================

echo "🚀 Tacitus Quant Terminal - Quick Start"
echo "========================================"
echo ""

# Переходим в корневую директорию проекта
cd "$(dirname "$0")"

echo "📁 Текущая директория: $(pwd)"
echo ""

# Проверяем наличие Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 не найден! Установите Python 3.8+"
    exit 1
fi

echo "✅ Python найден: $(python3 --version)"
echo ""

# Создаем venv если его нет
if [ ! -d "venv" ]; then
    echo "📦 Создаю виртуальное окружение..."
    python3 -m venv venv
    echo "✅ venv создан"
else
    echo "✅ venv уже существует"
fi
echo ""

# Активируем venv
echo "🔌 Активирую venv..."
source venv/bin/activate

# Устанавливаем зависимости
echo "📥 Устанавливаю зависимости..."
pip install -q -r apps/api/requirements.txt
echo "✅ Зависимости установлены"
echo ""

# Запускаем demo
echo "=========================================="
echo "  🎯 Запуск Integration Demo"
echo "=========================================="
echo ""

python tests/test_integration_demo.py

echo ""
echo "=========================================="
echo "  ✅ Demo завершена!"
echo "=========================================="
echo ""
echo "📚 Следующие шаги:"
echo ""
echo "1️⃣  Запустить FastAPI backend:"
echo "   cd apps/api && python main.py"
echo "   Откроется на http://localhost:8080"
echo ""
echo "2️⃣  Открыть Swagger docs:"
echo "   http://localhost:8080/docs"
echo ""
echo "3️⃣  Прочитать документацию:"
echo "   - QUICKSTART.md - инструкции"
echo "   - PROJECT_ASSESSMENT.md - план проекта"
echo "   - IMPLEMENTATION_SUMMARY.md - что сделано"
echo ""
echo "🎉 Готово!"

