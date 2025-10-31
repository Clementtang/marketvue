export type Language = 'en-US' | 'zh-TW';

export interface Translations {
  // Header
  appTitle: string;
  appSubtitle: string;

  // Settings
  settings: string;
  appearance: string;
  light: string;
  dark: string;
  system: string;
  priceColorScheme: string;
  asian: string;
  western: string;
  redUpGreenDown: string;
  greenUpRedDown: string;
  language: string;

  // Stock Manager
  stockManager: string;
  enterStockSymbol: string;
  add: string;
  stocksAdded: string;
  trackedStocks: string;
  noStocksYet: string;
  maxStocksReached: string;
  stockAlreadyAdded: string;
  pleaseEnterSymbol: string;

  // Stock examples
  stockExampleTaiwan: string;
  stockExampleUS: string;
  stockExampleTaiwan2: string;
  stockExampleHK: string;
  stockExampleJP: string;
  stockExampleEU: string;

  // Time Range
  timeRange: string;
  customRange: string;
  to: string;

  // Dashboard
  dashboardGrid: string;
  volume: string;

  // News
  news: string;
  noNews: string;
  readMore: string;
  closeButton: string;

  // Chart
  open: string;
  high: string;
  low: string;
  close: string;
  ma20: string;
  ma60: string;

  // Empty state
  noStocksAddedYet: string;
  addStocksToStart: string;

  // Time Range
  custom: string;
  startDate: string;
  endDate: string;
  applyCustomRange: string;
  currentRange: string;

  // Stock Card
  viewNews: string;
  noDataAvailable: string;
  failedToFetch: string;

  // News Panel
  latestNews: string;
  noNewsAvailableFor: string;
  tryCheckingLater: string;
  readFullArticle: string;

  // Footer
  poweredBy: string;
}

export const translations: Record<Language, Translations> = {
  'en-US': {
    // Header
    appTitle: 'Stock Dashboard',
    appSubtitle: 'Track up to 9 stocks with real-time data',

    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    priceColorScheme: 'Price Color Scheme',
    asian: 'Asian',
    western: 'Western',
    redUpGreenDown: 'Red Up / Green Down',
    greenUpRedDown: 'Green Up / Red Down',
    language: 'Language',

    // Stock Manager
    stockManager: 'Stock Manager',
    enterStockSymbol: 'Enter stock symbol',
    add: 'Add',
    stocksAdded: 'stocks added',
    trackedStocks: 'Tracked Stocks:',
    noStocksYet: 'No stocks added yet. Add your first stock to get started!',
    maxStocksReached: 'Maximum 9 stocks allowed',
    stockAlreadyAdded: 'Stock already added',
    pleaseEnterSymbol: 'Please enter a stock symbol',

    // Stock examples
    stockExampleTaiwan: 'Taiwan: 2330.TW (TSMC)',
    stockExampleUS: 'US: AAPL (Apple)',
    stockExampleTaiwan2: 'Taiwan: 6741.TWO (91APP)',
    stockExampleHK: 'HK: 0700.HK (Tencent)',
    stockExampleJP: 'Japan: 9983.T (UNIQLO)',
    stockExampleEU: 'Europe: Add exchange suffix',

    // Time Range
    timeRange: 'Time Range',
    customRange: 'Custom Range',
    to: 'to',

    // Dashboard
    dashboardGrid: 'Dashboard Grid',
    volume: 'Volume',

    // News
    news: 'News',
    noNews: 'No news available',
    readMore: 'Read More',
    closeButton: 'Close',

    // Chart
    open: 'Open',
    high: 'High',
    low: 'Low',
    close: 'Close',
    ma20: 'MA20',
    ma60: 'MA60',

    // Empty state
    noStocksAddedYet: 'No Stocks Added Yet',
    addStocksToStart: 'Add stocks using the Stock Manager above to start tracking them',

    // Time Range
    custom: 'Custom',
    startDate: 'Start Date',
    endDate: 'End Date',
    applyCustomRange: 'Apply Custom Range',
    currentRange: 'Current range:',

    // Stock Card
    viewNews: 'View news',
    noDataAvailable: 'No data available',
    failedToFetch: 'Failed to fetch stock data',

    // News Panel
    latestNews: 'Latest News',
    noNewsAvailableFor: 'No news available for',
    tryCheckingLater: 'Try checking back later',
    readFullArticle: 'Read full article',

    // Footer
    poweredBy: 'Stock Dashboard - Real-time data powered by',
  },
  'zh-TW': {
    // Header
    appTitle: '股票儀表板',
    appSubtitle: '追蹤最多 9 支股票的即時數據',

    // Settings
    settings: '設定',
    appearance: '外觀',
    light: '淺色',
    dark: '深色',
    system: '系統',
    priceColorScheme: '價格配色',
    asian: '亞洲',
    western: '歐美',
    redUpGreenDown: '紅漲綠跌',
    greenUpRedDown: '綠漲紅跌',
    language: '語言',

    // Stock Manager
    stockManager: '股票管理',
    enterStockSymbol: '輸入股票代號',
    add: '新增',
    stocksAdded: '支股票已新增',
    trackedStocks: '追蹤中的股票：',
    noStocksYet: '尚未新增股票。新增第一支股票開始追蹤！',
    maxStocksReached: '最多只能新增 9 支股票',
    stockAlreadyAdded: '股票已新增',
    pleaseEnterSymbol: '請輸入股票代號',

    // Stock examples
    stockExampleTaiwan: '台股：2330.TW（台積電）',
    stockExampleUS: '美股：AAPL（Apple）',
    stockExampleTaiwan2: '台股：6741.TWO（91APP）',
    stockExampleHK: '港股：0700.HK（騰訊）',
    stockExampleJP: '日股：9983.T（UNIQLO）',
    stockExampleEU: '歐股：需加上交易所後綴',

    // Time Range
    timeRange: '時間區間',
    customRange: '自訂區間',
    to: '至',

    // Dashboard
    dashboardGrid: '儀表板',
    volume: '成交量',

    // News
    news: '新聞',
    noNews: '暫無新聞',
    readMore: '閱讀更多',
    closeButton: '關閉',

    // Chart
    open: '開盤',
    high: '最高',
    low: '最低',
    close: '收盤',
    ma20: 'MA20',
    ma60: 'MA60',

    // Empty state
    noStocksAddedYet: '尚未新增股票',
    addStocksToStart: '使用上方的股票管理功能新增股票開始追蹤',

    // Time Range
    custom: '自訂',
    startDate: '開始日期',
    endDate: '結束日期',
    applyCustomRange: '套用自訂區間',
    currentRange: '目前區間：',

    // Stock Card
    viewNews: '查看新聞',
    noDataAvailable: '無可用數據',
    failedToFetch: '無法取得股票數據',

    // News Panel
    latestNews: '最新新聞',
    noNewsAvailableFor: '無可用新聞',
    tryCheckingLater: '請稍後再試',
    readFullArticle: '閱讀完整文章',

    // Footer
    poweredBy: '股票儀表板 - 即時資料由',
  },
};

export function useTranslation(language: Language): Translations {
  return translations[language];
}
