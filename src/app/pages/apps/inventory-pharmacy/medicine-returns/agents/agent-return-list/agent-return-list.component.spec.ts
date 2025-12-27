import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentReturnListComponent } from './agent-return-list.component';

describe('AgentReturnListComponent', () => {
  let component: AgentReturnListComponent;
  let fixture: ComponentFixture<AgentReturnListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgentReturnListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AgentReturnListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
