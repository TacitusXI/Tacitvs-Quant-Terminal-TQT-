"""
Unit tests для Report Generator.

Тестируем:
- Markdown report generation
- File saving
- Comparison reports
"""

import pytest
import os
import tempfile


class TestReportGenerator:
    """Тесты для ReportGenerator."""
    
    @pytest.fixture
    def temp_output_dir(self):
        """Временная директория для тестов."""
        with tempfile.TemporaryDirectory() as tmpdir:
            yield tmpdir
    
    @pytest.fixture
    def sample_metrics(self):
        """Sample метрики."""
        return {
            'total_trades': 10,
            'win_rate': 40.0,
            'total_pnl': 250.50,
            'return_pct': 2.51,
            'max_drawdown': -5.2,
            'sharpe_ratio': 1.5,
            'profit_factor': 1.8
        }
    
    @pytest.fixture
    def sample_equity_curve(self):
        """Sample equity curve."""
        return [10000, 10100, 10050, 10200, 10150, 10250]
    
    def test_init_creates_output_dir(self, temp_output_dir):
        """Тест: Инициализация создаёт output директорию."""
        from core.research.report_generator import ReportGenerator
        
        output_dir = os.path.join(temp_output_dir, "reports")
        generator = ReportGenerator(output_dir=output_dir)
        
        assert os.path.exists(output_dir)
        assert generator.output_dir == output_dir
    
    def test_generate_markdown_report_returns_string(self, sample_metrics, sample_equity_curve):
        """Тест: generate_markdown_report возвращает строку."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        
        report = generator.generate_markdown_report(
            strategy_name='Test Strategy',
            market='BTC-PERP',
            metrics=sample_metrics,
            equity_curve=sample_equity_curve
        )
        
        assert isinstance(report, str)
        assert len(report) > 0
    
    def test_markdown_report_contains_strategy_name(self, sample_metrics, sample_equity_curve):
        """Тест: Markdown отчёт содержит название стратегии."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        
        report = generator.generate_markdown_report(
            strategy_name='Tortoise',
            market='BTC-PERP',
            metrics=sample_metrics,
            equity_curve=sample_equity_curve
        )
        
        assert 'Tortoise' in report
    
    def test_markdown_report_contains_metrics(self, sample_metrics, sample_equity_curve):
        """Тест: Markdown отчёт содержит метрики."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        
        report = generator.generate_markdown_report(
            strategy_name='Test',
            market='BTC-PERP',
            metrics=sample_metrics,
            equity_curve=sample_equity_curve
        )
        
        # Проверяем наличие ключевых метрик
        assert 'Total Trades' in report
        assert 'Win Rate' in report
        assert 'Sharpe Ratio' in report
        assert '10' in report  # total_trades value
    
    def test_save_report_creates_file(self, temp_output_dir, sample_metrics, sample_equity_curve):
        """Тест: save_report создаёт файл."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator(output_dir=temp_output_dir)
        
        report = generator.generate_markdown_report(
            strategy_name='Test',
            market='BTC-PERP',
            metrics=sample_metrics,
            equity_curve=sample_equity_curve
        )
        
        filepath = generator.save_report(report, 'test_report.md')
        
        assert os.path.exists(filepath)
    
    def test_saved_report_readable(self, temp_output_dir, sample_metrics, sample_equity_curve):
        """Тест: Сохранённый отчёт читаемый."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator(output_dir=temp_output_dir)
        
        report = generator.generate_markdown_report(
            strategy_name='Test',
            market='BTC-PERP',
            metrics=sample_metrics,
            equity_curve=sample_equity_curve
        )
        
        filepath = generator.save_report(report, 'test.md')
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        assert content == report
    
    def test_generate_comparison_report(self):
        """Тест: generate_comparison_report создаёт сравнительный отчёт."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        
        comparisons = [
            {
                'name': 'Config A',
                'metrics': {'return_pct': 5.0, 'sharpe_ratio': 1.5, 'max_drawdown': -3.0, 'win_rate': 55.0}
            },
            {
                'name': 'Config B',
                'metrics': {'return_pct': 3.0, 'sharpe_ratio': 2.0, 'max_drawdown': -2.0, 'win_rate': 60.0}
            }
        ]
        
        report = generator.generate_comparison_report(comparisons)
        
        assert isinstance(report, str)
        assert 'Config A' in report
        assert 'Config B' in report
    
    def test_report_with_advanced_metrics(self, sample_metrics, sample_equity_curve):
        """Тест: Отчёт с advanced metrics."""
        from core.research.report_generator import ReportGenerator
        
        generator = ReportGenerator()
        
        advanced_metrics = {
            'calmar_ratio': 0.8,
            'sortino_ratio': 1.2,
            'omega_ratio': 1.5,
            'var_95': -2.5,
            'cvar_95': -3.0,
            'recovery_factor': 2.0
        }
        
        report = generator.generate_markdown_report(
            strategy_name='Test',
            market='BTC-PERP',
            metrics=sample_metrics,
            equity_curve=sample_equity_curve,
            advanced_metrics=advanced_metrics
        )
        
        assert 'Calmar Ratio' in report
        assert 'Sortino Ratio' in report
        assert 'VaR' in report

