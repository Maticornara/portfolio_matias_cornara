@echo off
REM ===========================================================================
REM  SERVIDOR.BAT  -  doble click aca para ver el sitio
REM ---------------------------------------------------------------------------
REM  Por que hace falta:
REM  Abrir los HTML con doble click los sirve como "file://", y en ese modo
REM  Chrome bloquea la carga de imagenes dentro de un canvas. Resultado: la
REM  animacion de SIMBIO se queda en la pantalla de carga para siempre.
REM  Servido por HTTP anda todo.
REM
REM  Este script levanta un servidor local y abre el navegador.
REM  Para apagarlo: cerrar la ventana negra que queda abierta.
REM ===========================================================================

cd /d "%~dp0.."

REM  Si el puerto ya esta ocupado, "python -m http.server" falla con un error
REM  feo y la ventana se cierra sola. Antes de intentar, preguntamos si hay
REM  alguien escuchando: si ya hay un servidor, solo abrimos el navegador.
netstat -ano | findstr /R /C:"LISTENING" | findstr ":8123" >nul
if %errorlevel%==0 (
  echo.
  echo   Ya habia un servidor escuchando en el puerto 8123.
  echo   No levanto otro: abro el navegador y listo.
  echo.
  start "" http://localhost:8123/index.html
  pause
  exit /b
)

echo.
echo   Levantando servidor en http://localhost:8123
echo   Dejar esta ventana abierta mientras trabajas.
echo   Para apagarlo: cerrar esta ventana.
echo.
echo   OJO: la pagina tiene que abrirse por http://localhost:8123
echo   Si en la barra de direcciones dice "file:///C:/Users/..." la animacion
echo   del armado NO puede funcionar: el navegador bloquea la carga de los
echo   frames. Abrila siempre desde el link de arriba.
echo.

start "" http://localhost:8123/index.html
python -m http.server 8123
