import { Component, NgZone} from '@angular/core';
import { EthereumService } from "../../services/ethereum.service";
import { GamesService } from '../../services/games.service';
import { GameKey } from '../../models/gamekey.model';
import { Subscription } from 'rxjs';
import { PwayTokenService } from '../../services/pwaytoken.service';

@Component({
    selector: 'gameKeys',
    templateUrl: './gameKeys.component.html'
})
export class GameKeysComponent {

    public gamesKeys: GameKey[] = [];
    subList: Array<Subscription> = new Array<Subscription>();
  
    public noMetamask: boolean = false;
    public hasKeys: boolean = false;
    public isVerified: boolean = false;
    public loading = false;

    constructor(
        private _zone: NgZone,
        public _gamesService: GamesService,
        public _tokenService: PwayTokenService,
        public _ethereumService: EthereumService) {
    }

    ngOnInit() {
        //this.subList.push(this._ethereumService.OnAccountChanged().subscribe((result: any) => {
        //    this._zone.run(() => {
        //        console.log(result);
        //        //this.handleAccountChange(result);
        //    })
        //}));
    }


    ngOnDestroy() {
        for (let sub of this.subList)
            sub.unsubscribe();
    }
}
