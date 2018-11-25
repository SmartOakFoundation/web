import { Component, NgZone } from '@angular/core';
import { AuthService } from '../../services/auth.service';

@Component({
    selector: 'nav-menu',
    templateUrl: './navmenu.component.html'
})
export class NavMenuComponent {

    public isSignin: boolean;
    public isAdmin: boolean;
    public userEmail: string;

    constructor(
        private _zone: NgZone,
        private _authService: AuthService) {

        _authService.OnLoginChanged().subscribe((result) => {
            this.isSignin = result.email != "";
            if (this.isSignin)
                this.isAdmin = result.isAdmin;
            else
                this.isAdmin = false;

            this._zone.run(() => {
              
                if (this.isSignin) {
                    this.userEmail = result.email;
                }
                else
                    this.userEmail = "";

            });
        });
      
    }

    public logout() {
        this._authService.logOut();
    }

    ngOnInit() {

        
    }
}
