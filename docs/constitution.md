# Constitución del Proyecto: Acortador de URLs Local

1. **Entorno 100% Local**: La aplicación opera exclusivamente en local; prohibida toda dependencia de nube, hosting, APIs externas o telemetría.
2. **Privacidad y Persistencia Local**: Los datos se almacenan únicamente en la máquina local y deben persistir entre reinicios del sistema.
3. **Integridad y Validación de URLs**: Toda URL debe validarse antes del guardado; los identificadores cortos generados deben ser únicos y libres de colisiones.
4. **Redirección Fiel**: Al acceder al enlace corto local, debe redirigir de forma exacta e inequívoca a la URL original correspondiente.
5. **Calidad y Tests Obligatorios**: Cada requisito funcional debe contar con tests automatizados en verde (unitarios/integración) antes de dar por cerrada una tarea.
6. **Límites y Minimalismo**: Prohibido agregar dependencias o funcionalidades fuera de alcance sin justificación explícita; cero credenciales en el código.
7. **Convenciones**: Código y mensajes consistentes, documentación en español (Markdown) y cumplimiento de comprobaciones de formato/lint.
