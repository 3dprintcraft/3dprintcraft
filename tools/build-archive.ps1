<#
  build-archive.ps1 — 3DPrintCraft photo archive builder
  ------------------------------------------------------
  ΧΡΗΣΗ:
    1. Ρίξε φωτογραφίες στον φάκελο  assets/img/archive/
       - Στη ρίζα  -> κατηγορία "Όλα"
       - Σε ΥΠΟΦΑΚΕΛΟ (π.χ. assets/img/archive/Μπρελόκ/) -> το όνομα του φακέλου γίνεται ΚΑΤΗΓΟΡΙΑ
    2. Τρέξε:  powershell -ExecutionPolicy Bypass -File tools\build-archive.ps1
  Τι κάνει: σμικραίνει τις μεγάλες (>1600px), μετατρέπει PNG->JPG, διορθώνει EXIF περιστροφή,
  και γράφει το assets/img/archive/manifest.json (με κατηγορίες) που διαβάζει το archive.html.
#>
Add-Type -AssemblyName System.Drawing

$base = if ($PSScriptRoot) { Split-Path -Parent $PSScriptRoot } else { (Get-Location).Path }
$root = Join-Path $base 'assets\img\archive'
if (-not (Test-Path $root)) { New-Item -ItemType Directory -Force -Path $root | Out-Null }

$jpgEnc  = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$maxEdge = 1600
$quality = 82
$entries = @()

function Add-Image($file, $cat) {
  $img = [System.Drawing.Image]::FromFile($file.FullName)
  $orient = 1
  if ($img.PropertyIdList -contains 0x0112) { $orient = $img.GetPropertyItem(0x0112).Value[0] }
  if     ($orient -eq 3) { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate180FlipNone) }
  elseif ($orient -eq 6) { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate90FlipNone) }
  elseif ($orient -eq 8) { $img.RotateFlip([System.Drawing.RotateFlipType]::Rotate270FlipNone) }

  $w = $img.Width; $h = $img.Height
  $isPng    = $file.Extension -match '(?i)png'
  $tooBig   = [Math]::Max($w, $h) -gt $maxEdge
  $reEncode = $tooBig -or $isPng -or ($orient -ne 1)
  $dir      = $file.DirectoryName
  $name     = $file.Name

  if ($reEncode) {
    $scale = [Math]::Min(1.0, $maxEdge / [Math]::Max($w, $h))
    $nw = [int][Math]::Round($w * $scale); $nh = [int][Math]::Round($h * $scale)
    $bmp = New-Object System.Drawing.Bitmap $nw, $nh
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode   = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.SmoothingMode     = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.DrawImage($img, 0, 0, $nw, $nh)
    $img.Dispose()
    $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
    $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality, [long]$quality)
    $name = [System.IO.Path]::GetFileNameWithoutExtension($file.Name) + '.jpg'
    $bmp.Save((Join-Path $dir $name), $jpgEnc, $ep)
    $g.Dispose(); $bmp.Dispose()
    if ($isPng) { Remove-Item $file.FullName -Force }
    $w = $nw; $h = $nh
  } else { $img.Dispose() }

  $rel = if ($cat) { "$cat/$name" } else { $name }
  $script:entries += [ordered]@{ src = $rel; w = $w; h = $h; cat = $cat }
  "  {0,-14} {1}" -f ("[" + ($(if ($cat) { $cat } else { '—' })) + "]"), $rel
}

$imgFilter = { $_.Extension -match '(?i)\.(jpe?g|png|webp)$' }

# root-level images -> "Όλα"
Get-ChildItem $root -File | Where-Object $imgFilter | Sort-Object LastWriteTime -Descending | ForEach-Object { Add-Image $_ '' }
# one level of subfolders -> categories
Get-ChildItem $root -Directory | Sort-Object Name | ForEach-Object {
  $cat = $_.Name
  Get-ChildItem $_.FullName -File | Where-Object $imgFilter | Sort-Object LastWriteTime -Descending | ForEach-Object { Add-Image $_ $cat }
}

$json = '[' + (($entries | ForEach-Object { $_ | ConvertTo-Json -Compress }) -join ',') + ']'
[System.IO.File]::WriteAllText((Join-Path $root 'manifest.json'), $json, (New-Object System.Text.UTF8Encoding($false)))
$cats = @($entries | Where-Object { $_.cat } | ForEach-Object { $_.cat } | Sort-Object -Unique)
"`nWrote manifest.json  ({0} images, {1} categories: {2})" -f $entries.Count, $cats.Count, ($cats -join ', ')
