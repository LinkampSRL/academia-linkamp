---
modulo: "04"
titulo: "Ensayos y Recomendaciones"
curso: "balanzas-electronicas"
version: "REV00"
---

## 4. Ensayos y Recomendaciones

---

### 4.1 Ensayos metrológicos

Para corroborar el correcto funcionamiento metrológico se debe realizar una calibración, para la cual se utilizan pesos patrones (acordes a la clase de la balanza) y procedimientos específicos. Estos procedimientos quedan fuera del alcance del presente curso, pero explicaremos brevemente sus partes más relevantes, de las cuales nos podemos valer para tener una idea de si el instrumento está dentro de los límites admisibles.

#### Repetibilidad o fidelidad

Esta prueba consiste en colocar y quitar una carga sobre la balanza reiteradamente, al menos 3 veces. Se deberá cuidar de aplicar la misma carga todas las veces en el mismo lugar (centro de la plataforma), a iguales intervalos de tiempo. Se toman nota de los valores que se obtienen al colocar la carga. La diferencia entre cualquiera de las mediciones no debe ser superior a **3 divisiones**.

Como carga de prueba se pueden utilizar valores de, por ejemplo, 50% de la capacidad máxima.

#### Excentricidad

Los ensayos de excentricidad de carga se efectúan mediante una carga de prueba que se debe colocar sobre los diferentes extremos del dispositivo receptor de carga, uno a la vez. Dicha carga de prueba debe ser igual a **un tercio de la capacidad máxima**.

Tomemos como ejemplo una plataforma rectangular de capacidad máxima 30 kg; el ensayo se debe realizar con una carga de 10 kg en los diferentes puntos de la plataforma:

![Puntos de ensayo de excentricidad](./imagenes/imagen_24_puntos_ensayo_excentricidad.png)
*Imagen 24 — Puntos de ensayo de excentricidad sobre la plataforma.*

Para pasar de un punto a otro se debe dejar la plataforma vacía.

Se registran los valores obtenidos al colocar la carga. La diferencia entre cualquiera de las mediciones no debe ser superior a **3 divisiones**.

#### Linealidad

Consiste en ir agregando peso conocido sobre la balanza hasta alcanzar la capacidad máxima (carrera ascendente). Alcanzado el máximo, se va retirando la carga hasta llegar a cero (carrera descendente).

Se recomienda probar en **10 puntos**. En la siguiente tabla vemos una posibilidad para el ejemplo de la plataforma de 30 kg:

| N.º | Valor Referencia [kg] | Valor medido Ascendente | Valor medido Descendente |
|-----|-----------------------|-------------------------|--------------------------|
| 1   | 0,1                   |                         |                          |
| 2   | 0,5                   |                         |                          |
| 3   | 1                     |                         |                          |
| 4   | 2                     |                         |                          |
| 5   | 5                     |                         |                          |
| 6   | 10                    |                         |                          |
| 7   | 15                    |                         |                          |
| 8   | 20                    |                         |                          |
| 9   | 25                    |                         |                          |
| 10  | 30                    |                         |                          |

La diferencia entre cualquiera de los valores ascendente o descendente con respecto al valor de referencia no debe ser superior a **3 divisiones**.

---

### 4.2 Detección de fallas

En este punto nos centraremos en las fallas típicas que provocan una diferencia en el peso visualizado. Es decir, tenemos un instrumento que pesa mal, pero que enciende y muestra información en pantalla.

Si nos llegamos a encontrar ante casos donde no hay señales visibles ni acústicas, se deberán revisar la fuente de alimentación, corroborar fusibles, asegurar que llega tensión a la placa, asegurar que todos los cables y fichas se encuentran bien conectados, o bien, corroborar si es un problema de display.

Asimismo, dejaremos de lado aquellas fallas que el propio indicador visualiza en pantalla con algún código de error; para analizar la causa de estas se deberá revisar el manual correspondiente.

#### Problemas de linealidad

Si no se encuentran problemas de repetibilidad y de excentricidad, pero los valores de la linealidad difieren de los valores de prueba, se debe realizar un **ajuste de cero y span** para corregir la curva de calibración.

Si la linealidad es correcta hasta un punto, pero al seguir incrementando la carga se obtienen valores muy diferentes, se deben revisar los topes de la plataforma o retenciones por rozamiento con algún objeto o acumulación de suciedad.

#### Problemas de repetibilidad

En general los problemas de repetibilidad vienen combinados con errores de excentricidad y linealidad.

Revisar los topes de la plataforma; buscar retenciones por acumulación de suciedad. De persistir, revisar los montajes de celdas y sus vinculaciones.

Puede ocurrir también que la celda de carga, o alguna de ellas en sistemas con más de una, esté dañada; para esto se las deberá medir (ver sección 4.3).

Descartados los problemas mencionados, sospecharemos del indicador y deberemos probar con uno de repuesto. Para la prueba de los indicadores fuera del sistema de pesaje, se puede utilizar un **simulador de celdas de carga**, que es un dispositivo que genera valores estables en mV.

#### Problemas de excentricidad

Si contamos con problemas de excentricidad, se deberá revisar en primer lugar los topes y buscar posibles retenciones por roces de la plataforma con algún objeto o por acumulación de suciedad.

En sistemas con más de una celda de carga, puede ocurrir que una celda esté dañada o bien que no estén correctamente ecualizadas. Para ver esto, debemos intervenir sobre la placa de ecualización (ver sección 4.5).

Para el caso de las monoceldas, por su diseño, la excentricidad viene ajustada desde fábrica. En caso de ser este el problema, se puede ajustar, pero es una tarea laboriosa que requiere cierta práctica.

![Ajuste de excentricidad en monocelda](./imagenes/imagen_25_ajuste_excentricidad_monocelda.jpeg)
*Imagen 25 — Ajuste de excentricidad en monocelda.*

---

### 4.3 Cómo medir celdas de carga

Para medir una celda de carga necesitamos un **multímetro** y una **fuente de alimentación de 12 V** con salida estable (por ejemplo, una fuente de PC o bien un indicador de peso).

**Paso 1 — Medir resistencias de excitación y de señal**

Con el multímetro colocado en escala de 2 kΩ, realizar dos mediciones:

1. Entre el par de conductores de **excitación** (negro y rojo).
2. Entre los cables de **señal** (verde y blanco).

Los valores medidos deben coincidir con los que declara el fabricante para ese modelo de celda (consultables en la ficha técnica o en el test report).

Si en alguna de estas dos mediciones nos encontramos con el circuito abierto, debemos revisar el cable de la celda; si este no es el problema, debemos cambiarla.

**Paso 2 — Medir balance de cero**

Con la celda sin carga (retirada de la balanza):

1. Colocar el multímetro en una escala que permita medir como mínimo décima de mV (0,1 mV).
2. Conectar las puntas entre los cables de señal.
3. Conectar la fuente en los cables de alimentación.
4. La lectura del voltímetro debería estar en cero e incrementar o decrementar al ejercerle fuerza a la celda.

En general el balance de cero no debe ser mayor a **±1% FS**.

Por ejemplo, para una celda de 2 mV/V alimentada con 12 V:
**1% × 2 mV/V × 12 V = ±0,24 mV**

> En caso de sobrecargas de la plataforma se suelen encontrar celdas con resistencia abierta o con valores altos de balance de cero.

#### Cómo identificar los cables de una celda

Del procedimiento de medición anterior se desprende un método para identificar los cables en caso de no conocer el código de colores:

1. Medir resistencia entre cada par posible de cables (son 6 combinaciones). Se esperan 4 valores iguales y 2 distintos y mayores. **El par con el valor mayor de resistencia corresponde a la excitación; el otro par es la señal.**

2. Identificados los pares, se determina la polaridad: aplicar tensión al par de excitación y, con el multímetro en mV conectado a los cables de señal, buscar un **incremento positivo** de la lectura al aplicarle fuerza a la celda.

---

### 4.4 Ajuste de cero y span

Una de las operaciones que frecuentemente se debe realizar —ya sea por desvíos en los valores medidos, reemplazo de una celda de carga o equipo nuevo— es el **ajuste de cero y span**.

Algunos indicadores muy simples, al encenderlos, toman el valor que está entregando la celda en ese momento como el cero, y el span queda definido por un potenciómetro en el interior. En estos casos:

1. Encender la balanza **sin carga** en la plataforma y esperar a que muestre cero en el display.
2. Colocar un peso conocido y accionar el potenciómetro hasta que la lectura indique el valor del peso de referencia.

En otros indicadores, estas configuraciones se realizan mediante un menú (ver sección 3.2 para el ejemplo completo del controlador DRACO).

Vale la pena aclarar que en la mayoría de los indicadores, el ajuste se puede realizar con un peso de referencia que **no necesariamente coincide** con la capacidad máxima. Como regla general se recomienda al menos el 20–30% de la capacidad.

---

### 4.5 Ecualización

Para balanzas con más de una celda, como por ejemplo una plataforma para pesar pallets, nos encontraremos con una **placa sumadora o ecualizadora**. Esta placa permite la conexión de las celdas hacia el indicador mediante un único cable, y además permite ecualizar las señales de las celdas para corregir los problemas de excentricidad.

![Placas ecualizadoras](./imagenes/imagen_26_placas_ecualizadoras.jpeg)
*Imagen 26 — Placas ecualizadoras.*

En caso de tener más de 4 celdas, se conecta más de una placa.

El proceso de ecualización es **iterativo**, es decir, requiere realizar varias veces una misma secuencia hasta reducir al mínimo la diferencia de excentricidad.

**Procedimiento:**

1. Accionar todos los potenciómetros hacia el mismo extremo.
2. Con una carga de prueba, obtener los valores indicados al colocarla lo más concentrada posible sobre cada celda de carga.
3. Si la diferencia entre cualquiera de estos valores no es mayor a 3 divisiones, no es necesario hacer nada más.
4. De lo contrario, tomar como referencia el valor más bajo (si al accionar el potenciómetro se obtiene decremento) o el valor más alto (si se obtiene incremento), y ajustar cada potenciómetro correspondiente hasta que todos los puntos coincidan con el valor de referencia.
5. Repetir el proceso hasta minimizar la diferencia entre puntos.

Terminado el proceso de ecualización, realizar un **ajuste de cero y span**.

La carga de prueba debe ser aproximadamente **1/3 de la capacidad máxima** para sistemas con hasta 4 celdas. Si hay más de 4 celdas, se utiliza un valor aproximado a la capacidad máxima dividido la cantidad de celdas.

---

### 4.6 Buenas prácticas

Para un correcto funcionamiento de un sistema de pesaje es fundamental mantenerlo limpio y tratarlo con el cuidado que requiere.

Muchos de los problemas que presentan se deben a suciedad que traba la plataforma o que ingresa en el controlador.

Es importante asegurar que los cables de celda no queden expuestos a aplastamientos o posibles enganches, como así también cubrir los montajes de celdas para impedir la acumulación de suciedad.

Por último, es muy recomendable realizar **controles periódicos con pesos conocidos** para que, en caso de ocurrir desvíos, encontrarlos rápidamente y no generar errores en los procesos donde interviene la balanza.
