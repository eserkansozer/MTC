import { APP_CONFIG } from '../config/config.service';
import { AuditService } from '../audit/audit.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import {
  CheckSubmissionApiCalled,
  CheckSubmissionAPIFailed,
  CheckSubmissionAPICallSucceeded,
} from '../audit/auditEntry';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SubmissionService } from '../submission/submission.service';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';

/**
 * Declaration of check start service
 */
@Injectable()
export class CheckCompleteService {

  checkSubmissionApiErrorDelay;
  checkSubmissionAPIErrorMaxAttempts;
  featureUseHpa;
  submissionPendingViewMinDisplay;

  constructor(private auditService: AuditService,
              private azureQueueService: AzureQueueService,
              private router: Router,
              private storageService: StorageService,
              private submissionService: SubmissionService,
              private tokenService: TokenService) {
    const { featureUseHpa,
      checkSubmissionApiErrorDelay,
      checkSubmissionAPIErrorMaxAttempts,
      submissionPendingViewMinDisplay,
    } = APP_CONFIG;
    this.checkSubmissionApiErrorDelay = checkSubmissionApiErrorDelay;
    this.checkSubmissionAPIErrorMaxAttempts = checkSubmissionAPIErrorMaxAttempts;
    this.featureUseHpa = featureUseHpa;
    this.submissionPendingViewMinDisplay = submissionPendingViewMinDisplay;
  }

  /**
   * Sleep function (milliseconds) to provide minimal display time for submission pending screen
   * @param {Number} ms
   * @returns {Promise.<void>}
   */
  private sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check complete submission
   * @param {Number} startTime Date time in milliseconds on the exact moment before check submission is called
   * @returns {Promise.<void>}
   */
  public async submit(startTime): Promise<void> {
    const config = this.storageService.getItem('config');
    if (config.practice) {
      return;
    }
    if (this.featureUseHpa === true) {
      const queueName = queueNames.checkComplete;
      const {url, token} = this.tokenService.getToken('checkComplete');
      const retryConfig = {
        errorDelay: this.checkSubmissionApiErrorDelay,
        errorMaxAttempts: this.checkSubmissionAPIErrorMaxAttempts
      };
      this.auditService.addEntry(new CheckSubmissionApiCalled());
      const payload = this.storageService.getAllItems();
      const excludedItems = ['access_token', 'checkstate', 'pending_submission', 'completed_submission'];
      excludedItems.forEach(i => delete payload[i]);
      payload.checkCode = payload && payload.pupil && payload.pupil.checkCode;
      try {
        await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
        this.auditService.addEntry(new CheckSubmissionAPICallSucceeded());
        this.onSuccess(startTime);
      } catch (error) {
        this.auditService.addEntry(new CheckSubmissionAPIFailed(error));
        this.router.navigate(['/submission-failed']);
      }
    } else {
      this.auditService.addEntry(new CheckSubmissionApiCalled());
      try {
        await this.submissionService.submitData().toPromise();
        this.auditService.addEntry(new CheckSubmissionAPICallSucceeded());
        this.onSuccess(startTime);
      } catch (error) {
        this.router.navigate(['/submission-failed']);
      }
    }
  }

  /**
   * On success handler
   * @param {Number} startTime
   * @returns {Promise.<void>}
   */
  async onSuccess(startTime): Promise<void> {
    this.storageService.setItem('pending_submission', false);
    this.storageService.setItem('completed_submission', true);
    // Display pending screen for the minimum configurable time
    const endTime = Date.now();
    const duration = endTime - startTime;
    const minDisplay = this.submissionPendingViewMinDisplay;
    if (duration < minDisplay) {
      const displayTime = minDisplay - duration;
      await this.sleep(displayTime);
    }
    this.router.navigate(['/check-complete']);
  }
}
