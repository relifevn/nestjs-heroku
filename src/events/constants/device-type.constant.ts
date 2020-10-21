export enum DEVICE_TYPE {
    RASPBERRY = 'raspberry',
    WEB = 'web',
    JETSON_NANO = 'jetson',

    FLAME_DETECTOR_ANDROID = 'flameDetectorAndroid', 
    DROWSINESS_DETECTOR_ANDROID = 'drowsinessDetectorAndroid',
}

export const LIST_DEVICES = Object.values(DEVICE_TYPE)