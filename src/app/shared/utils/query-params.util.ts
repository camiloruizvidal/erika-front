export class QueryParamsUtil {
  static construir(params: Record<string, any>): string {
    const queryParams = new URLSearchParams();
    
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        queryParams.append(key, String(value));
      }
    });
    
    return queryParams.toString();
  }
}

