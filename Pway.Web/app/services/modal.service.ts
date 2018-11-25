﻿import { Injectable } from '@angular/core';

import { ModalComponent } from '../components/controls/modal.component';

/**
* ModalService - Service used to interact with the Modal Component
*/
@Injectable()
export class ModalService {
    private modals: Array<ModalComponent>;

    constructor() {
        this.modals = [];
    }

    /**
    * close - Closes the selected modal by searching for the component and setting
    * isOpen to false
    * Note: If a modal is set to be 'blocking' a user click outside of the modal will
    * not dismiss the modal, this is off my default
    * @param { String } modalId The id of the modal to close
    */
    close(modalId: string, checkBlocking = false): void {
        let modal = this.findModal(modalId);

        if (modal) {
            if (checkBlocking && modal.blocking) {
                return;
            }
            setTimeout(() => {
                modal!.isOpen = false;
            }, 250);

        }
    }

    /**
    * findModal - Locates the specified modal in the modals array
    * @param { String } modalId The id of the modal to find
    */
    findModal(modalId: string): ModalComponent|null {
        for (let modal of this.modals) {

            if (modal.modalId === modalId) {
                return modal;
            }
        }

        return null;
    }

    /**
    * open - Opens the specified modal based on the suplied modal id
    * @param { String } modalId The id of the modal to open
    */
    open(modalId: string): void {
        let modal = this.findModal(modalId);

        if (modal) {
            setTimeout(() => {
                modal!.isOpen = true;
            }, 250);
        }
    }

    /**
    * registerModal - Registers all modal components being used on initialization
    * @param { Object } newModal The new modal to add to the array of available modals
    */
    registerModal(newModal: ModalComponent): void {
        let modal = this.findModal(newModal.modalId);

        // Delete existing to replace the modal
        if (modal) {
            this.modals.splice(this.modals.indexOf(modal), 1);
        }

        this.modals.push(newModal);

    }

}