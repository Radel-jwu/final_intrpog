import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransferComponentHtmlComponent } from './transfer.component.html.component';

describe('TransferComponentHtmlComponent', () => {
  let component: TransferComponentHtmlComponent;
  let fixture: ComponentFixture<TransferComponentHtmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransferComponentHtmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransferComponentHtmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
