# Этот файл делает директорию strategy Python пакетом
# Позволяет импортировать: from core.strategy import IStrategy

from .base import IStrategy, Signal, BarContext

# __all__ определяет что будет доступно при import *
__all__ = ['IStrategy', 'Signal', 'BarContext']

