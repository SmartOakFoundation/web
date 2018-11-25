import { Component} from '@angular/core';
import { EthereumService } from "../../services/ethereum.service";
import { GamesService } from '../../services/games.service';
import { ModalService } from '../../services/modal.service';
import { Game } from '../../models/game.model';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';
import { PwayTokenService } from '../../services/pwaytoken.service';
import { AppContextService } from '../../services/appContext.service';
import { UserService } from '../../services/user.service';
import { BigNumber } from 'bignumber.js';
import { GameKey } from '../../models/gamekey.model';
import { ServiceEvent } from '../../models/serviceEvent';
import { AuthService } from '../../services/auth.service';
import { HubConnection } from '@aspnet/signalr';
import * as signalR from '@aspnet/signalr';
import { timer } from 'rxjs';

@Component({
    selector: 'games',
    templateUrl: './games.component.html'
})
export class GamesComponent {

    public gamesList: Game[];
    public selectedGame: Game;
    public usersGamesList: Game[];
    public usersGamesKeys: GameKey[];
    public usersKeys: string[];
    public selectedTitle: string;
    subList: Array<Subscription> = new Array<Subscription>();

    public pwayBalance: BigNumber;
    public noMetamask: boolean = false;
    public noAccount: boolean = false;
    public wrongNetwork: boolean = false;
    public balanceEmpty: boolean = false;
    public allowance: BigNumber ;

    public amount: number;
   
    public hasKeys: boolean = false;
    public isVerified: boolean = false;

    public loadingUserKeys = false;

    public loadingGames = true;

    public loadingUserGames = true;
    public loadingUserGamesText:string;

    public loadingEth = true;
    public loadingEthText = '';

    public approveMessage: string;
    private _hubConnection: HubConnection;
    public loadingApprove: boolean = false;


    constructor(
        public _gamesService: GamesService,
        private _userService: UserService,
        public _tokenService: PwayTokenService,
        public _ethereumService: EthereumService,
        private toastr: ToastrService,
        private _appContextService: AppContextService) {

    }

    ngOnInit() {
        this.loadingEthText = "Loading account data..."
        this.subList.push(this._ethereumService.OnStateChanged().subscribe((result: any) => this.handleOnStateChange(result)));

        this._gamesService.getGamesList().subscribe(result => this.handleGamesList(result));

        this._hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this._appContextService.hostname + 'notify')
            .configureLogging(signalR.LogLevel.Information)
            .build();

        this._hubConnection
            .start()
            .then(() => console.log('Connection started!'))
            .catch(err => console.log('Error while establishing connection :('));

        this._hubConnection.on('BroadcastNewGameBought', (value: string) => {
            this.toastr.success('Your new game key is now available!', 'New Game Key', {
                timeOut: 4000
            });
            if (value == this._ethereumService.currentAccount) {
                this.refreshAccountData();
            }
        });
    }

    private handleUsersGamesList(_games: Game[]) {
        this.usersGamesList = _games;
        console.log(_games);
        this.loadingUserGames = false;
    }

    public clearKeys() {
        this.usersGamesKeys = [];
        this.selectedTitle = "";
    }

    private handleUsersGameKeys(_keys: GameKey[]) {
        this.selectedTitle = _keys[0].Name;
        this.usersGamesKeys = _keys;
        this.loadingUserKeys = false;

    }

    private handleGamesList(_games: Game[]) {
        _games.forEach(x => {
        });
        this.gamesList = _games;
        this.loadingGames = false;
    }

    public getFilteredGameList(): Game[] {
        return this.usersGamesList;
    }

    public copyMessage(val: string) {
        let selBox = document.createElement('textarea');
        selBox.style.position = 'fixed';
        selBox.style.left = '0';
        selBox.style.top = '0';
        selBox.style.opacity = '0';
        selBox.value = val;
        document.body.appendChild(selBox);
        selBox.focus();
        selBox.select();
        document.execCommand('copy');
        document.body.removeChild(selBox);

        this.toastr.success('to clipboard', 'Key copied', {
            timeOut: 1000
        });
    }

    public setGame(_game: Game) {
        this.selectedGame = _game;
        this.loadingUserKeys = true;
        this.selectedTitle = _game.Name;
        this._gamesService.getGameKeys(_game).subscribe(result => {
            this.handleUsersGameKeys(result);
        });

    }

    public topupWallet(amount: number) {
        var decimalPlaces = this.decimalPlaces(amount);
        if (amount == undefined || decimalPlaces > 11 ) {
            this.loadingApprove = false;
            this.amount = undefined;
            this.toastr.error('"Ups.. to crazy number"', 'Change PWAY on store', {
                timeOut: 10000
            });
        }
        else {
            this.loadingApprove = true;
            this.approveMessage = "Waiting for Metamask..."
            this._tokenService.approve(this._appContextService.pwayStoreAddress, amount.toString() + "00000000000").subscribe(
                (result: any) => this.handleApprove(result),
                err => {
                    console.log(err);
                    this.approveMessage = "";
                    this.amount = undefined;
                    this.resetLoading();

            });
        }
    }

    public authenticateUser() {
        this.loadingUserGames = true;
        this.loadingUserGamesText = "Please go to Metamask and accept transaction..."
        this._userService.authenticateUser().subscribe((result) => {
            this.isVerified = result
            if (result) {
                this.loadingUserGamesText = '';
                this._gamesService.getUsersGames().subscribe(result => this.handleUsersGamesList(result),
                    err => this.loadingUserGames = false);
            }
            else {
                this.loadingUserGames = false;
                this.loadingUserGamesText = '';
            }
           

        }, err => {
            console.log(err);
            this.loadingUserGames = false;
            this.loadingUserGamesText = '';

        });
    }

    public buyGame(game: Game) {
        game.WaitingForBuy = true;
        game.WaitingForBuyText = "Waiting for Metamask...";
        this._gamesService.buyGame(game.EthereumId).subscribe(
            (result: any) => this.handleBuyGame(result, game),
            error => {
                game.WaitingForBuy = false;
                game.WaitingForBuyText = '';

                var errorMessage = 'Check If You have available PWays on Store account';
                if (error.message && error.message.indexOf("User denied transaction signature") !== -1) {
                    errorMessage = "User denied transaction"
                }
                this.toastr.error(errorMessage, 'Transaction not possible', {
                    timeOut: 10000
                });
            });
    }

    private handleBuyGame(result: any, game:Game) {
        if (result.status == 1) {
            game.WaitingForBuyText = "Waiting for transaction to complete...";
        }
        else {
            game.WaitingForBuy = false;
            game.WaitingForBuyText = '';
            this.refreshAccountData();
        }
       
    }

    private handleApprove(result: any) {
        if (result.status == 1) {
            this.approveMessage = "Waiting for transaction to complete..."
        }
        else {
            this.refreshAccountData();
        }
    }

    public CanShowBuyButton(game: Game) {
        var price = new BigNumber(game.Price);
        if (this.pwayBalance)
            return this.pwayBalance.gte(price) && game.HasAnyLicence;
        else
            return false;
        
    }

     public refreshAccountData() {

        this._tokenService.getPwayBalance()
            .flatMap((result) => {
                console.log("getBalance " + JSON.stringify(result) + this._ethereumService.currentAccount);
                this.pwayBalance = result;;
                this.balanceEmpty = !result.gt(0);
                return this._tokenService.allowance(this._appContextService.pwayStoreAddress);
            })
            .flatMap((result) => {
                this.allowance = result;
                return this._userService.isUserAuthenticated();
            })
            .subscribe((result) => {
                this.isVerified = result;
                if (result) {
                    this._gamesService.getUsersGames().subscribe(result => {
                        this.handleUsersGamesList(result)
                        this.resetLoading();
                    }, err => this.loadingUserGames = false);
                }
                else {
                    this.resetLoading();
                }
                this.noAccount = false;
            }, (err) => {
                console.log(err);
                this.resetLoading();
            });

    }


    private resetLoading() {
        this.loadingEth = false;
        this.loadingApprove = false;
        this.loadingUserGames = false;
    }

    public handleOnStateChange(data: any) {
        if (data.event == ServiceEvent.Idle) {
            this.loadingEth = true;
        }
        else if (data.event == ServiceEvent.AccountChanged) {
            this.loadingEth = true;
            this.refreshAccountData();
        }
        else if (data.event == ServiceEvent.AccountNotFound) {
            console.error("account not found");
            this.loadingEth = false;
            this.loadingUserGames = false;
            this.noAccount = true;
        }
        else if (data.event == ServiceEvent.MetamaskNotDetected) {
            this.noMetamask = true;
            this.wrongNetwork = false;
            this.loadingEth = false;
            this.loadingUserGames = false;
        }
        else if (data.event == ServiceEvent.MetamaskDetected) {
            this.noMetamask = false;
        } else if (data.event == ServiceEvent.MetamaskDetectedWrongNetwork) {
            this.noMetamask = false;
            this.wrongNetwork = true;
            this.loadingEth = false;
            this.loadingUserGames = false;
        }
    }

    private decimalPlaces(num: number) {
        var match = ('' + num).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        if (!match) { return 0; }
        return Math.max(
            0,
            // Number of digits right of decimal point.
            (match[1] ? match[1].length : 0)
            // Adjust for scientific notation.
            - (match[2] ? +match[2] : 0));
    }

    public closeModal() {
        this.amount = undefined;
    }

    ngOnDestroy() {
        for (let sub of this.subList)
            sub.unsubscribe();
    }
}
