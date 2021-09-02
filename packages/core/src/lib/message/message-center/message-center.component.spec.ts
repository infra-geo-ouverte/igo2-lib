import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleNotificationsModule } from '@igo2/angular2-notifications';

import { MessageCenterComponent } from './message-center.component';

describe('NotificationComponent', () => {
  let component: MessageCenterComponent;
  let fixture: ComponentFixture<MessageCenterComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [SimpleNotificationsModule.forRoot()],
      declarations: [MessageCenterComponent]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MessageCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
