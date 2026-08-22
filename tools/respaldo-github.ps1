# =============================================================================
#  RESPALDO AUTOMÁTICO A GITHUB
# =============================================================================
#  Guarda todos los cambios del proyecto y los sube a GitHub, sin preguntar
#  nada. Pensado para que lo dispare el Programador de tareas de Windows.
#
#  Correrlo a mano, si alguna vez hace falta:
#      powershell -ExecutionPolicy Bypass -File tools\respaldo-github.ps1
#
#  Deja un registro de cada corrida en tools\respaldo-github.log
# =============================================================================

$repo = Split-Path -Parent $PSScriptRoot
$log  = Join-Path $PSScriptRoot 'respaldo-github.log'

function Anotar($texto) {
    $linea = "[{0}] {1}" -f (Get-Date -Format 'yyyy-MM-dd HH:mm:ss'), $texto
    Add-Content -Path $log -Value $linea -Encoding UTF8
    Write-Host $linea
}

Anotar "----- arranca el respaldo -----"
Set-Location $repo

# ¿Hay algo para guardar? Si no cambió nada, un commit vacío da error,
# así que se corta acá y no se ensucia el historial.
$cambios = git status --porcelain
if (-not $cambios) {
    Anotar "no hay cambios, no hay nada que subir"
    exit 0
}

$cuantos = ($cambios -split "`n" | Where-Object { $_.Trim() }).Count
Anotar "$cuantos archivos con cambios"

# GitHub rechaza cualquier archivo de más de 100 MB, y un push rechazado
# deja el commit hecho a medias. Mejor avisar antes de intentarlo.
$grandes = Get-ChildItem $repo -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -gt 100MB -and $_.FullName -notmatch '\\.git\' }

foreach ($g in $grandes) {
    $rel = $g.FullName.Substring($repo.Length + 1) -replace '\', '/'
    git check-ignore -q "$rel"
    if ($LASTEXITCODE -ne 0) {
        $mb = [math]::Round($g.Length / 1MB)
        Anotar "FRENO: '$rel' pesa $mb MB y GitHub corta en 100. Agregalo al .gitignore o comprimilo."
        exit 1
    }
}

git add -A
if ($LASTEXITCODE -ne 0) { Anotar "ERROR al preparar los archivos"; exit 1 }

$fecha   = Get-Date -Format 'dd/MM/yyyy HH:mm'
$mensaje = "Respaldo automático del $fecha`n`n$cuantos archivos con cambios. Commit hecho por la tarea programada de Windows, sin revisar: el mensaje no describe el trabajo, solo lo pone a salvo."

git commit -q -m $mensaje
if ($LASTEXITCODE -ne 0) { Anotar "ERROR al hacer el commit"; exit 1 }

git push -q
if ($LASTEXITCODE -ne 0) { Anotar "ERROR al subir a GitHub (¿hay internet? ¿caducaron las credenciales?)"; exit 1 }

$sha = (git rev-parse --short HEAD).Trim()
Anotar "listo: subido como $sha"
exit 0
