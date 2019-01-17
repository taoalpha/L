import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { FolderMeta, StoreService } from '../../../providers/store.service';
import { FormGroup } from '@angular/forms';

export interface AddNoteDialogData {
  name: string;
  folder?: FolderMeta;
}

@Component({
  selector: 'app-add-note-dialog',
  templateUrl: './add-note-dialog.component.html',
  styleUrls: ['./add-note-dialog.component.scss']
})
export class AddNoteDialogComponent implements OnInit {

  readonly folders: FolderMeta[] = this.store.listFolders();
  form: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AddNoteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddNoteDialogData,
    private store: StoreService
  ) {
    if (this.folders.length) data.folder = this.folders[0];
  }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}