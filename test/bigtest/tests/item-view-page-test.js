import { beforeEach, describe, it } from '@bigtest/mocha';
import { expect } from 'chai';
import faker from 'faker';

import setupApplication from '../helpers/setup-application';
import DummyComponent from '../helpers/DummyComponent';
import ItemViewPage from '../interactors/item-view-page';
import ItemEditPage from '../interactors/item-edit-page';
import ItemCreatePage from '../interactors/item-create-page';

const itemStatusesMap = {
  InProcess: 'In process',
  InProcessNonRequestable: 'In process (non-requestable)',
  Intellectual: 'Intellectual item',
  LongMissing: 'Long missing',
  Restricted: 'Restricted',
  Unavailable: 'Unavailable',
  Unknown: 'Unknown',
};

describe('ItemViewPage', () => {
  describe('User has permissions', () => {
    const requestsPath = '/requests';

    setupApplication({
      modules: [{
        type: 'app',
        name: '@folio/ui-requests',
        displayName: 'Requests',
        route: requestsPath,
        module: DummyComponent,
      }],
    });

    describe('visiting the item view page', () => {
      let item;

      beforeEach(async function () {
        const instance = this.server.create(
          'instance',
          'withHoldingAndItem',
          {
            title: 'ADVANCING RESEARCH',
          }
        );

        const holding = this.server.schema.instances.first().holdings.models[0];
        item = holding.items.models[0].attrs;
        const request = this.server.create('request', {
          holdShelfExpirationDate: faker.date.future(),
          item: { ...item, status: 'Awaiting pickup' },
        });

        this.server.get('/circulation/requests', { totalRecords: 1, requests: [request.toJSON()] });

        this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
        await ItemViewPage.whenLoaded();
      });

      it('displays the title in the pane header', () => {
        expect(ItemViewPage.title).to.equal(`Item • ${item.barcode} • ${item.status.name}`);
      });

      it('displays the "Collapse all" button', () => {
        expect(ItemViewPage.collapseAllButton.isPresent).to.be.true;
      });

      it('displays collapsed accordion by default if it is empty', () => {
        expect(ItemViewPage.enumerationDataAccordion.contentHeight).to.be.equal(0);
        expect(ItemViewPage.enumerationDataAccordion.isOpen).to.be.false;
      });

      describe('"Administrative data" section', () => {
        it('contains "Statistical code" table', () => {
          expect(ItemViewPage.statisticalCodeTable.isPresent).to.be.true;
        });
      });

      describe('"Electronic access" section', () => {
        it('contains "Electronic access" table', () => {
          expect(ItemViewPage.electronicAccessTable.isPresent).to.be.true;
        });
      });

      describe('"Circulation history" accordion', () => {
        it('should be present', () => {
          expect(ItemViewPage.circulationHistoryAccordion.isPresent).to.be.true;
        });

        it('"Check in date" field should not be empty', () => {
          expect(ItemViewPage.circulationHistoryAccordion.keyValues(0).text).to.be.equal('12/12/2019, 2:28 PM');
        });

        it('"Service point" field should not be empty', () => {
          expect(ItemViewPage.circulationHistoryAccordion.keyValues(1).text).to.be.equal('Circ Desk 1');
        });

        it('"Source" field should not be empty', () => {
          expect(ItemViewPage.circulationHistoryAccordion.keyValues(2).text).to.be.equal('Doe, John Antony');
        });
      });

      describe('pane header dropdown menu', () => {
        beforeEach(async () => {
          await ItemViewPage.headerDropdown.click();
        });

        it('should show an edit menu item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasEdit).to.be.true;
        });

        it('should show a duplicate menu item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasDuplicate).to.be.true;
        });

        it('should show a mark as missing item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsMissing).to.be.true;
        });

        it('should show a mark as withdrawn item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsWithdrawn).to.be.true;
        });

        it('should show a mark as in process', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsInProcess).to.be.true;
        });

        it('should show a mark as in process (non-requestable)', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsInProcessNonRequestable).to.be.true;
        });

        it('should show a mark as intellectual item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsIntellectual).to.be.true;
        });

        it('should show a mark as long missing', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsLongMissing).to.be.true;
        });

        it('should show a mark as restricted', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsRestricted).to.be.true;
        });

        it('should show a mark as unavailable', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsUnavailable).to.be.true;
        });

        it('should show a mark as unknown', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsUnknown).to.be.true;
        });

        it('should show a delete menu item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasDeleteItem).to.be.true;
        });

        it('should show a new request item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasNewRequestItem).to.be.true;
        });

        describe('clicking on edit', () => {
          beforeEach(async () => {
            await ItemViewPage.headerDropdownMenu.clickEdit();
          });

          it('should redirect to item edit page', () => {
            expect(ItemEditPage.$root).to.exist;
          });
        });

        describe('clicking on duplicate', () => {
          beforeEach(async () => {
            await ItemViewPage.headerDropdownMenu.clickDuplicate();
          });

          it('should redirect to item create page', () => {
            expect(ItemCreatePage.$root).to.exist;
          });
        });

        describe('clicking on mark as missing', () => {
          beforeEach(async function () {
            await ItemViewPage.headerDropdownMenu.clickMarkAsMissing();
          });

          it('should open a missing confirmation modal', () => {
            expect(ItemViewPage.hasMarkAsMissingModal).to.exist;
          });

          it('should display open requests number', () => {
            expect(ItemViewPage.openRequestsNumber.text).to.equal('1 open request');
          });

          describe('clicking on the open requests number link', () => {
            beforeEach(async () => {
              await ItemViewPage.openRequestsNumber.click();
            });

            it('should redirect to "requests"', function () {
              expect(this.location.pathname).to.equal(requestsPath);
              expect(this.location.search).includes(item.id);
            });
          });

          describe('clicking on "Confirm" button', () => {
            beforeEach(async () => {
              await ItemViewPage.confirmButton.click();
            });

            it('should close a missing confirmation modal', () => {
              expect(ItemViewPage.hasMarkAsMissingModal).to.be.false;
            });

            it('should change item status to "Missing"', () => {
              expect(ItemViewPage.loanAccordion.keyValues(2).text).to.be.equal('Missing');
            });
          });
        });

        describe('clicking on mark as withdrawn', () => {
          beforeEach(async () => {
            await ItemViewPage.headerDropdownMenu.clickMarkAsWithdrawn();
          });

          it('should open a withdrawn confirmation modal', () => {
            expect(ItemViewPage.hasMarkAsWithdrawnModal).to.exist;
          });

          it('should display open requests number', () => {
            expect(ItemViewPage.openRequestsNumber.text).to.equal('1 open request');
          });

          describe('clicking on the open requests number link', () => {
            beforeEach(async () => {
              await ItemViewPage.openRequestsNumber.click();
            });

            it('should redirect to "requests"', function () {
              expect(this.location.pathname).to.equal(requestsPath);
              expect(this.location.search).includes(item.id);
            });
          });

          describe('clicking on "Confirm" button', () => {
            beforeEach(async () => {
              await ItemViewPage.confirmButton.click();
            });

            it('should close a withdrawn confirmation modal', () => {
              expect(ItemViewPage.hasMarkAsWithdrawnModal).to.be.false;
            });

            it('should change item status to "Withdrawn"', () => {
              expect(ItemViewPage.loanAccordion.keyValues(2).text).to.be.equal('Withdrawn');
            });
          });
        });

        Object.keys(itemStatusesMap).forEach(status => {
          const statusName = itemStatusesMap[status];

          describe(`clicking on mark as ${statusName}`, () => {
            beforeEach(async () => {
              await ItemViewPage.headerDropdownMenu[`clickMarkAs${status}`]();
            });

            it('should open an item status modal', () => {
              expect(ItemViewPage.hasItemStatusModal).to.exist;
            });

            it('should display open requests number', () => {
              expect(ItemViewPage.openRequestsNumber.text).to.equal('1 open request');
            });

            describe('clicking on the open requests number link', () => {
              beforeEach(async () => {
                await ItemViewPage.openRequestsNumber.click();
              });

              it('should redirect to "requests"', function () {
                expect(this.location.pathname).to.equal(requestsPath);
                expect(this.location.search).includes(item.id);
              });
            });

            describe('clicking on "Confirm" button', () => {
              beforeEach(async () => {
                await ItemViewPage.confirmButton.click();
              });

              it('should close an item status modal', () => {
                expect(ItemViewPage.hasItemStatusModal).to.be.false;
              });

              it(`should change item status to ${statusName}`, () => {
                expect(ItemViewPage.loanAccordion.keyValues(2).text).to.be.equal(statusName);
              });
            });
          });
        });

        describe('clicking on delete', () => {
          beforeEach(async () => {
            await ItemViewPage.headerDropdownMenu.clickDelete();
          });

          it('should open a delete confirmation modal', () => {
            expect(ItemViewPage.hasDeleteModal).to.exist;
          });
        });
      });
    });

    describe('visiting the paged item view page', () => {
      beforeEach(async function () {
        const instance = this.server.create(
          'instance',
          'withHoldingAndPagedItem',
          {
            title: 'ADVANCING RESEARCH',
          }
        );
        const holding = this.server.schema.instances.first().holdings.models[0];
        const item = holding.items.models[0].attrs;

        this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
        await ItemViewPage.whenLoaded();
      });

      describe('clicking on mark as missing', () => {
        beforeEach(async () => {
          await ItemViewPage.headerDropdownMenu.clickMarkAsMissing();
        });

        it('should open a missing confirmation modal', () => {
          expect(ItemViewPage.hasMarkAsMissingModal).to.exist;
        });
      });
    });

    describe('visiting the in process item view page', () => {
      beforeEach(async function () {
        const instance = this.server.create(
          'instance',
          'withHoldingAndItemStatus',
          {
            title: 'ADVANCING RESEARCH',
            itemStatus: 'In process',
          }
        );
        const holding = this.server.schema.instances.first().holdings.models[0];
        const item = holding.items.models[0].attrs;

        this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
        await ItemViewPage.whenLoaded();
      });

      describe('clicking on mark as missing', () => {
        beforeEach(async () => {
          await ItemViewPage.headerDropdownMenu.clickMarkAsMissing();
        });

        it('should open a missing confirmation modal', () => {
          expect(ItemViewPage.hasMarkAsMissingModal).to.exist;
        });
      });
    });

    describe('visiting the withdrawn item view page', () => {
      beforeEach(async function () {
        const instance = this.server.create(
          'instance',
          'withHoldingAndItemStatus',
          {
            title: 'ADVANCING RESEARCH',
            itemStatus: 'Withdrawn',
          }
        );
        const holding = this.server.schema.instances.first().holdings.models[0];
        const item = holding.items.models[0].attrs;

        this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
        await ItemViewPage.whenLoaded();
      });

      describe('clicking pane header dropdown menu', () => {
        beforeEach(async () => {
          await ItemViewPage.headerDropdown.click();
        });

        it('should show a mark as missing item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsMissing).to.be.true;
        });

        it('should not show a mark as withdrawn item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasMarkAsWithdrawn).to.be.false;
        });

        it('should not show a new request item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasNewRequestItem).to.be.false;
        });
      });
    });

    describe('visiting the restricted item view page', () => {
      beforeEach(async function () {
        const instance = this.server.create(
          'instance',
          'withHoldingAndItemStatus',
          {
            title: 'ADVANCING RESEARCH',
            itemStatus: 'Restricted',
          }
        );
        const holding = this.server.schema.instances.first().holdings.models[0];
        const item = holding.items.models[0].attrs;

        this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
        await ItemViewPage.whenLoaded();
      });

      describe('clicking pane header dropdown menu', () => {
        beforeEach(async () => {
          await ItemViewPage.headerDropdown.click();
        });

        it('should show a new request item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasNewRequestItem).to.be.true;
        });
      });
    });

    Object.keys(itemStatusesMap).forEach(status => {
      const statusName = itemStatusesMap[status];

      describe(`visiting the item with status ${statusName} view page`, () => {
        beforeEach(async function () {
          const instance = this.server.create(
            'instance',
            'withHoldingAndItemStatus',
            {
              title: 'ADVANCING RESEARCH',
              itemStatus: statusName,
            }
          );
          const holding = this.server.schema.instances.first().holdings.models[0];
          const item = holding.items.models[0].attrs;

          this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
          await ItemViewPage.whenLoaded();
        });

        describe('clicking pane header dropdown menu', () => {
          beforeEach(async () => {
            await ItemViewPage.headerDropdown.click();
          });

          it(`should not display the "mark as ${statusName}" menu item`, () => {
            expect(ItemViewPage.headerDropdownMenu[`hasMarkAs${status}`]).to.be.false;
          });
        });
      });
    });
  });

  describe('User does not have permissions', () => {
    setupApplication({
      hasAllPerms: false,
      permissions: {
        'module.inventory.enabled': true,
        'ui-inventory.instance.view': true,
      }
    });

    describe('visiting the item view page', () => {
      let item;

      beforeEach(async function () {
        const instance = this.server.create(
          'instance',
          'withHoldingAndItem',
          {
            title: 'ADVANCING RESEARCH',
          }
        );
        const holding = this.server.schema.instances.first().holdings.models[0];
        item = holding.items.models[0].attrs;

        this.visit(`/inventory/view/${instance.id}/${holding.id}/${item.id}`);
        await ItemViewPage.whenLoaded();
      });

      it('should not show a dropdown menu in the pane header', () => {
        expect(ItemViewPage.hasHeaderDropdown).to.be.undefined;
      });

      it('should not show a duplicate menu item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasDuplicate).to.be.false;
      });

      it('should not show a mark as missing item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsMissing).to.be.false;
      });

      it('should not show a mark as intellectual item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsIntellectual).to.be.false;
      });

      it('should not show a mark as restricted item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsRestricted).to.be.false;
      });

      it('should not show a mark as unknown item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsUnknown).to.be.false;
      });

      it('should not show a mark as unavailable item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsUnavailable).to.be.false;
      });

      it('should not show a mark as long missing item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsLongMissing).to.be.false;
      });

      it('should not show a mark as in process (non-requestable) item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasMarkAsInProcessNonRequestable).to.be.false;
      });

      it('should not show a delete menu item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasDeleteItem).to.be.false;
      });

      it('should not show a new request item', () => {
        expect(ItemViewPage.headerDropdownMenu.hasNewRequestItem).to.be.false;
      });

      describe('pane header dropdown menu', () => {
        beforeEach(async () => {
          await ItemViewPage.clickDismiss();
        });

        it('should not display an edit item', () => {
          expect(ItemViewPage.headerDropdownMenu.hasEdit).to.be.false;
        });
      });
    });
  });
});
