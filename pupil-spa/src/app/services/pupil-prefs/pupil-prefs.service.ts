import { Injectable } from '@angular/core';
import { APP_CONFIG } from '../config/config.service';
import { AzureQueueService } from '../azure-queue/azure-queue.service';
import { Http, RequestOptions, Headers } from '@angular/http';
import { StorageService } from '../storage/storage.service';
import { TokenService } from '../token/token.service';
import { queueNames } from '../azure-queue/queue-names';
import { accessArrangementsDataKey, AccessArrangementsConfig, AccessArrangements } from '../../access-arrangements';
import { Pupil } from '../../pupil';
import { AuditService } from '../audit/audit.service';
import { PupilPrefsAPICalled, PupilPrefsAPICallSucceeded, PupilPrefsAPICallFailed } from '../audit/auditEntry';

@Injectable()
export class PupilPrefsService {

  featureUseHpa;
  pupilPrefsAPIErrorDelay;
  pupilPrefsAPIErrorMaxAttempts;
  accessArrangements;
  fontSettings;
  contrastSettings;

  constructor(private azureQueueService: AzureQueueService,
              private http: Http,
              private storageService: StorageService,
              private tokenService: TokenService,
              private auditService: AuditService) {
    const { featureUseHpa,
      pupilPrefsAPIErrorDelay,
      pupilPrefsAPIErrorMaxAttempts
    } = APP_CONFIG;
    this.featureUseHpa = featureUseHpa;
    this.pupilPrefsAPIErrorDelay = pupilPrefsAPIErrorDelay;
    this.pupilPrefsAPIErrorMaxAttempts = pupilPrefsAPIErrorMaxAttempts;
    this.fontSettings = AccessArrangementsConfig.fontSettings;
    this.contrastSettings = AccessArrangementsConfig.contrastSettings;
  }

  public async storePupilPrefs() {
    if (!this.featureUseHpa) {
      return;
    }
    const accessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    const fontSetting = this.fontSettings.find(f => f.val === accessArrangements.fontSize);
    const contrastSetting = this.contrastSettings.find(f => f.val === accessArrangements.contrast);
    const pupil = this.storageService.getItem('pupil') as Pupil;
    const queueName = queueNames.pupilPreferences;
    const {url, token} = this.tokenService.getToken('pupilPreferences');
    const retryConfig = {
      errorDelay: this.pupilPrefsAPIErrorDelay,
      errorMaxAttempts: this.pupilPrefsAPIErrorMaxAttempts
    };
    const payload = {
      preferences: {
        fontSizeCode: null,
        colourContrastCode: null
      },
      version: 1,
      checkCode: pupil.checkCode
    };
    if (fontSetting) {
      payload.preferences.fontSizeCode = fontSetting.code;
    }
    if (contrastSetting) {
      payload.preferences.colourContrastCode = contrastSetting.code;
    }
    try {
      this.auditService.addEntry(new PupilPrefsAPICalled());
      await this.azureQueueService.addMessage(queueName, url, token, payload, retryConfig);
      this.auditService.addEntry(new PupilPrefsAPICallSucceeded());
    } catch (error) {
      this.auditService.addEntry(new PupilPrefsAPICallFailed(error));
    }
  }

  public loadPupilPrefs() {
    this.accessArrangements = new AccessArrangements();
    const appliedAccessArrangements = this.storageService.getItem(accessArrangementsDataKey);
    // Fetch prefs from current session stored within local storage
    this.accessArrangements.fontSize = appliedAccessArrangements && appliedAccessArrangements.fontSize;
    this.accessArrangements.contrast = appliedAccessArrangements && appliedAccessArrangements.contrast;
    if (this.accessArrangements.fontSize && this.accessArrangements.contrast) {
      return;
    }
    // Fetch prefs from check config or assign default values
    const config = this.storageService.getItem('config');
    if (!this.accessArrangements.contrast) {
      this.contrastSettings = AccessArrangementsConfig.contrastSettings;
      const contrastSetting = config && this.contrastSettings.find(f => f.code === config.colourContrastCode);
      this.accessArrangements.contrast = (contrastSetting && contrastSetting.val) || 'bow';
    }
    if (!this.accessArrangements.fontSize) {
      this.fontSettings = AccessArrangementsConfig.fontSettings;
      const fontSetting = config && this.fontSettings.find(f => f.code === config.fontSizeCode);
      this.accessArrangements.fontSize = (fontSetting && fontSetting.val) || 'regular';
    }
    this.storageService.setItem(accessArrangementsDataKey, this.accessArrangements);
  }
}
