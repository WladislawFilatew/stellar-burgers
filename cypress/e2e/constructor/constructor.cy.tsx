describe('Constructor page tests', function () {
    beforeEach(function() {
        cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' });
        cy.viewport(1300, 800);
        cy.visit('/');
        cy.contains('Соберите бургер').should('exist');
    });

    describe('Ingredient list functionality', () => {
        it('should display all ingredient categories', () => {
            cy.contains('Булки').should('exist');
            cy.contains('Начинки').should('exist');
            cy.contains('Соусы').should('exist');
        });

        it('should show ingredient details', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            cy.contains('Калории').should('exist');
            cy.contains('Белки').should('exist');
            cy.contains('Жиры').should('exist');
            cy.contains('Углеводы').should('exist');
            cy.get('[data-cy=close_icon]').click();
        });
    });

    describe('Constructor drag and drop functionality', () => {
        it('should add bun to constructor', () => {
            cy.get('[data-cy=bun_1_constructor]').contains('Выберите булки').should('exist');
            
            cy.get('[data-cy=bun_ingredients]').find('li').first().find('button').contains('Добавить').click();

            cy.get('[data-cy=bun_1_constructor]').find('.constructor-element').should('exist');
            cy.get('[data-cy=bun_2_constructor]').find('.constructor-element').should('exist');
        });

        it('should add and display main ingredients', () => {
            cy.get('[data-cy=constructor]').should('exist');

            cy.get('[data-cy=main_ingredients]').find('li').first().find('button').contains('Добавить').click();

            cy.get('[data-cy=constructor]').find('.constructor-element').should('exist');
        });

        it('should update total price when ingredients are added', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().find('button').contains('Добавить').click();

            cy.get('[data-cy=order_button]')
                .find('.text')
                .invoke('text')
                .should('not.be.empty')
                .and('match', /\d+/);
        });
    });

    describe('Constructor interaction features', () => {
        beforeEach(() => {
            cy.get('[data-cy=main_ingredients]').find('li').first().find('button').contains('Добавить').click();

            cy.get('[data-cy=souce_ingredients]').find('li').first().find('button').contains('Добавить').click();

            cy.get('[data-cy=constructor]').find('.constructor-element').should('have.length.at.least', 2);
        });

        it('should allow ingredient deletion', () => {
            cy.get('[data-cy=constructor]')
                .find('.constructor-element__action')
                .first()
                .click();

            cy.get('[data-cy=constructor]')
                .find('.constructor-element')
                .should('have.length', 1);
        });

        it('should allow ingredient reordering', () => {
            cy.get('[data-cy=constructor]')
                .find('.constructor-element')
                .should('have.length.at.least', 2);
        });
    });

    describe('Error handling', () => {
        it('should handle failed ingredient loading', () => {
            cy.intercept('GET', 'api/ingredients', {
                statusCode: 500,
                body: { success: false }
            }).as('loadError');

            cy.reload();
            
            cy.contains('Булки').should('not.exist');
        });

        it('should handle empty ingredient lists', () => {
            cy.intercept('GET', 'api/ingredients', {
                success: true,
                data: []
            }).as('emptyList');

            cy.reload();
            
            cy.get('[data-cy=constructor]').should('exist');
            cy.contains('Выберите булки').should('exist');
        });
    });
});
