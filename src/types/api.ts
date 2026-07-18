export interface ApiResponseEnvelope<T> {
  statusCode: number;
  success: boolean;
  data: T;
  errors: string[] | null;
}
