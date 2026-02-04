# RIVO Node Hardware-to-Data Pipeline & WebUI Spec

**Purpose**: This document explains how the RIVO Node converts raw hardware input (I2C/UART) into standardized JSON data. It is intended to be used as a **Context/Prompt** for an AI Agent or Developer building a **WebUI Protocol Creator**.

---

## 1. The Core Data Flow

The RIVO Node is a "Universal Translator" for hardware. Instead of writing Go code for every new sensor, it loads **Protocol Definition Files (`.yaml`)**.

### The Pipeline Steps
1.  **Discovery**: The Node scans the bus (e.g., I2C address `0x76`).
2.  **Identification**: It matches the valid `.yaml` file by checking the `identify` register (e.g., "Reading register `0xD0` returns `0x60`? Then this is a BME280").
3.  **Polling Loop**:
    *   Every `interval_ms` (defined in YAML), the Node reads raw bytes from the `read.registers`.
    *   **Decode**: It converts those raw bytes into numbers (e.g., `[0x12, 0x34]` -> `4660`) using the `decode` strategy.
4.  **Mapping**: It injects these numbers into a template to create the final JSON output for the server.

---

## 2. The Output Goal (YAML)

The WebUI must generate a YAML file that looks exactly like this. This is the **Contract**.

```yaml
id: "my-custom-sensor"      # Unique ID
type: "sensor"
bus: "i2c"
address: "0x76"             # Hex Address
identify:
  whoami_reg: "0xD0"        # Register to check identity
  whoami_value: "0x60"      # Expected value
read:
  interval_ms: 500          # How often to read (milliseconds)
  registers:
    - name: "raw_temp"      # Internal variable name
      reg: "0xFA"           # Target Register
      len: 3                # Bytes to read
      decode: "bme280_temp" # Conversion Logic (int16, uint16, etc.)
map:
  status:
    sensor_overview:
      - sensor_id: "temp_1"
        sensor_type: "Temperature"
        value: "${raw_temp}"  # Variables are injected here
        unit: "C"
  telemetry:
    "/weather_topic":
      temperature: "${raw_temp}"
```

---

## 3. WebUI Requirements (Instructions for the UI Agent)

You are building a "No-Code Sensor Configurator". The user should not see YAML. They should see a friendly form.

### Step 1: Sensor Basics
*   **Sensor Name**: (Becomes `id`, e.g., "living-room-sensor")
*   **Bus Type**: Dropdown [`I2C`, `UART`] (Becomes `bus`)
*   **Address**: Text input (e.g., "0x76") (Becomes `address`)

### Step 2: Identification (Handshake)
*   "How do we know connected device is this sensor?"
*   **Register**: Text input (e.g., "0xD0")
*   **Expected Value**: Text input (e.g., "0x60")

### Step 3: Data Definitions (The "Read" Section)
Allow the user to add multiple **Data Points**. For each point:
*   **Name**: (e.g., "Temperature", internal variable name)
*   **Register Address**: (e.g., "0xFA")
*   **Length**: Number of bytes (1, 2, 4, etc.)
*   **Data Type/decoder**: Dropdown [
    `int8`, `uint8`, `int16_le`, `int16_be`, `uint16_le`, `uint16_be`, `float32`, `bme280_temp`...
    ] (This maps to the `decode` field).

### Step 4: Output Mapping (The "Map" Section)
"Where should this data go?"
*   **Live Status**: Checkbox. If checked, map to `status.sensor_overview`.
    *   *Field*: Unit (e.g., "C", "F", "%")
*   **Telemetry Graph**: Checkbox. If checked, map to `telemetry`.
    *   *Field*: Topic Name (e.g., "/weather")

### Step 5: Generate & Download
*   Button: "Download Protocol File".
*   Action: Generates the YAML file string and triggers a download of `[id].yaml`.

---

## 4. Why this matters?
This allows a user to buy a random I2C sensor from Amazon, look at its datasheet (PDF), and create a driver for the RIVO Node **without writing a single line of Go code**. The WebUI bridges the gap between the PDF datasheet and the RIVO Node's YAML engine.
