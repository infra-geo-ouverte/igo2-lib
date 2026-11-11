export interface ToastConfig {
  timeOut: number;
  extendedTimeOut: number;
  closeButton: boolean;
  progressBar: boolean;
  tapToDismiss: boolean;
  positionClass: string;
  maxOpened: number;
  preventDuplicates: boolean;
  enableHtml: boolean;
  disableTimeOut: boolean;
  showIcon: boolean;
  freezeProgressOnHover: boolean;
}

export type IndividualToastConfig = Partial<ToastConfig>;

export interface ToastRef {
  toastId: number;
  message: string;
  title: string;
  type: ToastType;
  config: ToastConfig;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning' | 'show';

export const DEFAULT_TOAST_CONFIG: ToastConfig = {
  timeOut: 10000,
  extendedTimeOut: 10000,
  closeButton: true,
  progressBar: true,
  tapToDismiss: true,
  positionClass: 'toast-bottom-right',
  maxOpened: 4,
  preventDuplicates: true,
  enableHtml: true,
  disableTimeOut: false,
  showIcon: false,
  freezeProgressOnHover: true
};
