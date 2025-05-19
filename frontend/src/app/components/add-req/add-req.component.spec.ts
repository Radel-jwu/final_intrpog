import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReqComponent } from './add-req.component';

describe('AddReqComponent', () => {
  let component: AddReqComponent;
  let fixture: ComponentFixture<AddReqComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReqComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
