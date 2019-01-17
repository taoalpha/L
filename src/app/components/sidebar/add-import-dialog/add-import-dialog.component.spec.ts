import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddImportDialogComponent } from './add-import-dialog.component';

describe('AddImportDialogComponent', () => {
  let component: AddImportDialogComponent;
  let fixture: ComponentFixture<AddImportDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddImportDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddImportDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
