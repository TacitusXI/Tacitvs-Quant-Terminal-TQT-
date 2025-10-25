"""
Report Generator для создания отчётов по результатам backtesting и research.

Генерирует:
- Markdown reports (для GitHub/docs)
- HTML reports (для viewing)
- Summary metrics tables
- Trade analysis
- Performance charts (ASCII для simple output)

Использование:
    generator = ReportGenerator()
    
    # Markdown report
    md_content = generator.generate_markdown_report(
        strategy_name='Tortoise',
        metrics=metrics,
        trades=trades,
        equity_curve=equity
    )
    
    # Save to file
    generator.save_report(md_content, 'reports/tortoise_btc.md')
"""

from typing import Dict, List, Any, Optional
from datetime import datetime
import os


class ReportGenerator:
    """
    Generator для создания отчётов по backtesting/research результатам.
    
    Создаёт читаемые markdown и HTML отчёты с метриками, графиками, и анализом.
    """
    
    def __init__(self, output_dir: str = "reports"):
        """
        Инициализация Report Generator.
        
        output_dir: Директория для сохранения отчётов.
        """
        self.output_dir = output_dir
        
        # Создаём директорию если не существует
        os.makedirs(output_dir, exist_ok=True)
    
    def generate_markdown_report(
        self,
        strategy_name: str,
        market: str,
        metrics: Dict[str, Any],
        equity_curve: List[float],
        trades: Optional[List[Dict[str, Any]]] = None,
        walk_forward_results: Optional[Dict[str, Any]] = None,
        monte_carlo_results: Optional[Dict[str, Any]] = None,
        advanced_metrics: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Генерировать Markdown отчёт.
        
        strategy_name: Название стратегии.
        market: Рынок (например, 'BTC-PERP').
        metrics: Базовые метрики backtest.
        equity_curve: Equity curve.
        trades: Список сделок (optional).
        walk_forward_results: WF результаты (optional).
        monte_carlo_results: MC результаты (optional).
        advanced_metrics: Продвинутые метрики (optional).
        
        Возвращает: Markdown content.
        """
        lines = []
        
        # Header
        lines.append(f"# {strategy_name} Strategy Report")
        lines.append(f"**Market:** {market}")
        lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("")
        lines.append("---")
        lines.append("")
        
        # Summary Metrics
        lines.append("## 📊 Performance Summary")
        lines.append("")
        lines.append("| Metric | Value |")
        lines.append("|--------|-------|")
        lines.append(f"| Total Trades | {metrics.get('total_trades', 0)} |")
        lines.append(f"| Win Rate | {metrics.get('win_rate', 0):.1f}% |")
        lines.append(f"| Total P&L | ${metrics.get('total_pnl', 0):.2f} |")
        lines.append(f"| Return | {metrics.get('return_pct', 0):.2f}% |")
        lines.append(f"| Max Drawdown | {metrics.get('max_drawdown', 0):.2f}% |")
        lines.append(f"| Sharpe Ratio | {metrics.get('sharpe_ratio', 0):.2f} |")
        lines.append(f"| Profit Factor | {metrics.get('profit_factor', 0):.2f} |")
        lines.append("")
        
        # Advanced Metrics (if provided)
        if advanced_metrics:
            lines.append("## 🎯 Advanced Risk Metrics")
            lines.append("")
            lines.append("| Metric | Value |")
            lines.append("|--------|-------|")
            lines.append(f"| Calmar Ratio | {advanced_metrics.get('calmar_ratio', 0):.2f} |")
            lines.append(f"| Sortino Ratio | {advanced_metrics.get('sortino_ratio', 0):.2f} |")
            lines.append(f"| Omega Ratio | {advanced_metrics.get('omega_ratio', 0):.2f} |")
            lines.append(f"| VaR (95%) | {advanced_metrics.get('var_95', 0):.2f}% |")
            lines.append(f"| CVaR (95%) | {advanced_metrics.get('cvar_95', 0):.2f}% |")
            lines.append(f"| Recovery Factor | {advanced_metrics.get('recovery_factor', 0):.2f} |")
            lines.append("")
        
        # Walk-Forward Results (if provided)
        if walk_forward_results:
            lines.append("## 🔄 Walk-Forward Analysis")
            lines.append("")
            summary = walk_forward_results.get('summary', {})
            lines.append("| Metric | Value |")
            lines.append("|--------|-------|")
            lines.append(f"| Number of Splits | {summary.get('num_splits', 0)} |")
            lines.append(f"| IS Avg Return | {summary.get('is_avg_return', 0):.2f}% |")
            lines.append(f"| OOS Avg Return | {summary.get('oos_avg_return', 0):.2f}% |")
            lines.append(f"| OOS Consistency | {summary.get('oos_consistency', 0):.1f}% |")
            lines.append("")
            
            # IS vs OOS degradation
            degradation = summary.get('is_avg_return', 0) - summary.get('oos_avg_return', 0)
            if degradation > 0:
                lines.append(f"⚠️ **IS→OOS Degradation:** {degradation:.2f}% (potential overfitting)")
            else:
                lines.append(f"✅ **IS→OOS:** Stable performance")
            lines.append("")
        
        # Monte Carlo Results (if provided)
        if monte_carlo_results:
            lines.append("## 🎲 Monte Carlo Simulation")
            lines.append("")
            stats = monte_carlo_results.get('stats', {})
            lines.append("| Metric | Value |")
            lines.append("|--------|-------|")
            lines.append(f"| Simulations | {monte_carlo_results.get('simulations', 0)} |")
            lines.append(f"| Probability of Profit | {stats.get('prob_profit', 0):.1%} |")
            lines.append(f"| Median Return | {stats.get('median_return', 0):.2f}% |")
            lines.append(f"| Mean Return | {stats.get('mean_return', 0):.2f}% |")
            lines.append(f"| Best Case | {stats.get('best_case_return', 0):.2f}% |")
            lines.append(f"| Worst Case | {stats.get('worst_case_return', 0):.2f}% |")
            lines.append("")
        
        # Equity Curve Summary
        if equity_curve and len(equity_curve) > 0:
            lines.append("## 📈 Equity Curve")
            lines.append("")
            lines.append(f"- Initial Capital: ${equity_curve[0]:.2f}")
            lines.append(f"- Final Equity: ${equity_curve[-1]:.2f}")
            lines.append(f"- Peak Equity: ${max(equity_curve):.2f}")
            lines.append(f"- Lowest Equity: ${min(equity_curve):.2f}")
            lines.append("")
        
        # Trade Analysis (if provided)
        if trades and len(trades) > 0:
            lines.append("## 📋 Trade Analysis")
            lines.append("")
            
            winning_trades = [t for t in trades if t.get('pnl', 0) > 0]
            losing_trades = [t for t in trades if t.get('pnl', 0) < 0]
            
            lines.append(f"**Winning Trades:** {len(winning_trades)}")
            if winning_trades:
                avg_win = sum(t['pnl'] for t in winning_trades) / len(winning_trades)
                lines.append(f"- Average Win: ${avg_win:.2f}")
            
            lines.append("")
            lines.append(f"**Losing Trades:** {len(losing_trades)}")
            if losing_trades:
                avg_loss = sum(t['pnl'] for t in losing_trades) / len(losing_trades)
                lines.append(f"- Average Loss: ${avg_loss:.2f}")
            
            lines.append("")
        
        # Conclusion
        lines.append("## 💡 Conclusion")
        lines.append("")
        
        # Auto-generate simple conclusion based on metrics
        total_return = metrics.get('return_pct', 0)
        sharpe = metrics.get('sharpe_ratio', 0)
        
        if total_return > 0 and sharpe > 1:
            lines.append("✅ **Strategy shows positive performance with good risk-adjusted returns.**")
        elif total_return > 0:
            lines.append("⚠️ **Strategy is profitable but has suboptimal risk-adjusted returns.**")
        else:
            lines.append("❌ **Strategy shows negative performance. Not recommended for live trading.**")
        
        lines.append("")
        
        # Footer
        lines.append("---")
        lines.append("")
        lines.append("*Report generated by Tacitus Quant Terminal*")
        
        return "\n".join(lines)
    
    def save_report(self, content: str, filename: str) -> str:
        """
        Сохранить отчёт в файл.
        
        content: Содержимое отчёта.
        filename: Имя файла (relative to output_dir).
        
        Возвращает: Полный путь к файлу.
        """
        filepath = os.path.join(self.output_dir, filename)
        
        # Создаём поддиректории если нужно
        os.makedirs(os.path.dirname(filepath), exist_ok=True)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return filepath
    
    def generate_comparison_report(
        self,
        comparisons: List[Dict[str, Any]],
        title: str = "Strategy Comparison"
    ) -> str:
        """
        Генерировать comparison отчёт для нескольких стратегий/параметров.
        
        comparisons: Список результатов для сравнения.
            [{'name': 'Config1', 'metrics': {...}}, ...]
        title: Заголовок отчёта.
        
        Возвращает: Markdown content.
        """
        lines = []
        
        lines.append(f"# {title}")
        lines.append(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        lines.append("")
        lines.append("---")
        lines.append("")
        
        # Comparison table
        lines.append("## 📊 Performance Comparison")
        lines.append("")
        
        # Header
        header = "| Configuration |"
        separator = "|---------------|"
        
        if comparisons:
            # Get metric names from first comparison
            metric_names = ['return_pct', 'sharpe_ratio', 'max_drawdown', 'win_rate']
            for metric in metric_names:
                header += f" {metric.replace('_', ' ').title()} |"
                separator += "--------|"
        
        lines.append(header)
        lines.append(separator)
        
        # Rows
        for comp in comparisons:
            name = comp.get('name', 'Unknown')
            metrics = comp.get('metrics', {})
            
            row = f"| {name} |"
            for metric in metric_names:
                value = metrics.get(metric, 0)
                if 'pct' in metric or 'rate' in metric or 'drawdown' in metric:
                    row += f" {value:.2f}% |"
                else:
                    row += f" {value:.2f} |"
            
            lines.append(row)
        
        lines.append("")
        
        # Best configuration
        if comparisons:
            # Rank by Sharpe ratio
            best = max(comparisons, key=lambda x: x.get('metrics', {}).get('sharpe_ratio', -999))
            lines.append(f"🏆 **Best Configuration:** {best.get('name')}")
            lines.append(f"   Sharpe Ratio: {best.get('metrics', {}).get('sharpe_ratio', 0):.2f}")
            lines.append("")
        
        lines.append("---")
        lines.append("*Report generated by Tacitus Quant Terminal*")
        
        return "\n".join(lines)
    
    def __repr__(self) -> str:
        """Строковое представление."""
        return f"ReportGenerator(output_dir='{self.output_dir}')"

