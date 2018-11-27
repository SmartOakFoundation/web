import { Component,} from '@angular/core';

@Component({
    selector: 'SmartOakfooter',
    templateUrl: './footer.component.html'
})
export class FooterComponent {

    public year: number;

    constructor() {
        this.year = new Date().getFullYear();
    }
    
}
