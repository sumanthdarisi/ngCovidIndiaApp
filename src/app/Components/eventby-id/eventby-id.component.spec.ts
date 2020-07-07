import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EventbyIDComponent } from './eventby-id.component';

describe('EventbyIDComponent', () => {
  let component: EventbyIDComponent;
  let fixture: ComponentFixture<EventbyIDComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EventbyIDComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EventbyIDComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
