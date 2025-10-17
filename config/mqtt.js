const mqtt = require("mqtt");
const SensorData = require("../models/SensorData");
const {
  calculateTHIStatus,
  calculateSoundStatus,
  calculatePostureStatus,
} = require("../utils/statusCalculator");
const AlertService = require("../services/alertService"); // ✅ DITAMBAHKAN INI

let io; // Socket.IO instance

function initSocketIO(socketInstance) {
  io = socketInstance;
}

function initMQTT() {
  const brokerUrl = process.env.MQTT_BROKER_URL;
  const username = process.env.MQTT_USERNAME;
  const password = process.env.MQTT_PASSWORD;

  const options = {
    username,
    password,
    rejectUnauthorized: false,
  };

  const client = mqtt.connect(brokerUrl, options);

  client.on("connect", () => {
    console.log("✅ Connected to MQTT Broker");

    const topics = ["esp32/sensors", "esp32/audio", "jetson"];
    client.subscribe(topics, (err) => {
      if (err) console.log("❌ Subscribe Failed:", err);
      else console.log("✅ Subscribed to:", topics);
    });
  });

  client.on("message", async (topic, messageBuffer) => {
    const message = messageBuffer.toString();
    let parsed;

    try {
      parsed = JSON.parse(message);
    } catch (err) {
      console.log("❌ Invalid JSON Received:", message);
      return;
    }

    let finalData = { topic, raw: parsed, status: {} };

    // === THI PROCESS (ESP32 SENSOR) ===
    if (topic === "esp32/sensors") {
      const { thi, thi_status } = calculateTHIStatus(parsed.temp, parsed.hum);
      finalData.status = { thi, thi_status };
    }

    // === SOUND PROCESS ===
    if (topic === "esp32/audio") {
      const sound_status = calculateSoundStatus(parsed.db_level);
      finalData.status = { sound_status };
    }

    // === JETSON POSTURE ===
    if (topic === "jetson") {
      const { posture_status, LT, LBD } = calculatePostureStatus(
        parsed.current_posture,
        parsed.total_time_seen_s,
        parsed.last_posture_since_s
      );
      finalData.status = { posture_status, LT, LBD };
    }

    // ✅ === TRIGGER WA ALERT SERVICE DI SINI ===
    await AlertService.processSensorData({
      sensorType:
        topic === "esp32/sensors"
          ? "temperature"
          : topic === "esp32/audio"
          ? "sound"
          : topic === "jetson"
          ? "camera"
          : "other",
      sensorId: parsed.id ? String(parsed.id) : "device-1",
      data: { ...parsed, ...finalData.status },
    });

    // === Save ke MongoDB jika mau histori ===
    try {
      await SensorData.create({
        topic,
        sensorType:
          topic === "esp32/sensors"
            ? "temperature"
            : topic === "esp32/audio"
            ? "sound"
            : topic === "jetson"
            ? "camera"
            : "other",
        sensorId: parsed.id ? String(parsed.id) : "device-1",
        data: { ...parsed, ...finalData.status },
        timestamp: new Date(),
      });
    } catch (err) {
      console.log("⚠️ MongoDB Save Failed:", err.message);
    }

    // === Emit ke Frontend ===
    if (io) {
      io.emit("realtime-data", {
        ...finalData,
        timestamp: new Date().toISOString(),
      });
    }

    console.log("📡 Realtime Emit:", finalData);
  });

  client.on("error", (err) => {
    console.log("❌ MQTT Error:", err);
  });
}

module.exports = { initMQTT, initSocketIO };
