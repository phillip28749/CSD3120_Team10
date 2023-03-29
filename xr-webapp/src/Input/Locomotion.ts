import { AbstractMesh, WebXRDefaultExperience, WebXRFeatureName, WebXRFeaturesManager, WebXRMotionControllerTeleportation } from "babylonjs";
import { GLOBAL } from "../Global";

export class Locomotion 
{
    teleportation : WebXRMotionControllerTeleportation

    disableTeleport()
    {
        const success = this.teleportation.detach();
        GLOBAL.print("detach success " + success)
    }
    enableTeleport()
    {   
        const success = this.teleportation.attach();
        GLOBAL.print("attach success " + success)
    }

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