---
description: 如何新增感測器範本到資料庫
---

# 新增感測器範本

## 步驟

### 1. 建立 YAML 範本檔案

根據類別選擇目錄：
- 創客感測器：`src/sensor-templates/maker/`
- 工業級感測器：`src/sensor-templates/industrial/`

範本格式：
```yaml
# 感測器名稱
id: "sensor-id"
type: "sensor"
bus: "i2c"           # i2c, uart, modbus-rtu, modbus-ascii, analog
address: "0x76"

identify:
  whoami_reg: "0xD0"
  whoami_value: "0x60"

read:
  interval_ms: 500
  registers:
    - name: "temperature"
      reg: "0xFA"
      len: 3
      decode: "int24_be >> 4"

calibrate:
  temperature:
    input: "temperature"
    expr: "value / 100.0"

map:
  status:
    sensor_overview:
      - id: "temp"
        type: "temperature"
        source: "temperature"
        unit: "°C"
  telemetry:
    environment:
      temperature: "temperature"
```

### 2. 更新範本索引

編輯 `src/sensor-templates/templates.json`，在 `templates` 陣列中新增：

```json
{
  "id": "sensor-id",
  "name": "感測器中文名稱",
  "name_en": "Sensor English Name",
  "category": "maker",
  "protocols": ["i2c"],
  "file": "maker/sensor-file.yaml",
  "tags": ["temperature", "environmental"],
  "manufacturer": "Manufacturer Name",
  "datasheet": "https://...",
  "description": "感測器描述",
  "i2c_addresses": ["0x76", "0x77"]
}
```

### 3. 驗證

重新載入協議產生器頁面，確認新範本出現在範本瀏覽器中。

## 類別說明

| 類別 ID | 名稱 | 適用場景 |
|---------|------|----------|
| `maker` | 創客感測器 | Arduino, RPi 等開發板 |
| `industrial` | 工業級感測器 | Modbus, 4-20mA 工業協議 |

## 支援的通訊協議

| 協議 | 說明 | 範例 |
|------|------|------|
| `i2c` | 雙線序列匯流排 | BME280, MPU6050 |
| `uart` | 通用非同步收發 | DHT22 |
| `modbus-rtu` | Modbus RTU 二進制 | 工業溫度計 |
| `modbus-ascii` | Modbus ASCII | 部分 PLC |
| `analog` | 4-20mA / 0-10V 類比 | 壓力傳送器 |
