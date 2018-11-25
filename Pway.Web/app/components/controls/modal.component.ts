import { Component, HostListener, Input, OnInit } from '@angular/core';
import { ModalService } from '../../services/modal.service';

/**
 * ModalComponent - This class represents the modal component.
 * @requires Component
 */

@Component({
  selector: 'app-modal',
  styleUrls: ['modal.component.scss'],
  templateUrl: './modal.component.html'
})

export class ModalComponent implements OnInit {

  isOpen: boolean = false;

  @Input() closebtn: boolean;
  @Input() modalId: string;
  @Input() modalTitle: string;
  @Input() blocking: boolean;
  @HostListener('document:keyup', ['$event'])
  /**
  * keyup - Checks keys entered for the 'esc' key, attached to hostlistener
  */
  keyup(event: KeyboardEvent): void {
    if (event.keyCode === 27) {
      this.modalService.close(this.modalId, true);
    }
  }

  constructor(private modalService: ModalService) { }

  /**
  * ngOnInit - Initiated when component loads
  */
  ngOnInit() {
    this.modalService.registerModal(this);
  }

  /**
  * close - Closes the selected modal
  */
  close(checkBlocking = false): void {
    this.modalService.close(this.modalId, checkBlocking);
  }

}