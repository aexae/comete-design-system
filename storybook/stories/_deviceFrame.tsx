// Cadre « device » réutilisable pour prévisualiser une story dans un VRAI
// viewport via <iframe> : chaque iframe a sa propre taille, donc Grid (media
// queries), Page.Bar (@container) et le wrap de la Toolbar réagissent
// réellement — un simple <div> à largeur fixe laisserait Grid en mode desktop.
//
// Non préfixé *.stories.tsx → pas indexé comme story ; simple helper partagé.
import type { ReactElement } from "react";
import { Text } from "@aexae/comete-design-system/components";

/** URL canvas d'une story (mode iframe autonome). */
export const storyUrl = (id: string) => `/iframe.html?id=${id}&viewMode=story`;

export interface DeviceFrameProps {
  /** ID de la story cible (ex. "layout-page--full-page-desktop-raw"). */
  storyId: string;
  /** Largeur RÉELLE du device (= viewport de l'iframe, avant mise à l'échelle). */
  width: number;
  /** Hauteur réelle du device. */
  height: number;
  /** Facteur d'échelle d'affichage (`transform: scale`). @default 1 */
  scale?: number;
  /** Habillage : fenêtre navigateur (3 points) ou téléphone (encoche + barre home). @default "browser" */
  variant?: "browser" | "phone";
  /** Libellé sous le cadre. */
  label: string;
  /** Phrase descriptive sous le libellé. */
  note?: string;
}

/** Cadre device sobre (pas d'image) enveloppant l'iframe d'une story. */
export function DeviceFrame({
  storyId,
  width,
  height,
  scale = 1,
  variant = "browser",
  label,
  note,
}: DeviceFrameProps): ReactElement {
  const isPhone = variant === "phone";
  const w = width * scale;
  const h = height * scale;
  return (
    <figure
      style={{
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: "var(--space150)",
        alignItems: "center",
      }}
    >
      <div
        style={{
          width: w,
          background: "var(--background-surface-default)",
          border: isPhone
            ? "8px solid var(--background-neutral-bold-default)"
            : "1px solid var(--border-default)",
          borderRadius: isPhone ? 36 : "var(--radius200)",
          overflow: "hidden",
          boxSizing: "content-box",
        }}
      >
        {isPhone ? (
          // Encoche symbolique
          <div style={{ position: "relative", height: 16, background: "var(--background-surface-default)" }}>
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: 90,
                height: 12,
                background: "var(--background-neutral-bold-default)",
                borderRadius: "0 0 10px 10px",
              }}
            />
          </div>
        ) : (
          // Barre de fenêtre : 3 points
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              height: 20,
              paddingInline: 8,
              background: "var(--background-neutral-subtlest-default)",
              borderBottom: "1px solid var(--border-subtle)",
            }}
          >
            {[0, 1, 2].map((d) => (
              <span
                key={d}
                style={{ width: 6, height: 6, borderRadius: "var(--radius-round)", background: "var(--border-default)" }}
              />
            ))}
          </div>
        )}
        {/* Fenêtre à la taille réelle du device, réduite via transform: scale() */}
        <div style={{ width: w, height: h, overflow: "hidden" }}>
          <iframe
            src={storyUrl(storyId)}
            title={label}
            style={{ width, height, border: 0, transform: `scale(${scale})`, transformOrigin: "top left" }}
          />
        </div>
        {isPhone && (
          // Barre home symbolique
          <div style={{ display: "flex", justifyContent: "center", padding: "6px 0", background: "var(--background-surface-default)" }}>
            <div style={{ width: 90, height: 4, borderRadius: "var(--radius-round)", background: "var(--background-neutral-bold-default)", opacity: 0.5 }} />
          </div>
        )}
      </div>
      <figcaption style={{ textAlign: "center", maxWidth: Math.max(w, 200) }}>
        <Text as="div" weight="bold">
          {label}
        </Text>
        {note ? (
          <Text as="div" size="small" color="subtle">
            {note}
          </Text>
        ) : null}
      </figcaption>
    </figure>
  );
}
