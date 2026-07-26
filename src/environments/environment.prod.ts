const BASE_API_URL = 'http://192.168.0.229';

export const environment = {
  production: false,
  PATIENT_RECORD_API_URL: `${BASE_API_URL}:8081/api/v1/patient-records`,
  PATIENT_CONSULTATION_API_URL: `${BASE_API_URL}:8082/api/v1/patient-consultation`,
  PATIENT_DIAGNOSIS_API_URL: `${BASE_API_URL}:8083/api/v1/patient-diagnosis`,
  BRANDS_API_URL: `${BASE_API_URL}:8084/api/v1/brands`,
  POS_API_URL: `${BASE_API_URL}:8085/api/v1/pos`,
  STOCK_ADJUSTMENT_API_URL: `${BASE_API_URL}:8086/api/v1/stock-adjustment`,
  MEDICAL_HISTORY_API_URL: `${BASE_API_URL}:8087/api/v1/medical-history`,
  PDF_API_URL: `${BASE_API_URL}:8088/api/v1/pdf`,
  MEDICINE_API_URL: `${BASE_API_URL}:8089/api/v1/medicine`,
  STOCK_RECEIVING_API_URL: `${BASE_API_URL}:8090/api/v1/stock-receiving`,
  POS_PATIENT_RETURN_API_URL: `${BASE_API_URL}:8091/api/v1/patient-medicine-return`
}
