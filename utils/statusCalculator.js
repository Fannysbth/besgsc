// utils/statusCalculator.js

function calculateTHIStatus(temp, hum) {
  // Rumus THI
  const thi = (1.8 * temp + 32) - ((0.55 - 0.0055 * hum) * (1.8 * temp - 26));

  let thi_status = "Normal";
  if (thi < 74) thi_status = "Normal";
  else if (thi >= 75 && thi <= 78) thi_status = "Siaga";
  else if (thi >= 79 && thi <= 83) thi_status = "Bahaya";
  else if (thi > 84) thi_status = "Sangat Bahaya";

  return { thi: parseFloat(thi.toFixed(2)), thi_status };
}

function calculateSoundStatus(db) {
  if (db >= 50 && db <= 70) return "Normal";
  if (db > 70 && db <= 85) return "Waspada";
  if (db > 85) return "Urgent";
  return "Unknown";
}

function calculatePostureStatus(posture, total_time_seen_s, last_posture_since_s) {
  // Convert detik ke jam
  const LT = total_time_seen_s / 3600;
  const LBD = last_posture_since_s / 60;

  let status = "Normal";
  if (LT > 14.72 || LBD > 42.6) status = "Warning";

  return { posture_status: status, LT, LBD };
}

module.exports = {
  calculateTHIStatus,
  calculateSoundStatus,
  calculatePostureStatus,
};
