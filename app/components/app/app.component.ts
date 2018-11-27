import { Component } from '@angular/core';
import { AppContextService } from '../../services/appContext.service';
import { ToastrService } from 'ngx-toastr';
import { EthereumService } from '../../services/ethereum.service';

@Component({
    selector: 'app',
    templateUrl: './app.component.html'

})
export class AppComponent {


    constructor(
        private _appContext: AppContextService,
        private _ethereumService: EthereumService
    ) {

    }

    ngOnInit() {
        this._appContext.init(this._ethereumService);
        
      
    }



}
