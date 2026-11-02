// Étend les matchers Vitest avec les assertions DOM de @testing-library/jest-dom
import "@testing-library/jest-dom";

// jsdom n'implémente pas `ResizeObserver`. `ScrollArea` s'en sert pour
// remesurer son pouce, et il est désormais rendu par d'autres composants
// (Drawer, ModalDialog) : sans ce bouchon, leurs tests lèveraient une
// `ReferenceError` au montage. Il ne déclenche jamais de rappel — jsdom ne
// met rien en page, il n'y a donc aucun redimensionnement à observer.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe(): void {}
    unobserve(): void {}
    disconnect(): void {}
  };
}

// Même raison pour `scrollIntoView` : jsdom ne l'implémente pas (il ne met
// rien en page, il n'y a donc rien à faire défiler). Les composants qui
// amènent un élément dans la vue au montage — `TimeCalendar` et son créneau
// sélectionné — lèveraient sinon un `TypeError` au premier rendu.
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = function scrollIntoView(): void {};
}
