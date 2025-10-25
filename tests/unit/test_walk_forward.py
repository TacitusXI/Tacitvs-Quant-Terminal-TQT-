"""
Unit tests для Walk-Forward Analysis.

Тестируем:
- Splitting данных на train/test windows
- Anchored vs Rolling window
- Edge cases (недостаточно данных, etc)
"""

import pytest
import pandas as pd
from datetime import datetime, timedelta


class TestWalkForwardSplitter:
    """Тесты для WalkForwardSplitter."""
    
    @pytest.fixture
    def sample_data(self):
        """Sample данные на 365 дней."""
        dates = pd.date_range(start='2024-01-01', periods=365, freq='D')
        return pd.DataFrame({
            'timestamp': dates,
            'close': [100 + i for i in range(365)]
        })
    
    def test_init_stores_parameters(self):
        """Тест: WalkForwardSplitter сохраняет параметры."""
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(
            train_days=180,
            test_days=30,
            step_days=30
        )
        
        assert splitter.train_days == 180
        assert splitter.test_days == 30
        assert splitter.step_days == 30
    
    def test_split_creates_multiple_windows(self, sample_data):
        """
        Тест: split создает несколько train/test windows.
        
        365 дней данных, train=180, test=30, step=30
        Должно получиться несколько splits.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(
            train_days=180,
            test_days=30,
            step_days=30
        )
        
        splits = splitter.split(sample_data)
        
        # Должно быть минимум 2 split
        assert len(splits) >= 2
        
        # Каждый split должен иметь train и test
        for split in splits:
            assert 'train' in split
            assert 'test' in split
            assert isinstance(split['train'], pd.DataFrame)
            assert isinstance(split['test'], pd.DataFrame)
    
    def test_train_window_has_correct_size(self, sample_data):
        """Тест: train window имеет правильный размер."""
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(train_days=180, test_days=30)
        splits = splitter.split(sample_data)
        
        first_split = splits[0]
        
        # Train должен быть ровно 180 дней
        assert len(first_split['train']) == 180
    
    def test_test_window_has_correct_size(self, sample_data):
        """Тест: test window имеет правильный размер."""
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(train_days=180, test_days=30)
        splits = splitter.split(sample_data)
        
        first_split = splits[0]
        
        # Test должен быть ровно 30 дней
        assert len(first_split['test']) == 30
    
    def test_test_follows_train_chronologically(self, sample_data):
        """
        Тест: test period идет ПОСЛЕ train period (no look-ahead bias).
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(train_days=180, test_days=30)
        splits = splitter.split(sample_data)
        
        first_split = splits[0]
        
        # Последняя дата train должна быть раньше первой даты test
        last_train_date = first_split['train']['timestamp'].iloc[-1]
        first_test_date = first_split['test']['timestamp'].iloc[0]
        
        assert last_train_date < first_test_date
    
    def test_anchored_window_keeps_same_start(self, sample_data):
        """
        Тест: anchored window всегда начинается с начала данных.
        
        Anchored: train window растет с каждым split.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(
            train_days=180,
            test_days=30,
            step_days=30,
            anchored=True
        )
        
        splits = splitter.split(sample_data)
        
        if len(splits) >= 2:
            # Первая дата train в обоих splits должна быть одинаковой
            first_split_start = splits[0]['train']['timestamp'].iloc[0]
            second_split_start = splits[1]['train']['timestamp'].iloc[0]
            
            assert first_split_start == second_split_start
            
            # Но второй train должен быть длиннее
            assert len(splits[1]['train']) > len(splits[0]['train'])
    
    def test_rolling_window_shifts_start(self, sample_data):
        """
        Тест: rolling window сдвигает начало train с каждым split.
        
        Rolling: train window фиксированного размера, сдвигается вперед.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(
            train_days=180,
            test_days=30,
            step_days=30,
            anchored=False  # Rolling
        )
        
        splits = splitter.split(sample_data)
        
        if len(splits) >= 2:
            # Начало второго train должно быть позже первого
            first_split_start = splits[0]['train']['timestamp'].iloc[0]
            second_split_start = splits[1]['train']['timestamp'].iloc[0]
            
            assert second_split_start > first_split_start
            
            # И размеры train должны быть одинаковыми
            assert len(splits[0]['train']) == len(splits[1]['train'])
    
    def test_split_raises_error_for_insufficient_data(self):
        """
        Тест: split выбрасывает ошибку если данных недостаточно.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        # Только 100 дней данных
        short_data = pd.DataFrame({
            'timestamp': pd.date_range('2024-01-01', periods=100, freq='D'),
            'close': list(range(100))
        })
        
        # Но требуем 180 дней для train
        splitter = WalkForwardSplitter(train_days=180, test_days=30)
        
        with pytest.raises(ValueError, match="Недостаточно данных"):
            splitter.split(short_data)
    
    def test_get_split_info_returns_metadata(self, sample_data):
        """
        Тест: get_split_info возвращает метаданные о каждом split.
        """
        from core.research.walk_forward import WalkForwardSplitter
        
        splitter = WalkForwardSplitter(train_days=180, test_days=30)
        splits = splitter.split(sample_data)
        
        info = splitter.get_split_info(splits)
        
        # Должна быть информация о каждом split
        assert len(info) == len(splits)
        
        # Каждая запись должна содержать ключевые поля
        first_info = info[0]
        assert 'split_id' in first_info
        assert 'train_start' in first_info
        assert 'train_end' in first_info
        assert 'test_start' in first_info
        assert 'test_end' in first_info
        assert 'train_size' in first_info
        assert 'test_size' in first_info

