import { Component, OnInit, ElementRef, Input, NgZone, ViewChild } from '@angular/core';
import marked from 'marked';
import { Router, ActivatedRoute, ParamMap } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { StoreService, NoteMeta } from '../../providers/store.service';
import * as fs from 'fs-extra';

@Component({
  selector: 'app-note',
  templateUrl: './note.component.html',
  styleUrls: ['./note.component.scss']
})
export class NoteComponent implements OnInit {

  note: string;
  @ViewChild('noteContainer') noteContainer: ElementRef;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private store: StoreService,
    private zone: NgZone
  ) {}
  
  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      let noteId = params.get("id");
      this.loadNote(this.store.getNote(noteId));
    });
  }

  loadNote(note: NoteMeta) {
    this.zone.runOutsideAngular(() => {
      fs.readFile(note.path, "utf-8")
      .then(fileContent => {
        this.zone.run(() => {
          this.note = fileContent;
          this.noteContainer.nativeElement.innerHTML = marked(fileContent);
        });
      });
    });
  }
}
