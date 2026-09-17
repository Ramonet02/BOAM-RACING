// Estado compartido del efecto de curvas de nivel del cursor.
// `intensity` se interpola dentro del tick del canvas: nunca se escribe desde fuera.
//
// NOTA: el unico escritor de `target` era <TopoButton>, un boton del tema arena
// antiguo que se borro en la integracion. Hoy nadie lo escribe, asi que el realce
// de "pico bajo el boton" queda inactivo; el efecto base sigue funcionando. Si se
// quiere recuperar, basta con que un componente ponga aqui el centro del boton.

export const topoState: {
  target: { x: number; y: number } | null; // centro del realce (hoy sin escritor)
  pos:    { x: number; y: number } | null; // ultima posicion conocida (para el lerp de salida)
  intensity: number;                       // 0..1, interpolada cada frame en el canvas
} = {
  target:    null,
  pos:       null,
  intensity: 0,
};
