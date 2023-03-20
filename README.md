# CSD3120 Individual Project Assignment (IPA)

## Ho Yi Guan - 2001595

## Table of Contents

- [Background](#background)
- [Dependencies](#dependencies)
- [Install](#install)
- [App Details](#app-details)


## Background
App Built using Node, BabylonJS, and webpack with TypeScript.
Target Device: **Oculus  Quest 2**.

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

Clone the project using git-clone.

Install the required `Dependencies` using npm via npm install.

Build the development environment using `npm run build`.

Run the development server using `npm run serve`.

Standalone app can be accessed from the local machine at http://localhost:3005/ from your local browser.


## App-Details

- Available Interactions:\
You can use the trigger buttons on your XR controller to pick up reactants such as `C`, `H2`, and `O2` in the scene. These reactants will follow your controller movement in an intuitive way. To register a reactant as a part of the reaction, you can drag it to the yellow "reaction zone" sphere.

- Available Reactions:\
There are currently only two valid reactions available in the app:\
`1. C  + O2   -> CO2  (Carbon dioxide)`\
`2. 6C + 3H2  -> C6H6 (Benzene)`

- Buttons:\
You can trigger the react button using the controller's trigger keys, which will perform the reaction using the reactants previously placed in the reaction zone. If you want to reset the reactants that were previously placed in the reaction zone, you can trigger the reset button using the controller's trigger keys.

- Locomotion:\
To move around within the scene, you can use teleportation by holding the trigger on the ground, allowing you to teleport within the XR environment.

![Failed to load image from URL](./app.png)


## XRAuthor

The XRAuthor video lesson can be found at "https://github.com/Hert97/csd3120-ipa/tree/sub/xrauthor-uploads/assets/synthesis/videos".