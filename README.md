# Paella Player für die BHT Berlin

Dieses Projekt umfasst den gesamten Player. Es ist ein Fork von dem [Paella Player](https://github.com/polimediaupv/paella).

Das Projekt erweitert den Player um die Funktionalitäten und das Aussehen für die Beuth Hochschule.

Material (PSDs): beuth-material/
Erweiterungen des originalen Projekts: beuth/

Alle Dateien im Unterordner beuth werden durch das Buildtool in den dist-Ordner kopiert und überschreiben die Dateien, welche im src-Ordner definiert wurden.

Alle watch-/build-Tasks wurden mit dem task beuth erweitert. 

## Einstellungen

### Anordnung der Videos
Konfig: `/beuth/player/config/profiles/profiles.json`

Hiermit kann gesteuert werden, wie die Videos angeordnet werden können.

### Player-Config
Konfig: `beuth/build/player/config/config.json`

Hiermit lassen sich alle Einstellungen für den Player vornehmen.


### Styling
Url: `beuth/resources/style/skins/beuth.less`

Das gesamte Styling wurde auch wie das Originalprojekt mit LESS umgesetzt, damit die Variablen genutzt werden können. 
Die Controls wurden zusätzlich überschrieben, da andere Icons genommen wurden (FontAwesome Icons)

## Building

```
cd path/to/repository
npm i
npm i gulp -g
gulp build // baut eine Version
```

Einfach Veränderungen an diesem Projekt pushen und über das paella-matterhorn Repository bauen und deployen. Der Player muss an sich nur zum Testen gebuildet werden.
 
 