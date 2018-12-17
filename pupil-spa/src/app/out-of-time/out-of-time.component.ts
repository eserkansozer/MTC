import { Component, OnInit, AfterViewInit, ElementRef, OnDestroy } from '@angular/core';
import { WindowRefService } from '../services/window-ref/window-ref.service';
import { SpeechService } from '../services/speech/speech.service';
import { QuestionService } from '../services/question/question.service';
import { AppInsights } from 'applicationinsights-js';
import { StorageService } from '../services/storage/storage.service';

@Component({
  selector: 'app-out-of-time',
  templateUrl: './out-of-time.component.html',
  styleUrls: ['./out-of-time.component.scss']
})
export class OutOfTimeComponent implements OnInit, AfterViewInit, OnDestroy {

  protected window: any;
  protected numQuestions: number;
  protected numCompleted: number;
  private speechListenerEvent: any;

  constructor(protected windowRefService: WindowRefService,
              private storageService: StorageService,
              private questionService: QuestionService,
              private speechService: SpeechService,
              private elRef: ElementRef) {
    this.window = windowRefService.nativeWindow;
    const timeoutData = this.storageService.getItem('time_out');
    if (timeoutData) {
        this.numQuestions = timeoutData.numQuestions;
        this.numCompleted = timeoutData.numCompleted;
    }
  }

  ngOnInit() {
    this.window.ga('send', {
      hitType: 'pageview',
      page: '/out-of-time'
    });
    AppInsights.trackPageView('Check complete', '/out-of-time');
  }

  // wait for the component to be rendered first, before parsing the text
  ngAfterViewInit() {
    if (this.questionService.getConfig().questionReader) {
      this.speechService.speakElement(this.elRef.nativeElement).then(() => {
        this.speechService.focusEndOfSpeech(this.elRef.nativeElement.querySelector('#sign-out'));
      });

      this.speechListenerEvent = this.elRef.nativeElement.addEventListener('focus',
        (event) => { this.speechService.focusEventListenerHook(event); },
        true
      );
    }
  }

  ngOnDestroy(): void {
    // stop the current speech process if the page is changed
    if (this.questionService.getConfig().questionReader) {
      this.speechService.cancel();

      this.elRef.nativeElement.removeEventListener('focus', this.speechListenerEvent, true);
    }
  }
}
