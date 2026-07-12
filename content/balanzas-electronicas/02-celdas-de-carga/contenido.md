---
modulo: "02"
titulo: "Celdas de Carga"
curso: "balanzas-electronicas"
version: "REV00"
---

## 2. Celdas de Carga

Como ya hemos visto antes, la celda de carga es uno de los elementos fundamentales de una balanza electrónica.

---

### 2.1 ¿Qué es una celda de carga?

![Diferentes modelos de celdas de carga](./imagenes/imagen_03_modelos_celdas_de_carga.png)
*Imagen 3 — Diferentes modelos de celdas de carga.*

Una celda de carga es un elemento físico diseñado para soportar la carga y traducirla en una señal eléctrica. Según el diseño, las cargas a medir pueden ser de compresión, tensión, flexión y torsión:

![Tipos de cargas](./imagenes/imagen_04_tipos_de_cargas.png)
*Imagen 4 — Tipos de cargas.*

A grandes rasgos, se las puede clasificar en dos grupos: digitales y analógicas. En este curso nos centraremos en las **celdas de carga analógicas**.

---

### 2.2 Componentes de la celda de carga

#### Cuerpo

Es una pieza especialmente diseñada que, al aplicar una carga, se deforma de manera controlada.

Los cuerpos de las celdas de carga se fabrican en diversos materiales, siendo los más comunes:

- **Aluminio:** para celdas de baja capacidad y del tipo monopunto o monocelda. Suelen ser las más económicas.
- **Aleación de acero:** para aplicaciones de mayor capacidad. Con este material se logra la mejor relación costo-desempeño.
- **Acero inoxidable:** dado su alto costo, se emplea en aplicaciones donde se requiere una elevada resistencia a la corrosión. En general este tipo de celdas son herméticamente selladas, con lo cual se pueden utilizar en ambientes hostiles y con elevada humedad.

#### Strain gage (galga extensiométrica)

![Strain gage](./imagenes/imagen_05a_strain_gage_foto.jpeg)
*Imagen 5 — Strain gage.*

![Detalle strain gage](./imagenes/imagen_05b_strain_gage_detalle.png)
*Imagen 5 (detalle) — Componentes del strain gage.*

Un **strain gage** o galga extensométrica es un sensor que mide deformación. Su principio de funcionamiento se basa en el **efecto piezorresistivo**, que es la propiedad que tienen ciertos materiales de cambiar el valor nominal de su resistencia cuando se les somete a ciertos esfuerzos y se deforman en dirección de los ejes mecánicos. Un esfuerzo que deforma la galga producirá una variación en su resistencia eléctrica. Esta variación se produce por el cambio de longitud, el cambio originado en la sección o el cambio generado en la resistividad.

La galga extensiométrica hace una lectura directa de las deformaciones longitudinales en cierto punto del material que se está analizando. La magnitud que lo representa es **ε**, que es adimensional y expresa el cambio de la longitud sobre la longitud inicial.

La galga extensométrica más común está formada por un alambre o lámina muy fina configurada de tal manera que exista un cambio lineal en la resistencia eléctrica cuando se aplica una deformación en una dirección específica. Aumentará su resistencia al estirarse y disminuirá al contraerse. Esta variación es la que luego se medirá y transformará en valores de peso.

![Modelos de strain gage — serie A](./imagenes/imagen_06a_modelos_strain_gage.png)
*Imagen 6a — Diferentes modelos de strain gage.*

![Modelos de strain gage — serie B](./imagenes/imagen_06b_modelos_strain_gage.png)
*Imagen 6b — Diferentes modelos de strain gage.*

Existe un sinnúmero de modelos y diseños de galgas, según aplicación, materiales de los cuerpos de la celda, temperaturas de funcionamiento, etc.

#### Cable

Mediante el cable, podemos conectar la celda (o celdas) al elemento indicador o controlador del sistema de pesaje.

Para el conexionado se emplean **4 conductores** (2 para la alimentación de la celda y 2 para la señal de respuesta). Existen modelos que poseen 2 conductores adicionales, llamados de censado. Estos conductores, si están presentes y el controlador de peso lo permite, se utilizan para realizar una compensación de la señal debida a la atenuación que puede provocar la longitud del cable y para compensar efectos de variación de temperatura.

Nuestra línea de celdas marca **Zell** utiliza cable de 4 conductores apantallado mediante una malla. Esta malla se conecta a la tierra del indicador (mediante grampas o borneras).

A continuación se detalla el código de colores utilizado por nuestras celdas Zell:

![Código de colores celdas Zell](./imagenes/imagen_07_codigo_colores_zell.png)
*Imagen 7 — Código de colores celdas Zell.*

Cabe destacar que este código puede variar según cada fabricante. Se deberá consultar la hoja de datos correspondiente para corroborarlo.

Además de los 4 conductores, se encontrará un 5.º cable desnudo, que está en contacto con la malla y facilita la conexión a tierra de esta.

También debemos mencionar que en celdas económicas o de poca calidad, se suele omitir el apantallado de los conductores e incluso el envainado exterior. El mallado cumple la función de proteger a los conductores de alimentación y señal de posibles tensiones inducidas. Estas podrían provocar errores aleatorios del sistema de pesaje, e incluso podrían dañar la celda.

---

### 2.3 Principio de funcionamiento

Como hemos visto anteriormente, al aplicar una carga sobre el cuerpo de la celda, este se deforma y contrae o estira el o los strain gage que tiene adherido. Esto provoca un cambio de resistencia, el cual debemos medir.

Para poder medir esto, se conectan las galgas de manera de formar un circuito muy conocido: el **puente de Wheatstone**.

Este es un circuito eléctrico que se utiliza para medir resistencias desconocidas mediante el equilibrio de las ramas del puente.

![Esquema puente de Wheatstone](./imagenes/imagen_08_puente_wheatstone.png)
*Imagen 8 — Esquema puente de Wheatstone.*

Estas están constituidas por cuatro resistencias que forman un circuito cerrado, siendo una de ellas la resistencia bajo medida (Rx).

En el esquema anterior se tiene Rx, que es la resistencia cuyo valor se quiere determinar; R1, R2 y R3 son resistencias de valores conocidos, además la resistencia R2 es ajustable para fijar el punto de equilibrio. Si la relación de las dos resistencias de la rama conocida (R1/R2) es igual a la relación de las dos de la rama desconocida (R3/Rx), el voltaje entre los puntos D y B será nulo y no circulará corriente a través del galvanómetro VG. En caso de desequilibrio, la dirección de la corriente en el galvanómetro indica si R2 es demasiado alta o demasiado baja. El valor de voltaje de la fuente de poder (Vs) es indiferente y no afecta la medición.

En condición de equilibrio, cuando el puente está construido de forma que R3 es igual a R1, Rx es igual a R2 (corriente nula por el galvanómetro).

Si los valores de R1, R2 y R3 se conocen con mucha precisión, el valor de Rx puede ser determinado igualmente con precisión. Pequeños cambios en el valor de Rx romperán el equilibrio y serán claramente detectados por la indicación del galvanómetro.

De forma alternativa, si los valores de R1, R2 y R3 son conocidos y R2 no es ajustable, la corriente que fluye a través del galvanómetro puede ser utilizada para calcular el valor de Rx, siendo este procedimiento más rápido que ajustar a cero la corriente a través del medidor.

Ya hemos visto qué le sucede a una galga cuando se la deforma y hemos hecho una introducción al puente de Wheatstone. Veamos ahora cómo es que esto se conjuga y nos permite realizar la medición.

Consideremos una columna compuesta por un bloque de acero a la cual le podemos adherir galgas en cada una de sus caras laterales. Si aplicamos una fuerza de compresión en la cara superior, disminuirá la altura del bloque y se abombará hacia afuera, como si fuera un barril. Dos de las galgas estarán colocadas opuestas una de la otra para responder proporcionalmente al cambio de longitud; las otras dos al abombamiento:

![Ejemplo columna con galgas](./imagenes/imagen_09_ejemplo_columna.png)
*Imagen 9 — Ejemplo de columna con galgas extensiométricas.*

Podemos conectar las galgas en la configuración de puente de Wheatstone y reemplazar la escala del galvanómetro para que muestre un peso [kg] o una fuerza [N] en vez de Volts.

![Esquema circuito celda de carga](./imagenes/imagen_10_circuito_celda_de_carga.png)
*Imagen 10 — Esquema del circuito de una celda de carga.*

De esta manera logramos una balanza en su mínima expresión.

Las celdas de carga se fabrican en diferentes formas y configuraciones, colocando los strain gauges en forma estratégica para obtener resultados óptimos.

---

### 2.4 Señal de salida

La señal de salida de una celda de carga se determina no solamente por la carga que se les aplica, sino también por el **voltaje de excitación** y su **tasa de sensibilidad [mV/V]** a fondo de escala (FS).

Uno de los valores de sensibilidad más común es **2 mV/V**. Esto significa que por cada volt de excitación que se aplica a carga máxima, habrá 2 mV de señal de salida. Supongamos que una celda de esta sensibilidad y capacidad máxima 10 kg es alimentada con 5 V; entonces cuando apliquemos la carga máxima tendremos:

**5 V × 2 mV/V = 10 mV**

Es decir que para una carga de 10 kg, el resultado de la medición es 10 mV. Esta es una relación lineal; con lo cual, si aplicamos 5 kg, el resultado es 5 mV.

> **Ejercicio 1:** ¿Cuál sería la lectura si aplicamos 8 kg?

> **Ejercicio 2:** ¿Cuánto es la carga si la lectura es de 2,25 mV?

> **Ejercicio 3:** Si tuviéramos una celda de capacidad máxima 100 kg, sensibilidad 3 mV/V, alimentada con 10 V, ¿cuánto es la carga si la lectura obtenida es de 15 mV?

---

### 2.5 Ficha técnica

La **ficha técnica** es un documento donde encontraremos las características eléctricas de cada modelo de celda, como así también las dimensiones físicas, material y capacidades máximas disponibles. A modo de ejemplo, a continuación se muestra la ficha técnica de nuestra celda marca Zell, modelo SPA (disponible también en el **Anexo A**).

![Ficha técnica celda Zell SPA](./imagenes/imagen_27_ficha_tecnica_celda_spa.jpeg)
*Imagen 27 — Ficha técnica celda Zell, modelo SPA.*

---

### 2.6 Test report

La mayoría de las celdas de carga, incluidas las nuestras, vienen con un **certificado de fábrica o test report**. A continuación se muestra, como ejemplo, el test report de una de nuestras celdas (disponible también en el **Anexo B**).

![Test report celda Zell SPA](./imagenes/imagen_28_test_report_celda_spa.jpeg)
*Imagen 28 — Test report celda Zell, modelo SPA.*

En este documento se proporcionan los datos pertinentes de la celda de carga, referido al modelo, número de serie y capacidad. En él se detalla la sensibilidad real de la celda en mV/V y demás valores típicos de la celda. También se incluye el código de colores para el cableado.

A continuación listamos y comentamos cada una de estas características:

#### Balance de cero

La señal de salida de la celda de carga, con excitación estipulada y sin carga aplicada, generalmente expresado en porcentaje de señal de salida estipulada (FS, Fondo de escala).

#### Deriva (Creep)

Cambio de señal de salida de la celda de carga que ocurre en el tiempo, estando con carga, condiciones ambientales y otras variables constantes. Valor expresado como % de la señal a fondo de escala y en un tiempo dado (30 minutos para las celdas Zell).

#### No Linealidad

Desviación máxima de la curva de calibración desde una línea recta (ideal) trazada entre las señales de salida de "cero" y "carga máxima". Se expresa como %FS (fondo de escala).

#### Histéresis

Diferencia máxima entre las lecturas de señal de salida de una celda de carga. Una lectura se obtiene incrementando la carga desde cero y la otra decrementando la carga desde la carga clasificada. Las lecturas deben tomarse lo más pronto posible para minimizar el efecto de deriva. Se mide como %FS.

#### Repetibilidad

Diferencia máxima entre señal de salida de la celda de carga en cargas sucesivas bajo condiciones idénticas ambientales y de carga. Se mide como %FS.

Fuera de celdas de carga, es también la habilidad de un instrumento, sistema o método para brindar resultados idénticos en ocasiones sucesivas.

#### Efecto de temperatura en carga

Cambio en señal de salida, con carga aplicada, debido a cambio en temperatura ambiental. Usualmente se expresa como % en cambio de señal de salida a fondo de escala por cada 10 °C de variación de temperatura.

#### Efecto de temperatura en cero

Cambio en balance a cero debido a cambio en la temperatura ambiental. Se expresa de igual modo que el efecto de temperatura en carga.

#### Temperatura de operación

Es el rango de temperatura en el cual la celda puede operar sin inconvenientes.

#### Rango compensado de temperatura

Rango de temperatura para el cual es válido el valor declarado en efecto de temperatura.

#### Límite de sobrecarga

Cifra que indica la sobrecarga (y margen de ello) que puede soportar un dispositivo antes de averiarse eléctricamente. Cabe aclarar que la resistencia mecánica es mayor a este valor.

#### Resistencia de entrada

Resistencia eléctrica en la señal de entrada de la celda de carga. Medida con un Ohmetro entre terminales de excitación (entre los cables negro y rojo). Generalmente es mayor que la resistencia de salida debido a las resistencias de compensación de temperatura. En celdas de baja calidad, estas resistencias no están presentes, por lo que los valores de resistencia de entrada y salida coinciden.

#### Resistencia de salida

Resistencia eléctrica en la señal de salida de una celda de carga. Medida con un Ohmetro entre terminales de salida (entre los cables verde y blanco). Las resistencias más comunes son: 350 Ω, 480 Ω, 700 Ω, 750 Ω y 1.000 Ω.

#### Resistencia de aislamiento

Resistencia eléctrica entre el circuito de la celda de carga y su estructura; generalmente medida a 50 VDC y bajo condiciones estándar de prueba.

#### Tensión de excitación

Valor que indica cuál es el valor óptimo para alimentar la celda; también se indica el valor máximo.

En la siguiente imagen se muestra de manera gráfica algunos de los valores antes descriptos:

![Representación gráfica de datos del test report](./imagenes/imagen_11_representacion_datos_test_report.png)
*Imagen 11 — Representación gráfica de datos de un test report.*

---

### 2.7 Algunos modelos de celdas de carga

#### Viga al corte

![Celda viga, modelo SBA](./imagenes/imagen_12_celda_viga_sba.jpeg)
*Imagen 12 — Celda viga, modelo SBA.*

La celda de carga tipo viga está diseñada para aplicaciones de básculas de perfil bajo y procesos. El rango más usual de capacidades de este tipo de celda va desde 100 kg a 10.000 kg.

Un extremo de la viga cuenta con las perforaciones de montaje y en el otro extremo se aplica la carga.

![Aplicación de fuerza en celda viga](./imagenes/imagen_13_aplicacion_fuerza_celda_viga.png)
*Imagen 13 — Aplicación de fuerza en celda viga.*

La celda de carga deberá montarse en una superficie plana y lisa, con pernos de alta resistencia, y la carga debe aplicarse en un único punto y de manera normal a la celda. Cualquier cambio en la posición y dirección de la carga se traducirá en errores de pesaje.

Estas celdas se las puede encontrar fabricadas de aleación de acero o de acero inoxidable.

A continuación se muestran ejemplos típicos de montaje:

![Ejemplos de montaje de celda viga](./imagenes/imagen_14_montaje_celda_viga.png)
*Imagen 14 — Ejemplos de montaje celda viga: mediante pata articulada (izq.), mediante separador de elastómero (centro) y mediante sistema de esfera (der).*

##### Aplicaciones

Este tipo de celdas es muy utilizado en balanzas de plataforma de mediana capacidad, silos y tanques de baja y mediana capacidad; también es utilizada en diseños especiales.

#### Monoceldas

![Monocelda, modelo SPA](./imagenes/imagen_15_monocelda_spa.jpeg)
*Imagen 15 — Monocelda, modelo SPA.*

Este tipo de celda está diseñado para trabajar en forma independiente, es decir una única celda en el sistema de pesaje. El montaje de este tipo es similar al de las vigas, pero por su diseño admite la aplicación de cargas fuera de su centro. El área donde se puede aplicar esta carga es un parámetro que se informa en la hoja de datos; por ejemplo, en el Anexo A se puede ver que para la celda SPA esta área es de 350 × 350 mm.

Existe una enorme variedad de modelos, con dimensiones y capacidades diferentes. En la mayoría de los casos se fabrican de aluminio y son para baja capacidad (1.000 kg como máximo).

![Monoceldas, modelo SPB (izq.) y MCB (der)](./imagenes/imagen_16_monoceldas_spb_mcb.png)
*Imagen 16 — Monoceldas, modelo SPB (izq.) y MCB (der).*

##### Aplicaciones

Este tipo de celdas es uno de los más utilizados, en balanzas de mostrador, plataformas de baja capacidad, balanzas de pesar personas, dosificadoras, embolsadoras, entre otras.

#### Tipo "S"

![Celda "S", modelo TSA](./imagenes/imagen_17_celda_s_tsa.jpeg)
*Imagen 17 — Celda "S", modelo TSA.*

La celda de carga tipo S adquiere su nombre dada su forma. Se puede utilizar tanto a la tracción como a la compresión, de forma unitaria o formando un sistema.

Disponible en una amplia variedad de capacidades máximas, desde los 50 kg a los 20.000 kg. Se fabrican en aleación de acero y acero inoxidable.

Para el montaje, por ejemplo a la tracción, se pueden utilizar cáncamos:

![Montaje celda "S" con cáncamos](./imagenes/imagen_18_montaje_celda_s_cancamos.png)
*Imagen 18 — Montaje celda "S" con cáncamos.*

##### Aplicaciones

Este tipo de celdas se los puede encontrar en tolvas y silos, dinamómetros, balanzas de gancho, máquinas de ensayo. También se pueden utilizar intercalándola en el varillaje del pilón de una balanza mecánica para obtener una balanza híbrida (digital/mecánica).

#### Otros tipos de celdas

Además de las ya mencionadas, hay otros tipos de celdas de carga de uso frecuente.

##### Compresión

En este apartado nos encontraremos con dos tipos de celdas: las de tipo columna y las de tipo anillo. Se utilizan para cargas de compresión. Las aplicaciones de estos tipos son muy diversas, pudiéndose encontrar en plataformas camioneras, tolvas, tanques, máquinas de ensayo, etc.

![Celda CCD, tipo columna](./imagenes/imagen_19a_celda_ccd_columna.jpg)
*Imagen 19a — Celda CCD, tipo columna.*

![Celda CAB, tipo anillo](./imagenes/imagen_19b_celda_cab_anillo.png)
*Imagen 19b — Celda CAB, tipo anillo.*

##### Doble viga al corte

Las celdas del tipo doble viga al corte tienen un funcionamiento muy similar a la viga al corte; se utilizan en aplicaciones donde se requieren capacidades de carga mayores. Muy usadas en plataformas camioneras y grandes silos. También hay modelos de balanzas de gancho provistas de este tipo de celda, en general de capacidades superiores a las 10 t.

![Celda doble viga al corte, modelo DVV](./imagenes/imagen_20_celda_doble_viga_dvg.png)
*Imagen 20 — Celda doble viga al corte, modelo DVV.*
