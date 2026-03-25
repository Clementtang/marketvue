"""
Tests for NewsService._sort_and_filter static method

Tests cover:
- Basic descending sort by date
- 72h time window filtering (articles older than 72h are excluded)
- Date parse failure bug: articles with invalid published_at bypass cutoff check
  and are retained (regression test for Phase 3 fix)
- Empty input
- All articles expired
- Boundary condition at exactly 72h
"""

import pytest
from datetime import datetime, timedelta, timezone
from unittest.mock import patch

from services.news_service import NewsService
from constants import NEWS_DATE_FORMAT, NEWS_TIME_WINDOW_HOURS


def make_article(article_id: str, published_at: str) -> dict:
    """Build a minimal article dict for testing."""
    return {
        'id': article_id,
        'headline': f'Headline {article_id}',
        'summary': None,
        'source': 'TestSource',
        'url': f'https://example.com/{article_id}',
        'image': None,
        'published_at': published_at,
        'language': 'en-US',
    }


def fmt(dt: datetime) -> str:
    """Format a datetime to NEWS_DATE_FORMAT (strips tzinfo for strftime)."""
    return dt.strftime(NEWS_DATE_FORMAT)


class TestSortAndFilterBasicSort:
    """Basic descending sort behaviour"""

    def test_articles_sorted_newest_first(self):
        """should return articles sorted by date descending"""
        now = datetime.now(timezone.utc)
        articles = [
            make_article('old', fmt(now - timedelta(hours=10))),
            make_article('newest', fmt(now - timedelta(hours=1))),
            make_article('middle', fmt(now - timedelta(hours=5))),
        ]

        result = NewsService._sort_and_filter(articles)

        assert [a['id'] for a in result] == ['newest', 'middle', 'old']

    def test_single_article_returned_as_is(self):
        """should return a list with the single recent article"""
        now = datetime.now(timezone.utc)
        articles = [make_article('only', fmt(now - timedelta(hours=1)))]

        result = NewsService._sort_and_filter(articles)

        assert len(result) == 1
        assert result[0]['id'] == 'only'

    def test_articles_with_same_date_all_included(self):
        """should keep all articles when they share the same timestamp"""
        now = datetime.now(timezone.utc)
        ts = fmt(now - timedelta(hours=2))
        articles = [make_article(f'art_{i}', ts) for i in range(3)]

        result = NewsService._sort_and_filter(articles)

        assert len(result) == 3


class TestSortAndFilter72hWindow:
    """Time window filtering: only articles within 72h are kept"""

    def test_article_older_than_72h_is_excluded(self):
        """should exclude articles published more than 72 hours ago"""
        now = datetime.now(timezone.utc)
        articles = [
            make_article('recent', fmt(now - timedelta(hours=10))),
            make_article('stale', fmt(now - timedelta(hours=73))),
        ]

        result = NewsService._sort_and_filter(articles)

        ids = [a['id'] for a in result]
        assert 'recent' in ids
        assert 'stale' not in ids

    def test_article_within_72h_is_included(self):
        """should include articles published within the last 72 hours"""
        now = datetime.now(timezone.utc)
        articles = [make_article('fresh', fmt(now - timedelta(hours=71, minutes=59)))]

        result = NewsService._sort_and_filter(articles)

        assert len(result) == 1
        assert result[0]['id'] == 'fresh'

    def test_mixed_articles_only_recent_kept(self):
        """should keep only recent articles when mixed with stale ones"""
        now = datetime.now(timezone.utc)
        articles = [
            make_article('hour_1', fmt(now - timedelta(hours=1))),
            make_article('hour_48', fmt(now - timedelta(hours=48))),
            make_article('hour_72_plus', fmt(now - timedelta(hours=80))),
            make_article('hour_72_plus_2', fmt(now - timedelta(hours=100))),
        ]

        result = NewsService._sort_and_filter(articles)

        ids = [a['id'] for a in result]
        assert 'hour_1' in ids
        assert 'hour_48' in ids
        assert 'hour_72_plus' not in ids
        assert 'hour_72_plus_2' not in ids


class TestSortAndFilterBoundaryCondition:
    """Boundary: article at exactly the 72h cutoff"""

    def test_article_at_exact_cutoff_is_included(self):
        """should include an article published at exactly 72h ago (>= cutoff)"""
        # Pin now so the cutoff calculation is deterministic
        fixed_now = datetime(2026, 3, 25, 12, 0, 0, tzinfo=timezone.utc)
        exact_cutoff = fixed_now - timedelta(hours=NEWS_TIME_WINDOW_HOURS)

        articles = [make_article('boundary', fmt(exact_cutoff))]

        with patch('services.news_service.datetime') as mock_dt:
            mock_dt.now.return_value = fixed_now
            mock_dt.strptime.side_effect = datetime.strptime
            mock_dt.min = datetime.min
            result = NewsService._sort_and_filter(articles)

        assert len(result) == 1
        assert result[0]['id'] == 'boundary'

    def test_article_one_second_past_cutoff_is_excluded(self):
        """should exclude an article published one second beyond the 72h cutoff"""
        fixed_now = datetime(2026, 3, 25, 12, 0, 0, tzinfo=timezone.utc)
        just_past_cutoff = fixed_now - timedelta(hours=NEWS_TIME_WINDOW_HOURS, seconds=1)

        articles = [make_article('just_stale', fmt(just_past_cutoff))]

        with patch('services.news_service.datetime') as mock_dt:
            mock_dt.now.return_value = fixed_now
            mock_dt.strptime.side_effect = datetime.strptime
            mock_dt.min = datetime.min
            result = NewsService._sort_and_filter(articles)

        assert len(result) == 0


class TestSortAndFilterEmptyInput:
    """Edge case: empty article list"""

    def test_empty_list_returns_empty_list(self):
        """should return an empty list when given an empty list"""
        result = NewsService._sort_and_filter([])
        assert result == []


class TestSortAndFilterAllExpired:
    """All articles are stale"""

    def test_all_expired_returns_empty(self):
        """should return empty list when all articles are older than 72h"""
        now = datetime.now(timezone.utc)
        articles = [
            make_article('old_1', fmt(now - timedelta(hours=73))),
            make_article('old_2', fmt(now - timedelta(hours=100))),
            make_article('old_3', fmt(now - timedelta(hours=200))),
        ]

        result = NewsService._sort_and_filter(articles)

        assert result == []


class TestSortAndFilterDateParseBug:
    """
    Regression tests for the date parse failure fix.

    Fix: When published_at cannot be parsed, the except branch now uses
    `continue` to skip the article entirely — articles with invalid dates
    are excluded rather than bypassing the cutoff check.
    """

    def test_invalid_date_article_is_skipped(self):
        """should skip article with unparseable published_at"""
        articles = [make_article('bad_date', 'not-a-date')]

        result = NewsService._sort_and_filter(articles)

        assert len(result) == 0

    def test_missing_published_at_article_is_skipped(self):
        """should skip article with empty published_at string"""
        article = {
            'id': 'no_date',
            'headline': 'No date article',
            'published_at': '',   # empty string triggers ValueError in strptime
        }

        result = NewsService._sort_and_filter([article])

        assert len(result) == 0

    def test_none_published_at_article_is_skipped(self):
        """should skip article when published_at is None"""
        article = {
            'id': 'none_date',
            'headline': 'None date article',
            'published_at': None,
        }

        result = NewsService._sort_and_filter([article])

        assert len(result) == 0

    def test_valid_articles_kept_when_mixed_with_invalid_date(self):
        """should keep valid recent articles and skip those with invalid dates"""
        now = datetime.now(timezone.utc)
        articles = [
            make_article('bad_date', 'garbage'),
            make_article('recent', fmt(now - timedelta(hours=1))),
            make_article('older', fmt(now - timedelta(hours=10))),
        ]

        result = NewsService._sort_and_filter(articles)

        ids = [a['id'] for a in result]
        assert 'recent' in ids
        assert 'older' in ids
        assert 'bad_date' not in ids

    def test_multiple_invalid_dates_all_skipped(self):
        """should skip all articles with unparseable dates"""
        articles = [
            make_article('bad_1', 'not-a-date'),
            make_article('bad_2', '2026/03/25'),  # wrong format
            make_article('bad_3', ''),
        ]

        result = NewsService._sort_and_filter(articles)

        assert len(result) == 0

    def test_invalid_date_mixed_with_stale_valid_date(self):
        """should skip both stale and bad-date articles"""
        now = datetime.now(timezone.utc)
        articles = [
            make_article('stale', fmt(now - timedelta(hours=80))),
            make_article('bad_date', 'not-a-date'),
        ]

        result = NewsService._sort_and_filter(articles)

        assert result == []
