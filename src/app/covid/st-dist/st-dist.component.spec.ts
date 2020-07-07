import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StDistComponent } from './st-dist.component';

describe('StDistComponent', () => {
  let component: StDistComponent;
  let fixture: ComponentFixture<StDistComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StDistComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StDistComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
