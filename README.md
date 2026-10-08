# GitHub Pages · VELOCITY GP 2.5.0

Spiel: https://o-some.github.io/velocity/

GitHub Actions prüft die Spielversion und veröffentlicht `dist/`. Zusätzlich unterstützt die Startdatei im Repository-Stamm die Pages-Veröffentlichung von `main` / `/ (root)`. Sämtliche Bilder liegen lokal im Repository.

## Ursprüngliche Projektdokumentation

# VELOCITY GP Evolution · 2.5.0

Die überarbeitete Webversion von Muhammed Köses Rennspiel. Weiterentwickelt mit
ChelonakiAppFactory 1.21.1 und den tatsächlich gelesenen Spielmodulen 96, 97, 98,
Autonomie-Modul 93 sowie Modul 55 für die unabhängige Prüfung.

## Spielen

https://muhammed-koese-velocity-gp.o-some.chatgpt.site

Der bestehende private Spiel-Link bleibt erhalten. Nach einem Update bei Bedarf
die Seite vollständig neu laden. Lokal das Paket entpacken und `dist` über einen statischen Webserver ausliefern,
z. B. `python3 -m http.server 8080 --directory dist`. Dann localhost:8080 öffnen.
Beim direkten Öffnen mit file:// können Browser Texturladevorgänge blockieren;
dann bleiben einfache Ersatzoberflächen sichtbar. Es gibt keine Serverdatenbank, Werbung,
Analyse-Tracker oder kostenpflichtige API.

## Neu in 2.5: Studio-Lack, weichere Formen und live gespiegeltes Podest

Der Schwerpunkt liegt auf der Fahrzeugpräsentation aus der Nutzeraufnahme:
Die bisher matte graue Scheibe ist durch ein kleineres, dunkles Hochglanzpodest
mit polierter Metallkante, feinem Team-Lichtband und klarer Spiegeloberfläche
ersetzt. Fahrzeug und Podest drehen sich langsam gemeinsam; reduzierte Bewegung
stoppt diese automatische Rotation. Eine neutrale Studio-Hauptbeleuchtung,
weiches Fülllicht, Themen-Kantenlicht und Kontakt-Schatten formen das Fahrzeug.

Vier räumliche Lichtflächen werden einmalig mit Three.js PMREM vorgefiltert
und als echte Umgebungsspiegelungen für die Showroom-Materialien verwendet.
Die Podestoberfläche erhält eine zusätzliche planare Spiegelung des laufenden
3D-Autos: gespiegelt berechnete Kamera, schräger Nah-Clipping-Plane und lokaler
Render-Target. Die Spiegelung wird vor ACES-Tonemapping in das physikalische
Bodenmaterial eingeblendet. Renderzustand, Ziel, XR und Shadow-Updates werden
anschließend auch bei Fehlern wiederhergestellt. Der Sparmodus schaltet diese
Spiegelung und Showroom-Schatten ab. Ausgewogen: 512x512, jede zweite Darstellung;
Detail: 1024x1024, jede Darstellung. Die Zusatzdarstellung läuft nur im Menü/der
Garage; Rennen erhalten diesen Render-Pass nicht. Bei Grafikfehlern bleibt das
physikalische Podest ohne planare Spiegelung erhalten.

Alle vier tatsächlichen 3D-Fahrzeuge haben jetzt längs weich interpolierte,
abgerundete Karosserieflächen, geformte Frontflügel, kleinere Luftöffnungen,
feineren Carbon-Webstoff, glänzenderen Klarlack und 16 instanzierte verbundene
Aufhängungsstreben. Innere Radflächen erhalten dunkle Bremsscheiben. Die fünf
InstancedMeshes je Fahrzeug werden beim Wechsel ordnungsgemäß freigegeben.
Schadensanschlüsse, Kollisionsmaße, Ghost und gespeicherter Fortschritt bleiben
kompatibel. Die Fahrphysik wurde nicht verändert.

Die Garage zeigt vier fotorealistische Team-Porträts mit erhaltenem Alpha-Kanal
in größeren Auswahlkarten: insgesamt 472.644 Byte, je 960x640 RGBA WebP.
Dies sind eigens erzeugte Render-Artworks und keine Screenshots des WebGL-Spiels;
die interaktive Hauptpräsentation verwendet weiterhin echte 3D-Geometrie.
Herkunft und vollständige Prompts: `dist/assets/portraits/manifest.json` und
`dist/assets/portraits/prompts.json`. Eingebautes image_gen; ausschließlich
Größenanpassung und WebP-Kodierung. PNG-Originale bleiben im Bildpaket erhalten.

Die vollständige automatische Prüfung besteht einschließlich Spiegelkamera,
Clip-Richtung, Shader-Einfügung am tatsächlich gebündelten Three.js-Shader,
Renderer-Zustand nach Erfolg/Fehler, Sparmodus, Modellgeometrie und Drehung.
Die unabhängige CAF-Prüfung besteht nach Reparatur eines PMREM-Fehlerpfads;
der tatsächliche PMREM-Code wird zusätzlich mit simulierten GPU- und
Konstruktorfehlern auf die vollständige Wiederherstellung des Renderers geprüft.
Der GPU-Render-Pass, PMREM-Rendering, endgültige Lichtwirkung und tatsächliche
Bildrate konnten hier nicht in einem echten Browser geprüft werden. Die
Nutzeraufnahme wurde als Vorher-Referenz betrachtet; es gibt kein Nachher-
Screenshot des tatsächlichen Spiels. Fotorealistische Echtzeitqualität wird
nicht allein aus diesen Tests abgeleitet.

## Neu in 2.4: Fahrzeugformen, Streckenanlagen und Auswahlbilder

Die vier Fahrzeuge haben jetzt abgerundete Karosseriequerschnitte mit getrennten
Endkappen, maßhaltige gefaste Anbauteile, profilierte Slickreifen, acht instanzierte
Felgenspeichen pro Rad, Bremsscheiben und Bremssättel. Reifenflanken tragen Team-
Markierungen. Zusätzliche Carbon-Lamellen, Unterbodenkanäle und Diffusorfinnen
ergänzen den Look. Die bisherigen vier Team-Lackierungen und Schadensanschlüsse
bleiben verwendet. Kollisionsmaße und Fahrphysik wurden nicht erweitert.

An allen drei Strecken ergänzen überdachte Tribünenmodule, instanzierte Sitze,
ein verglastes Kontrollgebäude, grüne Sicherheitsstreifen und dezente Gummispuren
die bestehenden Boxen, Zuschauer, Bäume und Themengebäude. Der transparente
Zaunschleier wird durch alpha-getestete tatsächliche Maschen ersetzt. Die neuen
Gebäude werden gegen alle realen Mittelliniensegmente außerhalb des umzäunten
Fahrkorridors platziert. Die Hafenfenster folgen jetzt den gedrehten Gebäudeflächen.
Der Sparmodus blendet die zusätzliche Sitz- und Aerodynamikdetailgruppe aus.

Das Startpodest besteht aus einer gefasten Metallbasis, Carbonoberseite,
feinem teamfarbenem Lichtband, zwölf Metallmarkierungen und Bodenschatten.
Das Panorama bleibt interaktiv. Das Fahrzeug steht auf Höhe der Podestoberseite.

Drei neu erzeugte 1280x640 WebP-Auswahlbilder (728.918 Byte zusammen) ersetzen
die einfachen Weltillustrationen in der Haupt- und Streckenauswahl. Die Bilder
sind stimmungsvolle Illustrationen; den exakten Streckenverlauf zeigt weiterhin
eine separate SVG-Karte. Die bisherigen SVGs bleiben als Bildausfall-Ersatz.
Die Garage verwendet Ausschnitte der echten Team-Lackierungen in der Auswahl.
Asset-Herkunft und vollständige Prompts: `dist/assets/selection/manifest.json`
und `dist/assets/selection/prompts.json`. Eingebautes image_gen, danach ausschließlich
Größenanpassung und WebP-Kodierung. PNG-Originale liegen im separaten Bildpaket.

Die automatischen Prüfungen bestehen inklusive Flächennormalen, Geometriemaßen,
Zaun-UVs, Sparmodus, Podestteilen und unabhängigen Fahrkorridor-Abstandsprüfungen.
Browser-/GPU-Darstellung und echte Bildrate sind weiterhin nicht geprüft.

## Neu in 2.3: klare Landschaft und eigene Fahrzeug-Lackierungen

Aus dem Nutzerbild: Die große graue Menü-Bodenfläche verdeckte den Horizont;
Nebel und starke Bühnenbeleuchtung machten Fahrzeuge blass. Die Menü-/Garagen-
Bühne ist jetzt auf einen Radius98-Kreis begrenzt, ohne Nebel und mit reduzierter
Beleuchtungsstärke. Das Panorama füllt den Hintergrund als proportionstreuer
Fotoausschnitt und bewegt sich beim Ziehen. Der Rennhorizont bleibt eine 3D-Kugel.
Die Hintergrundausschnitte verändern ausschließlich eine eigene Texture-Kopie;
die beim Rennen verwendeten UV-Transformationen bleiben unabhängig.

Vier tatsächliche lokale 1024x1024 WebP-Lackierungen (562.966 Byte zusammen):
Aurora Rot/Weiß, Nova Cyan/Navy, Helix Gelb/Graphit, Titan Lime/Silber. Sie liegen
auf Karosserie, Motorabdeckung, Nase und Seitenkästen. UVs wurden ergänzt;
physikalisches Lackmaterial kombiniert Albedo, moderates Metall, Klarlack und
Reflexionen. Dunkles Carbon und Reifen bleiben als eigene Materialien erhalten.
512-Pixel-Startnummern und Teamplaketten ergänzen die Texturen. Seitenplaketten
gehören zu den beschädigbaren Seitenkästen. Das blaue Ghost-Fahrzeug bleibt transparent.
Bei Ladefehlern verwendet das Spiel die passende Teamfarbe mit einer Ersatzstreife.

Assets und Herkunft: `dist/assets/liveries/manifest.json`; vollständige Prompts
und verwendeter eingebauter image_gen-Modus: `dist/assets/liveries/prompts.json`.
PNG-Originale liegen zusätzlich im Dropbox-Lackierungspaket. Verarbeitung:
Größenanpassung und WebP-Kodierung, keine semantische Bildnachbearbeitung.
Die bereitgestellte Aufnahme wurde als Vorher-Referenz betrachtet. Das fertige
Ergebnis ist noch nicht im Browser gerendert oder auf einem Gerät geprüft.

## Neu in 2.2: Grand-Prix-Kulisse und interaktiver Horizont

- Drei lokal gespeicherte, eigens mit image_gen erzeugte Panorama-Bilder (2048 × 1024):
  mediterrane Berglandschaft, Hafen-Dämmerung und Wüsten-Sonnenuntergang.
  Zusammen 922.206 Byte (ca. 0,92 MB zusätzlicher Download für alle drei Welten).
- Der Horizont liegt auf einer 3D-Himmelskugel. Kamerawechsel und Blickrichtung
  verändern den sichtbaren Ausschnitt; die Rennstrecke bleibt räumlich konsistent.
- Im Hauptmenü „Kulisse entdecken“ horizontal/vertikal ziehen. Pfeiltasten und
  Bild-auf/Bild-ab drehen die Ansicht, Pos1 oder „Ansicht zurücksetzen“ setzen sie zurück.
  Beim Menüwechsel, Abbruch oder Fensterwechsel wird die Geste beendet.
- Bewegte, separate Wolkenschichten; ruhige Darstellung bei reduzierter Bewegung
  und deaktivierte zusätzliche Wolken bei „Sparsam“. Regen dunkelt die Kulisse ab.
- Boxengebäude, Glasfronten, Flutlichtmasten, instanzierte Zuschauer und Leitplanken
  ergänzen alle drei Circuits. Spielphysik, Rennmodi und gespeicherter Fortschritt bleiben erhalten.
- Die Menü- und Garagenbühne übernehmen Licht und Panorama der ausgewählten Strecke.

Das ist ein weiterentwickelter privater Arcade-Rennspiel-Kandidat. Eine Gleichwertigkeit
mit kommerziellen AAA-Rennsimulationen wird nicht behauptet. Nahtlosigkeit, Projektion,
Shader, Bildrate und tatsächliche Browserdarstellung sind noch visuell zu prüfen.

## Neu in 2.1: Texturen und Vegetation

- Fünf echte lokale WebP-Texturen mit 1024 × 1024 Pixeln: Asphalt, Gras, Sand,
  Rinde und Laub. Zusammen 2.414.638 Byte (ca. 2,4 MB Download), keine externe Asset-CDN.
- Texturierte Baumstämme und Kronen, Zypressen mit sichtbarem Stamm, geschwungene
  3D-Palmwedel, strukturierte Dünen und sandige Auslaufzonen.
- Geteilte Texturen, Mipmaps, Wiederholung und bis zu 4× anisotrope Filterung.
  Waldobjekte bleiben instanziert; Stamm und Krone verwenden höchstens zwei Materialgruppen.
- Bilder laden asynchron. Bei einem Ladefehler bleibt eine farbige Ersatztextur
  erhalten und der Rennablauf läuft weiter. Die 2D-Ersatzansicht verwendet keine Bildtexturen.
- Herkunft, Maße, Dateigrößen und SHA-256: `dist/assets/textures/manifest.json`.

## Neu in Evolution

- Vier verfeinerte prozedurale Fahrzeugformen, Materialreflexionen, Cockpitdetails,
  Fahrerhelm, Halo, Startnummern, Reifenringe und 3D-Showroom im Menü/der Garage.
- Italien: mediterranes Abendlicht, Villen, Zypressen und bestehende Vegetation.
- Japan: Hafen-Skyline, Container, Fensterlicht und farbige Streckenränder.
- Bahrain: Sonnenuntergang, Dünen, Palmen, Hospitality-Zelte und ein Rundturm.
- Straßenoberfläche, Streckenbeschilderung, Bremsmarkierungen und optionale
  farbige Orientierungslinie. Die Linie ist eine Fahrhilfe, keine ideale
  physikalisch optimierte Rennlinie für jedes Fahrzeug.
- Neue Menüzusammenstellung, schnelle Streckenauswahl und kompakteres HUD.
- Analoge Touch-Lenkung mit Tastenalternative und drei Empfindlichkeitsstufen.
- Optionale milde Stabilitätshilfe, drei Grafikauflösungsstufen und ruhige Kamera.
- Kamerawechsel und Zurücksetzen über eigene Touch-Tasten.
- Ein abgeschlossenes Rennen bringt +1 Upgrade-Punkt, ein Podium +2, ein Sieg +3.
  Zeitfahren, Ausfall und vorzeitiges Verlassen bringen keine Abschlussbelohnung.
- Renn- und Siegstatistik ab dieser Version; bestehende Spielstände bleiben erhalten.
- Three.js r128 ist lokal enthalten und benötigt keinen CDN-Aufruf mehr.

## Steuerung

WASD/Pfeiltasten: Gas, Bremse, Lenken. Shift/E: Boost. Leertaste: Handbremse.
C: Kamera. R: Zurücksetzen. Esc/P: Pause. Gamepad-Eingaben bleiben erhalten.

Auf Touch-Geräten links den Lenkbereich berühren und horizontal bewegen;
rechts Gas/Bremse/Boost halten. In den Einstellungen lässt sich auf die
bisherigen Lenktasten wechseln. Für das Spiel bietet sich Querformat an.

## Projektstruktur

`dist/js/game.js`: bestehende Simulation und Spielzustände mit begrenzten Anpassungen.
`dist/js/studio.js`: Studio-Umgebung, Materialeinbindung und lokale planare Spiegelung.
`dist/js/world.js`: neue Fahrzeuggeometrie, Materialien, Welten und Showroom.
`dist/js/evolution.js`: Bedienoberfläche, Eingaben und Zusatzstatistik.
`dist/styles/`: bestehende Gestaltung plus Evolution-Erweiterungen.
`dist/assets/portraits/`: vier tatsächlich verwendete Team-Porträts, Manifest und Prompts.
`dist/assets/selection/`: verwendete Auswahlbilder, Manifest und Prompts.
`dist/assets/liveries/`: tatsächlich verwendete Team-Lackierungen, Manifest und Prompts.
`dist/assets/horizons/`: verwendete Panorama-Bilder, Manifest und Generierungs-Prompts.
`dist/assets/textures/`: im Spiel tatsächlich verwendete WebP-Bilder und Manifest.
`dist/vendor/`: unverändertes Three.js r128 und dessen MIT-Lizenz.
`tests/verify.cjs`: integrierte automatisierte Laufzeitprüfung.

Das Originalarchiv bleibt unverändert. Ausgangs-Commit:
`6970f562cc243bc8dc24c0285296abc3c69a4e76`.
SHA-256 der ursprünglichen index.html:
`ebfa22a2f79b126962827ba9441fc1f8a3864fa28ad4e16eb5e6460306bf74b2`.

## Prüfung und Grenzen

`node tests/verify.cjs` prüft in einer Node-VM alle zwölf Kombinationen, komplette
Qualifying- und Rennrunden mit der vorhandenen KI, Zustandswechsel, echte
Three.js-Geometrie/Kameramathematik, Touch-Ereignisse, Save-Kompatibilität,
Schadensanimation, Wetter, Belohnungen und 2D-Ersatzmodus. DOM, Canvas und
Renderer sind Test-Doubles: Diese Prüfung kompiliert keine GPU-Shader und
beweist weder das Aussehen noch die tatsächliche Bildrate im Browser.

Die automatisierte Prüfung umfasst zusätzlich Asset-Hashes, Baum-UVs, Materialgruppen
und simuliertes erfolgreiches/fehlgeschlagenes asynchrones Texturladen. Die fünf
WebP-Dateien wurden mit Pillow vollständig dekodiert. Die unabhängige CAF-Prüfung
ist im aktuellen Prüfbericht dokumentiert. Browserbilder, Geräteeingaben, Safe-Area-Layout, Audio und Bildraten
müssen anschließend im echten Spiel geprüft werden. Es wird keine visuelle
Qualitätsnote und keine Store-/Android-Freigabe behauptet.

## Herkunft und Speicherung

Ausgangsdatei: `/[Muhammed Köse]/rennspiel.zip`. Modelle, Welten, SVG-Grafiken
sind originale lokale Code-Erzeugnisse. Die fünf Rastertexturen, drei Horizontbilder, vier Lackierungen, drei Auswahlbilder und vier Fahrzeug-Porträts wurden für diese
Version mit image_gen erzeugt und ausschließlich verkleinert/WebP-kodiert.
PNG-Originale und Laufzeittexturen werden im separaten Dropbox-Texturpaket gesichert.
Three.js: https://github.com/mrdoob/three.js/tree/r128, MIT.
Google Fonts bleiben optional; Systemschrift-Fallbacks sind vorhanden.

Auslieferung im bestehenden Kundenprojekt:
`/[Muhammed Köse]/[Apps]/[VELOCITY GP]/[Spielbare Version]`,
`[Quellcode]`, `[Dokumentation]`, `[Tests]` und `[Texturen]/[v2.5.0]`.
Das Android-Projekt wird in diesem Arbeitsschritt nicht verändert.
