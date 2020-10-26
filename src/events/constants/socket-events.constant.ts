export enum SOCKET_EVENT {
  TEMPERATURE_POST = 'temperature-post',
  TEMPERATURE_GET = 'temperature-get',

  FLAME_SENSOR_POST = 'flame-sensor-post',
  FLAME_SENSOR_GET = 'flame-sensor-get',

  CAMERA_RAW_POST = 'camera-raw-post',
  CAMERA_RAW_GET = 'camera-raw-get',

  CAMERA_FILTER_POST = 'camera-filter-post',
  CAMERA_FILTER_GET = 'camera-filter-get',

  GPS_POST = 'gps-post',
  GPS_GET = 'gps-get',

  DETECT_FLAME_GET = 'detect-flame-get',
  DETECT_FLAME_POST = 'detect-flame-post',

  CALL = 'call',
  SEND_SMS = 'send-sms',

  DROWSINESS_DETECTION_POST = 'drowsiness-detect-post',
  DROWSINESS_DETECTION_GET = 'drowsiness-detect-get',
}

