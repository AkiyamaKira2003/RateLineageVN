Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

function Decode-Utf8Base64([string]$base64Value) {
  return [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($base64Value))
}

function New-RoundedPath(
  [int]$x,
  [int]$y,
  [int]$width,
  [int]$height,
  [int]$radius
) {
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  if ($width -le 0 -or $height -le 0) {
    return $path
  }

  $maxRadius = [Math]::Floor([Math]::Min($width, $height) / 2)
  $r = [Math]::Max(0, [Math]::Min($radius, $maxRadius))
  if ($r -eq 0) {
    $path.AddRectangle((New-Object System.Drawing.Rectangle $x, $y, $width, $height))
    return $path
  }

  $diameter = $r * 2
  $path.AddArc($x, $y, $diameter, $diameter, 180, 90)
  $path.AddArc($x + $width - $diameter, $y, $diameter, $diameter, 270, 90)
  $path.AddArc($x + $width - $diameter, $y + $height - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($x, $y + $height - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

function Draw-ShadowText(
  [System.Drawing.Graphics]$graphics,
  [string]$text,
  [System.Drawing.Font]$font,
  [System.Drawing.Brush]$fillBrush,
  [int]$x,
  [int]$y,
  [System.Drawing.Color]$shadowColor,
  [int]$offset = 2
) {
  $shadowBrush = New-Object System.Drawing.SolidBrush $shadowColor
  $graphics.DrawString($text, $font, $shadowBrush, $x + $offset, $y + $offset)
  $graphics.DrawString($text, $font, $fillBrush, $x, $y)
  $shadowBrush.Dispose()
}

function Draw-SoftEllipseStack(
  [System.Drawing.Graphics]$graphics,
  [int]$x,
  [int]$y,
  [int]$width,
  [int]$height,
  [System.Drawing.Color]$baseColor
) {
  for ($layer = 0; $layer -lt 6; $layer++) {
    $expand = $layer * 24
    $alpha = [Math]::Max(0, $baseColor.A - ($layer * 12))
    if ($alpha -le 0) {
      continue
    }

    $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($alpha, $baseColor.R, $baseColor.G, $baseColor.B))
    $graphics.FillEllipse($brush, $x - $expand, $y - $expand, $width + ($expand * 2), $height + ($expand * 2))
    $brush.Dispose()
  }
}

$root = Split-Path -Parent $PSScriptRoot
$outputPathPng = Join-Path $root "og-preview.png"
$outputPathJpg = Join-Path $root "og-preview.jpg"
$outputJpegPath = Join-Path $root "og-preview.jpg"
$logoPath = Join-Path $root "logoKRLC.png"

$width = 1200
$height = 630

$bitmap = New-Object System.Drawing.Bitmap $width, $height
$graphics = [System.Drawing.Graphics]::FromImage($bitmap)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$fullRect = New-Object System.Drawing.Rectangle 0, 0, $width, $height

$bgA = [System.Drawing.Color]::FromArgb(7, 15, 28)
$bgB = [System.Drawing.Color]::FromArgb(11, 28, 45)
$bgBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($fullRect, $bgA, $bgB, 18)
$graphics.FillRectangle($bgBrush, $fullRect)

$overlayA = [System.Drawing.Color]::FromArgb(70, 8, 32, 58)
$overlayB = [System.Drawing.Color]::FromArgb(40, 24, 48, 74)
$overlayBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($fullRect, $overlayA, $overlayB, 120)
$graphics.FillRectangle($overlayBrush, $fullRect)

$linePenA = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(16, 100, 146, 196), 1)
for ($i = -$height; $i -lt ($width + $height); $i += 34) {
  $graphics.DrawLine($linePenA, $i, 0, $i + $height, $height)
}

$linePenB = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(10, 74, 116, 168), 1)
for ($j = -$height; $j -lt ($width + $height); $j += 80) {
  $graphics.DrawLine($linePenB, $j + 120, 0, $j + $height + 120, $height)
}

Draw-SoftEllipseStack -graphics $graphics -x 40 -y -100 -width 340 -height 260 -baseColor ([System.Drawing.Color]::FromArgb(54, 64, 224, 255))
Draw-SoftEllipseStack -graphics $graphics -x 840 -y 280 -width 310 -height 240 -baseColor ([System.Drawing.Color]::FromArgb(48, 255, 142, 92))
Draw-SoftEllipseStack -graphics $graphics -x 580 -y -180 -width 420 -height 240 -baseColor ([System.Drawing.Color]::FromArgb(28, 88, 152, 255))

$auroraPenA1 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(26, 106, 226, 255), 132)
$auroraPenA1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenA1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenA1.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawBezier($auroraPenA1, -180, 210, 140, 46, 520, 190, 760, 96)

$auroraPenA2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(42, 110, 232, 255), 78)
$auroraPenA2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenA2.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenA2.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawBezier($auroraPenA2, -180, 210, 140, 46, 520, 190, 760, 96)

$auroraPenB1 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(24, 255, 146, 98), 122)
$auroraPenB1.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenB1.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenB1.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawBezier($auroraPenB1, 660, 610, 790, 466, 1020, 598, 1340, 450)

$auroraPenB2 = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(38, 255, 152, 108), 72)
$auroraPenB2.StartCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenB2.EndCap = [System.Drawing.Drawing2D.LineCap]::Round
$auroraPenB2.LineJoin = [System.Drawing.Drawing2D.LineJoin]::Round
$graphics.DrawBezier($auroraPenB2, 660, 610, 790, 466, 1020, 598, 1340, 450)

$random = [System.Random]::new(20260412)
$grainBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(10, 255, 255, 255))
for ($n = 0; $n -lt 1300; $n++) {
  $x = $random.Next(0, $width)
  $y = $random.Next(0, $height)
  $size = if ($random.NextDouble() -lt 0.82) { 1 } else { 2 }
  $graphics.FillRectangle($grainBrush, $x, $y, $size, $size)
}

$panelX = 34
$panelY = 38
$panelW = 1132
$panelH = 554
$panelPath = New-RoundedPath -x $panelX -y $panelY -width $panelW -height $panelH -radius 20
$panelRect = New-Object System.Drawing.Rectangle $panelX, $panelY, $panelW, $panelH

$panelBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $panelRect,
  ([System.Drawing.Color]::FromArgb(156, 8, 20, 37)),
  ([System.Drawing.Color]::FromArgb(178, 7, 15, 30)),
  96
)
$graphics.FillPath($panelBrush, $panelPath)

$panelBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(104, 78, 130, 183), 2)
$graphics.DrawPath($panelBorder, $panelPath)

$innerPanelPath = New-RoundedPath -x ($panelX + 8) -y ($panelY + 8) -width ($panelW - 16) -height ($panelH - 16) -radius 16
$innerBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(58, 106, 150, 200), 1)
$graphics.DrawPath($innerBorder, $innerPanelPath)

$topGlowPen = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(58, 126, 184, 236), 1)
$graphics.DrawLine($topGlowPen, $panelX + 26, $panelY + 22, $panelX + $panelW - 26, $panelY + 22)

$glassX = 298
$glassY = 76
$glassW = 822
$glassH = 466
$glassPath = New-RoundedPath -x $glassX -y $glassY -width $glassW -height $glassH -radius 28
$glassRect = New-Object System.Drawing.Rectangle $glassX, $glassY, $glassW, $glassH
$glassBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $glassRect,
  ([System.Drawing.Color]::FromArgb(42, 84, 132, 194)),
  ([System.Drawing.Color]::FromArgb(12, 38, 70, 106)),
  135
)
$graphics.FillPath($glassBrush, $glassPath)

$glassBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(70, 120, 170, 224), 1)
$graphics.DrawPath($glassBorder, $glassPath)

$logoRect = New-Object System.Drawing.Rectangle 86, 84, 188, 188
for ($shadowLayer = 0; $shadowLayer -lt 5; $shadowLayer++) {
  $expand = $shadowLayer * 6
  $shadowAlpha = [Math]::Max(8, 42 - ($shadowLayer * 7))
  $shadowPath = New-RoundedPath -x ($logoRect.X - $expand) -y ($logoRect.Y - $expand) -width ($logoRect.Width + ($expand * 2)) -height ($logoRect.Height + ($expand * 2)) -radius (36 + $expand)
  $shadowBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb($shadowAlpha, 14, 30, 52))
  $graphics.FillPath($shadowBrush, $shadowPath)
  $shadowBrush.Dispose()
  $shadowPath.Dispose()
}

$logoPathRound = New-RoundedPath -x $logoRect.X -y $logoRect.Y -width $logoRect.Width -height $logoRect.Height -radius 34
$logoFrameBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(92, 7, 23, 41))
$graphics.FillPath($logoFrameBrush, $logoPathRound)

if (Test-Path $logoPath) {
  $logoImage = [System.Drawing.Image]::FromFile($logoPath)
  $graphics.SetClip($logoPathRound)
  $graphics.DrawImage($logoImage, $logoRect)
  $graphics.ResetClip()
  $logoImage.Dispose()
}

$logoBorder = New-Object System.Drawing.Pen ([System.Drawing.Color]::FromArgb(214, 70, 220, 255), 2)
$graphics.DrawPath($logoBorder, $logoPathRound)

$titleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(236, 244, 252))
$subtitleBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(184, 206, 230))
$tagBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(142, 236, 255, 255))

$titleFont = New-Object System.Drawing.Font("Segoe UI Semibold", 60, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$line2Font = New-Object System.Drawing.Font("Segoe UI Semibold", 52, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$tagFont = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
$subFont = New-Object System.Drawing.Font("Segoe UI", 34, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

$tagLine = Decode-Utf8Base64 "UmVhbHRpbWUgMTAwJSAtIEPhuq1wIG5o4bqtdCAyNC83"
$subLine = Decode-Utf8Base64 "QuG6o25nIGdpw6EgMjggc2VydmVyIHwgQmnhu4N1IMSR4buTIHThu5VuZyBo4bujcA=="

Draw-ShadowText -graphics $graphics -text "Kira Rate Adena VN" -font $titleFont -fillBrush $titleBrush -x 316 -y 102 -shadowColor ([System.Drawing.Color]::FromArgb(122, 5, 14, 24)) -offset 2
Draw-ShadowText -graphics $graphics -text "Lineage Classic" -font $line2Font -fillBrush $titleBrush -x 318 -y 184 -shadowColor ([System.Drawing.Color]::FromArgb(122, 5, 14, 24)) -offset 2
Draw-ShadowText -graphics $graphics -text $tagLine -font $tagFont -fillBrush $tagBrush -x 318 -y 286 -shadowColor ([System.Drawing.Color]::FromArgb(112, 4, 12, 20)) -offset 1
Draw-ShadowText -graphics $graphics -text $subLine -font $subFont -fillBrush $subtitleBrush -x 318 -y 356 -shadowColor ([System.Drawing.Color]::FromArgb(102, 3, 10, 18)) -offset 1

$bar1Rect = New-Object System.Drawing.Rectangle 320, 456, 560, 14
$bar1Path = New-RoundedPath -x $bar1Rect.X -y $bar1Rect.Y -width $bar1Rect.Width -height $bar1Rect.Height -radius 7
$bar1Brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $bar1Rect,
  ([System.Drawing.Color]::FromArgb(196, 97, 183, 255)),
  ([System.Drawing.Color]::FromArgb(196, 54, 120, 226)),
  0
)
$graphics.FillPath($bar1Brush, $bar1Path)

$bar2Rect = New-Object System.Drawing.Rectangle 320, 486, 392, 14
$bar2Path = New-RoundedPath -x $bar2Rect.X -y $bar2Rect.Y -width $bar2Rect.Width -height $bar2Rect.Height -radius 7
$bar2Brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
  $bar2Rect,
  ([System.Drawing.Color]::FromArgb(186, 255, 162, 112)),
  ([System.Drawing.Color]::FromArgb(186, 255, 118, 84)),
  0
)
$graphics.FillPath($bar2Brush, $bar2Path)

$bitmap.Save($outputPathPng, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Save($outputPathJpg, [System.Drawing.Imaging.ImageFormat]::Jpeg)

$jpegEncoder = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq "image/jpeg" } |
  Select-Object -First 1
if ($jpegEncoder) {
  $jpegParams = New-Object System.Drawing.Imaging.EncoderParameters 1
  $jpegQuality = New-Object System.Drawing.Imaging.EncoderParameter(
    [System.Drawing.Imaging.Encoder]::Quality,
    [long]92
  )
  $jpegParams.Param[0] = $jpegQuality
  $bitmap.Save($outputJpegPath, $jpegEncoder, $jpegParams)
  $jpegQuality.Dispose()
  $jpegParams.Dispose()
}

$bar2Brush.Dispose()
$bar2Path.Dispose()
$bar1Brush.Dispose()
$bar1Path.Dispose()
$subFont.Dispose()
$tagFont.Dispose()
$line2Font.Dispose()
$titleFont.Dispose()
$tagBrush.Dispose()
$subtitleBrush.Dispose()
$titleBrush.Dispose()
$logoBorder.Dispose()
$logoFrameBrush.Dispose()
$logoPathRound.Dispose()
$glassBorder.Dispose()
$glassBrush.Dispose()
$glassPath.Dispose()
$topGlowPen.Dispose()
$innerBorder.Dispose()
$innerPanelPath.Dispose()
$panelBorder.Dispose()
$panelBrush.Dispose()
$panelPath.Dispose()
$grainBrush.Dispose()
$auroraPenB2.Dispose()
$auroraPenB1.Dispose()
$auroraPenA2.Dispose()
$auroraPenA1.Dispose()
$linePenB.Dispose()
$linePenA.Dispose()
$overlayBrush.Dispose()
$bgBrush.Dispose()
$graphics.Dispose()
$bitmap.Dispose()

Write-Output "Generated: $outputPathPng"
Write-Output "Generated: $outputPathJpg"
