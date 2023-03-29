import {AuthoringData, loadAuthoringData} from 'xrauthor-loader'
import {createXRScene} from './init'

loadAuthoringData('assets/synthesis').then((data: AuthoringData) => {
    createXRScene('renderCanvas', data)
})