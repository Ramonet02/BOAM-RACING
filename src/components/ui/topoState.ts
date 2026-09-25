// Estado compartido del efecto de curvas de nivel del cursor.
// `intensity` se interpola dentro del tick del canvas: nunca se escribe desde fuera.
//
// NOTA: el unico escritor de `target` era <TopoButton>, un boton del tema arena
// antiguo que se borro en la integracion. Hoy nadie lo escribe, asi que el realce
// de "pico bajo el boton" queda inactivo; el efecto base sigue funcionando. Si se
// quiere recuperar, basta con que un componente ponga aqui el centro del boton.
//
// SOLIDOS
// El canvas es `position: fixed; z-index: 5` y pinta POR ENCIMA del contenido
// (ver CursorTopoEffect). Un fondo opaco no lo tapa, y subir un componente por
// encima del canvas con z-index tampoco sirve donde un ancestro crea su propio
// contexto de apilamiento (`.dust-overlay` lleva `isolation: isolate`, y
// `position: sticky` siempre crea uno). Asi que es el canvas el que se aparta:
// cada elemento registrado aqui se recorta del dibujo en cada repintado, y el
// canvas vuelve a recortar cuando la caja se mueve (scroll, giro, acordeon).

export const topoState: {
  target: { x: number; y: number } | null; // centro del realce (hoy sin escritor)
  pos:    { x: number; y: number } | null; // ultima posicion conocida (para el lerp de salida)
  intensity: number;                       // 0..1, interpolada cada frame en el canvas
  solids: Set<Element>;                    // elementos sobre los que no se dibuja
  solidsVersion: number;                   // sube al registrar o retirar un solido
} = {
  target:    null,
  pos:       null,
  intensity: 0,
  solids:    new Set(),
  solidsVersion: 0,
};

/**
 * Ref de React que marca un elemento como solido: las curvas de nivel no se
 * dibujan encima de el. Es una funcion de modulo, estable entre renders, asi
 * que React no la vuelve a llamar en cada render. Devuelve la limpieza (React
 * 19 la ejecuta al desmontar el elemento).
 *
 *   <div ref={topoSolidRef}>…</div>
 */
export function topoSolidRef(node: Element | null): (() => void) | undefined {
  if (!node) return undefined;
  topoState.solids.add(node);
  topoState.solidsVersion += 1;
  return () => {
    topoState.solids.delete(node);
    topoState.solidsVersion += 1;
  };
}
