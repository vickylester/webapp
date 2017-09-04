# T2T: WebApp
[English version of this doc is coming soon]

## Généralités
- Cette application web est développée en Angular 1.6. La documentation à propos de Angular 1.6 est disponible ici : https://angularjs.org/
- L'objectif de l'application web est d'exploiter les données de l'API de T2T et de et de lui fournir d'autres données. Pour plus d'information sur l'API, voir https://github.com/TranscribeToTEI/api

## Structuration des fichiers
L'application est structurée de la manière suivante :
- app
    - Admin -> Contient les pages d'administration du projet
    - App -> Contient les pages publiques du projet
    - System -> Contient les éléments génériques du projet (navbar, filters, directives ...)
    - Transcript -> Contient le controller le plus abstrait de l'application
    - web -> Contient les fichiers web du projet (images, css, libraries externes ...)
    - app.js -> Fichier d'initialisation de Angular, contient les appels de directive, la config et le run
    - index.html -> Fichier HTML racine
    - parameters.yrml -> Fichier de paramètre contenant notamment les liens vers l'API
    
Il est important de noter qu'au sein des dossiers Admin et App, les données sont structurées de la manière suivante. 
Chaque page est représentée par un dossier :
- Home -> Dossier pour la page Home
    - Home.js -> Controller de la page
    - Home.html -> Vue de la page
    - Home.css -> CSS de la page