# CSD3120 Team VR Project

## Member:
> Ho Yi Guan - 2001595 <br>
> Chen Yen Hsun - 2002761 <br>
> Seet Min Yi - 2002088 <br>
> Edwin Poh Yi Han - 2001033 <br>
> Syaakir - 2001998 <br>
> Sim Chin Hin - 2001246 <br>

## Table of Contents

- [Background](#background)
- [Dependencies](#dependencies)
- [Install](#install)
- [App Details](#app-details)
- [Architecture](#architecture)
- [Feedbacks](#feedbacks)
- [Responses (as of 2/4/2023)](#responses)


## Background
App Built using Node, BabylonJS, and webpack with TypeScript.<br>
Target Device: **Meta Quest 2**.<br>

## Dependencies

### Main Packages
- `"@types/node"`
-  `babylonjs`
-  `babylonjs-gui`
-  `babylonjs-loaders`
    
### Dev Packages
- `html-webpack-plugin`
- `ts-loader`
- `typescript`
- `webpack-cli`
- `html-webpack-plugin`
- `webpack-dev-server`

## Install

Clone the project using git-clone.<br>

<br>Install the required `Dependencies` using 
```
npm via npm install
```

<br>`Build` the development environment using
```
npm run build
```
```
npm run build-ext
```

<br>`Run` the development server using
```
npm run serve
```

<br>Standalone app can be accessed from the local machine at http://localhost:3005/ from your local browser.

## Architecture
- [xr-webapp folder](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src)
	- [init.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/init.ts) - Entry point for the vr application.
	- [index.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/index.ts) - Load the XRauthor data into the VR application.
	- [index-ext.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/index-ext.ts) - Sets up the extension to create.
	- [Global.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Global.ts) - GLOBAL class used among all the other classes.
	- [app.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/app.ts) - App class for setting up the scenes.
	- [Camera](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Camera)
		- [SceneCamera.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Camera/SceneCamera.ts) - SceneCamera class for creating a free camera.
	- [Component](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component)
		- [Buttons](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Buttons)
			- [SceneButton.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Buttons/SceneButton.ts) - SceneButton class for creating a scene button.
		- [Indicators](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Indicators)
			- [Indicator.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Indicators/Indicator.ts) - Indicator class for creating a tutorial indicator.
		- [Molecules](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Molecules)
			- [Molecule.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Molecules/Molecule.ts) - Molecule class for creating a molecule.
			- [MoleculeLabel.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Molecules/MoleculeLabel.ts) - MoleculeLabel class for creating the label for a molecule.
			- [MoleculeManager.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Molecules/MoleculeManager.ts) - MoleculeManager class for managing the molecules.
		- [Panels](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Panels)
			- [DisplayPanels.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Panels/DisplayPanels.ts) - DisplayPanel class for creating a display panel.
		- [ReactionZones](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/ReactionZones)
			- [ReactionZones.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/ReactionZones/ReactionZone.ts) - ReactionZone class for creating a reaction zone.
		- [Text](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Text)
			- [TextString.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/Text/TextString.ts) - TextString class for creating a text.
		- [index.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Component/index.ts) - Codes to be exported from the Component folder.
	- [Events](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Events)
		- [ParticleEvent.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Events/ParticleEvent.ts) - ParticleEvent class for setting up the particle system.
		- [TimeEvent.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Events/TimeEvent.ts) - TimeEvent class for setting up a timer.
		- [index.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Events/index.ts) - Codes to be exported from the Events folder.
	- [Input](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Input)
		- [Controller.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Input/Controller.ts) - Controller class for gamepad controller movements. (NOT SUPPORTED)
		- [Locomotion.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Input/Locomotion.ts) - Locomotion class for user teleportation movement.
		- [index.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Input/index.ts) - Codes to be exported from the Input folder.
	- [Physics](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Physics)
		- [Collision.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Physics/Collision.ts) - Collision class for collision interactions.
	- [Scene](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Scene)
		- [XRScene.ts](https://github.com/phillip28749/CSD3120_Team10/tree/main/xr-webapp/src/Scene/XRScene.ts) - XRScene class for creating the scene of the vr application.

## App-Details

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/app.png)<br /><br /><br />

**Available Reactions:**<br />
There are currently only two valid reactions available in the app:\
`1. C  + O2   -> CO2  (Carbon dioxide)`\
`2. 6C + 3H2  -> C6H6 (Benzene)`<br />

**Locomotion:**<br />
To move around within the scene, you can use teleportation by pointing a controller to the ground and holding the trigger for *2 seconds*, allowing you to teleport within the VR environment.

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/teleportation.png)<br /><br /><br />

**Tutorial Indicators:**<br />
To guide the users on the tasks they are required to perform, we have added some tutorial indicators around the table with molecules. Do check them out and follow through the tutorial to get a grasp of how the VR scene works.

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/indicator.png)<br /><br /><br />

**Grabbing Interactions:**<br />
You can use the trigger button on your VR controller to grab and pick up reactants such as `C`, `H2`, and `O2`, and reactions such as `CO2`, and `C6H6` in the scene. These molecules will intuitively follow your controller movement.

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/grabbing.png)<br /><br /><br />

**Reaction Zone:**<br />
To perform a reaction among the molecules, you can drag a molecule to the yellow "Reaction Zone". The newly added molecule will appear on the blue "Display Panel" above the table. Try to merge/break the molecules according to the "Available Reactions" and watch the resultant reaction on the "Display Panel"

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/zone.png)<br /><br /><br />

**Buttons:**<br />
You can trigger the "JOIN/BREAK" button using the controller's trigger button, which will perform the reaction using the molecules previously placed in the reaction zone. If you want to reset the reactants that were previously placed in the reaction zone, you can trigger the "RESET" button using the controller's trigger button.

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/button.png)<br /><br /><br />

**XRAuthor video:**<br />
There is a video panel positioned on the blackboard screen. You can use the controller's trigger button to press the "PLAY/PAUSE" button to play or pause the XRAuthor video. You can also use the controller's trigger button to press on "+/-" buttons on the Top-Right corner of the video panel to increase/decrease the scaling of the video panel. You can also use the controller's trigger button to press on "↑/↓" buttons on the Top-Left corner of the video panel to bring the video panel closer/further away from you. 

![Picture](https://github.com/phillip28749/CSD3120_Team10/blob/main/showcase/Images/xrauthor.png)<br /><br /><br />

## XRAuthor

The XRAuthor video lesson can be found at [XRAuthor Video](https://github.com/phillip28749/CSD3120_Team10/blob/main/xr-webapp/public/assets/synthesis/videos/0.webm).


## Video Demo
The video demo of our VR application can be found at [Video Demo](https://github.com/phillip28749/CSD3120_Team10/tree/main/showcase/VideoDemo.mp4).


## Feedbacks
Please feel free to give us a review of our VR application: [VR Questionnaire](https://forms.gle/7SfHh8LyQCqTBoSF8)


## Responses
Here is the [list of responses](https://github.com/phillip28749/CSD3120_Team10/tree/main/Questionnaire/VR_Questionnaire_Responses.xlsx) gathered from the feedback questionnaires until 2/4/2023.