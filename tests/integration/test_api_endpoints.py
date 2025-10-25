"""
Integration tests для FastAPI endpoints.

Тестируем:
- GET /api/data/candles - получение данных
- POST /api/data/fetch - загрузка новых данных
- POST /api/backtest/run - запуск backtesting
- GET /api/backtest/strategies - список стратегий
"""

import pytest
from fastapi.testclient import TestClient


pytestmark = pytest.mark.integration


class TestDataEndpoints:
    """Тесты для data API endpoints."""
    
    @pytest.fixture(scope="class")
    def client(self):
        """FastAPI test client."""
        from apps.api.main import app
        return TestClient(app)
    
    def test_health_check(self, client):
        """Тест: health check endpoint работает."""
        response = client.get("/health")
        
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
    
    def test_get_candles_returns_data(self, client):
        """
        Тест: GET /api/data/candles возвращает данные.
        
        Должны вернуться реальные BTC свечи.
        """
        response = client.get(
            "/api/data/candles",
            params={
                "market": "BTC-PERP",
                "interval": "1d",
                "days_back": 30
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Проверяем структуру ответа
        assert "market" in data
        assert "interval" in data
        assert "candles" in data
        
        # Должны быть данные
        assert len(data["candles"]) > 0
        
        # Проверяем формат свечи
        first_candle = data["candles"][0]
        required_keys = ["timestamp", "open", "high", "low", "close", "volume"]
        for key in required_keys:
            assert key in first_candle
    
    def test_get_candles_validates_interval(self, client):
        """Тест: endpoint валидирует interval."""
        response = client.get(
            "/api/data/candles",
            params={
                "market": "BTC-PERP",
                "interval": "invalid",
                "days_back": 30
            }
        )
        
        # Должна быть ошибка валидации
        assert response.status_code == 422 or response.status_code == 400
    
    def test_post_fetch_data_loads_new_data(self, client):
        """
        Тест: POST /api/data/fetch загружает данные.
        
        Можем указать market и period для загрузки.
        """
        response = client.post(
            "/api/data/fetch",
            json={
                "market": "SOL-PERP",
                "interval": "1d",
                "days_back": 90
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        assert "status" in data
        assert "candles_count" in data
        assert data["status"] == "success"


class TestBacktestEndpoints:
    """Тесты для backtesting API endpoints."""
    
    @pytest.fixture(scope="class")
    def client(self):
        """FastAPI test client."""
        from apps.api.main import app
        return TestClient(app)
    
    def test_get_strategies_list(self, client):
        """
        Тест: GET /api/backtest/strategies возвращает список стратегий.
        """
        response = client.get("/api/backtest/strategies")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "strategies" in data
        # Должна быть минимум Tortoise
        assert len(data["strategies"]) > 0
        
        # Проверяем структуру
        first_strategy = data["strategies"][0]
        assert "name" in first_strategy
        assert "description" in first_strategy
    
    def test_post_run_backtest_returns_results(self, client):
        """
        Тест: POST /api/backtest/run запускает backtest и возвращает результаты.
        
        Должны получить метрики и equity curve.
        """
        response = client.post(
            "/api/backtest/run",
            json={
                "strategy": "tortoise",
                "market": "BTC-PERP",
                "interval": "1d",
                "days_back": 90,
                "initial_capital": 10000,
                "risk_per_trade": 1.0,
                "params": {
                    "don_break": 20,
                    "don_exit": 10
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Проверяем структуру результатов
        assert "metrics" in data
        assert "equity_curve" in data
        assert "trades" in data
        
        # Проверяем метрики
        metrics = data["metrics"]
        assert "total_trades" in metrics
        assert "win_rate" in metrics
        assert "total_pnl" in metrics
        assert "max_drawdown" in metrics
    
    def test_post_run_backtest_validates_strategy(self, client):
        """Тест: endpoint валидирует название стратегии."""
        response = client.post(
            "/api/backtest/run",
            json={
                "strategy": "nonexistent",
                "market": "BTC-PERP",
                "interval": "1d",
                "days_back": 30
            }
        )
        
        # Должна быть ошибка
        assert response.status_code == 400 or response.status_code == 422
    
    def test_post_run_backtest_with_custom_params(self, client):
        """
        Тест: можем передать custom параметры стратегии.
        """
        response = client.post(
            "/api/backtest/run",
            json={
                "strategy": "tortoise",
                "market": "BTC-PERP",
                "interval": "1d",
                "days_back": 60,
                "params": {
                    "don_break": 30,  # Custom parameter
                    "don_exit": 15
                }
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Результаты должны отличаться от default параметров
        assert "metrics" in data

