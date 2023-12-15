import { Component, OnInit } from '@angular/core';
import { DataService } from './data.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { User, Role, UserRoles, RankTierMapping } from './user.model';

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
  editingUser: string | null = null;
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

  constructor(private fb: FormBuilder, private dataService: DataService) {
    this.userForm = this.fb.group({
      username: [''],
      DPS_Tier: [''],
      DPS_Rank: [''],
      Support_Tier: [''],
      Support_Rank: [''],
      Tank_Tier: [''],
      Tank_Rank: [''],
    });
  }

  ngOnInit() {
    this.dataService.getUsers().subscribe((data: User) => {
      this.users = data;
    });
  }

  onSubmit(): void {
    const formValue = this.userForm.value;
    if (this.editingUser) {
      this.users[this.editingUser] = {
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
        Tank: {
          Tier: formValue.Tank_Tier,
          Rank: formValue.Tank_Rank,
          highlighted: false,
        },
      };
    } else {
      this.users[formValue.username] = {
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
        Tank: {
          Tier: formValue.Tank_Tier,
          Rank: formValue.Tank_Rank,
          highlighted: false,
        },
      };
    }

    this.uploadJson();
    this.userForm.reset();
    this.editingUser = null;
  }

  toggleEdit(username: string): void {
    this.editMode[username] = !this.editMode[username];

    if (this.editMode[username]) {
      const userData = this.users[username];
      this.userForm.setValue({
        username: username,
        DPS_Tier: userData.DPS.Tier,
        DPS_Rank: userData.DPS.Rank,
        Support_Tier: userData.Support.Tier,
        Support_Rank: userData.Support.Rank,
        Tank_Tier: userData.Tank.Tier,
        Tank_Rank: userData.Tank.Rank,
      });
    } else {
      this.uploadJson();
    }
  }

  deleteUser(username: string): void {
    if (window.confirm('Are you sure you want to delete this user?')) {
      delete this.users[username];
      this.uploadJson();
    }
  }

  uploadJson(): void {
    this.dataService.uploadJson(this.users).subscribe((data: User) => {});
  }

  getRoleData(userRoles: UserRoles, role: string): Role {
    switch (role) {
      case 'DPS':
        return userRoles.DPS;
      case 'Support':
        return userRoles.Support;
      case 'Tank':
        return userRoles.Tank;
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
