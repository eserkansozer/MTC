import { async, fakeAsync, tick, ComponentFixture, TestBed } from '@angular/core/testing';

import { PracticeQuestionComponent } from './practice-question.component';
import { AuditService } from '../services/audit/audit.service';
import { AuditServiceMock } from '../services/audit/audit.service.mock';
import { SpeechService } from '../services/speech/speech.service';
import { SpeechServiceMock } from '../services/speech/speech.service.mock';
import { StorageService } from '../services/storage/storage.service';
import { QuestionService } from '../services/question/question.service';
import { QuestionServiceMock } from '../services/question/question.service.mock';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SoundComponentMock } from '../sound/sound-component-mock';

describe('PractiseQuestionComponent', () => {
  let component: PracticeQuestionComponent;
  let fixture: ComponentFixture<PracticeQuestionComponent>;
  let mockSpeechService: SpeechServiceMock;

  beforeEach(async(() => {
    mockSpeechService = new SpeechServiceMock();

    TestBed.configureTestingModule({
      declarations: [ PracticeQuestionComponent ],
      providers: [
        { provide: AuditService, useClass: AuditServiceMock },
        { provide: SpeechService, useValue: mockSpeechService },
        { provide: QuestionService, useClass: QuestionServiceMock },
        StorageService,
        WindowRefService
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PracticeQuestionComponent);
    component = fixture.componentInstance;
    component.soundComponent = new SoundComponentMock();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('initialises the remaining time', () => {
    component['questionTimeoutSecs'] = 200;
    component.ngOnInit();
    expect(component['remainingTime']).toBe(200);
  });

  it('starts the timers', () => {
    expect(component['timeout']).toBeTruthy();
    expect(component['countdownInterval']).toBeTruthy();
  });

  describe('hasAnswer', () => {
    it('returns true for a proper answer', () => {
      component.answer = 'test';
      expect(component.hasAnswer()).toBeTruthy();
    });
    it('returns false for an empty answer', () => {
      component.answer = '';
      expect(component.hasAnswer()).toBeFalsy();
    });
  });

  describe('hasStartedAnswering', () => {
    it('returns false before input was added', () => {
      expect(component.hasStartedAnswering()).toBeFalsy();
    });
    it('returns true after input was added', () => {
      component.addChar('1');
      expect(component.hasStartedAnswering()).toBeTruthy();
    });
    it('returns true after input was added and deleted', () => {
      component.addChar('1');
      component.deleteChar();
      expect(component.hasStartedAnswering()).toBeTruthy();
    });
  });

  describe('onClickAnswer', () => {
    it('adds the input to the answer if there is room', () => {
      component.answer = '12';
      const event = {};
      component.onClickAnswer(4, event);
      expect(component.answer).toBe('124');
    });
    it('does not add the input to the answer if the answer is 5 chars long', () => {
      component.answer = '12345';
      component.onClickAnswer(6, event);
      expect(component.answer).toBe('12345');
    });
  });

  describe('onClickBackspace', () => {
    it('deletes the end character from the answer', () => {
      component.answer = '12345';
      const event = {};
      component.onClickBackspace(event);
      expect(component.answer).toBe('1234');
    });
    it('behaves when the answer is empty', () => {
      component.answer = '';
      const event = {};
      component.onClickBackspace(event);
      expect(component.answer).toBe('');
    });
  });

  describe('onSubmit', () => {
    it('emits the answer', async(() => {
      component.answer = '123';
      component.manualSubmitEvent.subscribe(g => {
        expect(g).toEqual('123');
      });
      component.onSubmit();
    }));
    it('only allows submit to happen once', async(() => {
      component.answer = '124';
      component.onSubmit(); // burn the submit
      expect(component.onSubmit()).toBeFalsy();  // test repeat submission fails
    }));
    it('returns false if the answer is too short', () => {
      component.answer = '';
      expect(component.onSubmit()).toBeFalsy();
    });
  });

  describe('sendTimeoutEvent', () => {
    it('emits the answer', (done: DoneFn) => {
      component.answer = '125';
      component.timeoutEvent.subscribe(g => {
        expect(g).toEqual('125');
        done();
      });
    });

    it('returns false for a duplicate timeout event', async () => {
      component.answer = '126';
      expect(component[ 'submitted' ]).toBe(false);
      component.sendTimeoutEvent();
      // A duplicate timeout should return false;
      const retVal = await component.sendTimeoutEvent();
      expect(retVal).toBe(false);
    });
  });

  describe('handleKeyboardEvent', () => {
    function dispatchKeyEvent(keyboardDict) {
      const event = new KeyboardEvent('keydown', keyboardDict);
      event.initEvent('keydown', true, true);
      document.dispatchEvent(event);
      return event;
    }

    it('adds to the answer when a number is given', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      const event1 = dispatchKeyEvent({ key: '1' });
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(1);
      expect(component.handleKeyboardEvent).toHaveBeenCalledWith(event1);
      expect(component.answer).toBe('1');
    });

    it('keyboard calls deleteChar when pressing Backspace or Delete', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'deleteChar').and.callThrough();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '4' });
      dispatchKeyEvent({ key: '7' });
      expect(component.answer).toBe('147');
      dispatchKeyEvent({ key: 'Backspace' });
      expect(component.deleteChar).toHaveBeenCalledTimes(1);
      expect(component.answer).toBe('14');
      dispatchKeyEvent({ key: 'Delete' });
      expect(component.answer).toBe('1');
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(5);
    });

    it('keyboard calls deleteChar when pressing "Del"', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'deleteChar').and.callThrough();
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '0' });
      expect(component.answer).toBe('10');
      dispatchKeyEvent({ key: 'Del' });
      expect(component.answer).toBe('1');
    });

    it('keyboard calls OnSubmit() when Enter is pressed (if there is an answer)', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'onSubmit').and.returnValue(null);
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: 'Enter' });
      expect(component.handleKeyboardEvent).toHaveBeenCalledTimes(2);
      expect(component.onSubmit).toHaveBeenCalledTimes(1);
      expect(component.answer).toBe('1');
    });

    it('keyboard accepts numbers', () => {
      spyOn(component, 'handleKeyboardEvent').and.callThrough();
      spyOn(component, 'addChar').and.callThrough();
      dispatchKeyEvent({ key: '0' });
      dispatchKeyEvent({ key: '1' });
      dispatchKeyEvent({ key: '2' });
      dispatchKeyEvent({ key: '3' });
      dispatchKeyEvent({ key: '4' });
      expect(component.answer).toBe('01234');
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      dispatchKeyEvent({ key: 'Backspace' });
      expect(component.answer).toBe('');
      dispatchKeyEvent({ key: '5' });
      dispatchKeyEvent({ key: '6' });
      dispatchKeyEvent({ key: '7' });
      dispatchKeyEvent({ key: '8' });
      dispatchKeyEvent({ key: '9' });
      expect(component.answer).toBe('56789');
    });
  });

  describe('preSendTimeoutEvent', () => {
    it('should play the end of question sound', () => {
      component.config.questionReader = false;
      spyOn(component.soundComponent, 'playEndOfQuestionSound');
      component.preSendTimeoutEvent();

      expect(component.soundComponent.playEndOfQuestionSound).toHaveBeenCalled();
    });

    it('should play the end of question sound after speech ends', <any>fakeAsync(() => {
      component.config.questionReader = true;
      spyOn(mockSpeechService, 'waitForEndOfSpeech').and.returnValue(
        new Promise(resolve => setTimeout(resolve, 100))
      );
      spyOn(component.soundComponent, 'playEndOfQuestionSound');
      component.preSendTimeoutEvent();

      tick(50);
      expect(mockSpeechService.waitForEndOfSpeech).toHaveBeenCalled();
      expect(component.soundComponent.playEndOfQuestionSound).not.toHaveBeenCalled();

      tick(50);
      expect(component.soundComponent.playEndOfQuestionSound).toHaveBeenCalled();
    }));
  });
});
