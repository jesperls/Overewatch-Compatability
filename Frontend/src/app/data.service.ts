import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from './user.model'; // Adjust the path as needed


@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private http: HttpClient) { }
/*
{"DizzyDwarf": {"DPS": {"Rank": "5", "Tier": "Bronze", "highlighted": false}, "Support": {"Rank": 2, "Tier": "Platinum", "highlighted": false}, "Tank": {"Rank": "2", "Tier": "Silver", "highlighted": false}}, "Seth": {"DPS": {"Rank": "2", "Tier": "Bronze", "highlighted": false}, "Support": {"Rank": "2", "Tier": "Bronze", "highlighted": false}, "Tank": {"Rank": "3", "Tier": "Diamond", "highlighted": false}},

*/
  getUsers(): Observable<any> {
    // get users from the api endpoint on port 5000
    return this.http.get('https://darkrage.pro/api/get_json');
  }

  uploadJson(json: User): Observable<any> {
    // upload json to the api endpoint on port 5000
    // when pushing to the api, set all highlighted values to false
    for (const user in json) {
      for (const role in json[user]) {
        json[user][role].highlighted = false;
      }
    }
    return this.http.post('https://darkrage.pro/api/upload_json', json);
  }
}