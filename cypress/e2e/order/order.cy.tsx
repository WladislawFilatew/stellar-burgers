///<reference types="cypress"/>
describe('Order functionality tests', function () {
    beforeEach(function() {
        cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' });
        cy.intercept('GET', '/api/auth/user', { fixture: 'userData.json' });
        cy.intercept('POST', '/api/orders', { fixture: 'sucessOrder.json' });
        
        window.localStorage.setItem(
            'refreshToken',
            JSON.stringify('test-refreshToken')
        );
        cy.setCookie('accessToken', 'test-accessToken');

        cy.viewport(1300, 800);
        cy.visit('/');
        cy.contains('Соберите бургер').should('exist');
    });

    afterEach(function () {
        cy.clearCookies();
        cy.clearLocalStorage();
    });

    describe('Order creation', () => {
        it('should create order successfully with all ingredients', () => {
    cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();
    cy.get('[data-cy=main_ingredients]').contains('Добавить').click();
    cy.get('[data-cy=souce_ingredients]').contains('Добавить').click();

            cy.get('[data-cy=order_button]').contains('Оформить заказ').click();

    cy.get('[data-cy=order_number]').contains('2128506').should('exist');
    cy.get('[data-cy=close_icon]').click();
    cy.get('[data-cy=modal]').should('not.exist');

    cy.get('[data-cy=constructor]').should('not.contain', 'Ингридиент_1');
    cy.get('[data-cy=ingredient_constructor]').should('not.contain', 'Ингридиент_4');
    cy.get('[data-cy=ingredient_constructor]').should('not.contain', 'Ингридиент_2');
        });

        it('should not allow order without bun', () => {
            cy.get('[data-cy=main_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=souce_ingredients]').contains('Добавить').click();

            cy.get('[data-cy=order_button]')
                .find('button')
                .should('be.disabled');

            cy.get('[data-cy=modal]').should('not.exist');
        });

        it('should allow order with only bun', () => {
            cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();

            cy.get('[data-cy=order_button]').contains('Оформить заказ').click();
            cy.get('[data-cy=order_number]').should('exist');
            cy.get('[data-cy=close_icon]').click();
        });
    });

    describe('Order validation', () => {
        it('should show correct total price', () => {
            cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=main_ingredients]').contains('Добавить').click();

            cy.get('[data-cy=order_button]')
                .find('.text')
                .invoke('text')
                .then(parseFloat)
                .should('be.gt', 0);
        });

        it('should clear constructor after successful order', () => {
            cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=main_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=souce_ingredients]').contains('Добавить').click();

            cy.get('[data-cy=order_button]').contains('Оформить заказ').click();
            cy.get('[data-cy=close_icon]').click();

            cy.get('[data-cy=constructor]').within(() => {
                cy.contains('Выберите булки').should('exist');
                cy.contains('Выберите начинку').should('exist');
            });
        });
    });

    describe('Error handling', () => {
        it('should handle order creation error', () => {
            cy.intercept('POST', '/api/orders', {
                statusCode: 500,
                body: { success: false }
            }).as('failedOrder');

            cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=main_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=order_button]').contains('Оформить заказ').click();

            cy.wait('@failedOrder');
            cy.get('[data-cy=modal]').should('not.exist');
        });

        it('should handle unauthorized order attempt', () => {
            cy.clearCookies();
            cy.clearLocalStorage();
            cy.reload();

            cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=main_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=order_button]').contains('Оформить заказ').click();

            cy.url().should('include', '/login');
        });
    });

    describe('Order modal', () => {
        beforeEach(() => {
            cy.get('[data-cy=bun_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=main_ingredients]').contains('Добавить').click();
            cy.get('[data-cy=order_button]').contains('Оформить заказ').click();
        });

        it('should show order details in modal', () => {
            cy.get('[data-cy=modal]').within(() => {
                cy.get('[data-cy=order_number]').should('exist');
                cy.contains('идентификатор заказа').should('exist');
                cy.contains('Ваш заказ начали готовить').should('exist');
            });
        });

        it('should close order modal properly', () => {
            cy.get('[data-cy=close_icon]').click();
            cy.get('[data-cy=modal]').should('not.exist');
        });
    });
});
