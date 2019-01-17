import { Injectable } from '@angular/core';
import { StoreService, FolderMeta } from './store.service';

/**
 * Here defines all states of this application.
 */
@Injectable({
  providedIn: 'root'
})
export class StateService {
  files: FolderMeta[] = this.store.listFolders();

  constructor(private store: StoreService) {
    store.fileStoreChange.subscribe(() => {
      this.files = this.store.listFolders();
    });
  }
}
