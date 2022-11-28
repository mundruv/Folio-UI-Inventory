import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';

import setupApplication from '../../../helpers/setup-application';
import ClassificationTypes from '../../../interactors/settings/classification-types/classification-types';

describe('Classification types', () => {
  function mockData() {
    this.server.create('classificationType', {
      id : '3363cdb1-e644-446c-82a4-dc3a1d4395b9',
      name : 'ISBN',
      source : 'folio'
    });
    this.server.create('classificationType', {
      id : '526aa04d-9289-4511-8866-349299592c18',
      name : 'LCCN',
      source : 'folio'
    });
    this.server.create('classificationType', {
      id : '6312d172-f0cf-40f6-b27d-9fa8feaf332f',
      name : 'ISSN',
      source : 'folio'
    });
  }
  describe('User has permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'settings.inventory.enabled': true,
        'ui-inventory.settings.list.view': true,
        'ui-inventory.settings.classification-types': true
      }
    });

    beforeEach(mockData);

    describe('viewing classification types list', () => {
      beforeEach(function () {
        this.visit('/settings/inventory/classificationtypes');
      });

      it('has a classification types list', () => {
        expect(ClassificationTypes.hasList).to.be.true;
      });

      it('list has 3 items', () => {
        expect(ClassificationTypes.rowCount).to.equal(3);
      });

      it('list has new button', () => {
        expect(ClassificationTypes.hasNewButton).to.be.true;
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
        await this.visit('/settings/inventory/classificationtypes');
      });

      it('has an altenative title types list', () => {
        expect(ClassificationTypes.hasList).to.be.false;
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

    describe('viewing classification types list', () => {
      beforeEach(function () {
        this.visit('/settings/inventory/classificationtypes');
      });

      it('has a classification types list', () => {
        expect(ClassificationTypes.hasList).to.be.true;
      });

      it('list has 3 items', () => {
        expect(ClassificationTypes.rowCount).to.equal(3);
      });

      it('list has new button', () => {
        expect(ClassificationTypes.hasNewButton).to.be.false;
      });
    });
  });
});
