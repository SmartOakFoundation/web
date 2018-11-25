import { NgModule, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AppComponent } from './components/app/app.component';
import { GamesComponent } from './components/games/games.component';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppContextService } from './services/appContext.service';
import { EthereumService } from "./services/ethereum.service";
import { GamesService } from "./services/games.service";
import { PwayTokenService } from './services/pwaytoken.service';
import { ToastrModule } from 'ngx-toastr';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { NavMenuComponent } from './components/controls/navmenu.component';
import { FooterComponent } from './components/controls/footer.component';

import { TokenInterceptor } from './utils/token.interceptor';
import { EthAddressValidator } from './Directives/ethAddress.directive';
import { HelperService } from './services/helper.service';
import { GameKeysComponent } from './components/gameKeys/gameKeys.component';
import { PwayTokenPrec } from './pipes/pwayTokenPrec.pipe';
import { LoadingModule, ANIMATION_TYPES } from 'ngx-loading';
import { BrowserModule } from '@angular/platform-browser';
import { ModalComponent } from './components/controls/modal.component';
import { ModalService } from './services/modal.service';
import { UserGuard } from './services/userGuard.service';
import { OnlyNumber } from './Directives/onlyNumber.directive';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        ModalComponent,
        GamesComponent,
        GameKeysComponent,
        FooterComponent,
        PwayTokenPrec,
        EthAddressValidator,
        OnlyNumber,
    ],
    imports: [
        BrowserModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        LoadingModule.forRoot({
            animationType: ANIMATION_TYPES.doubleBounce,
            backdropBackgroundColour: 'rgba(255,240,240,0.3)',
            backdropBorderRadius: '4px',
            primaryColour: '#007bff',
            secondaryColour: '#ffffff',
            tertiaryColour: '#ffffff'
        }),
        BrowserAnimationsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'games', pathMatch: 'full' },
            { path: 'games', component: GamesComponent },
            { path: 'gameKeys', component: GameKeysComponent },
            { path: '**', redirectTo: 'games' }
        ], {
            scrollPositionRestoration: 'enabled',
                anchorScrolling: 'enabled'
            }),
        ToastrModule.forRoot(),
    ],
    providers: [
        { provide: 'BASE_URL', useFactory: getBaseUrl },
        AppContextService,
        EthereumService,
        GamesService,
        PwayTokenService,
        UserService,
        AuthService,
        HelperService,
        ModalService,
        UserGuard


    ],
    bootstrap: [ AppComponent ]
})

export class AppModule {
}


export function getBaseUrl() {
    return document.getElementsByTagName('base')[0].href;
}
