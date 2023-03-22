import { AbstractMesh, WebXRDefaultExperience, WebXRFeatureName, WebXRFeaturesManager, WebXRMotionControllerTeleportation } from "babylonjs";

export class Locomotion 
{
    teleportation : WebXRMotionControllerTeleportation

    constructor(xr: WebXRDefaultExperience, featureManager: WebXRFeaturesManager, ground: AbstractMesh, tpOption?: { time?: number, fillColor?: string, borderColor?: string }) {
        this.teleportation = featureManager.enableFeature(
            WebXRFeatureName.TELEPORTATION,
            "stable",
            {
                xrInput: xr.input,
                floorMeshes: [ground],
                timeToTeleport: tpOption?.time?? 4000,
                useMainComponentOnly: true,
                defaultTargetMeshOptions: {
                    teleportationFillColor: tpOption?.fillColor?? "#55FF99",
                    teleportationBorderColor: tpOption?.borderColor?? "blue",
                    torusArrowMaterial: ground.material,
                },
            },
            true,
            true
        ) as WebXRMotionControllerTeleportation;
        this.teleportation.parabolicRayEnabled = true;
        this.teleportation.parabolicCheckRadius = 2;
    }
}