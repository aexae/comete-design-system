// Tabs — Comète Design System
// Composant tabs accessible basé sur React Aria.
import type { ReactElement, ReactNode } from "react";
import {
  Tabs as AriaTabs,
  TabList as AriaTabList,
  Tab as AriaTab,
  TabPanel as AriaTabPanel,
  type TabsProps as AriaTabsProps,
  type TabListProps as AriaTabListProps,
  type TabProps as AriaTabProps,
  type TabPanelProps as AriaTabPanelProps,
} from "react-aria-components";
import type { IconName } from "@naxit/comete-icons";
import { Icon } from "../Icon/index.js";
import { FocusRing } from "../FocusRing/index.js";
import styles from "./Tabs.module.css";

// -----------------------------------------------------------------------
// Types publics

export interface TabsProps
  extends Omit<AriaTabsProps, "className" | "style"> {
  /** Additional CSS class. */
  className?: string;
  children: ReactNode;
}

export interface TabListProps<T extends object = object>
  extends Omit<AriaTabListProps<T>, "className" | "style"> {
  /** Additional CSS class. */
  className?: string;
  children: ReactNode;
}

export interface TabProps
  extends Omit<AriaTabProps, "className" | "style" | "children"> {
  /** Label du tab. */
  children: ReactNode;
  /** Icône affichée avant le label. */
  iconBefore?: IconName;
  /** Icône affichée après le label. */
  iconAfter?: IconName;
  /** Additional CSS class. */
  className?: string;
}

export interface TabPanelProps
  extends Omit<AriaTabPanelProps, "className" | "style"> {
  /** Additional CSS class. */
  className?: string;
  children?: ReactNode;
}

// -----------------------------------------------------------------------
// Tabs — root container

/**
 * Tabs — Comète Design System
 *
 * Composant d'onglets accessible basé sur React Aria.
 * Composé de quatre sous-composants : `Tabs` (racine), `TabList` (liste des onglets),
 * `Tab` (onglet individuel) et `TabPanel` (contenu associé).
 *
 * ```tsx
 * <Tabs defaultSelectedKey="details">
 *   <TabList>
 *     <Tab id="details" iconBefore="Info">Détails</Tab>
 *     <Tab id="activity" iconBefore="Activity">Activité</Tab>
 *     <Tab id="settings" iconBefore="Settings">Paramètres</Tab>
 *   </TabList>
 *   <TabPanel id="details">Contenu des détails…</TabPanel>
 *   <TabPanel id="activity">Contenu de l'activité…</TabPanel>
 *   <TabPanel id="settings">Contenu des paramètres…</TabPanel>
 * </Tabs>
 * ```
 *
 * @param children - TabList + TabPanels
 */
export function Tabs({
  className,
  children,
  ...props
}: TabsProps): ReactElement {
  const classNames = [styles.tabs, className].filter(Boolean).join(" ");
  return (
    <AriaTabs {...props} className={classNames}>
      {children}
    </AriaTabs>
  );
}

Tabs.displayName = "Tabs";

// -----------------------------------------------------------------------
// TabList — horizontal list of tabs with bottom border

export function TabList<T extends object>({
  className,
  children,
  ...props
}: TabListProps<T>): ReactElement {
  const classNames = [styles.tabList, className].filter(Boolean).join(" ");
  return (
    <AriaTabList {...props} className={classNames}>
      {children}
    </AriaTabList>
  );
}

TabList.displayName = "TabList";

// -----------------------------------------------------------------------
// Tab — individual tab item

export function Tab({
  children,
  iconBefore,
  iconAfter,
  className,
  ...ariaProps
}: TabProps): ReactElement {
  return (
    <AriaTab
      {...ariaProps}
      className={[styles.tab, className].filter(Boolean).join(" ")}
    >
      {({ isSelected, isDisabled, isPressed, isFocusVisible }) => {
        /** Icon color follows label semantic: subtle → primary on press, information on selected. */
        const iconColor = isDisabled
          ? "disabled"
          : isSelected
            ? "information"
            : isPressed
              ? "default"
              : "subtle";

        return (
        <>
          <span className={styles.tabContainer}>
            {iconBefore && (
              <Icon
                icon={iconBefore}
                size={20}
                appearance="outlined"
                color={iconColor}
              />
            )}
            <span className={styles.tabLabel}>{children}</span>
            {iconAfter && (
              <Icon
                icon={iconAfter}
                size={20}
                appearance="outlined"
                color={iconColor}
              />
            )}
          </span>
          <span className={styles.tabIndicator} />
          {isFocusVisible && <FocusRing borderRadius={2} position="outside" />}
        </>
        );
      }}
    </AriaTab>
  );
}

Tab.displayName = "Tab";

// -----------------------------------------------------------------------
// TabPanel — content area

export function TabPanel({
  className,
  children,
  ...props
}: TabPanelProps): ReactElement {
  const classNames = [styles.tabPanel, className].filter(Boolean).join(" ");
  return (
    <AriaTabPanel {...props} className={classNames}>
      {children}
    </AriaTabPanel>
  );
}

TabPanel.displayName = "TabPanel";
