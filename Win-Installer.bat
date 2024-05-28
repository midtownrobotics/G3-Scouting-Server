@echo off

setlocal enableextensions enabledelayedexpansion

powershell write-host -fore Blue Welcome to the G3 Scouting Software Installer
echo:
echo First we need to see if your online.
echo:
pause
echo:

call :isOnline github.com && set "status=online" || set "status=offline"

if !status!==offline (
    powershell write-host -fore Red You need to be online to install the scouting software.
    echo:
    echo Press any key to exit . . . 
    pause > nul
    exit
)

echo Success
echo:

call :NVMIsInstalled && set "node=yes" || set "node=no"

echo:

if !node!==no (
    echo Downloading NVM . . .
    echo:
    if exist "nvm-install.exe" del /q "nvm-install.exe" >nul 2>nul 
    curl.exe --location --request GET "https://github.com/coreybutler/nvm-windows/releases/download/1.1.12/nvm-setup.exe" --output nvm-install.exe -s
    echo You are about install the Node Version Manager.
    pause
    start nvm-install.exe
    echo:
    powershell write-host -fore Blue Press any key once you have completed NVM install, then restart the installer . . .
    pause > nul
    exit
)

if !node!==yes (
    powershell write-host -fore Green "NVM is already downloaded!" 
    echo:

    call :gitIsInstalled && set "git=yes" || set "git=no"

    if !git!==no (
        echo Downloading Git . . .
        echo:
        if exist "git-install.exe" del /q "git-install.exe" >nul 2>nul 
        curl.exe --location --request GET "https://github.com/git-for-windows/git/releases/download/v2.45.1.windows.1/Git-2.45.1-64-bit.exe" --output git-install.exe -s
        echo You are about install Git.
        pause
        start git-install.exe
        echo:
        powershell write-host -fore Blue Press any key once you have completed Git install, then restart the installer . . .
        pause > nul
        exit
    )

    if !git!==yes (
        echo: Installing Node and NPM using NVM . . . 
        powershell write-host -fore Red You may need to accept windows security prompts.
        pause
        nvm install lts
        nvm use lts
        SET PATH=C:\Program Files\Nodejs;%PATH%
        echo:
        echo:
        powershell write-host -fore Green "Git is already downloaded!" 
        echo:
        echo Cloning repository . . . 
        echo:
        git clone https://github.com/midtownrobotics/G3-Scouting-Server.git ./Scouting-Server
        echo:
        echo: Installing packages . . . 
        cd ./Scouting-Server
        npm install .
        cd ../
        echo:
        powershell write-host -fore Red "You have successfully installed the G3 Scouting Server! Please see the github https://github.com/midtownrobotics/G3-Scouting-Software if you need help."
    )
)

endlocal

:NVMIsInstalled
    setlocal enableextensions disabledelayedexpansion

    set "tempFile=%temp%\%~nx0.%random%.tmp"

    nvm --version > "%tempFile%" && set "error=" || set "error=1"

    set "exitCode=1"

    if not defined error (
        set "exitCode=0"
    )

    if exist "%tempFile%" del /q "%tempFile%" >nul 2>nul 

endlocal & exit /b %exitCode%

:gitIsInstalled
    setlocal enableextensions disabledelayedexpansion

    set "tempFile=%temp%\%~nx0.%random%.tmp"

    git --version > "%tempFile%" && set "error=" || set "error=1"

    set "exitCode=1"

    if not defined error (
        set "exitCode=0"
    )

    if exist "%tempFile%" del /q "%tempFile%" >nul 2>nul 

endlocal & exit /b %exitCode%

:isOnline address
    setlocal enableextensions disabledelayedexpansion

    set "tempFile=%temp%\%~nx0.%random%.tmp"

    ping -w 1000 -n 4 %~1 > "%tempFile%" && set "pingError=" || set "pingError=1"

    set "exitCode=1"
    find "TTL=" "%tempFile%" >nul 2>nul && set "exitCode=0" || (
        if not defined pingError (
            findstr /r /c:" [a-f0-9:][a-f0-9]*:[a-f0-9:%%]*[a-f0-9]: " "%tempFile%" >nul 2>nul  && set "exitCode=0"
        )
    )

    if exist "%tempFile%" del /q "%tempFile%" >nul 2>nul 

endlocal & exit /b %exitCode%