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
  visualTheme: string;
  classic: string;
  warmMinimal: string;
  classicDescription: string;
  warmMinimalDescription: string;
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
  export: string;
  import: string;
  exportToClipboard: string;
  importFromClipboard: string;
  exportedToClipboard: string;
  importedStocks: string;
  noStocksToExport: string;
  clipboardEmpty: string;
  noValidSymbols: string;
  skipped: string;
  noNewStocks: string;
  exportFailed: string;
  importFailed: string;

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
  daily: string;
  weekly: string;
  monthly: string;

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
  rateLimitExceeded: string;
  chartType: string;
  lineChart: string;
  candlestickChart: string;
  switchToLineChart: string;
  switchToCandlestickChart: string;

  // News Panel
  latestNews: string;
  noNewsAvailableFor: string;
  tryCheckingLater: string;
  readFullArticle: string;

  // Footer
  poweredBy: string;
  madeBy: string;
  viewOnGitHub: string;

  // Notification Banner
  freeHostingNotice: string;

  // Stock List Management
  defaultList: string;
  createNewList: string;
  saveAsCopy: string;
  renameList: string;
  deleteList: string;
  listName: string;
  listNamePlaceholder: string;
  listNameRequired: string;
  listNameTooLong: string;
  create: string;
  save: string;
  cancel: string;
  delete: string;
  listCreated: string;
  listRenamed: string;
  listDeleted: string;
  deleteListConfirm: string;
  deleteListWarning: string;
  listContainsStocks: string;
  maxListsReached: string;

  // Stock Search
  searchPlaceholder: string;
  noSearchResults: string;
  tryEnterSymbol: string;
  marketTW: string;
  marketTWO: string;
  marketUS: string;
  marketJP: string;
  marketHK: string;
}

export const translations: Record<Language, Translations> = {
  'en-US': {
    // Header
    appTitle: 'MarketVue',
    appSubtitle: 'Real-time Multi-Market Stock Dashboard',

    // Settings
    settings: 'Settings',
    appearance: 'Appearance',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    visualTheme: 'Visual Theme',
    classic: 'Classic',
    warmMinimal: 'Warm Minimal',
    classicDescription: 'Professional cool-toned appearance',
    warmMinimalDescription: 'Friendly warm-toned appearance',
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
    maxStocksReached: 'Maximum 18 stocks allowed',
    stockAlreadyAdded: 'Stock already added',
    pleaseEnterSymbol: 'Please enter a stock symbol',
    export: 'Export',
    import: 'Import',
    exportToClipboard: 'Export to clipboard',
    importFromClipboard: 'Import from clipboard',
    exportedToClipboard: 'Exported to clipboard',
    importedStocks: 'Imported',
    noStocksToExport: 'No stocks to export',
    clipboardEmpty: 'Clipboard is empty',
    noValidSymbols: 'No valid symbols found',
    skipped: 'Skipped',
    noNewStocks: 'No new stocks to import',
    exportFailed: 'Failed to export to clipboard',
    importFailed: 'Failed to import from clipboard',

    // Stock examples
    stockExampleTaiwan: 'Taiwan: 2330.TW (TSMC)',
    stockExampleUS: 'US: AAPL (Apple)',
    stockExampleTaiwan2: 'Taiwan: 6741.TWO (91APP)',
    stockExampleHK: 'HK: 0700.HK (Tencent)',
    stockExampleJP: 'Japan: 9983.JP (UNIQLO)',
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
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',

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
    rateLimitExceeded: 'Too many requests. Please wait a moment and try again.',
    chartType: 'Chart Type',
    lineChart: 'Line Chart',
    candlestickChart: 'Candlestick Chart',
    switchToLineChart: 'Switch to line chart',
    switchToCandlestickChart: 'Switch to candlestick chart',

    // News Panel
    latestNews: 'Latest News',
    noNewsAvailableFor: 'No news available for',
    tryCheckingLater: 'Try checking back later',
    readFullArticle: 'Read full article',

    // Footer
    poweredBy: 'Stock Dashboard - Real-time data powered by',
    madeBy: 'Made by',
    viewOnGitHub: 'View on GitHub',

    // Notification Banner
    freeHostingNotice: 'Using free hosting: Backend sleeps after 15min idle. First load may take 30-60s.',

    // Stock List Management
    defaultList: 'Default',
    createNewList: 'Create New List',
    saveAsCopy: 'Save as Copy',
    renameList: 'Rename',
    deleteList: 'Delete List',
    listName: 'List Name',
    listNamePlaceholder: 'Enter list name...',
    listNameRequired: 'List name is required',
    listNameTooLong: 'Name must be 30 characters or less',
    create: 'Create',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    listCreated: 'List created',
    listRenamed: 'List renamed',
    listDeleted: 'List deleted',
    deleteListConfirm: 'Are you sure you want to delete "{name}"?',
    deleteListWarning: 'This action cannot be undone.',
    listContainsStocks: 'This list contains {count} stocks.',
    maxListsReached: 'Maximum lists reached (5)',

    // Stock Search
    searchPlaceholder: 'Search stock symbol or name...',
    noSearchResults: 'No matching stocks found',
    tryEnterSymbol: 'Press Enter to add manually',
    marketTW: 'TW Listed',
    marketTWO: 'TW OTC',
    marketUS: 'US',
    marketJP: 'JP',
    marketHK: 'HK',
  },
  'zh-TW': {
    // Header
    appTitle: 'MarketVue',
    appSubtitle: '即時多市場股票追蹤儀表板',

    // Settings
    settings: '設定',
    appearance: '外觀',
    light: '淺色',
    dark: '深色',
    system: '系統',
    visualTheme: '視覺主題',
    classic: '經典',
    warmMinimal: '溫暖極簡',
    classicDescription: '冷色調專業外觀',
    warmMinimalDescription: '暖色調親和外觀',
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
    maxStocksReached: '最多只能新增 18 支股票',
    stockAlreadyAdded: '股票已新增',
    pleaseEnterSymbol: '請輸入股票代號',
    export: '匯出',
    import: '匯入',
    exportToClipboard: '匯出至剪貼簿',
    importFromClipboard: '從剪貼簿匯入',
    exportedToClipboard: '已匯出至剪貼簿',
    importedStocks: '已匯入',
    noStocksToExport: '沒有可匯出的股票',
    clipboardEmpty: '剪貼簿是空的',
    noValidSymbols: '找不到有效的股票代號',
    skipped: '已略過',
    noNewStocks: '沒有新的股票可匯入',
    exportFailed: '匯出至剪貼簿失敗',
    importFailed: '從剪貼簿匯入失敗',

    // Stock examples
    stockExampleTaiwan: '台股：2330.TW（台積電）',
    stockExampleUS: '美股：AAPL（Apple）',
    stockExampleTaiwan2: '台股：6741.TWO（91APP）',
    stockExampleHK: '港股：0700.HK（騰訊）',
    stockExampleJP: '日股：9983.JP（UNIQLO）',
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
    daily: '日線',
    weekly: '週線',
    monthly: '月線',

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
    rateLimitExceeded: '請求次數過多，請稍候片刻後再試',
    chartType: '圖表類型',
    lineChart: '線圖',
    candlestickChart: 'K線圖',
    switchToLineChart: '切換至線圖',
    switchToCandlestickChart: '切換至K線圖',

    // News Panel
    latestNews: '最新新聞',
    noNewsAvailableFor: '無可用新聞',
    tryCheckingLater: '請稍後再試',
    readFullArticle: '閱讀完整文章',

    // Footer
    poweredBy: '股票儀表板 - 即時資料由',
    madeBy: '製作者',
    viewOnGitHub: '在 GitHub 上查看',

    // Notification Banner
    freeHostingNotice: '採用免費託管服務：後端閒置 15 分鐘後休眠，首次載入可能需要 30-60 秒',

    // Stock List Management
    defaultList: '預設',
    createNewList: '建立新清單',
    saveAsCopy: '另存為新清單',
    renameList: '重新命名',
    deleteList: '刪除清單',
    listName: '清單名稱',
    listNamePlaceholder: '輸入清單名稱...',
    listNameRequired: '請輸入清單名稱',
    listNameTooLong: '名稱不能超過 30 個字元',
    create: '建立',
    save: '儲存',
    cancel: '取消',
    delete: '刪除',
    listCreated: '清單已建立',
    listRenamed: '清單已重新命名',
    listDeleted: '清單已刪除',
    deleteListConfirm: '確定要刪除「{name}」清單嗎？',
    deleteListWarning: '此操作無法復原。',
    listContainsStocks: '此清單包含 {count} 檔股票。',
    maxListsReached: '已達清單數量上限（5 個）',

    // Stock Search
    searchPlaceholder: '搜尋股票代號或名稱...',
    noSearchResults: '找不到符合的股票',
    tryEnterSymbol: '按 Enter 手動新增',
    marketTW: '台股上市',
    marketTWO: '台股上櫃',
    marketUS: '美股',
    marketJP: '日股',
    marketHK: '港股',
  },
};

export function useTranslation(language: Language): Translations {
  return translations[language];
}
