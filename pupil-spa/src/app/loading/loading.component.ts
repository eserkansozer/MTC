import { Component, AfterViewInit, Input, Output, EventEmitter, HostListener, ElementRef, OnDestroy } from '@angular/core';
import { AuditService } from '../services/audit/audit.service';
import { PauseRendered } from '../services/audit/auditEntry';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { Question } from '../services/question/question.model';
import { Config } from '../config.model';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})

export class LoadingComponent implements AfterViewInit, OnDestroy {

  protected config: Config;
  protected nextButtonDelayFinished = false;

  @Input()
  public question: Question = new Question(0, 0, 0);

  @Input()
  public total = 0;

  @Input()
  public loadingTimeout: number;

  @Output()
  timeoutEvent: EventEmitter<any> = new EventEmitter();

  @Input() public familiarisationCheck = false;

  constructor(protected auditService: AuditService,
              protected questionService: QuestionService,
              protected speechService: SpeechService,
              protected elRef: ElementRef) {
    this.config = this.questionService.getConfig();
  }

  /**
   * Prevent Backspace doing anything while the load-page is showing - some browsers will
   * go back a page.
   *
   * @param {KeyboardEvent} event
   */
  @HostListener('document:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // console.log(`loading.component: handleKeyboardEvent() called: key: ${event.key} keyCode: ${event.keyCode}`);
    // IMPORTANT: return false here
    event.preventDefault();

    const key = event.key;

    switch (key) {
      case 'Enter':
        this.sendTimeoutEvent();
        break;
    }

    return false;
  }

  addAuditServiceEntry() {
    this.auditService.addEntry(new PauseRendered({
      sequenceNumber: this.question.sequenceNumber,
      question: `${this.question.factor1}x${this.question.factor2}`
    }));
  }

  ngAfterViewInit() {
    this.addAuditServiceEntry();
    // wait for the component to be rendered first, before parsing the text
    if (this.config.speechSynthesis) {
      this.speechService.speakElement(this.elRef.nativeElement);

      if (!this.config.nextBetweenQuestions) {
        setTimeout(() => {
          this.speechService.waitForEndOfSpeech().then(() => {
            this.sendTimeoutEvent();
          });
        }, this.loadingTimeout * 1000);
      } else {
        setTimeout(() => { this.nextButtonDelayFinished = true; }, 1000);
      }
    } else {
      if (!this.config.nextBetweenQuestions) {
        setTimeout(() => {
          this.sendTimeoutEvent();
        }, this.loadingTimeout * 1000);
      } else {
        setTimeout(() => { this.nextButtonDelayFinished = true; }, 1000);
      }
    }
    if (this.config.nextBetweenQuestions) {
      this.elRef.nativeElement.querySelector('#goButton').focus();
    }
  }

  sendTimeoutEvent() {
    this.timeoutEvent.emit(null);
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.config.speechSynthesis) {
      this.speechService.cancel();
    }
  }
}
