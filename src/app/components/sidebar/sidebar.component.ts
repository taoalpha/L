import { Component, OnInit, NgZone, Output, EventEmitter } from '@angular/core';
import * as fs from 'fs-extra';
import { relative, isAbsolute, join } from 'path';
import { StoreService, FolderMeta, NoteMeta } from '../../providers/store.service';
import { MatDialog } from '@angular/material';
import { AddImportDialogComponent, AddImportDialogData } from './add-import-dialog/add-import-dialog.component';
import { FileService } from '../../providers/file.service';
import { StateService } from '../../providers/state.service';
import { Router, ActivatedRoute, RoutesRecognized } from '@angular/router';
import { switchMap } from 'rxjs/operators';

interface FileInfo {
  name: string;
  isDir: boolean;
  path: string;
  children?: FileInfo[];
}

@Component({
  selector: 'l-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  
  @Output() sidebar: EventEmitter<null> = new EventEmitter();
  
  activeNoteId: string;
  
  constructor(
    private readonly store: StoreService,
    readonly state: StateService,
    private readonly file: FileService,
    private readonly dialog: MatDialog,
    private readonly router: Router,
    private readonly route: ActivatedRoute
    ) { }
    
    ngOnInit() {
      this.route.firstChild.paramMap.subscribe(params => {
        this.activeNoteId = params.get("id");
      })
    }
    
    openDialog(): void {
      const dialogRef = this.dialog.open(AddImportDialogComponent, {
        width: '50%',
        data: {
          name: ""
        }
      });
      
      dialogRef.afterClosed().subscribe(async (result: AddImportDialogData) => {
        // canceled
        if (!result) return;
        
        if (result.isImport) {
          // import files in background process
          await this.file.importFolder(result.folder);
        } else {
          // create one
          // TODO: allow create nested folders
          await this.file.addFolder(result.name);
        }
      });
    }
    
    deleteNote(note: NoteMeta) {
      this.store.deleteNote(note);
    }
    
    deleteFolder(folder: FolderMeta) {
      this.store.deleteFolder(folder);
    }
    
    openNote(note: NoteMeta) {
      this.router.navigateByUrl(`home/note/${note.id}`);
      this.sidebar.emit(null);
    }
    
    toggleSidebar() {
      this.sidebar.emit(null);
    }
  }
  