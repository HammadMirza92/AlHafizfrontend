import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${this.apiUrl}/${path}`, { params });
  }

  post<T, D>(path: string, data: D): Observable<T> {
    return this.http.post<T>(`${this.apiUrl}/${path}`, data);
  }

  put<T, D>(path: string, data: D): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}/${path}`, data);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}/${path}`);
  }
}
