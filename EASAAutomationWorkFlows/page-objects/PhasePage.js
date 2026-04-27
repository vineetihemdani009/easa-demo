// pages/PhasePage.js
import { expect } from '@playwright/test';
import { UiHelpers } from '../utils/uiHelpers';


function excelDateToUiString(v) {
  // If Excel gave serial number
  if (typeof v === 'number') {
    const d = new Date(Math.round((v - 25569) * 86400 * 1000));
    return `${d.getMonth() + 1}/${d.getDate()}/${d.getFullYear()}`;
  }

  // If Excel already string like "07/01/2026"
  return String(v).trim();
}

export class PhasePage {
  constructor(page) {
    this.page = page;
    this.phaseIdLocator = this.page.locator('[data-test-id="20190510022618055338234"]');
    this.phaseStatusLocator = this.page.locator('[data-test-id="2016083016191602341167946"]');
    this.startDateInput = this.page.locator('[data-test-id="202309280859110159127"]');
    this.reminderDateInput = this.page.locator('input[data-test-id="202204061001380130998"][name="$PpyWorkPage$ppySLAGoal"]:not([disabled])').first();
    //this.dueDateInput = this.page.locator('[data-test-id="202204061001380132295"]');
    this.dueDateInput = this.page.locator('input[data-test-id="202204061001380132295"][name="$PpyWorkPage$ppySLADeadline"][data-editinput="DateTime-Calendar"]:not([disabled])');
    // Phase Duration dropdown (Surveillance only)
    this.phaseDurationSelect = this.page.locator('[data-test-id="202310121320400345980"]');
    this.ui = new UiHelpers(page);
  }

  //---Create a new Phase ---
  async createPhase(type, desc) {

    //---Click on Create Phase Link---
    await this.page.locator('[data-test-id="202201041753370952402"]').click();

    //--- Select Phase Type from drop down list---
    await this.page.locator('[data-test-id="202011111720010458772"]').selectOption(type);

    //---Provide Description of the Phase---
    await this.page.locator('[data-test-id="202011111723140860463"]').fill(desc);

  }

  //---Create Phase without Providing the Description ---
  async createPhaseWithErrorMessage(type, desc) {

    //---Click on Create Phase Link---
    await this.page.locator('[data-test-id="202201041753370952402"]').click();

    //--- Select Phase Type from drop down list---
    await this.page.locator('[data-test-id="202011111720010458772"]').selectOption(type);

    //---Provide Description of the Phase---
    await this.page.locator('[data-test-id="202011111723140860463"]').fill('');

  }

  //---Provide Description of the Phase---

  async prvoideDescription(desc) {

    //---Provide Description of the Phase---
    await this.page.locator('[data-test-id="202011111723140860463"]').fill(desc);
  }


  async logPhaseDescriptionErrors() {
    const phaseDescriptionField = this.page.locator('[data-test-id="202011111723140860463"]');

    await this.ui.logFieldError(
      phaseDescriptionField,
      'Phase Description',
      'Value cannot be blank'
    );
  }

  //--- Provide Start Date---
  async createStartDate(data) {

    await this.startDateInput.fill(String(data.StartDate));
    await this.startDateInput.press('Tab');
  }

  //--- Provide Reminder Date---
  async createReminderDate(data) {
    await this.reminderDateInput.fill(String(data.ReminderDate));
    await this.reminderDateInput.press('Tab'); // commit in Pega

  }

  //--- Provide Due Date---
  async createDueDate(data) {
    const phaseType = String(data?.PhaseType || '').trim().toLowerCase();

    if (phaseType.includes('surveillance')) return;

    await this.dueDateInput.fill(String(data?.DueDate ?? ''));
    await this.dueDateInput.press('Tab');

  }

  //--- Provide Phase Duration---
  async selectPhaseDurationIfSurveillance(data) {
    const phaseType = String(data.PhaseType || '').toLowerCase();
    if (!phaseType.includes('surveillance')) return;

    // Excel should provide MOA12 / MOA24 / MOA48 etc.
    await this.phaseDurationSelect.selectOption(String(data.PhaseDuration));
  }

  //---Click on Create button to complete Phase creation---
  async savePhaseDetails() {
    await this.page.locator('[data-test-id="20161017110917023277518"]').click();

  }


  //---Open Phase Id Details---
  async openPhaseID(phaseID) {

    //--- Provide Phase ID to open it--- 
    await this.page.getByRole('link', { name: phaseID }).click();
    

  }


  //---Save and Display Phase Id and Status---
  async capturePhaseData() {
    // wait until visible
    await expect(this.phaseIdLocator.first()).toBeVisible();

    const phaseId = await this.phaseIdLocator.first().textContent();
    const phaseStatus = await this.phaseStatusLocator.first().textContent();

    console.log('Phase ID:', phaseId);
    console.log('Phase Status:', phaseStatus);

    //return { phaseId, phaseStatus };
  }


  //--- Check if Team Lead is Added in Phase Team or not---
  async isNoPhaseTeamMember() {
    const phaseTeamMember = await this.page.getByRole('heading', { name: 'Phase team (0)' }).textContent();
    return phaseTeamMember?.includes('(0)') ?? false;

  }

  //---Error Message when no Team Member Added ---
  async verifyNoTeamMemberErrorMessage() {
    const errorMessage = this.page.locator('[data-test-id="202407081023360359917"]');

    await expect(errorMessage).toBeVisible();

    await expect(errorMessage).toHaveText('Before creating any activity, you have to add a Team Leader to the Phase.');

    const messageText = await errorMessage.textContent();
    console.log('Error message displayed:', messageText);
  }

  //---Add Team Member to the Phase---
  async addTeamMemberToPhaseTeam(role, name) {

    await this.page.locator('button[name="pyCaseMainInner_pyWorkPage_43"]').click();
    await this.page.locator('button[name="CaseStakeholders_pyWorkPage_3"]').click(); 

    await this.page.locator('[data-test-id="2015020216382502883175"]').selectOption(role);

  const nameInput = this.page.locator('[data-test-id="2015020217035309525865"]');

  await nameInput.click();
   await nameInput.clear();


  await nameInput.pressSequentially(name, { delay: 100 });
  const firstOption = this.page.locator('#autocomplete_option_row_0').first();
  await expect(firstOption).toBeVisible();
  await firstOption.click();

   await this.page.getByRole('button', { name: 'Submit' }).click();

  }
}
