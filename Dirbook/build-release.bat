@echo off
set JAVA_HOME=C:\Program Files\Android\Android Studio\jbr
set PATH=%JAVA_HOME%\bin;%PATH%

echo Compilando AAB para Play Store...
call "%~dp0gradlew.bat" bundleRelease

echo.
echo Listo. El archivo AAB queda en:
echo %~dp0app\build\outputs\bundle\release\app-release.aab
pause
