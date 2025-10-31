# Contributing to MarketVue

Thank you for your interest in contributing to MarketVue! 感謝您對 MarketVue 的貢獻！

[English](#english) | [繁體中文](#繁體中文)

---

## English

### How to Contribute

There are many ways to contribute to MarketVue:

1. **Report Bugs** - Found a bug? Let us know!
2. **Suggest Features** - Have an idea? We'd love to hear it!
3. **Submit Code** - Want to fix a bug or add a feature? Great!
4. **Improve Documentation** - Help make our docs better
5. **Translate** - Help us support more languages

### Getting Started

#### 1. Fork the Repository

Click the "Fork" button at the top right of the repository page.

#### 2. Clone Your Fork

```bash
git clone https://github.com/your-username/marketvue.git
cd marketvue
```

#### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

#### 4. Set Up Development Environment

**Frontend:**
```bash
npm install
npm run dev
```

**Backend:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
PORT=5001 python app.py
```

### Development Guidelines

#### Code Style

**TypeScript/React:**
- Use TypeScript for type safety
- Follow React hooks best practices
- Use functional components
- Keep components small and focused
- Use meaningful variable and function names

**Python:**
- Follow PEP 8 style guide
- Use type hints where applicable
- Write docstrings for functions and classes
- Keep functions focused on single responsibility

#### Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
feat: add stock comparison feature
fix: resolve chart rendering issue
docs: update API documentation
style: format code with prettier
refactor: simplify data fetching logic
test: add unit tests for StockCard
chore: update dependencies
```

**Format:**
```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

#### Testing

Before submitting a pull request:

1. Test your changes thoroughly
2. Ensure the app runs without errors
3. Check both frontend and backend functionality
4. Test on different screen sizes (if UI changes)
5. Verify dark mode works correctly (if applicable)

### Submitting a Pull Request

1. **Push your changes:**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request:**
   - Go to your fork on GitHub
   - Click "New Pull Request"
   - Select your branch
   - Fill in the PR template with:
     - Description of changes
     - Related issues (if any)
     - Screenshots (if UI changes)
     - Testing done

3. **Wait for Review:**
   - Maintainers will review your PR
   - Address any feedback or requested changes
   - Once approved, your PR will be merged!

### Reporting Issues

When reporting bugs, please include:

- **Description**: What is the bug?
- **Steps to Reproduce**: How can we reproduce it?
- **Expected Behavior**: What should happen?
- **Actual Behavior**: What actually happens?
- **Screenshots**: If applicable
- **Environment**: OS, browser, versions, etc.

**Example:**
```
**Description**
The stock price chart doesn't update when changing time range

**Steps to Reproduce**
1. Add stock AAPL
2. Change time range from 1M to 3M
3. Chart remains unchanged

**Expected Behavior**
Chart should update to show 3 months of data

**Actual Behavior**
Chart continues to show 1 month of data

**Environment**
- OS: macOS 14.0
- Browser: Chrome 120
- Node: 18.17.0
- Python: 3.11.0
```

### Feature Requests

We welcome feature suggestions! Please include:

- **Feature Description**: What feature would you like?
- **Use Case**: Why is this feature useful?
- **Proposed Solution**: (optional) How might it work?
- **Alternatives**: (optional) Any other ways to achieve this?

### Code of Conduct

Please be respectful and considerate in all interactions. We aim to maintain a welcoming and inclusive community.

---

## 繁體中文

### 如何貢獻

您可以通過多種方式為 MarketVue 做出貢獻：

1. **報告錯誤** - 發現錯誤？請告訴我們！
2. **建議功能** - 有想法？我們很樂意聽到！
3. **提交程式碼** - 想修復錯誤或添加功能？太好了！
4. **改進文件** - 幫助我們完善文件
5. **翻譯** - 幫助我們支援更多語言

### 開始貢獻

#### 1. Fork 專案

點擊專案頁面右上角的 "Fork" 按鈕。

#### 2. Clone 您的 Fork

```bash
git clone https://github.com/your-username/marketvue.git
cd marketvue
```

#### 3. 建立分支

```bash
git checkout -b feature/你的功能名稱
# 或
git checkout -b fix/你的錯誤修復
```

#### 4. 設定開發環境

**前端：**
```bash
npm install
npm run dev
```

**後端：**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
PORT=5001 python app.py
```

### 開發指南

#### 程式碼風格

**TypeScript/React：**
- 使用 TypeScript 確保型別安全
- 遵循 React hooks 最佳實踐
- 使用函數式組件
- 保持組件小而專注
- 使用有意義的變數和函數名稱

**Python：**
- 遵循 PEP 8 風格指南
- 適當使用型別提示
- 為函數和類別編寫文件字串
- 保持函數專注於單一職責

#### Commit 訊息

我們遵循 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

```
feat: 新增股票比較功能
fix: 修復圖表渲染問題
docs: 更新 API 文件
style: 使用 prettier 格式化程式碼
refactor: 簡化資料獲取邏輯
test: 為 StockCard 添加單元測試
chore: 更新依賴套件
```

#### 測試

在提交 Pull Request 之前：

1. 徹底測試您的更改
2. 確保應用程式無錯誤運行
3. 檢查前端和後端功能
4. 測試不同螢幕尺寸（如果有 UI 更改）
5. 驗證深色模式正常工作（如適用）

### 提交 Pull Request

1. **推送您的更改：**
   ```bash
   git push origin feature/你的功能名稱
   ```

2. **建立 Pull Request：**
   - 前往 GitHub 上您的 fork
   - 點擊 "New Pull Request"
   - 選擇您的分支
   - 填寫 PR 模板，包括：
     - 更改描述
     - 相關問題（如有）
     - 截圖（如有 UI 更改）
     - 已完成的測試

3. **等待審查：**
   - 維護者將審查您的 PR
   - 處理任何回饋或請求的更改
   - 獲得批准後，您的 PR 將被合併！

### 報告問題

報告錯誤時，請包括：

- **描述**：錯誤是什麼？
- **重現步驟**：如何重現？
- **預期行為**：應該發生什麼？
- **實際行為**：實際發生了什麼？
- **截圖**：如適用
- **環境**：作業系統、瀏覽器、版本等

### 功能請求

我們歡迎功能建議！請包括：

- **功能描述**：您想要什麼功能？
- **使用案例**：為什麼這個功能有用？
- **建議的解決方案**：（可選）它可能如何工作？
- **替代方案**：（可選）實現此目標的其他方式？

### 行為準則

請在所有互動中保持尊重和體貼。我們致力於維護一個熱情和包容的社群。

---

## Questions?

Feel free to open an issue for any questions about contributing!

有任何關於貢獻的問題，歡迎開 issue 詢問！
