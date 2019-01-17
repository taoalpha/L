import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'l-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  opened: boolean;
  constructor() { }
  
  ngOnInit() {
  }

  toggleSidebar() {
    this.opened = !this.opened;
  }
  
}
