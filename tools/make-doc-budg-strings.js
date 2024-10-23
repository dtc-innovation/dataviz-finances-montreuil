import {join} from 'node:path';
import {readdir, readFile, writeFile} from 'node:fs/promises';
import xmlBufferToString from 'xml-buffer-tostring';
import {DOMParser} from 'xmldom';

const SOURCE_COMPTES_DIR = process.env.SOURCE_COMPTES_DIR;
const BUILD_FINANCE_DIR = process.env.BUILD_FINANCE_DIR;

export function readXmlFilesInDir(sourceDir) {
    return readdir(sourceDir).then(items => Promise.all(
        items
            .filter(item => item.toLocaleLowerCase().endsWith('.xml'))
            .map(item => readFile(join(sourceDir, item)))
    ))
    .then(files => {
        return files
            .map(xmlBufferToString)
            .map(fileContent => (new DOMParser()).parseFromString(fileContent, "text/xml"))
    })
}


readXmlFilesInDir(SOURCE_COMPTES_DIR).then(plansDeComptes => {

    // sort with most recent years first
    plansDeComptes = plansDeComptes.sort((pc1, pc2) => {
        const [year1, year2] = [pc1, pc2].map(
            p => Number(p.getElementsByTagName('Nomenclature')[0].getAttribute('Exer'))
        )

        return year2 - year1;
    })

    const natureLabels = {}
    const fonctionLabels = {}

    for(const pc of plansDeComptes){
        const comptes = Array.from(pc.getElementsByTagName('Compte'));

        comptes.forEach(c => {
            const code = c.getAttribute('Code')

            if(!(code in natureLabels))
                natureLabels[code] = c.getAttribute('Libelle')
        })

        const fonctions = Array.from(pc.getElementsByTagName('RefFonc'));

        fonctions.forEach(c => {
            const code = c.getAttribute('Code')

            if(!(code in fonctionLabels))
                fonctionLabels[code] = c.getAttribute('Libelle')
        })
    }

    return {
        natureLabels,
        fonctionLabels
    }
})
.then( docBudgs => JSON.stringify(docBudgs, null, 2) )
.then(str => writeFile(join(BUILD_FINANCE_DIR, 'finance-strings.json'), str, {encoding: 'utf8'}))
.catch(err => {
    console.error('make-doc-budg-strings', err)
    process.exit(1)
})
