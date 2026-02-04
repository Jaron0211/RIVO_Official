# RIVO Visual Protocol Editor - JSON Schema Documentation

## Overview

This document defines the JSON schema for the RIVO Visual Protocol Editor. The schema describes all node types, their properties, and the connections between them.

## Schema Version

Current version: **1.0**

## Top-Level Structure

```json
{
  "version": "1.0",
  "metadata": { ... },
  "nodes": [ ... ],
  "edges": [ ... ]
}
```

## Node Types

### 1. Sensor Input Node (`input/sensor`)

Reads raw data from a sensor register.

**Properties:**
- `register` (string, required): Register address in hex format (e.g., "0xFA")
- `length` (integer, required): Number of bytes to read (1-16)
- `decoder` (string, required): Data decoder type
- `variable_name` (string, required): Variable name for the reading

**Supported Decoders:**
- `int8`, `uint8`
- `int16_le`, `int16_be`, `uint16_le`, `uint16_be`
- `int32_le`, `int32_be`, `uint32_le`, `uint32_be`
- `float32`
- `bme280_temp`, `bme280_press`, `bme280_hum`

**Outputs:**
- `raw_value` (number)

**Example:**
```json
{
  "id": "sensor_1",
  "type": "input/sensor",
  "position": { "x": 100, "y": 100 },
  "data": {
    "register": "0xFA",
    "length": 3,
    "decoder": "bme280_temp",
    "variable_name": "raw_temp"
  }
}
```

### 2. Constant Node (`input/constant`)

Defines a constant value for use in calibrations.

**Properties:**
- `name` (string, required): Constant name
- `value` (number, required): Constant value

**Outputs:**
- `value` (number)

**Example:**
```json
{
  "id": "const_1",
  "type": "input/constant",
  "position": { "x": 100, "y": 200 },
  "data": {
    "name": "offset",
    "value": 32.0
  }
}
```

### 3. Calibration Node (`process/calibration`)

Applies a mathematical expression to transform data.

**Properties:**
- `expression` (string, required): Mathematical expression
- `description` (string, optional): Human-readable description

**Expression Syntax:**
- Variables: `$input`, `$const_name`
- Operators: `+`, `-`, `*`, `/`, `^` (power)
- Functions: `abs()`, `sqrt()`, `pow()`, `log()`, `exp()`

**Inputs:**
- `input` (number)

**Outputs:**
- `result` (number)

**Example:**
```json
{
  "id": "calib_1",
  "type": "process/calibration",
  "position": { "x": 300, "y": 100 },
  "data": {
    "expression": "$input * 1.8 + 32",
    "description": "Convert Celsius to Fahrenheit"
  }
}
```

### 4. Math Function Node (`process/math`)

Applies a predefined mathematical function.

**Properties:**
- `function` (string, required): Function name
- `parameter` (number, optional): Parameter for functions like `pow`

**Supported Functions:**
- `abs`: Absolute value
- `sqrt`: Square root
- `pow`: Power (requires parameter)
- `log`: Natural logarithm
- `log10`: Base-10 logarithm
- `exp`: Exponential
- `sin`, `cos`, `tan`: Trigonometric functions
- `round`, `floor`, `ceil`: Rounding functions

**Inputs:**
- `input` (number)

**Outputs:**
- `result` (number)

**Example:**
```json
{
  "id": "math_1",
  "type": "process/math",
  "position": { "x": 300, "y": 200 },
  "data": {
    "function": "sqrt",
    "parameter": null
  }
}
```

### 5. Output Status Node (`output/status`)

Maps data to real-time status display.

**Properties:**
- `sensor_id` (string, required): Unique sensor identifier
- `sensor_type` (string, required): Sensor type
- `unit` (string, optional): Unit of measurement
- `min_value` (number, optional): Minimum expected value
- `max_value` (number, optional): Maximum expected value

**Inputs:**
- `value` (number)

**Example:**
```json
{
  "id": "output_status_1",
  "type": "output/status",
  "position": { "x": 500, "y": 100 },
  "data": {
    "sensor_id": "sensor_temp_1",
    "sensor_type": "Temperature",
    "unit": "C",
    "min_value": -40,
    "max_value": 85
  }
}
```

### 6. Output Telemetry Node (`output/telemetry`)

Maps data to telemetry/charting system.

**Properties:**
- `topic` (string, required): Telemetry topic path
- `field` (string, required): Field name within topic
- `sample_rate` (integer, optional): Sampling rate in ms

**Inputs:**
- `value` (number)

**Example:**
```json
{
  "id": "output_telem_1",
  "type": "output/telemetry",
  "position": { "x": 500, "y": 200 },
  "data": {
    "topic": "/weather",
    "field": "temperature",
    "sample_rate": 500
  }
}
```

## Edges (Connections)

Edges define data flow between nodes.

**Properties:**
- `id` (string, required): Unique edge identifier
- `source` (object, required): Source node and port
  - `node_id` (string): Source node ID
  - `port` (string): Output port name
- `target` (object, required): Target node and port
  - `node_id` (string): Target node ID
  - `port` (string): Input port name
- `data_type` (string, optional): Data type flowing through edge

**Example:**
```json
{
  "id": "edge_1",
  "source": {
    "node_id": "sensor_1",
    "port": "raw_value"
  },
  "target": {
    "node_id": "calib_1",
    "port": "input"
  },
  "data_type": "number"
}
```

## Complete Example

```json
{
  "version": "1.0",
  "metadata": {
    "id": "bme280-protocol",
    "name": "BME280 Temperature Sensor",
    "description": "Temperature sensor with Celsius to Fahrenheit conversion",
    "author": "RIVO Team",
    "created": "2026-02-05T00:00:00Z"
  },
  "nodes": [
    {
      "id": "sensor_1",
      "type": "input/sensor",
      "position": { "x": 100, "y": 100 },
      "data": {
        "register": "0xFA",
        "length": 3,
        "decoder": "bme280_temp",
        "variable_name": "raw_temp"
      }
    },
    {
      "id": "const_offset",
      "type": "input/constant",
      "position": { "x": 100, "y": 250 },
      "data": {
        "name": "fahrenheit_offset",
        "value": 32.0
      }
    },
    {
      "id": "calib_1",
      "type": "process/calibration",
      "position": { "x": 350, "y": 100 },
      "data": {
        "expression": "$input * 1.8 + $fahrenheit_offset",
        "description": "Convert to Fahrenheit"
      }
    },
    {
      "id": "output_1",
      "type": "output/status",
      "position": { "x": 600, "y": 100 },
      "data": {
        "sensor_id": "temp_sensor_1",
        "sensor_type": "Temperature",
        "unit": "F"
      }
    }
  ],
  "edges": [
    {
      "id": "edge_1",
      "source": { "node_id": "sensor_1", "port": "raw_value" },
      "target": { "node_id": "calib_1", "port": "input" },
      "data_type": "number"
    },
    {
      "id": "edge_2",
      "source": { "node_id": "calib_1", "port": "result" },
      "target": { "node_id": "output_1", "port": "value" },
      "data_type": "number"
    }
  ]
}
```

## Validation Rules

1. **Node IDs** must be unique within the graph
2. **Edge IDs** must be unique within the graph
3. **Variable names** must follow snake_case pattern (`[a-z_][a-z0-9_]*`)
4. **Register addresses** must be in hex format (`0x[0-9A-Fa-f]+`)
5. **Data types** in edges must match between source output and target input
6. **Constant references** in expressions must match defined constant names
7. **Cyclic connections** are not allowed
8. **Output nodes** must have at least one input connection

## Expression Language

### Variables
- `$input`: The input value from the connected node
- `$const_name`: Reference to a constant node's value

### Operators
- `+`, `-`, `*`, `/`: Basic arithmetic
- `^`: Power (exponentiation)
- `()`: Grouping

### Functions
- `abs(x)`: Absolute value
- `sqrt(x)`: Square root
- `pow(x, y)`: x to the power of y
- `log(x)`: Natural logarithm
- `log10(x)`: Base-10 logarithm
- `exp(x)`: e to the power of x

### Example Expressions
```
$input * 1.8 + 32
($input - 32) / 1.8
$input * $scale_factor + $offset
sqrt($input ^ 2 + $const_y ^ 2)
```
