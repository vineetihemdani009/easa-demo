import { test } from '@playwright/test';
import { getData } from '../utils/excel.js';
import { LoginPage } from '../page-objects/LoginPage.js';
import { SearchPage } from '../page-objects/SearchPage.js';
import { PhasePage } from '../page-objects/PhasePage.js';
import { ActivityPage } from '../page-objects/ActivityPage.js';
import { LogoutPage } from '../page-objects/LogoutPage.js';

test('ESA Base Framework (Excel + POM)', async ({ page }) => {

  const variant = (process.env.ESA_VARIANT || 'V1').trim().toUpperCase();
  const data = getData(variant);

  const login = new LoginPage(page);
  const search = new SearchPage(page);
  const phase = new PhasePage(page);
  const activity = new ActivityPage(page);
  const logout = new LogoutPage(page);

  await login.login(process.env.ESA_USERNAME, process.env.ESA_PASSWORD);
  await page.waitForTimeout(2000);
  
  await search.openApproval(data.approval.ApprovalNumber);
  await page.waitForTimeout(5000);

  await phase.createPhase(data.phase.PhaseType, data.phase.PhaseDescription);

  await phase.createStartDate(data.phase);
  await phase.selectPhaseDurationIfSurveillance(data.phase);
  await phase.createReminderDate(data.phase);
  await phase.createDueDate(data.phase);
  await phase.savePhaseDetails();
  await phase.capturePhaseData();
  await page.waitForTimeout(2000);

  
  //--- Click on Create Activity button---
  await activity.createActivity(data.activity);

  //---Select Activity Type---
  await activity.selectActivity(data.activity);

  //---Select Estimated Start Date of Activity---
  await activity.selectActivityStartDate(data.activity);

  //---Select Estimated End Date of Activity---
  await activity.selectActivityEndDate(data.activity);

  //---Add Auditor details to the Activity---
  await activity.addAuditor(data.activity);

  //---Add Checklist to the Activity---
  await activity.addCheckList(data.activity);

  //---Add Location to the Activity---
  await activity.addLocation(data.activity);

  //--- Save Activity Details---
  await activity.saveActivityDetails();

  //---Save and Display Activity ID---
  await activity.readActivityID();

  //---Display Activity Status--
  await activity.readActivityStatus();

  await page.waitForTimeout(5000);

  await logout.logout();
  await page.close();

});
