'use client'

import { MotionConfig } from 'motion/react'

/* ============================================================
   CONFIGURACIÓN GLOBAL DE MOVIMIENTO

   `reducedMotion="user"` hace que Motion respete la preferencia
   del sistema por su cuenta: cuando está activada, desactiva las
   animaciones de transform y layout (desplazamientos, escalas,
   rotaciones) y deja pasar solo opacidad y color.

   Esto reemplaza al patrón `variants={reduce ? still : fadeUp}`,
   que parecía equivalente pero tenía un fallo real: el hook de
   preferencia solo puede dar el valor correcto DESPUÉS de montar
   —si lo da antes, el marcado del servidor y el del cliente no
   coinciden y React rehace la página— y ese cambio a mitad de
   camino intercambiaba el objeto de variantes por otro, lo que
   dejaba a los hijos orquestados congelados en su estado
   "hidden": secciones enteras invisibles para quien tiene la
   preferencia puesta.

   Con MotionConfig la decisión se toma en el momento de animar,
   no en el de renderizar. El marcado es idéntico siempre.
   ============================================================ */

export function MotionProvider({ children }: { children: React.ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}
