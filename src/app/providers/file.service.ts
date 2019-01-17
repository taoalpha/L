import { Injectable } from '@angular/core';
import * as fs from 'fs-extra';
import { basename, relative, isAbsolute, join } from 'path';
import { remote } from 'electron';
import { NoteMeta, StoreService, FolderMeta } from './store.service';
import {UNKNOWN_FOLDER_ID} from "./store.service";

/**
* The service that handle all note / folder read / write / create
*/

@Injectable({
  providedIn: 'root'
})
export class FileService {
  
  private _appPath = remote.app.getPath("userData");
  private dbFolder = "notes";
  
  constructor(private store: StoreService) { }
  
  /**
  * Creates a note with a give folder and a give name
  */
  async addNote(folderId: string = UNKNOWN_FOLDER_ID, title: string = "untitled.md"): Promise<NoteMeta> {
    let note = this.store.createNoteMeta(title, this.store.createFolderMeta(folderId));
    await fs.ensureFile(note.path);
    return note;
  }
  
  async importFolder(folderPath: string): Promise<number> {
    let count = 0;
    await fs.copy(folderPath, join(this._appPath, this.dbFolder), {
      async filter(src: string) {
        // copy over all md | html | text files
        if (fs.statSync(src).isDirectory()) return false;
        else if (src.endsWith(".md") || src.endsWith(".html") || src.endsWith(".text")) {
          await this.addNote(UNKNOWN_FOLDER_ID, src);
          count++;
          return true;
        }
        return false;
      }
    });
    
    return count; 
  }
  
  /**
  * Creates a folder with a give name.
  */
  async addFolder(folder: string) : Promise<FolderMeta> {
    return this.store.createFolderMeta(folder);
  }
  
  async moveNote(noteId: string, folderId: string) {
    return this.store.move(noteId, folderId);
  }
  
  async deleteFolder(folder: FolderMeta, deleteAllFiles?: boolean) {
    // move all files to UNKNOWN_FOLDER_ID
    let folders = [folder];
    while (folders.length) {
      folder = folders.pop();
      folder.notes.forEach(note => {
        if (!deleteAllFiles) this.store.move(note.id, UNKNOWN_FOLDER_ID);
        else this.store.deleteNote(note.id);
      });
      folder.subFolders.forEach(f => {
        folders.push(f);
      });
    }

    // delete the folder
    this.store.deleteFolder(folder.id);
  }

  async listFiles(folder: string, filter: (fileName: string) => boolean, recursive?: boolean) {
    const fileNames = fs.readdirSync(join(this._appPath, folder));
    return fileNames.filter(filter);
  }
}
