import { Component, OnInit, Inject, NgZone } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { remote } from 'electron';
import { basename } from "path";

const { dialog } = remote;

export interface AddImportDialogData {
  name: string;
  isImport?: boolean;
  folder?: string;
}

@Component({
  selector: 'app-add-import-dialog',
  templateUrl: './add-import-dialog.component.html',
  styleUrls: ['./add-import-dialog.component.scss']
})
export class AddImportDialogComponent implements OnInit {
  constructor( public dialogRef: MatDialogRef<AddImportDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any, private zone: NgZone) { }

  ngOnInit() {
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  import() {
    dialog.showOpenDialog({
      properties: ['openDirectory']
    }, filePaths => {
      if (filePaths) this.zone.run(() => {
        this.data.name = basename(filePaths[0]);
        this.data.folder = filePaths[0];
        this.data.isImport = true;
      })
    });
  }

}
