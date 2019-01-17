import { Injectable, EventEmitter } from '@angular/core';
import * as fs from 'fs-extra';
import ElectronStore from "electron-store";
import { basename, relative, isAbsolute, join } from 'path';
import { remote } from 'electron';
import * as uuid from "uuid/v4";
import { Observable } from 'rxjs';

export const UNKNOWN_FOLDER_ID = uuid();

export type Override<T, K> = Pick<T, Exclude<keyof T, keyof K>> & K;

export interface FolderMeta {
  id: string;
  name: string; // just the name (all virtual folders)
  labels: string[];
  subFolders?: FolderMeta[]; // sub folders
  notes: NoteMeta[];
}

export type FolderMetaInStore = Override<FolderMeta, {notes: string[]}>;

export interface NoteMeta {
  id: string;
  name: string;
  path: string; // path
  folder: FolderMeta;
  labels: string[];
}

export type NoteMetaInStore = Override<NoteMeta, {folder: string}>;  // only keep folder id

enum StoreKeys {
  Folders = "folders",
  Notes = "notes",
}

/**
* Here defines all states of this application.
*/
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  private _appPath = remote.app.getPath("userData");
  
  private dbFolder = "notes";
  
  // contains file structure and meta info
  readonly dataStore = new ElectronStore({name: "db"});
  
  fileStoreChange: EventEmitter<FolderMeta[]> = new EventEmitter();
  
  constructor() {
    if (!this.dataStore.has(StoreKeys.Notes)) this.dataStore.set(StoreKeys.Notes, {});
    if (!this.dataStore.has(StoreKeys.Folders)) this.dataStore.set(StoreKeys.Folders, {});
    this.fileStoreChange.emit();
  }
  
  // all notes stored in root level storage for notes
  listNotes() : NoteMeta[] {
    return Object.keys(this.dataStore.get(StoreKeys.Notes)).map(noteId => this.getNoteMeta(noteId));
  }
  
  // only top level folders stored in root level storage for folders
  listFolders() : FolderMeta[] {
    return Object.keys(this.dataStore.get(StoreKeys.Folders)).map(folderId => this.getFolderMeta(folderId));
  }
  
  private getFolderMeta(id: string): FolderMeta {
    let folder: FolderMetaInStore = this.dataStore.get(`folders.${id}`);
    let folderMeta: FolderMeta = Object.assign({}, folder, {notes: []});
    folderMeta.notes = folder.notes.map(noteId => this.getNoteMeta(noteId, folderMeta));
    return folderMeta;
  }
  
  private getNoteMeta(id: string, folder?: FolderMeta): NoteMeta {
    let note: NoteMetaInStore = this.dataStore.get(`notes.${id}`);
    if (!folder) folder = this.getFolderMeta(note.folder);
    return Object.assign({}, note, {folder}) as NoteMeta;
  }
  
  // we don't allow create multiple folders with same name on top level
  createFolderMeta(name: string, labels: string[] = []): FolderMeta {
    if (this.dataStore.has("folders") && this.dataStore.get(`folders.${name}`)) {
      return this.getFolderMeta(name);
    }
    
    const id = name === UNKNOWN_FOLDER_ID ? name : uuid();
    name = name === UNKNOWN_FOLDER_ID ? "untitled folder" : name;
    const folder = {
      id,
      name,
      labels,
      subFolders: [],
      notes: []
    }
    
    this.storeFolder(folder);
    
    return folder;
  }

  getNote(noteId: string): NoteMeta {
    return this.getNoteMeta(noteId);
  }
  
  // allow create multiple files with same title
  createNoteMeta(name: string, folder: FolderMeta, labels: string[] = []): NoteMeta {
    let id = uuid();
    let note = {
      id,
      name,
      path: join(this._appPath, this.dbFolder, id),
      labels,
      folder
    }
    folder.notes.push(note);
    this.storeNote(note);
    this.storeFolder(folder);
    return note;
  }
  
  move(noteId: string, folderId: string): NoteMeta {
    let note = this.getNoteMeta(noteId);
    note.folder.notes = note.folder.notes.filter(n => n.id !== note.id);
    note.folder = this.getFolderMeta(folderId);
    note.folder.notes.push(note);
    
    this.storeNote(note);
    return note;
  }
  
  /** Deletes note from store and local filesystem. */
  async deleteNote(noteId: string | NoteMeta) {
    let note: NoteMeta;
    if (typeof noteId === "string") {
      note = this.getNoteMeta(noteId);
    } else {
      note = noteId;
    }
    // delete the note record
    this.dataStore.delete(`notes.${noteId}`);
    
    // update folder record
    note.folder.notes = note.folder.notes.filter(n => n.id !== note.id);
    
    // delete the actual note file
    await fs.remove(note.path);
    
    // persist
    this.storeFolder(note.folder);
  }
  
  /** Deletes folder from store (since its virtual folder). */
  deleteFolder(folderId: string | FolderMeta) {
    if (typeof folderId !== "string") folderId = folderId.id;
    this.dataStore.delete(`folders.${folderId}`);
    this.fileStoreChange.emit();
  }
  
  private storeNote(note: NoteMeta) {
    this.dataStore.set(`notes.${note.id}`, Object.assign(note, {folder: note.folder.id}));
    this.fileStoreChange.emit();
  }
  
  private storeFolder(folder: FolderMeta) {
    this.dataStore.set(`folders.${folder.id}`, Object.assign(folder, {notes: folder.notes.map(note => note.id)}));
    this.fileStoreChange.emit();
  }
}
