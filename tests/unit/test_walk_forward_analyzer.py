"""
Unit tests для WalkForwardAnalyzer.

Тестируем:
- Запуск backtests на train/test splits
- Сбор IS/OOS метрик
- Агрегацию результатов
"""

import pytest
import pandas as pd
from unittest.mock import Mock, patch


class TestWalkForwardAnalyzer:
    """Тесты для WalkForwardAnalyzer."""
    
    @pytest.fixture
    def sample_strategy(self):
        """Mock стратегия."""
        strategy = Mock()
        strategy.id = "test_strategy"
        strategy.markets = ["TEST-PERP"]
        # Mock on_bar должен возвращать пустой список signals
        strategy.on_bar.return_value = []
        return strategy
    
    @pytest.fixture
    def sample_data(self):
        """Sample данные на 180 дней."""
        dates = pd.date_range(start='2024-01-01', periods=180, freq='D')
        return pd.DataFrame({
            'timestamp': dates,
            'open': [100.0] * 180,
            'high': [101.0] * 180,
            'low': [99.0] * 180,
            'close': [100.0 + i * 0.1 for i in range(180)],
            'volume': [1000.0] * 180
        })
    
    def test_init_stores_parameters(self, sample_strategy):
        """Тест: WalkForwardAnalyzer сохраняет параметры."""
        from core.research.walk_forward import WalkForwardAnalyzer
        
        analyzer = WalkForwardAnalyzer(
            strategy=sample_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        assert analyzer.strategy == sample_strategy
        assert analyzer.initial_capital == 10000.0
        assert analyzer.risk_per_trade == 1.0
    
    def test_run_analysis_returns_results(self, sample_strategy, sample_data):
        """
        Тест: run_analysis возвращает результаты для каждого split.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(strategy=sample_strategy)
        
        # Создаем splitter
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        # Запускаем анализ
        results = analyzer.run_analysis(
            market='TEST-PERP',
            data=sample_data,
            splitter=splitter
        )
        
        # Проверяем что результаты содержат нужные ключи
        assert 'splits' in results
        assert 'summary' in results
        
        # Должны быть результаты для каждого split
        assert len(results['splits']) > 0
    
    def test_each_split_has_train_and_test_results(self, sample_strategy, sample_data):
        """
        Тест: Каждый split содержит IS и OOS результаты.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(strategy=sample_strategy)
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        results = analyzer.run_analysis('TEST-PERP', sample_data, splitter)
        
        # Каждый split должен иметь train (IS) и test (OOS) метрики
        for split_result in results['splits']:
            assert 'split_id' in split_result
            assert 'train_metrics' in split_result  # In-Sample
            assert 'test_metrics' in split_result   # Out-of-Sample
    
    def test_train_metrics_are_from_train_period(self, sample_strategy, sample_data):
        """
        Тест: train_metrics получены из train периода.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(strategy=sample_strategy)
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        results = analyzer.run_analysis('TEST-PERP', sample_data, splitter)
        
        first_split = results['splits'][0]
        
        # Train metrics должны быть словарем с метриками
        assert isinstance(first_split['train_metrics'], dict)
        assert 'total_trades' in first_split['train_metrics']
    
    def test_summary_aggregates_oos_results(self, sample_strategy, sample_data):
        """
        Тест: summary содержит агрегированные OOS метрики.
        
        OOS (Out-of-Sample) метрики - главный показатель робастности.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(strategy=sample_strategy)
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        results = analyzer.run_analysis('TEST-PERP', sample_data, splitter)
        
        summary = results['summary']
        
        # Summary должен содержать OOS метрики
        assert 'oos_avg_return' in summary
        assert 'oos_avg_sharpe' in summary
        assert 'oos_win_rate' in summary
        assert 'oos_consistency' in summary  # % прибыльных OOS периодов
        assert 'num_splits' in summary
    
    def test_oos_consistency_shows_stable_periods(self, sample_strategy, sample_data):
        """
        Тест: oos_consistency показывает процент прибыльных OOS периодов.
        
        Consistency = (количество прибыльных OOS) / (всего OOS) * 100%
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(strategy=sample_strategy)
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        results = analyzer.run_analysis('TEST-PERP', sample_data, splitter)
        
        # Consistency должен быть между 0 и 100
        consistency = results['summary']['oos_consistency']
        assert 0 <= consistency <= 100
    
    def test_analyzer_uses_backtest_engine(self, sample_strategy, sample_data):
        """
        Тест: Analyzer использует BacktestEngine для каждого split.
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(
            strategy=sample_strategy,
            initial_capital=10000.0,
            risk_per_trade=1.0
        )
        
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        # Mock BacktestEngine
        with patch('core.research.walk_forward.BacktestEngine') as mock_engine:
            # Настраиваем mock для возврата метрик
            mock_instance = Mock()
            mock_instance.run_backtest.return_value = {
                'metrics': {
                    'total_trades': 5,
                    'win_rate': 50.0,
                    'total_pnl': 100.0,
                    'final_equity': 10100.0,
                    'return_pct': 1.0,
                    'sharpe_ratio': 0.5
                },
                'equity_curve': [10000, 10050, 10100],
                'trades': []
            }
            mock_engine.return_value = mock_instance
            
            results = analyzer.run_analysis('TEST-PERP', sample_data, splitter)
            
            # BacktestEngine должен быть вызван для каждого split (train + test)
            # Если 3 splits → 6 вызовов (train + test для каждого)
            num_splits = len(results['splits'])
            expected_calls = num_splits * 2  # train + test
            
            assert mock_engine.call_count == expected_calls
    
    def test_comparison_shows_is_vs_oos_degradation(self, sample_strategy, sample_data):
        """
        Тест: Результаты показывают IS vs OOS degradation.
        
        Degradation = насколько OOS хуже чем IS (признак overfitting).
        """
        from core.research.walk_forward import WalkForwardAnalyzer, WalkForwardSplitter
        
        analyzer = WalkForwardAnalyzer(strategy=sample_strategy)
        splitter = WalkForwardSplitter(train_days=90, test_days=30)
        
        results = analyzer.run_analysis('TEST-PERP', sample_data, splitter)
        
        summary = results['summary']
        
        # Summary должен содержать средние IS метрики для сравнения
        assert 'is_avg_return' in summary
        assert 'oos_avg_return' in summary
        
        # Можем проверить есть ли degradation
        # (OOS обычно хуже чем IS)

