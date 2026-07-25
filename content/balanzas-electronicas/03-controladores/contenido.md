---
modulo: "03"
titulo: "Indicadores y Controladores"
curso: "balanzas-electronicas"
version: "REV00"
---

## 3. Indicadores y Controladores

![Controladores ZELL: DRACO, HIDRA LED e HIDRA LCD](./imagenes/imagen_21_controladores_draco_hidra_led_lcd.png)
*Imagen 21 — Controladores ZELL: DRACO, HIDRA LED e HIDRA LCD.*

Este es el elemento que permite la visualización de la medida en primer lugar. Después, dependiendo de la complejidad, permitirá realizar diferentes operaciones. La variedad y posibilidades es prácticamente infinita.

Volviendo al esquema visto en la sección 1.1, nos centraremos en los módulos 3 al 7.

El **conversor analógico-digital** es una de las partes más importantes del controlador; es el lugar donde se procesa la señal analógica proveniente de las celdas de carga. El resultado de este procesamiento son las cuentas internas, un valor adimensional. Dependiendo de la calidad del conversor, será la confiabilidad que resulte del indicador.

El **procesador** del controlador, con la información proveniente del conversor, transforma esas cuentas en valores de peso. Dependiendo de su velocidad, podrá procesar en menor tiempo los datos y habilitar su uso en diferentes aplicaciones, como puede ser el pesaje continuo en una cinta transportadora.

En todos los controladores, ya sea de baja complejidad (un display y algunos botones) o de gama alta (pantalla LCD color, touch screen, servidor web integrado, multibalanza, etc.), se deben realizar un mínimo de ajustes necesarios para lograr el funcionamiento de la balanza.

---

### 3.1 Conexionado

Dependiendo del modelo de indicador, el conexionado de la celda de carga puede ser a través de una ficha, por medio de una bornera o bien soldando los conductores directamente a la placa.

![Métodos de conexión de celdas](./imagenes/imagen_22_metodos_conexion_celdas.png)
*Imagen 22 — Métodos de conexión de celdas.*

En el caso de que se utilice una ficha, se deberá consultar el manual para conocer la distribución de pines.

Cuando la conexión se realiza por borneras o mediante soldadura a la placa, suele estar indicado por la serigrafía de la placa dónde se conecta cada conductor.

Si la conexión es mediante bornera, se recomienda **estañar la punta de los conductores**, lo que evitará problemas futuros de falsos contactos.

---

### 3.2 Configuración

En esta etapa debemos indicarle al controlador los datos de capacidad máxima, división mínima y curva de calibración. Para esto debemos ingresar al menú correspondiente. Se deberá consultar el manual de cada indicador para conocer la metodología, dado que no es igual para todos.

Por lo general, el acceso a estas configuraciones se encuentra protegido, por dos razones: evitar que por error se cambien estos valores, y evitar que se cambien intencionalmente para que la balanza pese de más o de menos. Por esta última razón, para las balanzas de uso comercial, es requisito que el acceso esté protegido por algún método que implique la rotura de un precinto o faja de seguridad.

Dependiendo el caso, para ingresar a estas configuraciones puede ser necesario alguno de los siguientes métodos:

- Acceder al interior del equipo para colocar un jumper o puente en algún sitio de la placa.
- Accionar un pulsador previsto para este fin.
- Mantener pulsadas más de uno de los botones del indicador a la vez.
- Ingresar alguna clave.
- Combinación de algunos de los métodos mencionados.

#### Capacidad máxima y división mínima

La manera de ingresar estos valores cambia según cada equipo. En algunos puede aparecer **n** (número de divisiones); en ese caso recordemos que:

**n = Máx. / dd**

#### Curva de calibración

También conocido como **ajuste de cero y span**. Con esto se busca establecer dos puntos: uno sin peso y otro con peso conocido, para que luego la balanza funcione correctamente.

- **Ajuste de cero:** el controlador registra el valor que está entregando la celda de carga con la plataforma vacía, es decir sin carga alguna.
- **Ajuste de span:** se referencia al controlador un valor de peso conocido para que lo asocie al valor correspondiente entregado por la celda de carga. El peso de referencia debe ser acorde a la capacidad máxima. Como regla general se recomienda contar con al menos un **20% de la capacidad máxima**.

A modo de ejemplo, veamos el árbol del menú de configuraciones del controlador **DRACO** de marca Zell:

![Árbol menú calibración DRACO](./imagenes/imagen_23_arbol_menu_calibracion_draco.png)
*Imagen 23 — Árbol menú calibración DRACO.*

En este menú están los parámetros que definen la capacidad, resolución y calibración del indicador:

**[CA.1] 'FILTR' — Filtro**
Este parámetro permite elegir el valor de filtro de vibraciones que mejor se adapte a su aplicación.

**[CA.2] 'UNID' — Selección de la unidad primaria:** `U : kg` | `U : g`

**[CA.3] 'D.MIN' — División Mínima y Punto Decimal**
Valores permitidos: 1; 2; 5; 10; 20; 50; 0,1; 0,2; 0,5; 0,01; 0,02; 0,05; 0,001; 0,002; 0,005; 0,010; 0,020 y 0,050.

**[CA.4] 'CAPAC' — Capacidad del controlador**
El valor máximo permitido es 150.000 kg o 30.000 divisiones, lo que sea menor.

**[CA.5] 'CAL' — Calibración de Cero y Span**

1. Pulse **[ENTER]** para ingresar al modo de calibración: aparecerá el valor de la señal de celda como porcentaje de 2 mV/V. El rango aceptado es −35,0% a +50,0%.
2. Con la plataforma vacía, pulse **[ENTER]** para calibrar el Cero.
3. Coloque un peso patrón sobre la plataforma y pulse **[ENTER]**.
4. Con las teclas **[▲]** y **[▼]** ingrese el valor del peso patrón colocado y acepte con **[ENTER]**.
5. El display mostrará el peso vivo calibrado; acepte pulsando **[ENTER]**.

> **Nota 1:** En cualquier momento puede abortar la calibración pulsando **[ESC]**.  
> **Nota 2:** Se recomienda que el peso patrón sea mayor al 30% de la capacidad del controlador.

**[CA.6] 'CERO' — Calibración del Cero solamente**

Esta función permite calibrar solamente el Cero de Calibración cuando se corre el cero de la celda.

1. Pulse **[ENTER]** para ingresar al modo de calibración.
2. Con la plataforma vacía, pulse **[ENTER]** para calibrar el Cero.

**[CA.7] 'AJ.SPA' — Ajuste del Span**

El Ajuste de Span se utiliza para obtener el valor correcto de peso cuando hay diferencias entre el peso real y el valor indicado en el display. Esta función es muy útil para ajustar el Span en tanques y tolvas donde es muy dificultoso aplicar pesas.

El valor de peso a corregir debe ser por lo menos 10% de la capacidad.

1. Con el display indicando el valor de peso que se desea corregir, ingrese al menú **[CA.7]** y pulse **[ENTER]**.
2. Con **[▲]** y **[▼]** ingrese el valor del peso correcto y acepte pulsando **[ENTER]**.
3. El display mostrará el peso vivo corregido; acepte con **[ENTER]**.

**[CA.8] 'CE.INI' — Cero Inicial**

Este parámetro define el rango de puesta a cero automático al encender el indicador. Si el peso está fuera de rango, el display muestra `[Err 0]`. El valor predeterminado es ±20% de la capacidad. Para pesaje de tanques se debe elegir `C.CAL` (Cero de calibración).

**[CA.9] 'CE.TRA' — Auto Cero Tracking**

El auto cero tracking corrige pequeñas derivas del cero producidas por diferencia de temperatura o la acumulación de residuos sobre la plataforma. Este parámetro define la banda de acción del cero tracking o permite deshabilitarlo. Actúa cada 1,5 segundos, cuando el peso es estable y dentro de la banda.
