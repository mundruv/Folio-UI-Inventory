import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../../helpers/setup-application';
import ModesOfIssuance from '../../../interactors/settings/modes-of-issuance/modes-of-issuance';

describe('Modes of issuance', () => {
  function mockData() {
    this.server.create('issuance-mode', {
      id : '3363cdb1-e644-446c-82a4-dc3a1d4395b9',
      name : 'Monograph',
      source : 'rdamodeissue'
    });
    this.server.create('issuance-mode', {
      id : '526aa04d-9289-4511-8866-349299592c18',
      name : 'Serial',
      source : 'rdamodeissue'
    });
    this.server.create('issuance-mode', {
      id : '6312d172-f0cf-40f6-b27d-9fa8feaf332f',
      name : 'Other',
      source : 'rdamodeissue'
    });
  }

  describe('User has permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'settings.inventory.enabled': true,
        'ui-inventory.settings.list.view': true,
        'ui-inventory.settings.modes-of-issuance': true
      }
    });

    beforeEach(mockData);
    describe('viewing modes of issuance list', () => {
      beforeEach(function () {
        this.visit('/settings/inventory/modesofissuance');
      });

      it('has a modes of issuance list', () => {
        expect(ModesOfIssuance.hasList).to.be.true;
      });

      it('list has 3 items', () => {
        expect(ModesOfIssuance.rowCount).to.equal(3);
      });

      it('list has new button', () => {
        expect(ModesOfIssuance.hasCreateButton).to.be.true;
      });
    });
  });

  describe('User does not have permissions to see the list', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'settings.inventory.enabled': true
      }
    });

    beforeEach(mockData);

    describe('viewing alternative title types list', () => {
      beforeEach(async function () {
        await this.visit('/settings/inventory/modesofissuance');
      });

      it('has an altenative title types list', () => {
        expect(ModesOfIssuance.hasList).to.be.false;
      });
    });
  });

  describe('User does not have permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'settings.inventory.enabled': true,
        'ui-inventory.settings.list.view': true
      }
    });

    beforeEach(mockData);
    describe('viewing modes of issuance list', () => {
      beforeEach(function () {
        this.visit('/settings/inventory/modesofissuance');
      });

      it('has a modes of issuance list', () => {
        expect(ModesOfIssuance.hasList).to.be.true;
      });

      it('list has 3 items', () => {
        expect(ModesOfIssuance.rowCount).to.equal(3);
      });

      it('list has new button', () => {
        expect(ModesOfIssuance.hasCreateButton).to.be.false;
      });
    });
  });
});
