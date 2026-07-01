---
modulo: "01"
titulo: "Introducción"
curso: "balanzas-electronicas"
version: "REV00"
---

## 1. Introducción

Una balanza es un instrumento de medición que sirve para determinar la masa de los objetos colocados sobre ella. Existen de diferentes tipos (electrónicas, mecánicas, estáticas, dinámicas), capacidades, materiales e incluso existen diseños especiales para pesar durante los procesos productivos.

Sin importar su diseño y funciones todas las balanzas funcionan de la misma manera y en esencia se componen por:

- Un dispositivo receptor de carga, que es el lugar donde se colocan los objetos a pesar.
- Un dispositivo de visualización o indicador, donde se lee de manera directa el valor medido.
- Adicionalmente se pueden contar con accesorios como elementos de impresión, comunicación o procesamiento de datos.

---

### 1.1 Partes constitutivas

Si hablamos de una balanza electrónica, el valor de la pesada, cuando se coloca un objeto sobre el receptor de carga, se obtiene a través de un elemento llamado **celda de carga**. Este es un elemento especialmente diseñado para que al recibir una carga genere una señal eléctrica proporcional a dicho esfuerzo. Esta señal es procesada por el indicador para su visualización.

![Balanza de mesa — partes](./imagenes/imagen_01_balanza_mesa_partes.jpg)
*Imagen 1- Balanza de mesa partes*

Cuando la plataforma está compuesta por más de una celda de carga, se suele colocar una **placa sumadora**, que además de permitir la conexión de las celdas nos da la posibilidad de ajustar individualmente la salida de cada una de estas para lograr la ecualización de las señales. En este punto también vale aclarar que hay indicadores que permiten conectar cada celda por separado y realizar este ajuste de manera digital.

En el siguiente esquema se puede ver de manera modular las distintas partes constitutivas:

![Esquema modular del sistema de pesaje](./imagenes/imagen_02_esquema_modular_pesaje.jpeg)
*Imagen 2 — Esquema modular del sistema de pesaje.*

---

### 1.2 Características metrológicas de los instrumentos

En esta sección definiremos la terminología básica respecto a las balanzas:

- **Capacidad máxima (Máx.):** capacidad máxima de pesada.
- **Capacidad mínima (Mín.):** valor por debajo del cual las pesadas están afectadas de un error relativo importante.
- **Valor de la división:** valor expresado en unidades de masa de la diferencia entre dos indicaciones o impresiones de valores consecutivos, en indicación o impresión discontinua (dd).
- **Número de divisiones (n):** cociente entre la capacidad máxima y el valor de la división:

**n = Máx. / dd**

---

### 1.3 Cualidades metrológicas de un instrumento

- **Movilidad:** cualidad de un instrumento para reaccionar con pequeñas variaciones de carga.
- **Fidelidad:** actitud de un instrumento para suministrar resultados idénticos para una misma carga, depositada varias veces sobre su receptor, en condiciones estables de ensayo.

---

### 1.4 Unidades de medida

En Argentina la unidad de medida es la adoptada por el SIMELA (Ley 19.511), donde la unidad de masa es el kilogramo [kg], pudiéndose utilizar múltiplos y submúltiplos.

El valor de la división serán múltiplos o submúltiplos de 1, 2 o 5 (por ejemplo: 0,001; 0,002; 0,005; 0,01; 0,02; 0,05; 0,1; 0,2; 0,5; 1; 2; 5; 10; 20; 50; 100; etc.)

---

### 1.5 Clasificación según el número de divisiones

| Clase | Precisión | n mínimo | n máximo |
|-------|-----------|----------|----------|
| (I)   | Especial  | 10       | Sin límite |
| (II)  | Fina      | 200      | 100.000  |
| (III) | Media     | 50       | 10.000   |
| (IIII)| Ordinaria | 100      | 1.000    |

Recordemos que **n** es el cociente entre la capacidad máxima (Máx.) y el valor de división (dd).

La mayoría de las balanzas que nos encontraremos en la industria es de **clase (III) (precisión media)** con un máximo de 10.000 divisiones.
