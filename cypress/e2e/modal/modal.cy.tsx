///<reference types="cypress"/>

describe('Modal window tests', function() {
    beforeEach(function() {
        cy.intercept('GET', 'api/ingredients', { fixture: 'ingredients.json' });
        cy.viewport(1300, 800);
        cy.visit('/');
        cy.contains('Соберите бургер').should('exist');
    });

    describe('Ingredient modal functionality', () => {
        beforeEach(() => {
        cy.get('[data-cy=modal]').should('not.exist');
        });

        it('should open modal with correct ingredient details', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            
            cy.get('[data-cy=modal]').within(() => {
                cy.get('h3').should('exist');
                cy.contains('Детали ингредиента').should('exist');
                cy.contains('Калории').should('exist');
                cy.contains('Белки').should('exist');
                cy.contains('Жиры').should('exist');
                cy.contains('Углеводы').should('exist');
            });
        });

        it('should display nutritional values correctly', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            
            cy.get('[data-cy=modal]').within(() => {
                ['Калории', 'Белки', 'Жиры', 'Углеводы'].forEach(nutrient => {
                    cy.contains(nutrient)
                        .next()
                        .invoke('text')
                        .should('match', /^\d+$/);
                });
            });
        });

        it('should show ingredient image', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            
            cy.get('[data-cy=modal]').within(() => {
                cy.get('img')
                    .should('be.visible')
                    .and('have.attr', 'src')
                    .and('match', /^https?:\/\/.+/);
            });
        });
    });

    describe('Modal closing functionality', () => {
        beforeEach(() => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            cy.get('[data-cy=modal]').should('exist');
        });

        it('should close modal when clicking close button', () => {
        cy.get('[data-cy=close_icon]').click();
        cy.get('[data-cy=modal]').should('not.exist');
        });

        it('should close modal when clicking overlay', () => {
            cy.get('[data-cy=overlay]').click('topRight', { force: true });
            cy.get('[data-cy=modal]').should('not.exist');
        });

        it('should close modal on Escape key press', () => {
            cy.get('body').type('{esc}');
            cy.get('[data-cy=modal]').should('not.exist');
        });
    });

    describe('Modal accessibility', () => {
        it('should handle keyboard navigation', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            
            cy.get('[data-cy=modal]').within(() => {
                cy.get('[data-cy=close_icon]').should('be.visible');
                cy.get('[data-cy=close_icon]').focus();
                cy.focused().should('have.attr', 'data-cy', 'close_icon');
            });
        });

        it('should have proper structure', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            
            cy.get('[data-cy=modal]').within(() => {
                cy.get('h3').should('exist');
                cy.get('[data-cy=close_icon]')
                    .should('have.attr', 'type', 'button');
            });
        });
    });

    describe('Modal state persistence', () => {
        it('should maintain modal state during route navigation', () => {
            cy.get('[data-cy=bun_ingredients]').find('li').first().click();
            
            const ingredientName = cy.get('[data-cy=modal]').invoke('text');
            
            cy.url().should('include', '/ingredients/');
            cy.go('back');
        cy.get('[data-cy=modal]').should('not.exist');
        });
    });

    describe('Error handling', () => {
        it('should handle missing ingredient data gracefully', () => {
            cy.intercept('GET', 'api/ingredients', {
                statusCode: 500,
                body: { success: false }
            }).as('loadError');

            cy.reload();
            cy.get('[data-cy=bun_ingredients]').should('not.exist');
        });

        it('should handle empty ingredient data', () => {
            cy.intercept('GET', 'api/ingredients', {
                success: true,
                data: []
            }).as('emptyData');

            cy.reload();
            cy.get('[data-cy=bun_ingredients]')
                .find('li')
                .should('have.length', 1)
                .and('contain', 'Нет доступных ингредиентов');
        });
    });
});
