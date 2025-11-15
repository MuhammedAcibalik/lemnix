/// <reference types="cypress" />

describe("Kesim listesi oluşturma", () => {
  it("409 yanıtında backend mesajını gösterir", () => {
    const conflictMessage =
      "12. Hafta için zaten bir kesim listesi mevcut. Lütfen mevcut listeyi kontrol edin.";

    cy.intercept("GET", "/api/cutting-list", {
      statusCode: 200,
      body: { success: true, data: [] },
    }).as("getCuttingLists");

    cy.intercept("POST", "/api/cutting-list", {
      statusCode: 409,
      body: { success: false, error: conflictMessage },
    }).as("createCuttingList");

    cy.visit("/cutting-list");
    cy.wait("@getCuttingLists");

    cy.get('input[type="number"]').clear().type("12");
    cy.contains("button", "Kesim Listesi Oluştur").click();

    cy.wait("@createCuttingList");

    cy.contains("div", conflictMessage).should("be.visible");
  });
});
