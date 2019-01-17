import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FileService } from '../../providers/file.service';
import { MatDialog } from '@angular/material';
import { AddNoteDialogComponent, AddNoteDialogData } from './add-note-dialog/add-note-dialog.component';

@Component({
  selector: 'l-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @Output() sidebar: EventEmitter<null> = new EventEmitter();

  constructor(private file: FileService, private dialog: MatDialog) { }
  
  ngOnInit() {
  }

  toggleSidebar() {
    this.sidebar.emit(null);
  }

  openDialog(): void {
    const dialogRef = this.dialog.open(AddNoteDialogComponent, {
      width: '50%',
      data: {
        name: ""
      }
    });

    dialogRef.afterClosed().subscribe(async (result: AddNoteDialogData) => {
      // canceled
      if (!result) return;

      let name = result.name;
      if (name.indexOf(".") === -1) name += ".md";

      this.file.addNote(result.folder.id, name);
    });
  }
}
