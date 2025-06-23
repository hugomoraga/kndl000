---
layout: poems
title: Script el verbo
image: /assets/images/poems-003.jpg
---


## Script el verbo
```python

def el_verbo():
    verbo = Palabra("nombrar", origen="impulso", tipo="verbo", intensidad=1.0)
    eco = Palabra("voz", tipo="resonancia", repeticion=True)
    sentido = Palabra("división", tipo="consecuencia", efecto="fractura")

    if verbo.origen == "impulso":
        print("decir lo primero")
        print("antes del signo")
        print("antes del sentido")

    if eco.repeticion:
        print("una voz")
        print("la sabiduría")
        print("y otro acento")

    sentido.efecto  # => confrontación, persistencia

    return "persistimos"
```
﹏
