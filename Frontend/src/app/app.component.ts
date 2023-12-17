import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User, Role, UserRoles, RankTierMapping } from './user.model';
import { Observable } from 'rxjs';

const rankTierMapping: RankTierMapping = {
  Bronze: 0,
  Silver: 5,
  Gold: 10,
  Platinum: 15,
  Diamond: 20,
  Master: 30,
  Grandmaster: 40,
};

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  users: User = {};
  editMode: { [key: string]: boolean } = {};
  userForm: FormGroup;
  currentlyEditing: string | null = null;
  tiers = [
    'Bronze',
    'Silver',
    'Gold',
    'Platinum',
    'Diamond',
    'Master',
    'Grandmaster',
  ];
  ranks = [1, 2, 3, 4, 5];
  selectedRankNumeric: number = 0;
  public isLocal = false;

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.userForm = this.fb.group({
      Tank_Tier: [''],
      Tank_Rank: [''],
      username: [''],
      DPS_Tier: [''],
      DPS_Rank: [''],
      Support_Tier: [''],
      Support_Rank: [''],
    });
  }
// {"DizzyDwarf": {"DPS": {"Rank": "5", "Tier": "Bronze", "highlighted": false}, "Support": {"Rank": 2, "Tier": "Platinum", "highlighted": false}, "Tank": {"Rank": "2", "Tier": "Silver", "highlighted": false}}, "Seth": {"DPS": {"Rank": "2", "Tier": "Bronze", "highlighted": false}, "Support": {"Rank": "2", "Tier": "Bronze", "highlighted": false}, "Tank": {"Rank": "3", "Tier": "Diamond", "highlighted": false}},
  ngOnInit() {
    this.getJson();
  }

  getJson(): void {
    this.dataService.getUsers(this.isLocal).subscribe((data: User) => {
      this.users = data;
    });
  }

  changeLocal(): void {
    this.isLocal = !this.isLocal;
    this.getJson();
  }

  onSubmit(): void {
    const formValue = this.userForm.value;
    this.dataService.validateUser(formValue.username, this.isLocal).subscribe((valid: boolean) => {
      if (valid) {
        this.addUser(formValue);
      } else {
        alert('Invalid username');
      }
    });
  }

  addUser(formValue: any): void {
    this.users[formValue.username] = {
      Tank: {
        Tier: formValue.Tank_Tier,
        Rank: formValue.Tank_Rank,
        highlighted: false,
      },
      DPS: {
        Tier: formValue.DPS_Tier,
        Rank: formValue.DPS_Rank,
        highlighted: false,
      },
      Support: {
        Tier: formValue.Support_Tier,
        Rank: formValue.Support_Rank,
        highlighted: false,
      },
    };
    this.uploadJson().subscribe(() => {
      this.dataService.updatePlayers(this.isLocal).subscribe(() => {
        this.getJson();
      });
    });
    this.userForm.reset();
  }

  toggleEdit(username: string): void {
    this.editMode[username] = !this.editMode[username];
    if (this.editMode[username]) {
      const userData = this.users[username];
      this.userForm.setValue({
        username: username,
        Tank_Tier: userData.Tank.Tier,
        Tank_Rank: userData.Tank.Rank,
        DPS_Tier: userData.DPS.Tier,
        DPS_Rank: userData.DPS.Rank,
        Support_Tier: userData.Support.Tier,
        Support_Rank: userData.Support.Rank,
      });
    } else {
      this.uploadJson().subscribe(() => {});
    }
  }

  deleteUser(username: string): void {
    if (window.confirm('Are you sure you want to delete this user?')) {
      delete this.users[username];
      this.uploadJson().subscribe(() => {});
    }
  }

  updateUsers(): void {
    if(!this.isLocal) {
      this.dataService.updatePlayers(this.isLocal).subscribe((updated: any) => {
        if (updated) {
          this.getJson();
        } else {
          alert('Users was updated less than 1 minute ago. Please try again later.');
        }
      });
    }
  }

  uploadJson(): Observable<any> {
    return this.dataService.uploadJson(this.users, this.isLocal);
  }

  keepOriginalOrder = (a: { key: string; value: any }, b: { key: string; value: any }) => {
    return 0;
  };
  
  getRoleData(userRoles: UserRoles, role: string): Role {
    switch (role) {
      case 'Tank':
        return userRoles.Tank;
      case 'DPS':
        return userRoles.DPS;
      case 'Support':
        return userRoles.Support;
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }

  convertRankToNumeric(tier: string, rank: number): number {
    return rankTierMapping[tier] + (5 - rank);
  }

  selectUser(selectedTier: string, selectedRank: number): void {
    this.selectedRankNumeric = this.convertRankToNumeric(
      selectedTier,
      selectedRank
    );
    this.highlightCompatibleUsers(this.selectedRankNumeric);
  }

  highlightCompatibleUsers(selectedRankNumeric: number) {
    for (const userKey in this.users) {
      for (const role in this.users[userKey]) {
        const userRank = this.users[userKey][role as keyof UserRoles];
        const userRankNumeric = this.convertRankToNumeric(
          userRank.Tier,
          userRank.Rank
        );
        if (Math.abs(selectedRankNumeric - userRankNumeric) <= 10) {
          userRank.highlighted = true;
        } else {
          userRank.highlighted = false;
        }
      }
    }
  }
}
