import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WebinarManageComponent } from './webinar-manage.component';

describe('WebinarManageComponent', () => {
  let component: WebinarManageComponent;
  let fixture: ComponentFixture<WebinarManageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebinarManageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WebinarManageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
