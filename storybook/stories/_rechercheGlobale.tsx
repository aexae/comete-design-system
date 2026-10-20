// Helper de story partagé — recette « Recherche globale ». PAS un export du DS
// (rien dans src/components/, rien dans l'index public) : données, logique et
// composants d'UI réutilisés par la story `Recipes/Recherche globale` ET les
// stories `Layout/Page/*`, pour une barre strictement identique partout.
//
// Flux retenu : la loupe de la `Page.Bar` ouvre un `ModalDialog` qui porte le
// champ ET les résultats. Le contenu de la page reste en place derrière le
// voile. Le champ n'est PAS dans la toolbar : son slot `search` est borné à
// 240px par le layout, ce qui tronque le placeholder — ce slot sert à filtrer
// la liste courante, pas à chercher dans toute l'application.
//
// Zéro CSS local ici : tout est inline ou porté par des composants du DS.
import { useEffect, useMemo, useRef, useState, type ReactElement, type ReactNode } from "react";
import type { IconName } from "@aexae/comete-icons";
import type { TagStatusColor } from "@aexae/comete-design-system/components";
import {
  Button,
  Tag,
  Bleed,
  Divider,
  Drawer,
  DrawerHeader,
  DrawerBody,
  ModalDialog,
  InformativeState,
  Illustration,
  SearchField,
  List,
  ListHead,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Icon,
} from "@aexae/comete-design-system/components";
export { GlobalSearchButton } from "./_pageChrome";

// -----------------------------------------------------------------------
// Index de démonstration
//
// Construit sur le vocabulaire réel du produit : agents, sites, vacations,
// documents — plus les DESTINATIONS de navigation. Indexer les destinations
// rend atteignable en trois lettres une page enfouie derrière un menu « Plus ».

/** Famille d'un résultat. Sert aussi de titre de section dans la liste. */
export type SearchGroup =
  | "Agents"
  | "Sites"
  | "Vacations"
  | "Documents"
  | "Aller à";

export interface SearchHit {
  group: SearchGroup;
  icon: IconName;
  title: string;
  subtitle: string;
  /**
   * Statut, optionnel, affiché **sur la ligne de titre**.
   *
   * Le libellé nomme la réalité du TYPE, jamais un mot passe-partout : dans
   * une liste qui mélange les familles, un « Actif » porté par un site et par
   * un agent désigne deux choses différentes et n'apprend plus rien. Un site
   * est « En service », un agent « En poste ».
   *
   * L'état ne se met pas non plus dans le titre : « Ronde de nuit » est le
   * nom de l'objet, « Incomplète » est son état, et il se lit comme celui
   * des autres rangées.
   *
   * La couleur suit l'ADR 0002 et n'est pas redéfinie ici : un déroulement
   * normal est `information` ; `success` est réservé à « l'état souhaité est
   * atteint », ce qui n'est pas la même chose. Une ronde inachevée appelle
   * une suite : `warning`.
   */
  status?: { label: string; color: TagStatusColor };
}

/** Ordre d'affichage des sections : les objets d'abord, la navigation en dernier. */
export const GROUP_ORDER: readonly SearchGroup[] = [
  "Agents",
  "Sites",
  "Vacations",
  "Documents",
  "Aller à",
];

export const SEARCH_INDEX: readonly SearchHit[] = [
  { group: "Agents", icon: "Person", title: "MARTIN Bob", subtitle: "Comète Sécurité · Agent de sécurité" },
  { group: "Agents", icon: "Person", title: "MARCHAND Lucie", subtitle: "Agence Lyon · Agent de sécurité" },
  { group: "Agents", icon: "Person", title: "CHEN Alice", subtitle: "Comète Sécurité · Cheffe de poste" },
  { group: "Agents", icon: "Person", title: "BARDET Romain", subtitle: "Sous-traitant Vigilis · Agent de sécurité" },
  { group: "Agents", icon: "Person", title: "MARQUES Elsa", subtitle: "Agence Lyon · Maître-chien" },
  { group: "Sites", icon: "LocationOn", title: "Site Marché Nord", subtitle: "Secteur Nord" },
  { group: "Sites", icon: "LocationOn", title: "Entrepôt Nord 2", subtitle: "Secteur Nord" },
  { group: "Sites", icon: "LocationOn", title: "Centre commercial Rivoli", subtitle: "Secteur Ouest" },
  { group: "Sites", icon: "LocationOn", title: "Siège Marmande", subtitle: "Secteur Ouest" },
  { group: "Vacations", icon: "CalendarMonth", title: "Vacation du 14 mars, Site Marché Nord", subtitle: "06:00 à 14:00 · MARTIN Bob" },
  { group: "Vacations", icon: "CalendarMonth", title: "Vacation du 15 mars, Entrepôt Nord 2", subtitle: "22:00 à 06:00 · non affectée" },
  { group: "Documents", icon: "Description", title: "Attestation MARTIN Bob", subtitle: "Carte professionnelle · expire le 30 mars" },
  { group: "Documents", icon: "Description", title: "Rapport d'incident Marché Nord", subtitle: "Main courante · 12 mars" },
  { group: "Aller à", icon: "Administrator", title: "Droits d'accès", subtitle: "Administration" },
  { group: "Aller à", icon: "Person", title: "Utilisateurs", subtitle: "Administration" },
  { group: "Aller à", icon: "Description", title: "Formulaires d'évènements", subtitle: "Main courante" },
  { group: "Aller à", icon: "LocationOn", title: "Sites", subtitle: "Navigation" },
];

/** Recherches récentes de démonstration, proposées tant que le champ est vide. */
/**
 * Derniers éléments consultés, proposés tant que le champ est vide.
 *
 * Ce sont des **objets déjà visités**, pas des chaînes déjà tapées : on
 * rouvre une fiche d'un geste, sans la retaper. Mêmes lignes que les
 * résultats, pour qu'il n'y ait qu'une anatomie à apprendre.
 */
export const RECENT_HITS: readonly SearchHit[] = [
  {
    group: "Sites",
    icon: "LocationOn",
    title: "Site Bercy Village",
    subtitle: "12 agents · Paris 12e",
    status: { label: "En service", color: "information" },
  },
  {
    group: "Agents",
    icon: "Person",
    title: "Diallo Mamadou",
    subtitle: "SSIAP 1 · Site Bercy Village",
    status: { label: "En poste", color: "information" },
  },
  {
    group: "Documents",
    icon: "Description",
    title: "Ronde de nuit",
    subtitle: "Main courante · Tour Alto · 12 oct. 03:40",
    status: { label: "Incomplète", color: "warning" },
  },
];

/** Normalise pour une comparaison insensible à la casse ET aux accents. */
const norm = (s: string): string =>
  s.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase();

/** Résultats pour une requête. Chaîne vide ou blanche → aucun résultat. */
export function searchHits(query: string): SearchHit[] {
  const q = norm(query.trim());
  if (!q) return [];
  return SEARCH_INDEX.filter(
    (h) => norm(h.title).includes(q) || norm(h.subtitle).includes(q),
  );
}

// -----------------------------------------------------------------------
// Déclencheur — la loupe de la Page.Bar
//
// Se place AVANT les notifications dans `globalActions` : la recherche est
// l'action la plus fréquente de la barre, les notifications sont subies.

/**
 * Champ de recherche globale, à poser **dans le corps de la modale**.
 *
 * Il n'a sa place ni dans le slot `search` de la `Page.Toolbar` — borné à
 * 240px par le layout, ce qui tronque le placeholder, car ce slot est fait
 * pour filtrer la liste courante — ni dans le slot `title` de la `Page.Bar`,
 * rendu dans un `<h1>` où un champ de formulaire n'a rien à faire.
 *
 * Enveloppé dans un `<form role="search">` : la validation au clavier (Entrée)
 * est native, sans gestionnaire de touche — `TextField` n'expose ni
 * `onKeyDown` ni `autoFocus`. Les résultats se rafraîchissent de toute façon à
 * la frappe ; valider ne sert qu'à fermer le clavier virtuel en tactile.
 *
 * Le libellé dit explicitement « dans toute l'application », pour qu'on ne le
 * confonde jamais avec la recherche de la toolbar, qui filtre la liste courante.
 */
export function GlobalSearchBar({
  value,
  onChange,
  onSubmit,
  isTouch,
}: {
  value: string;
  onChange: (v: string) => void;
  onSubmit?: () => void;
  /**
   * Mise en page **tactile : mobile ET tablette**.
   *
   * Le discriminant est le **type de pointeur**, pas la largeur : une
   * tablette en paysage à 1280 px reste tactile. Les seuils de `Grid`
   * (`BREAKPOINTS.sm` 600px, desktop 1200px) sont des seuils de MISE EN
   * PAGE et ne s'appliquent pas ici : s'y fier donnerait la modale et les
   * raccourcis clavier à une tablette large, qui n'a ni clavier ni `esc`.
   *
   * Ici : marque de substitution courte (voir plus bas).
   */
  isTouch?: boolean;
}): ReactElement {
  const ref = useRef<HTMLFormElement>(null);

  // Le champ vient d'apparaître : on y place le curseur. `TextField` n'expose
  // pas `autoFocus`, d'où la recherche de l'input réel dans le sous-arbre.
  useEffect(() => {
    ref.current?.querySelector("input")?.focus();
  }, []);

  return (
    <form
      ref={ref}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit?.();
      }}
    >
      {/* La marque de substitution se raccourcit au doigt : « Rechercher dans
          toute l'application » ne tient pas dans un champ de téléphone et se
          fait trancher en plein milieu, ce qui ne renseigne plus sur rien.
          Le NOM ACCESSIBLE reste entier dans les deux formats : c'est lui qui
          distingue cette recherche de celle de la toolbar, et un lecteur
          d'écran n'a pas de largeur à respecter. */}
      <SearchField
        aria-label="Rechercher dans toute l'application"
        placeholder={isTouch ? "Rechercher" : "Rechercher dans toute l'application"}
        value={value}
        onChange={onChange}
      />
    </form>
  );
}

// -----------------------------------------------------------------------
// Résultats
//
// Groupés par famille : les objets d'abord, les destinations de navigation en
// dernier. Indexer les destinations rend atteignable en trois lettres une page
// enfouie derrière un menu « Plus ».

/**
 * Met en évidence la portion de `text` qui correspond à `query`. Insensible à
 * la casse ET aux accents : on cherche sur la forme normalisée, mais on
 * découpe le texte d'origine pour ne jamais abîmer son orthographe.
 */
function Highlight({ text, query }: { text: string; query: string }): ReactElement {
  const q = norm(query.trim());
  if (!q) return <>{text}</>;
  const i = norm(text).indexOf(q);
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark style={{ background: "var(--background-warning-subtlest-default, #fff3b0)", color: "inherit", borderRadius: 2 }}>
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

/**
 * Liste des résultats, en sections par famille dans l'ordre de `GROUP_ORDER`.
 * Rendue dans le corps de la modale.
 */
export function GlobalSearchResults({
  query,
  onOpenHit,
  currentIndex,
}: {
  query: string;
  /** Ouverture d'un résultat — en story, une simple trace. */
  onOpenHit?: (hit: SearchHit) => void;
  /** Index (dans l'ordre d'affichage) de la ligne parcourue au clavier. */
  currentIndex?: number;
}): ReactElement {
  const hits = searchHits(query);
  // Index courant dans l'ordre d'AFFICHAGE (groupes dans l'ordre de
  // GROUP_ORDER), pas dans l'ordre de l'index — sinon la flèche bas sauterait
  // d'une section à l'autre.
  const ordered = orderedHits(hits);

  // Champ vide : on propose les derniers éléments consultés plutôt qu'un
  // message. Un écran vide ne donne rien à faire ; les récents, si — et c'est
  // souvent la raison même de l'ouverture (rouvrir la fiche de tout à l'heure).
  if (!query.trim()) {
    return (
      <Bleed inline="300">
        <List aria-label="Récents">
          <ListHead isFlush style={rowInset}>
            Récents
          </ListHead>
          {RECENT_HITS.map((hit, i) => (
            <HitRow
              key={`${hit.group}:${hit.title}`}
              hit={hit}
              query=""
              isCurrent={i === currentIndex}
              {...(onOpenHit ? { onOpenHit } : {})}
            />
          ))}
        </List>
      </Bleed>
    );
  }

  if (hits.length === 0) {
    return (
      <InformativeState
        title={`Aucun résultat pour « ${query.trim()} »`}
        description="La recherche porte sur les agents, les sites, les vacations, les documents et les pages."
        image={<Illustration illustration="Empty" size={128} />}
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--space300)" }}>
      {GROUP_ORDER.filter((g) => hits.some((h) => h.group === g)).map((group) => {
        const groupHits = hits.filter((h) => h.group === group);
        return (
          <Bleed key={group} inline="300">
            <List aria-label={group}>
              <ListHead isFlush style={rowInset}>
                {group} ({groupHits.length})
              </ListHead>
              {groupHits.map((hit) => (
                <HitRow
                  key={`${hit.group}:${hit.title}`}
                  hit={hit}
                  query={query}
                  isCurrent={ordered.indexOf(hit) === currentIndex}
                  {...(onOpenHit ? { onOpenHit } : {})}
                />
              ))}
            </List>
          </Bleed>
        );
      })}
    </div>
  );
}

// Les lignes DÉBORDENT sur toute la largeur de la surface : `Bleed` compense le
// padding horizontal du conteneur (--space300, identique pour `DrawerBody` au
// doigt et pour le corps de `ModalDialog` au clavier), si bien que les états
// survol / appui / sélection vont d'un bord à l'autre. Chaque rangée reprend
// ensuite ce même retrait en padding interne : le texte reste aligné sur le
// titre de section. Même montage et même nommage que `_filtresOptionB.tsx`.
const bleedInset = "var(--space300)";
const rowInset = { paddingLeft: bleedInset, paddingRight: bleedInset } as const;

// Ligne de titre : le titre à gauche, le statut (ou la flèche des destinations)
// en fin de ligne. Le statut vit DANS cette ligne et non dans un bloc de fin :
// un `ListItemTrailing` amputerait la colonne de texte de sa largeur plus le
// gap, et seulement sur les rangées qui en portent un — le texte s'arrêtait
// alors sur autant de verticales qu'il y a de largeurs de Tag. Ici le bloc de
// texte va jusqu'au bord dans tous les cas, et c'est le TITRE qui cède.
const titleLine = {
  display: "flex",
  alignItems: "center",
  gap: "var(--space100)",
  minWidth: 0,
} as const;
// `flex: 1` + `minWidth: 0` : le titre tronque avant le Tag, jamais l'inverse.
const titleTextStyle = {
  flex: "1 1 auto",
  minWidth: 0,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
} as const;
/** Le statut garde sa place quoi qu'il arrive au titre. */
const titleEndStyle = { flex: "none", display: "inline-flex", alignItems: "center" } as const;


/**
 * Ligne de la palette, partagée par les récents et les résultats : une seule
 * anatomie à apprendre, et les récents gagnent gratuitement la surbrillance et
 * la sélection clavier.
 */
function HitRow({
  hit,
  query,
  isCurrent,
  onOpenHit,
}: {
  hit: SearchHit;
  query: string;
  isCurrent?: boolean;
  onOpenHit?: (hit: SearchHit) => void;
}): ReactElement {
  return (
    <ListItemButton
      isFlush
      isSelected={isCurrent}
      style={rowInset}
      onPress={() => onOpenHit?.(hit)}
    >
      {/* `size={24}` et non 20 : le slot `ListItemIcon` fait 24px de large et
          centre son glyphe, donc un glyphe de 20 démarre 2px plus loin que le
          titre de section. En 24 il remplit son slot et tombe pile dessus. */}
      <ListItemIcon>
        <Icon icon={hit.icon} size={24} color="subtle" />
      </ListItemIcon>
      <ListItemText
        primary={
          <span style={titleLine}>
            <span style={titleTextStyle}>
              <Highlight text={hit.title} query={query} />
            </span>
            {/* Fin de la ligne de titre : le statut s'il y en a un, sinon la
                flèche des destinations — elles font naviguer plutôt qu'ouvrir
                une fiche, et c'est le seul repère qui les distingue. */}
            {hit.status ? (
              <span style={titleEndStyle}>
                <Tag label={hit.status.label} color={hit.status.color} />
              </span>
            ) : hit.group === "Aller à" ? (
              <span style={titleEndStyle}>
                <Icon icon="ArrowForward" size={16} color="subtlest" />
              </span>
            ) : null}
          </span>
        }
        secondary={<Highlight text={hit.subtitle} query={query} />}
      />
    </ListItemButton>
  );
}

/** Résultats dans l'ordre d'AFFICHAGE : groupes selon `GROUP_ORDER`. */
export function orderedHits(hits: SearchHit[]): SearchHit[] {
  return GROUP_ORDER.flatMap((g) => hits.filter((h) => h.group === g));
}

// -----------------------------------------------------------------------
// Surface — la modale

/**
 * Surface de recherche globale : un `ModalDialog` qui porte le champ et les
 * résultats. Le contenu de la page reste en place derrière le voile.
 *
 * Le `ModalDialog` du DS apporte déjà le voile, le piège à focus, la fermeture
 * par Échap et par clic extérieur, et le bouton de fermeture du header — rien
 * de tout ça n'est à réécrire ici.
 */
export function GlobalSearchDialog({
  isOpen,
  onOpenChange,
  query,
  onQueryChange,
  onClose,
  onOpenHit,
  isTouch,
  container,
}: {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  query: string;
  onQueryChange: (v: string) => void;
  onClose: () => void;
  onOpenHit?: (hit: SearchHit) => void;
  /**
   * Mise en page **tactile : mobile ET tablette**.
   *
   * Le discriminant est le **type de pointeur**, pas la largeur : une
   * tablette en paysage à 1280 px reste tactile. Les seuils de `Grid`
   * (`BREAKPOINTS.sm` 600px, desktop 1200px) sont des seuils de MISE EN
   * PAGE et ne s'appliquent pas ici : s'y fier donnerait la modale et les
   * raccourcis clavier à une tablette large, qui n'a ni clavier ni `esc`.
   *
   * Ici : masque les raccourcis clavier du pied — il n'y a pas de clavier
   * sous le doigt — et ajoute un bouton de fermeture à côté du champ,
   * puisque `esc` n'y existe pas.
   */
  isTouch?: boolean;
  /**
   * Confine la palette dans ce conteneur (cadre mobile d'une story, zone
   * applicative). Il doit être positionné (`position: relative`).
   *
   * Présent, la palette **remplit le conteneur** au lieu de prendre sa
   * hauteur fixe : en tactile (mobile et tablette), une surface qui ne couvre qu'une partie de
   * l'écran laisserait une bande de contenu inutilisable derrière le voile.
   */
  container?: Element | null;
}): ReactElement {
  // Ce que parcourent les flèches, dans l'ordre d'affichage : les résultats,
  // ou les récents tant que le champ est vide — ils sont une liste comme une
  // autre, il n'y a pas de raison que le clavier s'y arrête.
  // `useMemo` : sans lui le tableau serait recréé à chaque rendu et
  // l'écouteur clavier réattaché en boucle.
  const hits = useMemo(
    () => (query.trim() ? orderedHits(searchHits(query)) : [...RECENT_HITS]),
    [query],
  );
  const [current, setCurrent] = useState(0);

  // Toute frappe refait la liste : la sélection repart en tête, sinon elle
  // désignerait une ligne qui n'existe plus.
  useEffect(() => {
    setCurrent(0);
  }, [query]);

  // Navigation clavier. Écouteur natif sur le conteneur : les touches montent
  // depuis l'input, et `TextField` n'expose pas de gestionnaire.
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return undefined;
    const onKeyDown = (e: KeyboardEvent) => {
      if (hits.length === 0) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setCurrent((c) => (c + 1) % hits.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setCurrent((c) => (c - 1 + hits.length) % hits.length);
      } else if (e.key === "Enter") {
        e.preventDefault();
        const hit = hits[current];
        if (hit) onOpenHit?.(hit);
      }
    };
    el.addEventListener("keydown", onKeyDown);
    return () => el.removeEventListener("keydown", onKeyDown);
  }, [hits, current, onOpenHit]);

  return (
    <ModalDialog
      title="Recherche globale"
      // Palette : le champ tient lieu d'en-tête et `esc` remplace la croix.
      // Le titre reste rendu hors écran, il nomme le dialog.
      showHeader={false}
      width="large"
      {...(container ? { container } : {})}
      // Taille stable, hauteur ET largeur : la palette ne doit pas se
      // redimensionner entre « aucun résultat », les récents et neuf
      // résultats — une surface qui saute à chaque frappe est illisible. Le
      // corps défile déjà (`overflow-y: auto`), donc le pied reste ancré.
      //
      // La largeur doit être posée explicitement : `.modal` n'a pas de
      // dimension propre, donc le `width: 100%` du dialog se résout sur un
      // parent qui s'ajuste au contenu — sans ça la palette passait de 351 à
      // 445px selon ce qu'elle affichait.
      //
      // Confinée, elle remplit son conteneur ; libre, elle prend sa taille.
      style={
        container
          ? { width: "100%", height: "100%", maxHeight: "100%" }
          : {
              width: "min(620px, calc(100vw - var(--space400) * 2))",
              height: "min(560px, calc(100vh - var(--space800) * 2))",
            }
      }
      isOpen={isOpen}
      // Tout passe par `onOpenChange` : Échap et le clic sur le voile. On ne
      // passe PAS `onClose` au ModalDialog — il n'alimente que la croix du
      // header, qui n'existe plus ici.
      onOpenChange={(open) => {
        if (!open) onClose();
        onOpenChange?.(open);
      }}
      // En tactile (mobile et tablette) le pied n'a que le compteur à montrer : tant qu'on n'a rien
      // tapé, il serait une bande vide. On ne le rend alors pas du tout.
      {...(isTouch && !query.trim()
        ? {}
        : {
            footer: (
              <PaletteFooter
                count={hits.length}
                hasQuery={Boolean(query.trim())}
                isTouch={isTouch}
              />
            ),
          })}
      // Le champ est ÉPINGLÉ : il reste en place pendant que les résultats
      // défilent, exactement comme `DrawerHeader` au-dessus de `DrawerBody`
      // sur la feuille tactile. C'est le corps du `ModalDialog` qui défile,
      // donc l'ascenseur est celui du DS — même règle, mêmes jetons et même
      // largeur que sur la tablette — et il ne paraît que s'il sert.
      pinned={
        /* L'écouteur clavier est attaché NATIVEMENT à ce conteneur (voir
           l'effet plus haut) plutôt qu'en prop JSX : `TextField` n'expose
           pas de gestionnaire de touche, et un `onKeyDown` sur un `<div>`
           nu serait à juste titre refusé par `jsx-a11y`. Il suffit qu'il
           entoure le champ : les touches montent depuis l'input, qui est
           le vrai élément focalisable. */
        <div ref={containerRef}>
          {isTouch ? (
            /* En tactile (mobile et tablette), le header du dialog est
               masqué ET `esc` n'existe pas : sans ce bouton, la seule
               sortie serait le voile. On le pose à côté du champ, comme
               le prototype. */
            <div style={{ display: "flex", alignItems: "center", gap: "var(--space100)" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <GlobalSearchBar value={query} onChange={onQueryChange} isTouch />
              </div>
              <Button
                appearance="subtle"
                iconBefore="CloseSmall"
                aria-label="Fermer la recherche"
                onPress={onClose}
              />
            </div>
          ) : (
            <GlobalSearchBar value={query} onChange={onQueryChange} />
          )}
        </div>
      }
    >
      <GlobalSearchResults
        query={query}
        currentIndex={current}
        {...(onOpenHit ? { onOpenHit } : {})}
      />
    </ModalDialog>
  );
}

/** Touche clavier affichée en pastille (`esc`, `↑↓`, `↵`). */
function Kbd({ children }: { children: ReactNode }): ReactElement {
  return (
    <span
      style={{
        fontFamily: "var(--font-family-code)",
        fontSize: "var(--font-size-ui-xxxs)",
        lineHeight: "var(--line-height-ui-xxxs)",
        color: "var(--text-subtlest)",
        border: "1px solid var(--border-subtle)",
        borderRadius: "var(--radius050)",
        padding: "0 var(--space050)",
        flex: "none",
      }}
    >
      {children}
    </span>
  );
}

/**
 * Pied de la palette : raccourcis à gauche, nombre de résultats à droite.
 *
 * **En tactile (mobile et tablette), les raccourcis disparaissent** : il n'y a pas de clavier
 * physique sous le doigt, afficher « ↑↓ naviguer » y serait au mieux du bruit,
 * au pire une promesse non tenue. Seul le compteur reste.
 */
function PaletteFooter({
  count,
  hasQuery,
  isTouch,
}: {
  count: number;
  hasQuery: boolean;
  /**
   * Mise en page **tactile : mobile ET tablette**.
   *
   * Le discriminant est le **type de pointeur**, pas la largeur : une
   * tablette en paysage à 1280 px reste tactile. Les seuils de `Grid`
   * (`BREAKPOINTS.sm` 600px, desktop 1200px) sont des seuils de MISE EN
   * PAGE et ne s'appliquent pas ici : s'y fier donnerait la modale et les
   * raccourcis clavier à une tablette large, qui n'a ni clavier ni `esc`.
   *
   * Ici : le pied se réduit au compteur, les raccourcis disparaissent.
   */
  isTouch?: boolean;
}): ReactElement {
  const compteur = hasQuery ? `${count} résultat${count > 1 ? "s" : ""}` : "";
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space200)",
        width: "100%",
        fontFamily: "var(--font-family-primary)",
        fontSize: "var(--font-size-ui-xxs)",
        color: "var(--text-subtlest)",
      }}
    >
      {isTouch ? null : (
        <>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space050)" }}>
            <Kbd>↑↓</Kbd> naviguer
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space050)" }}>
            <Kbd>↵</Kbd> ouvrir
          </span>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "var(--space050)" }}>
            <Kbd>esc</Kbd> fermer
          </span>
        </>
      )}
      <span style={{ marginLeft: "auto" }}>{compteur}</span>
    </div>
  );
}

/**
 * Surface de recherche **tactile (mobile et tablette)** : une feuille `Drawer`, pas une
 * modale.
 *
 * C'est la convention du DS pour les surfaces tactiles — `FilterChip` et la
 * recette `Filtres` passent par la même. On y gagne les cibles tactiles de
 * `DrawerHeader` et sa croix.
 *
 * **Plein écran** (`size="full"`), et non une feuille à 85dvh : clavier
 * ouvert, c'est le seul levier qui change la capacité. Sur 340x660 avec
 * ~300px de clavier, 85dvh ne laisse que ~177px de résultats (2 rangées)
 * contre ~293px en plein écran (4 rangées).
 *
 * Pas de `swipeable` à cette taille : sur une surface plein écran clavier
 * ouvert, le geste de fermeture vers le bas entre en conflit avec le
 * défilement de la liste. `DrawerHeader` fournit déjà la croix.
 */
export function GlobalSearchSheet({
  isOpen,
  onOpenChange,
  query,
  onQueryChange,
  onClose,
  onOpenHit,
}: {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  query: string;
  onQueryChange: (v: string) => void;
  onClose: () => void;
  onOpenHit?: (hit: SearchHit) => void;
}): ReactElement {
  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
        onOpenChange?.(open);
      }}
      placement="bottom"
      size="full"
      aria-label="Recherche globale"
    >
      {/* Le champ vit dans le header de la feuille : il tient lieu de titre,
          et `DrawerHeader` fournit la croix — `esc` n'existe pas au doigt. */}
      <DrawerHeader onClose={onClose}>
        <GlobalSearchBar value={query} onChange={onQueryChange} isTouch />
      </DrawerHeader>

      <Divider />

      <DrawerBody>
        <GlobalSearchResults
          query={query}
          {...(onOpenHit ? { onOpenHit } : {})}
        />
      </DrawerBody>
    </Drawer>
  );
}

// -----------------------------------------------------------------------
// État partagé

/**
 * État de la recherche globale : la modale est ouverte ou non, et elle porte
 * une requête. Fermer vide la requête — on ne retrouve pas sa recherche
 * précédente en rouvrant, c'est une surface qu'on traverse.
 */
export function useGlobalSearch(): {
  /** Vrai quand la modale de recherche est ouverte. */
  isSearching: boolean;
  query: string;
  setQuery: (v: string) => void;
  /** Clic sur la loupe de la barre. */
  open: () => void;
  /** Fermeture (croix, Échap, clic sur le voile) : requête vidée. */
  close: () => void;
} {
  const [isSearching, setIsSearching] = useState(false);
  const [query, setQuery] = useState("");

  return {
    isSearching,
    query,
    setQuery,
    open: () => setIsSearching(true),
    close: () => {
      setQuery("");
      setIsSearching(false);
    },
  };
}
