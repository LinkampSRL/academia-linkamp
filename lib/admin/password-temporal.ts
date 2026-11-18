import 'server-only'
import { randomInt } from 'node:crypto'

// Sin caracteres ambiguos al copiar/leer en un chat (0/O, 1/l/I) ni símbolos
// que un cliente de mensajería pueda interpretar como formato.
const MAYUSCULAS = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
const MINUSCULAS = 'abcdefghijkmnopqrstuvwxyz'
const DIGITOS = '23456789'
const ALFABETO = MAYUSCULAS + MINUSCULAS + DIGITOS

const LARGO = 12
const GRUPO = 4

// Contraseña temporal de 12 caracteres con formato XXXX-XXXX-XXXX (~70 bits
// de entropía), generada con node:crypto (CSPRNG). randomInt() elige sin
// sesgo de módulo; la composición (al menos una mayúscula, una minúscula y
// un dígito) se resuelve volviendo a sortear, no parchando posiciones. Ese
// re-sorteo sobrerrepresenta algo los dígitos y cuesta menos de 1 bit de
// entropía. No se guarda ni se loguea en ningún lado: vive solo en la
// respuesta que se muestra una única vez.
export function generarPasswordTemporal(): string {
  for (;;) {
    let crudo = ''
    for (let i = 0; i < LARGO; i++) {
      crudo += ALFABETO[randomInt(ALFABETO.length)]
    }
    if (/[A-Z]/.test(crudo) && /[a-z]/.test(crudo) && /[2-9]/.test(crudo)) {
      const grupos: string[] = []
      for (let i = 0; i < LARGO; i += GRUPO) grupos.push(crudo.slice(i, i + GRUPO))
      return grupos.join('-')
    }
  }
}
