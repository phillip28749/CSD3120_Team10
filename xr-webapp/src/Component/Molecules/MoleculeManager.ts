import {AbstractMesh, Nullable, Vector3 } from "babylonjs";
import { GLOBAL } from "../../Global";
import { XRScene } from "../../Scene/XRScene";
import {Molecule} from './Molecule'

/**
 * A manager class for molecules to perform molecule logic and holds data relating to molecules
 */
export class MoleculeManager
{   
    private xrScene: XRScene

    currSelected : Nullable<Molecule>;                  // currently selected molecule
    private joinReactants : Molecule[];                 // the available reactants
    private joinResult: Molecule[];                     // the available results for reactions
    private joinReactionList : Map<string,number>;      // list molecule and its count in the reaction list

    /**
     * Default constructs a molecule manager
     */
    constructor(xrScene: XRScene)
    {
        this.xrScene = xrScene

        this.currSelected = null;
        this.joinReactants = [];
        this.joinResult = [];
        this.joinReactionList = new Map<string,number>();
    }

    getAllJoinResults() : Molecule[]
    {
        return this.joinResult;
    }

    /**
     * Adds a molecule to the reaction list used to check for reaction
     * @param  m
     *         The reactant molecule obj
     */
    private static joinCounter : number = 0
    addJoinReactionToList(m : Nullable<Molecule>)
    {
        var count = this.joinReactionList.get(m.name);
        if(count !== undefined)
        {
            ++count;
            GLOBAL.print("Add reaction name:" + m.name);
            this.joinReactionList.set(m.name, count);

            //Add to display panel (create 4 rows 4 columns)
            const numRows = 4
            const numCols= 4
            const numMol = numRows * numCols

            const rowNo =  MoleculeManager.joinCounter % numRows
            const colNo =  Math.floor(MoleculeManager.joinCounter / numRows)

            MoleculeManager.joinCounter++
            if(MoleculeManager.joinCounter >= numMol) MoleculeManager.joinCounter = 0;

            const textPos =  new Vector3(-0.5 + colNo * 0.3, 0.3 + rowNo * -0.2, 0)
            this.xrScene.joinPanel.AddNewText(m.name + count, { text: m.name, fontSize: 70, outlineWidth: 7, position: textPos, color: "grey" })
        }
        else
            GLOBAL.print("Error: adding reaction to list");
    }
    /**
     * Clears the reaction list and reset it
     */
    clearJoinReactionList()
    {
        this.joinReactants.forEach(m => {
            this.joinReactionList.set(m.name, 0);
        });
        this.xrScene.joinPanel.ClearText("joinHeader")
        MoleculeManager.joinCounter = 0
        GLOBAL.print("clear reaction list");
    }

    /**
     * Push a molecule to the list of available reactants
     * @param   m
     *          The reactant molecule obj
     */
    pushJoinReactants( m : Molecule)
    {   
        this.joinReactants.push(m);
        this.joinReactionList.set(m.name,0);
    }

    /**
     * Finds a reactant master mesh's root by using its own/children's unique mesh id.
     * @param   id
     *          The unique id of mesh to perform search   
     * @returns 
     *          The master molecule object in the reactant list
     */
    findJoinReactants( id : number) : Nullable<Molecule>
    {
        for(let m of this.joinReactants)
        {   
            //GLOBAL.print("finding id:" + id.toString());
        
            if(m.uniqueIds.indexOf(id) !== -1)
            {
                return m;
            }
        }
        return null;
    }

    /**
     * Push a molecule to the list of available result from reaction
     * @param   m
     *          The reactant molecule obj
     */
    pushJoinResult( m : Molecule)
    {
        this.joinResult.push(m);
    }

    /**
     * Gets the result from the reaction
     * @returns 
     *          The resulting molecule object from the reaction,
     *          null is return if the process fails.
     */
    getJoinResult() : Nullable<Molecule>
    {   
        var m : Nullable<Molecule> = null;
        const cc = this.joinReactionList.get("C");
        const o2c = this.joinReactionList.get("O2");
        const h2c = this.joinReactionList.get("H2");
        // if(cc !== undefined)
        //     GLOBAL.print("C:" + cc.toString());
        // if(o2c !== undefined)
        //     GLOBAL.print("O2:" + o2c.toString());
        // if(h2c !== undefined)
        //     GLOBAL.print("H2:" + h2c.toString());

        //CO2
        if(cc !== undefined && cc == 1 && o2c !== undefined && o2c == 1 && (h2c === undefined || h2c === 0))
            m = this.joinResult[0];
        //C6H6
        else if(cc !== undefined && cc == 6 && h2c !== undefined && h2c == 3 && (o2c === undefined || o2c === 0) )
            m = this.joinResult[1];
        
        //reaction success clear the reaction list
        if(m != null)
            this.clearJoinReactionList();

        return m;
    }

    /**
     * Clones the given molecule's meshs,material and transform
     * @param   m
     *          The molecule to clone
     * @returns 
     *          The cloned molecule's mesh
     */
    clone(m : Molecule) : Nullable<AbstractMesh>
    {
       return m.mesh.clone(m.mesh.name + "_clone",null);
    }

};
