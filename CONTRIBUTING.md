# Contribuer à Comète Design System

## Règle de contribution — stories et mécanique

**Une story peut détenir de l'état, jamais de la mécanique.**

Détenir une valeur et la passer à une prop existante (`isOpen`/`onOpenChange`,
`sortDirection`/`onSortChange`) = démo controlled, légitime.

Implémenter dans la story ce que le composant n'expose pas (checkboxes de
sélection, click-outside, positionnement, setTimeout, calculs de style repris
du CSS interne) = API manquante → à absorber dans le composant AVANT de merger
la story.

Test : « si trois écrans consommateurs veulent cette feature, copieront-ils du
JSX de story ? » Si oui, c'est un trou d'API.

Signaux d'alarme en review :
- `useEffect` / `addEventListener` dans une story
- inline styles structurels
- helper privé dupliqué entre fichiers de stories
- placeholder inaccessible (`&nbsp;` dans un en-tête vide)
