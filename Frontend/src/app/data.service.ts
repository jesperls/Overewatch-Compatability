import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, catchError, of, throwError } from 'rxjs';
import { User } from './user.model';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(private http: HttpClient) {}
  /*
{"DizzyDwarf": {"DPS": {"Rank": "5", "Tier": "Bronze", "highlighted": false}, "Support": {"Rank": 2, "Tier": "Platinum", "highlighted": false}, "Tank": {"Rank": "2", "Tier": "Silver", "highlighted": false}}, "Seth": {"DPS": {"Rank": "2", "Tier": "Bronze", "highlighted": false}, "Support": {"Rank": "2", "Tier": "Bronze", "highlighted": false}, "Tank": {"Rank": "3", "Tier": "Diamond", "highlighted": false}},

*/
  getUsers(isLocal: boolean): Observable<User> {
    let params = new HttpParams().set('local', isLocal.toString());
    return this.http.get<User>(`${environment.apiEndpoint}/get_json`, { params }).pipe(
      map((data: { [key: string]: any }) => {
        const result: { [key: string]: any } = {};
        for (const user in data) {
          const dps = data[user]['DPS'];
          const support = data[user]['Support'];
          const tank = data[user]['Tank'];
          result[user] = {
            Tank: tank,
            DPS: dps,
            Support: support,
          };
        }
        return result as User;
      })
    );
  }

  uploadJson(json: User, isLocal: boolean): Observable<any> {
    // upload json to the api endpoint on port 5000
    // when pushing to the api, set all highlighted values to false
    for (const user in json) {
      for (const role in json[user]) {
        json[user][role].highlighted = false;
      }
    }

    let params = new HttpParams().set('local', isLocal.toString());
    return this.http.post(`${environment.apiEndpoint}/upload_json`, json, { params });
  }

  validateUser(user: string, isLocal: boolean): Observable<any> {
    if (isLocal) {
      return new Observable((observer) => {
        observer.next(true);
      });
    }
    let params = new HttpParams().set('local', isLocal.toString()).set('username', user);
    return this.http.get(`${environment.apiEndpoint}/validate_player_name`, { params }).pipe(
      map(response => true),
      catchError(error => {
        if (error.status === 404) {
          return of(false);
        } else {
          return throwError(error);
        }
      })
    );
  }

  updatePlayers(isLocal: boolean): Observable<any> {
    if (isLocal) {
      return new Observable((observer) => {
        observer.next(false);
      });
    }
    return this.http.get(`${environment.apiEndpoint}/get_players`).pipe(
      map(response => true),
      catchError(error => {
        if (error.status === 429) {
          return of(false);
        } else {
          return throwError(error);
        }
      })
    );
  }
}
