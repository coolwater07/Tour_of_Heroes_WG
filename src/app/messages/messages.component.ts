import { Component } from '@angular/core';
import { MessageService } from '../message.service';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss']
})
export class MessagesComponent {
  showMessagesPanel = false;


  constructor(public messageService: MessageService) { }

  toggleMessagesPanel(): void {
    this.showMessagesPanel = !this.showMessagesPanel;
  }

  

  closePanel(): void {
    this.showMessagesPanel = false;
  }

}
