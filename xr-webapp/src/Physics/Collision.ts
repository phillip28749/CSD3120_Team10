/*!*****************************************************************************
\file	Collision.ts
/*!*****************************************************************************
\brief
	This file contains the Collision class that include functions for collision 
  interactions in the scene.
*******************************************************************************/

import { AbstractMesh, Vector3, WebXRDefaultExperience } from "babylonjs";
import { XRScene } from "../Scene/XRScene";
import { GLOBAL } from "../Global";

export class Collision {
  /**
   * When the user picked on a molecule (using mouse [if DEBUG_MODE is enabled] / controller [if DEBUG_MODE is disabled])
   *
   * @param   xr
   *          the given XR experience
   *
   * @param   xr
   *          the given scene
   *
   * @returns none
   */
  static OnPicking(xr: WebXRDefaultExperience, xrScene: XRScene) {
    const pickingAction = (
      pickedMesh: AbstractMesh,
      parentMesh: AbstractMesh
    ) => {
      // make sure we can only pick reactants
      let m = xrScene.moleculeMg.findMolecule(pickedMesh.uniqueId);
      if (m) {
        if (!xrScene.grabTutDone && m.label.textBlock.text === "CO2") {
          xrScene.grabTutDone = true;
          xrScene.grabIndicator.Hide();
          xrScene.reactIndicator.Show();
        } else if (
          xrScene.dropTutDone &&
          !xrScene.breakTutDone &&
          m.label.textBlock.text !== "CO2"
        ) {
          xrScene.dropTutDone = false;
          xrScene.grabTutDone = false;
          xrScene.grabIndicator.Show();
          xrScene.reactIndicator.Hide();
          xrScene.breakIndicator.Hide();
        }

        xrScene.pickedMesh = xrScene.moleculeMg.cloneMesh(m); //clone the master mesh
        xrScene.pickedMesh.setParent(parentMesh, true); //set under parent controller's mesh
        //GLOBAL.print("picked mesh: " + xrScene.pickedMesh);
        xrScene.moleculeMg.currSelected = m;
        //GLOBAL.print("currently picked: " + m.name);
      }
    };

    const releaseAction = () => {
      if (!xrScene.dropTutDone) {
        xrScene.grabTutDone = false;
        xrScene.grabIndicator.Show();
        xrScene.reactIndicator.Hide();
      }

      xrScene.pickedMesh?.setParent(null);
      //GLOBAL.print("destroying this mesh: " + xrScene.pickedMesh);
      xrScene.pickedMesh?.dispose();
      xrScene.pickedMesh = null;
      xrScene.moleculeMg.currSelected = null;
    };

    if (GLOBAL.DEBUG_MODE) {
      //Mouse Picking
      var parentMesh = new AbstractMesh("MousePicking");
      xrScene.canvas.addEventListener("pointermove", function (event) {
        var pickResult = xrScene.scene.pick(
          xrScene.scene.pointerX,
          xrScene.scene.pointerY
        );
        if (pickResult !== null && pickResult.pickedPoint !== null) {
          parentMesh.position.x = pickResult.pickedPoint.x;
          parentMesh.position.y = pickResult.pickedPoint.y;
          parentMesh.position.z = pickResult.pickedPoint.z;
        }
      });

      xrScene.canvas.addEventListener("pointerdown", function (event) {
        // Get the object under the mouse pointer
        var pickResult = xrScene.scene.pick(
          xrScene.scene.pointerX,
          xrScene.scene.pointerY
        );

        //Grab mesh
        if (pickResult.hit) {
          //GLOBAL.print("Picking: " + pickResult.pickedMesh.parent);
          if (pickResult.pickedMesh.name.indexOf("Molecule") !== -1) {
            //Disabling Camera
            xrScene.sceneCam.camera.detachControl();
            pickingAction(pickResult.pickedMesh, parentMesh);
          }
        }
      });

      xrScene.canvas.addEventListener("pointerup", function (event) {
        //Enabling Camera
        xrScene.sceneCam.camera.attachControl();

        //Ungrab mesh
        //GLOBAL.print("Mouse button released!");
        releaseAction();
      });
    }

    //Controller Picking
    xr.input.onControllerAddedObservable.add((controller) => {
      controller.onMotionControllerInitObservable.add((motionController) => {
        const trigger = motionController.getComponentOfType("trigger");
        trigger.onButtonStateChangedObservable.add((state) => {
          if (trigger.changes.pressed) {
            if (trigger.pressed) {
              if (xrScene.pickedMesh != null)
                // make sure only one item is selected at a time
                return;

              let pickMesh: AbstractMesh;
              if (
                (pickMesh = xr.pointerSelection.getMeshUnderPointer(
                  controller.uniqueId
                ))
              ) {
                GLOBAL.print("mesh under controllerx pointer: " + pickMesh);
                // only allow picking if its a molecule
                if (pickMesh.name.indexOf("Molecule") !== -1) {
                  const distance = Vector3.Distance(
                    motionController.rootMesh?.getAbsolutePosition(),
                    pickMesh?.getAbsolutePosition()
                  );
                  if (distance < 1) {
                    GLOBAL.print(
                      "motionController.rootMesh " + motionController.rootMesh
                    );
                    xrScene.locomotion?.disableTeleport();
                    pickingAction(pickMesh, motionController.rootMesh);
                  }
                }
              }
            } else {
              releaseAction();
              xrScene.locomotion?.enableTeleport();
            }
          }
        });
      });
    });
  }

  /**
   * When the molecule mesh interacts with the reaction zone
   *
   * @param   xr
   *          the given scene
   *
   * @returns none
   */
  static OnCollision(xrScene: XRScene) {
    //reaction zone trigger update
    if (!xrScene.pickedMesh) return;
    if (
      xrScene.pickedMesh.intersectsMesh(xrScene.reactionZone.mesh, false, true)
    ) {
      xrScene.reactionSound.play();
      if (xrScene.grabTutDone && !xrScene.dropTutDone) {
        xrScene.dropTutDone = true;
        xrScene.reactIndicator.Hide();
        xrScene.breakIndicator.Show();
      }

      xrScene.reactionPanel.DeleteContainText("RESULT");
      xrScene.reactionPanel.ClearMolecules();

      // reaction trigger logic
      GLOBAL.print("Meshes intersecting!");
      xrScene.reactionZone.particleEvent.start();
      xrScene.moleculeMg.addMoleculeToList(xrScene.moleculeMg.currSelected);
      xrScene.moleculeMg.currSelected = null;
      xrScene.pickedMesh.dispose();
      xrScene.pickedMesh = null;
    }
  }
}
