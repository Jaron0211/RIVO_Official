---
description: 如何新增節點類型到視覺化編輯器
---

# 新增節點類型

## 步驟

### 1. 更新 SimpleNodeEditor

編輯 `src/simple-node-editor.js`：

#### 定義輸入/輸出埠
在 `getNodeInputs(type)` 和 `getNodeOutputs(type)` 中新增：

```javascript
case 'process/your_node_type':
    return ['input1', 'input2'];  // 輸入埠名稱
```

```javascript
case 'process/your_node_type':
    return ['result'];  // 輸出埠名稱
```

#### 定義預設屬性
在 `getDefaultProperties(type)` 中新增：

```javascript
case 'process/your_node_type':
    return {
        property1: 'default_value',
        property2: 0
    };
```

#### 定義節點標題
在 `getNodeTitle(type)` 中新增：

```javascript
case 'process/your_node_type':
    return '你的節點名稱';
```

### 2. 更新 palette 面板（如果需要）

在 `docs/zh/protocol-creator.html` 的 `.node-palette` 中新增：

```html
<div class="palette-node" draggable="true" data-node-type="YourNodeType">
    <div class="palette-node-title">節點名稱</div>
    <div class="palette-node-desc">節點描述說明</div>
</div>
```

### 3. 更新類型映射

在 `protocol-creator.html` 的 `initializeVisualEditor()` 函數中更新 `typeMap`：

```javascript
const typeMap = {
    // ...existing types
    'YourNodeType': 'process/your_node_type'
};
```

### 4. 更新 YAML 生成器

編輯 `src/yaml-generator.js`，在 `generateEnhancedYAML` 中處理新節點類型：

```javascript
const yourNodes = nodes.filter(n => n.type === 'process/your_node_type');

if (yourNodes.length > 0) {
    yaml += "\nyour_section:\n";
    yourNodes.forEach(node => {
        yaml += `  - property1: "${node.properties.property1}"\n`;
    });
}
```

## 節點類型命名規範

| 前綴 | 用途 | 範例 |
|------|------|------|
| `input/` | 輸入資料來源 | `input/sensor`, `input/constant` |
| `process/` | 資料處理 | `process/calibration`, `process/bit_shift` |
| `output/` | 輸出對應 | `output/status`, `output/telemetry` |

## 節點顏色定義

在 `drawNode(node)` 方法中，根據類型設定顏色：

```javascript
if (node.type.startsWith('input/')) {
    this.ctx.fillStyle = '#E0F2FE';  // 淺藍
} else if (node.type.startsWith('process/')) {
    this.ctx.fillStyle = '#FEF9C3';  // 淺黃
} else if (node.type.startsWith('output/')) {
    this.ctx.fillStyle = '#DCFCE7';  // 淺綠
}
```
