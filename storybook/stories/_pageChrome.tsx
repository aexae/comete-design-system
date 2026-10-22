// Helper de story partagé — chrome de la `Page.Bar`. PAS un export du DS
// (rien dans src/components/, rien dans l'index public).
//
// Les actions globales ne se redéfinissent pas story par story : elles sont
// UNE composition, injectée une fois par le gabarit via `Page globalActions`.
// Ce helper existe pour que les stories `Layout/Page*` et les recettes montrent
// toutes exactement la même barre.
//
// LES TROIS ACTIONS RÉPONDENT. Un bouton inerte dans un gabarit se lit comme
// une maquette, pas comme un produit : on ne voit ni le survol, ni le focus, ni
// ce que l'action ouvre, et rien n'oblige à se demander où elle mène. La loupe
// ouvre la recherche globale, la cloche et l'avatar ouvrent chacun leur menu.
import type { ReactElement, ReactNode } from "react";
import { fn } from "storybook/test";
import {
  Avatar,
  Button,
  Menu,
  MenuItem,
  MenuPopover,
  MenuSection,
  MenuTrigger,
} from "@aexae/comete-design-system/components";

/** Densité des actions de barre, pour suivre celle de leurs voisines. */
export type ChromeDensity = "default" | "compact";

/**
 * Bouton loupe de la barre de page. Remplace l'ancien bouton « Réglages » :
 * les préférences sont une destination de navigation, pas une action de barre,
 * et la recherche globale sait désormais y mener.
 */
export function GlobalSearchButton({
  onPress,
  isExpanded,
  density,
}: {
  onPress: () => void;
  /** Reflète l'état déplié du champ (`aria-expanded`). */
  isExpanded?: boolean;
  /** Densité du `Button`, pour suivre celle des actions voisines. */
  density?: ChromeDensity;
}): ReactElement {
  return (
    <Button
      appearance="subtle"
      iconBefore="Search"
      aria-label="Recherche globale"
      {...(density ? { density } : {})}
      {...(isExpanded === undefined ? {} : { "aria-expanded": isExpanded })}
      onPress={onPress}
    />
  );
}

/** Traces de clic dans les stories qui ne jouent pas le parcours complet. */
export const onOpenGlobalSearch = fn();
export const onOpenNotification = fn();
export const onOpenAccountAction = fn();

/**
 * Cloche de notifications — ouvre un menu plutôt que de ne rien faire.
 *
 * Un menu et non une page : on vient y jeter un œil et repartir. Les entrées
 * portent une description, parce qu'une notification sans son contexte
 * n'apprend rien.
 */
export function NotificationsButton({
  density,
}: {
  density?: ChromeDensity;
}): ReactElement {
  return (
    <MenuTrigger>
      <Button
        appearance="subtle"
        iconBefore="Notifications"
        aria-label="Notifications"
        {...(density ? { density } : {})}
      />
      <MenuPopover width={320}>
        <Menu aria-label="Notifications" onAction={onOpenNotification}>
          <MenuSection title="Aujourd'hui">
            <MenuItem
              id="notif-ronde"
              iconBefore="EditNote"
              description="Tour Alto · 03:40"
            >
              Ronde de nuit incomplète
            </MenuItem>
            <MenuItem
              id="notif-badge"
              iconBefore="Warning"
              description="Site Bercy Village · porte 4"
            >
              Badge non reconnu
            </MenuItem>
          </MenuSection>
          <MenuSection title="Cette semaine" hasSeparator>
            <MenuItem
              id="notif-attestation"
              iconBefore="Description"
              description="MARTIN Bob · expire le 30 mars"
            >
              Carte professionnelle à renouveler
            </MenuItem>
          </MenuSection>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

/**
 * Avatar du compte — ouvre le menu du compte.
 *
 * `Avatar` ne devient un `<button>` qu'avec un `onPress` : sans lui il rend un
 * `<div>`, inatteignable au clavier et sans état de survol. Le `onPress` est
 * donc indispensable ici, même si c'est `MenuTrigger` qui porte l'ouverture.
 */
export function AccountMenu({
  initials = "AC",
}: {
  initials?: string;
}): ReactElement {
  return (
    <MenuTrigger>
      <Avatar
        size="medium"
        initials={initials}
        alt="Compte"
        onPress={onOpenAccountAction}
      />
      <MenuPopover width={240}>
        <Menu aria-label="Compte" onAction={onOpenAccountAction}>
          <MenuItem id="compte-profil" iconBefore="Person">
            Mon profil
          </MenuItem>
          <MenuItem id="compte-preferences" iconBefore="Settings">
            Préférences
          </MenuItem>
          <MenuItem id="compte-deconnexion" iconBefore="Logout">
            Se déconnecter
          </MenuItem>
        </Menu>
      </MenuPopover>
    </MenuTrigger>
  );
}

/**
 * Trio d'actions globales de la `Page.Bar` : **recherche, notifications,
 * avatar**, dans cet ordre.
 *
 * La loupe vient **avant** les notifications : la recherche est une action
 * choisie et fréquente, la notification est subie. Elle a remplacé l'ancien
 * bouton « Réglages » — les préférences sont une destination de navigation,
 * pas une action de barre, et la recherche globale sait y mener (voir la
 * recette `Recipes/Recherche globale`).
 *
 * Les trois répondent. Dans les stories de mise en page, le clic sur la loupe
 * est une simple trace ; le parcours complet vit dans la recette, qui en porte
 * l'état.
 */
export function PageGlobalActions({
  onSearch = onOpenGlobalSearch,
  isSearching,
  density,
}: {
  /** Branché par la recette pour ouvrir réellement la recherche. */
  onSearch?: () => void;
  /** Reflète l'état déplié du champ (`aria-expanded`). */
  isSearching?: boolean;
  /** Densité commune aux trois actions. */
  density?: ChromeDensity;
} = {}): ReactElement {
  return (
    <>
      <GlobalSearchButton
        onPress={onSearch}
        {...(isSearching === undefined ? {} : { isExpanded: isSearching })}
        {...(density ? { density } : {})}
      />
      <NotificationsButton {...(density ? { density } : {})} />
      <AccountMenu />
    </>
  );
}

/** Rendu par `Page.Bar trailing` quand la page n'a pas de recherche globale. */
export function PageTrailingActions({
  density,
}: {
  density?: ChromeDensity;
} = {}): ReactNode {
  return (
    <>
      <NotificationsButton {...(density ? { density } : {})} />
      <AccountMenu />
    </>
  );
}
