-- La Nube de Most — Seed SQL
-- Generado automáticamente desde mock-data.ts

-- 1. Truncar tablas existentes para reinicio limpio
TRUNCATE public.comentarios, public.apuntes, public.actividades, public.materias, public.semestres, public.perfiles CASCADE;

-- 2. Insertar Semestres
INSERT INTO public.semestres (id, nombre, slug, periodo, activo) VALUES ('nivelacion-2026', 'Nivelación', 'nivelacion', 'Abril 2026 - Agosto 2026', true);
INSERT INTO public.semestres (id, nombre, slug, periodo, activo) VALUES ('primer-semestre-2026', '1er Semestre', 'primer-semestre', 'Octubre 2026 - Marzo 2027', false);

-- 3. Insertar Materias
INSERT INTO public.materias (id, nombre, slug, semestre_id, codigo, color, icono, descripcion) VALUES ('mat-intro-programacion', 'Introducción a la Programación', 'intro-programacion', 'nivelacion-2026', 'NV-101', '#DC2626', 'programacion', 'Fundamentos de lógica de programación, algoritmos y pseudocódigo.');
INSERT INTO public.materias (id, nombre, slug, semestre_id, codigo, color, icono, descripcion) VALUES ('mat-matematica-basica', 'Matemática Básica', 'matematica-basica', 'nivelacion-2026', 'NV-102', '#2563EB', 'matematica', 'Álgebra, funciones, ecuaciones lineales y cuadráticas.');
INSERT INTO public.materias (id, nombre, slug, semestre_id, codigo, color, icono, descripcion) VALUES ('mat-fisica-general', 'Física General', 'fisica-general', 'nivelacion-2026', 'NV-103', '#7C3AED', 'fisica', 'Mecánica clásica, cinemática y dinámica. Leyes de Newton.');
INSERT INTO public.materias (id, nombre, slug, semestre_id, codigo, color, icono, descripcion) VALUES ('mat-metodologia', 'Metodología de la Investigación', 'metodologia', 'nivelacion-2026', 'NV-104', '#059669', 'metodologia', 'Método científico, tipos de investigación, técnicas de estudio.');
INSERT INTO public.materias (id, nombre, slug, semestre_id, codigo, color, icono, descripcion) VALUES ('mat-comunicacion', 'Comunicación Oral y Escrita', 'comunicacion', 'nivelacion-2026', 'NV-105', '#D97706', 'comunicacion', 'Redacción académica, técnicas de comunicación y expresión.');

-- 4. Insertar Apuntes
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Variables y Tipos de Datos', 'variables-tipos-datos', 'mat-intro-programacion', 'nivelacion-2026', '# Variables y Tipos de Datos

## ¿Qué es una variable?

Una variable es un **espacio en memoria** que almacena un valor. Piensa en ella como una caja etiquetada donde guardas información.

```python
nombre = "Most"
edad = 20
promedio = 9.5
es_estudiante = True
```

## Tipos de datos fundamentales

| Tipo | Ejemplo | Descripción |
|------|---------|-------------|
| `int` | `42` | Números enteros |
| `float` | `3.14` | Números decimales |
| `str` | `"Hola"` | Cadenas de texto |
| `bool` | `True` | Verdadero o falso |

## Reglas para nombrar variables

1. **No** empezar con números (`1nombre` - incorrecto)
2. **No** usar espacios (`mi variable` - incorrecto, `mi_variable` - correcto)
3. **No** usar palabras reservadas (`print`, `if`, etc.)
4. Usar nombres descriptivos (`x` - incorrecto, `edad_usuario` - correcto)

## Conversión de tipos (Casting)

```python
# String a entero
texto = "25"
numero = int(texto)  # 25

# Entero a string
edad = 20
texto_edad = str(edad)  # "20"

# String a float
precio = float("19.99")  # 19.99
```

> **Tip de Most:** Siempre usa nombres de variables que describan lo que guardan. Tu yo del futuro te lo agradecerá cuando revise el código.', 'markdown', 'publicado', false, ARRAY['python', 'variables', 'tipos-de-datos', 'fundamentos'], 'Most', 142, '2026-05-10T14:00:00Z', '2026-05-20T10:30:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Estructuras de Control: If, Else, Elif', 'estructuras-control', 'mat-intro-programacion', 'nivelacion-2026', '# Estructuras de Control

## Condicionales

Las estructuras de control permiten tomar **decisiones** en tu código.

### If simple

```python
edad = 18

if edad >= 18:
    print("Eres mayor de edad")
```

### If - Else

```python
nota = 6.5

if nota >= 7:
    print("Aprobado")
else:
    print("Reprobado")
```

### If - Elif - Else

```python
nota = 8.5

if nota >= 9:
    print("Sobresaliente")
elif nota >= 8:
    print("Muy bueno")
elif nota >= 7:
    print("Aprobado")
else:
    print("Reprobado")
```

## Operadores de comparación

| Operador | Significado |
|----------|-------------|
| `==` | Igual a |
| `!=` | Diferente de |
| `>` | Mayor que |
| `<` | Menor que |
| `>=` | Mayor o igual |
| `<=` | Menor o igual |

## Operadores lógicos

```python
# AND - ambas condiciones deben ser verdaderas
if edad >= 18 and tiene_cedula:
    print("Puede votar")

# OR - al menos una debe ser verdadera
if es_feriado or es_fin_de_semana:
    print("No hay clases")

# NOT - niega la condición
if not llueve:
    print("Sal sin paraguas")
```

> **Tip de Most:** Cuidado con la indentación en Python. Un espacio de más o de menos y tu código no funciona. Usa siempre 4 espacios.', 'markdown', 'publicado', false, ARRAY['python', 'condicionales', 'if-else', 'fundamentos'], 'Most', 98, '2026-05-12T09:00:00Z', '2026-05-21T15:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Bucles: For y While', 'bucles-for-while', 'mat-intro-programacion', 'nivelacion-2026', '# Bucles: For y While

## ¿Para qué sirven los bucles?

Los bucles permiten **repetir** un bloque de código múltiples veces sin tener que escribirlo una y otra vez.

## Bucle For

Ideal cuando **sabes cuántas veces** quieres repetir algo.

```python
# Imprimir números del 1 al 5
for i in range(1, 6):
    print(i)

# Recorrer una lista
materias = ["Programación", "Matemáticas", "Física"]
for materia in materias:
    print(f"Estudiando: {materia}")
```

## Bucle While

Ideal cuando **no sabes cuántas veces** se repetirá, pero tienes una condición.

```python
contador = 0
while contador < 5:
    print(f"Iteración: {contador}")
    contador += 1
```

## Break y Continue

```python
# Break - sale del bucle
for i in range(10):
    if i == 5:
        break  # Para aquí
    print(i)

# Continue - salta a la siguiente iteración
for i in range(10):
    if i % 2 == 0:
        continue  # Salta los pares
    print(i)  # Solo impares
```

> **Tip de Most:** Si tu while loop no para nunca, probablemente olvidaste actualizar la variable de la condición. ¡Cuidado con los loops infinitos!', 'markdown', 'publicado', false, ARRAY['python', 'bucles', 'for', 'while', 'fundamentos'], 'Most', 76, '2026-05-15T11:00:00Z', '2026-05-22T08:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Funciones en Python', 'funciones-python', 'mat-intro-programacion', 'nivelacion-2026', '# Funciones en Python

## ¿Qué es una función?

Una función es un bloque de código reutilizable que realiza una tarea específica.

```python
def saludar(nombre):
    return f"¡Hola, {nombre}!"

mensaje = saludar("Most")
print(mensaje)
```

## Parámetros y argumentos

```python
def calcular_promedio(nota1, nota2, nota3):
    promedio = (nota1 + nota2 + nota3) / 3
    return round(promedio, 2)

resultado = calcular_promedio(8.5, 9.0, 7.5)
print(f"Tu promedio es: {resultado}")
```

## Valores por defecto

```python
def presentarse(nombre, universidad="UTA"):
    return f"Soy {nombre} de la {universidad}"

print(presentarse("Most"))
print(presentarse("Juan", "EPN"))
```

> **Tip de Most:** Las funciones son tu mejor amigo. Si estás copiando y pegando código, probablemente necesitas una función. DRY = Don''t Repeat Yourself.', 'markdown', 'publicado', false, ARRAY['python', 'funciones', 'def', 'return'], 'Most', 64, '2026-05-18T14:00:00Z', '2026-05-23T09:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Ecuaciones Lineales', 'ecuaciones-lineales', 'mat-matematica-basica', 'nivelacion-2026', '# Ecuaciones Lineales

## Definición

Una ecuación lineal es una igualdad que involucra una o más variables elevadas a la **primera potencia**.

## Forma general

`ax + b = 0`

Donde:
- **a** = coeficiente (a ≠ 0)
- **x** = variable (incógnita)
- **b** = término independiente

## Resolución paso a paso

### Ejemplo 1: Ecuación simple
```
3x + 6 = 0
3x = -6
x = -6/3
x = -2
```

### Ejemplo 2: Con variables en ambos lados
```
5x - 3 = 2x + 9
5x - 2x = 9 + 3
3x = 12
x = 4
```

### Ejemplo 3: Con fracciones
```
x/2 + 3 = x/4 + 5
(multiplicar todo por 4)
2x + 12 = x + 20
2x - x = 20 - 12
x = 8
```

## Verificación

Siempre sustituye el resultado en la ecuación original:
```
5(4) - 3 = 2(4) + 9
20 - 3 = 8 + 9
17 = 17
```

> **Tip de Most:** Siempre verifica tu respuesta sustituyendo. En el examen te quita puntos un error tonto que podrías detectar.', 'markdown', 'publicado', false, ARRAY['álgebra', 'ecuaciones', 'lineales', 'medio-parcial'], 'Most', 203, '2026-05-08T10:00:00Z', '2026-05-19T16:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Sistemas de Ecuaciones 2x2', 'sistemas-ecuaciones', 'mat-matematica-basica', 'nivelacion-2026', '# Sistemas de Ecuaciones 2x2

## Métodos de resolución

### 1. Método de Sustitución

```
x + y = 10    ... (1)
2x - y = 5   ... (2)

De (1): y = 10 - x
Sustituir en (2): 2x - (10 - x) = 5
2x - 10 + x = 5
3x = 15
x = 5

y = 10 - 5 = 5

Solución: (5, 5)
```

### 2. Método de Igualación

Despejar la misma variable en ambas ecuaciones e igualar.

### 3. Método de Eliminación (Reducción)

```
 3x + 2y = 16   ... (1)
 x - 2y = -4    ... (2)

Sumar (1) + (2):
4x = 12
x = 3

Sustituir: 3 - 2y = -4
-2y = -7
y = 3.5
```

> **Tip de Most:** En el examen, usa el método con el que te sientas más cómodo. Todos dan el mismo resultado. Yo prefiero eliminación cuando los coeficientes se cancelan fácil.', 'markdown', 'publicado', false, ARRAY['álgebra', 'sistemas', 'ecuaciones', 'medio-parcial'], 'Most', 178, '2026-05-11T13:00:00Z', '2026-05-20T11:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Funciones y Gráficas', 'funciones-graficas', 'mat-matematica-basica', 'nivelacion-2026', '# Funciones y Gráficas

## Definición de función

Una función f: A → B asigna a cada elemento de A **exactamente un** elemento de B.

## Dominio y rango

- **Dominio**: todos los valores posibles de x
- **Rango**: todos los valores posibles de y (o f(x))

## Función lineal: f(x) = mx + b

- **m** = pendiente (inclinación de la recta)
- **b** = intercepto con el eje Y

### Ejemplo
```
f(x) = 2x + 3

f(0) = 3    → punto (0, 3)
f(1) = 5    → punto (1, 5)
f(-1) = 1   → punto (-1, 1)
```

## Función cuadrática: f(x) = ax² + bx + c

La gráfica es una **parábola**.
- Si a > 0: abre hacia arriba ∪
- Si a < 0: abre hacia abajo ∩

### Vértice
```
x_v = -b / (2a)
y_v = f(x_v)
```

> **Tip de Most:** Para graficar rápido, calcula al menos 5 puntos: x = -2, -1, 0, 1, 2. Conéctalos y tendrás una buena idea de la forma.', 'markdown', 'publicado', false, ARRAY['funciones', 'gráficas', 'dominio', 'rango'], 'Most', 156, '2026-05-14T09:00:00Z', '2026-05-21T14:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Cinemática: MRU y MRUV', 'cinematica-mru-mruv', 'mat-fisica-general', 'nivelacion-2026', '# Cinemática: MRU y MRUV

## Movimiento Rectilíneo Uniforme (MRU)

Velocidad **constante**, aceleración = 0.

### Fórmulas
```
d = v · t
v = d / t
t = d / v
```

### Ejemplo
Un auto viaja a 60 km/h durante 2.5 horas.
```
d = 60 × 2.5 = 150 km
```

## Movimiento Rectilíneo Uniformemente Variado (MRUV)

Aceleración **constante** (velocidad cambia uniformemente).

### Fórmulas
```
vf = vi + a·t
d = vi·t + ½·a·t²
vf² = vi² + 2·a·d
d = ((vi + vf) / 2) · t
```

### Ejemplo
Un auto parte del reposo y acelera a 3 m/s² durante 8 segundos.
```
vf = 0 + 3(8) = 24 m/s
d = 0(8) + ½(3)(8²) = 96 m
```

> **Tip de Most:** Antes de resolver, identifica qué datos te dan y cuál fórmula tiene exactamente esas variables. Anota los datos en una lista primero.', 'markdown', 'publicado', false, ARRAY['cinemática', 'MRU', 'MRUV', 'medio-parcial'], 'Most', 189, '2026-05-09T15:00:00Z', '2026-05-18T10:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Leyes de Newton', 'leyes-newton', 'mat-fisica-general', 'nivelacion-2026', '# Leyes de Newton

## Primera Ley: Ley de Inercia

> Un cuerpo permanece en reposo o en movimiento rectilíneo uniforme a menos que una fuerza externa actúe sobre él.

**Ejemplo cotidiano:** Cuando un bus frena bruscamente, tu cuerpo "sigue" hacia adelante por inercia.

## Segunda Ley: F = m · a

La fuerza neta sobre un objeto es igual a su masa por su aceleración.

```
F = m · a
a = F / m
m = F / a
```

### Ejemplo
¿Qué aceleración tiene un objeto de 10 kg si se le aplica una fuerza de 50 N?
```
a = F/m = 50/10 = 5 m/s²
```

## Tercera Ley: Acción y Reacción

> A toda acción corresponde una reacción de igual magnitud pero en sentido contrario.

**Ejemplo:** Cuando caminas, empujas el suelo hacia atrás → el suelo te empuja hacia adelante.

## Peso vs Masa

- **Masa** (m): cantidad de materia, se mide en kg
- **Peso** (W): fuerza gravitacional, W = m · g (g ≈ 9.8 m/s²)

> **Tip de Most:** El error más común en exámenes es confundir masa con peso. La masa es en kg, el peso es en Newtons. ¡No los mezcles!', 'markdown', 'publicado', false, ARRAY['newton', 'fuerzas', 'dinámica', 'medio-parcial'], 'Most', 167, '2026-05-13T10:00:00Z', '2026-05-22T16:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'El Método Científico', 'metodo-cientifico', 'mat-metodologia', 'nivelacion-2026', '# El Método Científico

## Pasos del método científico

1. **Observación** → Identificar un fenómeno
2. **Pregunta** → Formular una pregunta de investigación
3. **Hipótesis** → Proponer una respuesta tentativa
4. **Experimentación** → Diseñar y ejecutar experimentos
5. **Análisis** → Interpretar los datos obtenidos
6. **Conclusión** → Aceptar o rechazar la hipótesis

## Tipos de investigación

| Tipo | Objetivo | Ejemplo |
|------|----------|---------|
| Exploratoria | Familiarizarse con un tema | Encuesta inicial |
| Descriptiva | Describir características | Censo |
| Correlacional | Relacionar variables | Estudio estadístico |
| Experimental | Establecer causa-efecto | Experimento controlado |

> **Tip de Most:** Para el examen, memoriza los pasos en orden y un ejemplo de cada tipo de investigación. Lo preguntan siempre.', 'markdown', 'publicado', false, ARRAY['método-científico', 'investigación', 'medio-parcial'], 'Most', 134, '2026-05-07T08:00:00Z', '2026-05-17T12:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Técnicas de Estudio y Resúmenes', 'tecnicas-estudio', 'mat-metodologia', 'nivelacion-2026', '# Técnicas de Estudio

## Técnicas más efectivas

### 1. Pomodoro
- 25 minutos de estudio
- 5 minutos de descanso
- Cada 4 pomodoros: descanso largo (15-30 min)

### 2. Active Recall
No releer, sino **intentar recordar** antes de revisar.

### 3. Spaced Repetition
Revisar el material en intervalos crecientes: 1 día → 3 días → 7 días → 14 días.

### 4. Mapas mentales
Ideal para conectar conceptos visualmente.

## Cómo hacer un buen resumen

1. Lee todo el material primero
2. Identifica ideas principales
3. Reformula con **tus propias palabras**
4. Organiza jerárquicamente
5. Agrega ejemplos propios

> **Tip de Most:** No transcribas todo. Un buen resumen tiene máximo el 30% del material original. Si es más largo, estás copiando, no resumiendo.', 'markdown', 'publicado', false, ARRAY['técnicas', 'estudio', 'resúmenes', 'productividad'], 'Most', 245, '2026-05-10T11:00:00Z', '2026-05-19T09:00:00Z');
INSERT INTO public.apuntes (id, titulo, slug, materia_id, semestre_id, contenido, tipo, estado, bloqueado, tags, autor, vistas, fecha_creacion, fecha_actualizacion) VALUES (gen_random_uuid(), 'Redacción Académica: Estructura del Ensayo', 'redaccion-academica', 'mat-comunicacion', 'nivelacion-2026', '# Redacción Académica

## Estructura del ensayo académico

### 1. Introducción
- Contextualización del tema
- **Tesis**: tu argumento principal en 1-2 oraciones
- Anticipación de la estructura

### 2. Desarrollo
- Cada párrafo = 1 idea + evidencia + análisis
- Conectores lógicos entre párrafos
- Citas en formato APA 7ma edición

### 3. Conclusión
- Retomar la tesis
- Sintetizar los argumentos
- Reflexión final (sin agregar info nueva)

## Errores comunes

- Oraciones demasiado largas (máx. 25 palabras)
- Uso excesivo de "yo creo" / "yo pienso"
- Párrafos de una sola oración
- No citar fuentes

## Conectores útiles

| Función | Conectores |
|---------|-----------|
| Adición | además, asimismo, también |
| Contraste | sin embargo, no obstante, por otro lado |
| Causa | debido a, ya que, puesto que |
| Consecuencia | por lo tanto, en consecuencia, así pues |

> **Tip de Most:** Lee tu ensayo en voz alta antes de entregarlo. Si suena raro al hablarlo, probablemente está mal escrito.', 'markdown', 'publicado', false, ARRAY['ensayo', 'redacción', 'APA', 'medio-parcial'], 'Most', 112, '2026-05-16T10:00:00Z', '2026-05-24T08:00:00Z');

-- 5. Insertar Actividades
INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('act-1', 'Taller 1: Variables y Condicionales', 'taller-1-variables-condicionales', 'mat-intro-programacion', 'Resolver 10 ejercicios de programación utilizando variables, tipos de datos y estructuras condicionales en Python. Entregar archivo .py con todos los ejercicios resueltos y comentados.', 'Los ejercicios 7 y 8 son los más difíciles. Usa elif para el 7 (tiene múltiples condiciones) y operadores lógicos para el 8. No olvides los comentarios, el profe los revisa.', 'entregada', '2026-05-12T00:00:00Z', '2026-05-19T23:59:00Z');
INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('act-2', 'Deber 3: Ecuaciones y Sistemas', 'deber-3-ecuaciones-sistemas', 'mat-matematica-basica', 'Resolver los ejercicios 1 al 15 de la página 87 del libro de texto. Mostrar todo el procedimiento. Entregar en hojas cuadriculadas, manuscrito.', 'Los ejercicios 11-15 son sistemas de ecuaciones. Usa eliminación para los que tienen coeficientes que se cancelan fácil (12 y 14). Para el 13 mejor usa sustitución. ¡Verifica todos tus resultados!', 'pendiente', '2026-05-20T00:00:00Z', '2026-05-28T23:59:00Z');
INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('act-3', 'Laboratorio: Movimiento Rectilíneo', 'lab-movimiento-rectilineo', 'mat-fisica-general', 'Práctica de laboratorio sobre MRU y MRUV. Tomar mediciones, calcular velocidades y aceleraciones. Entregar informe con tablas de datos, cálculos y gráficas.', 'Lleva calculadora científica y regla. Las gráficas deben ser en papel milimetrado. El profe valora mucho que las unidades estén correctas en cada resultado.', 'pendiente', '2026-05-22T00:00:00Z', '2026-05-30T23:59:00Z');
INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('act-4', 'Ensayo: Impacto de la Tecnología', 'ensayo-impacto-tecnologia', 'mat-comunicacion', 'Escribir un ensayo argumentativo de 800-1000 palabras sobre el impacto de la tecnología en la educación. Formato APA 7ma edición. Mínimo 3 fuentes bibliográficas.', 'Usa la estructura intro-desarrollo-conclusión. Mínimo 3 párrafos de desarrollo, cada uno con una idea diferente. Las fuentes deben ser académicas (no Wikipedia). Google Scholar es tu amigo.', 'entregada', '2026-05-05T00:00:00Z', '2026-05-15T23:59:00Z');
INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('act-5', 'Proyecto: Calculadora en Python', 'proyecto-calculadora-python', 'mat-intro-programacion', 'Desarrollar una calculadora que realice las 4 operaciones básicas, con manejo de errores y menú interactivo. Entregar código fuente (.py) y documentación breve.', 'Usa un while True con un menú de opciones. No olvides validar que el usuario no divida entre 0. Un try-except para entradas no numéricas te da puntos extra.', 'pendiente', '2026-05-18T00:00:00Z', '2026-06-01T23:59:00Z');
INSERT INTO public.actividades (id, nombre, slug, materia_id, descripcion_oficial, tips_most, estado, fecha_inicio, fecha_entrega) VALUES ('act-6', 'Informe: Método Científico Aplicado', 'informe-metodo-cientifico', 'mat-metodologia', 'Aplicar el método científico a un problema cotidiano. Documentar cada paso del proceso. Extensión: 3-5 páginas. Incluir bibliografía.', 'Elige algo simple como ''¿Qué marca de café rinde más?'' o ''¿Qué ruta al campus es más rápida?''. Lo importante es aplicar bien cada paso, no la complejidad del tema.', 'vencida', '2026-05-01T00:00:00Z', '2026-05-20T23:59:00Z');

-- 6. Insertar Comentarios
INSERT INTO public.comentarios (id, actividad_id, autor, contenido, fecha) VALUES (gen_random_uuid(), 'act-2', 'Andrea M.', '¿Alguien más no le sale el ejercicio 13? No me cuadra con ningún método', '2026-05-23T14:30:00Z');
INSERT INTO public.comentarios (id, actividad_id, autor, contenido, fecha) VALUES (gen_random_uuid(), 'act-2', 'Carlos R.', 'En el 13 hay que multiplicar la segunda ecuación por 3 primero. Ahí se cancela la y.', '2026-05-23T15:10:00Z');
INSERT INTO public.comentarios (id, actividad_id, autor, contenido, fecha) VALUES (gen_random_uuid(), 'act-2', 'Most', 'Carlos tiene razón. Multiplica la ec. 2 por 3 y luego suma. Actualicé los tips arriba', '2026-05-23T16:00:00Z');

-- 7. Insertar Perfil de Most (Mateo)
INSERT INTO public.perfiles (id, nombre_completo, apodo, rol, bio, redes) VALUES ('00000000-0000-0000-0000-000000000000', 'Mateo Sebastian Oviedo Trujillo', 'Most', 'admin', 'Estudiante de nivelación en la Universidad Técnica de Ambato (UTA). Creé La Nube de Most para organizar y compartir mis apuntes académicos de forma abierta y colaborativa con mis compañeros de clase. Aquí encontrarás material detallado de nivelación, ejercicios resueltos, guías de física y matemáticas, y mis recomendaciones personales para cada asignatura del semestre.', '[{"plataforma":"GitHub","usuario":"mateooviedo","url":"https://github.com","icono":"github"},{"plataforma":"LinkedIn","usuario":"mateo-oviedo","url":"https://linkedin.com","icono":"linkedin"},{"plataforma":"Instagram","usuario":"@mateo_oviedo","url":"https://instagram.com","icono":"instagram"},{"plataforma":"Twitter / X","usuario":"@mateo_oviedo","url":"https://x.com","icono":"twitter"}]'::jsonb);
